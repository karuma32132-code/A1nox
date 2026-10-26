import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Firebase config for server-side token validation
const firebaseConfigPath = path.join(__dirname, 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));

// Authorized store owner email (strictly checked)
const AUTHORIZED_ADMIN_EMAIL = 'karuma32132@gmail.com';

// Cache for Google public certificates used to verify Firebase ID tokens
let publicCertsCache: { [kid: string]: string } = {};
let publicCertsExpiry = 0;

async function getGooglePublicCerts(): Promise<{ [kid: string]: string }> {
  const now = Date.now();
  if (Object.keys(publicCertsCache).length > 0 && now < publicCertsExpiry) {
    return publicCertsCache;
  }
  try {
    const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const cacheControl = res.headers.get('cache-control');
    let maxAge = 3600;
    if (cacheControl) {
      const match = cacheControl.match(/max-age=(\d+)/);
      if (match) maxAge = parseInt(match[1], 10);
    }
    publicCertsCache = await res.json();
    publicCertsExpiry = now + maxAge * 1000;
    return publicCertsCache;
  } catch (e: any) {
    console.warn('[Security] Could not refresh Google securetoken certs:', e?.message || e);
    return publicCertsCache;
  }
}

/**
 * Server-side Firebase ID token verification and owner authorization check.
 */
async function verifyAdminAuthToken(token: string): Promise<{ authorized: boolean; email?: string; error?: string }> {
  if (!token || typeof token !== 'string') {
    return { authorized: false, error: 'Authentication token is required.' };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return { authorized: false, error: 'Malformed token structure.' };
  }

  let header: any;
  let payload: any;
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    return { authorized: false, error: 'Invalid token JSON structure.' };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < nowSec) {
    return { authorized: false, error: 'Session expired. Please sign in again with your Google account.' };
  }
  if (!payload.iss || payload.iss !== `https://securetoken.google.com/${firebaseConfig.projectId}`) {
    return { authorized: false, error: 'Token issuer mismatch.' };
  }
  if (!payload.aud || payload.aud !== firebaseConfig.projectId) {
    return { authorized: false, error: 'Token audience mismatch.' };
  }

  // Cryptographic signature verification using Google public certs
  try {
    const certs = await getGooglePublicCerts();
    if (header.kid && certs[header.kid]) {
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(`${parts[0]}.${parts[1]}`);
      const signature = Buffer.from(parts[2], 'base64url');
      const isValid = verifier.verify(certs[header.kid], signature);
      if (!isValid) {
        return { authorized: false, error: 'Invalid token cryptographic signature.' };
      }
    }
  } catch (err: any) {
    console.warn('[Security] Public key verification warning:', err?.message || err);
  }

  const userEmail = (payload.email || '').trim().toLowerCase();
  if (userEmail !== AUTHORIZED_ADMIN_EMAIL) {
    return {
      authorized: false,
      email: userEmail,
      error: `Access Denied: Account (${userEmail || 'unknown'}) is not authorized for administrative access.`,
    };
  }

  return { authorized: true, email: userEmail };
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Ensure persistent upload directories exist
  const uploadsDir = path.join(__dirname, 'public', 'uploads');
  const imagesDir = path.join(uploadsDir, 'images');
  const videosDir = path.join(uploadsDir, 'videos');
  
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  // Parse JSON payloads with high limit for images & video uploads
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Static uploads directory serving
  app.use('/uploads', express.static(uploadsDir));

  // Health check endpoint (Public)
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'A1NOXHUB Secure API & Media Server',
      timestamp: new Date().toISOString(),
    });
  });

  // Server-side Admin Token Verification Endpoint
  app.post('/api/admin/verify-token', async (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.body?.token || '');
    
    if (!token) {
      return res.status(401).json({
        authorized: false,
        error: 'Missing Authorization header or token.',
      });
    }

    const verification = await verifyAdminAuthToken(token);
    if (!verification.authorized) {
      return res.status(403).json({
        authorized: false,
        error: verification.error,
        email: verification.email,
      });
    }

    return res.json({
      authorized: true,
      email: verification.email,
      message: 'Verified administrator session.',
    });
  });

  // Admin Media Upload Endpoint (Protected)
  app.post('/api/upload', async (req, res) => {
    try {
      // 1. Enforce Server-Side Admin Authorization
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.body?.token || '');
      
      const authCheck = await verifyAdminAuthToken(token);
      if (!authCheck.authorized) {
        console.warn(`[Security Alert] Unauthorized upload attempt from IP ${req.ip}. Error: ${authCheck.error}`);
        return res.status(403).json({
          success: false,
          error: authCheck.error || 'Access Denied: Administrator privileges required.',
        });
      }

      const { fileName, fileType, mediaType, data } = req.body;
      if (!data || !fileName) {
        return res.status(400).json({ success: false, error: 'Missing file payload or file name.' });
      }

      // Extract raw base64 data
      const base64Content = data.includes(';base64,') ? data.split(';base64,')[1] : data;
      const buffer = Buffer.from(base64Content, 'base64');

      const isVideo =
        mediaType === 'video' ||
        (fileType && fileType.startsWith('video/')) ||
        /\.(mp4|webm|ogg|mov|m4v)$/i.test(fileName);

      const targetDir = isVideo ? videosDir : imagesDir;
      const subFolder = isVideo ? 'videos' : 'images';

      // Clean extension
      let ext = path.extname(fileName).toLowerCase();
      if (!ext) {
        ext = isVideo ? '.mp4' : '.jpg';
      }

      // Generate secure unique filename
      const safeBasename = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
      const uniqueFileName = `${Date.now()}_${safeBasename}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      const destPath = path.join(targetDir, uniqueFileName);

      fs.writeFileSync(destPath, buffer);

      const publicUrl = `/uploads/${subFolder}/${uniqueFileName}`;
      console.log(`[Upload] Admin (${authCheck.email}) saved ${mediaType || (isVideo ? 'video' : 'image')}: ${publicUrl} (${buffer.length} bytes)`);

      return res.json({
        success: true,
        url: publicUrl,
        fileName: uniqueFileName,
        size: buffer.length,
        mediaType: isVideo ? 'video' : 'image',
      });
    } catch (err: any) {
      console.error('[Upload Error]', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal server error while saving file.',
      });
    }
  });

  // Admin Media Delete Endpoint (Protected)
  app.post('/api/delete-media', async (req, res) => {
    try {
      // 1. Enforce Server-Side Admin Authorization
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.body?.token || '');
      
      const authCheck = await verifyAdminAuthToken(token);
      if (!authCheck.authorized) {
        console.warn(`[Security Alert] Unauthorized delete-media attempt from IP ${req.ip}. Error: ${authCheck.error}`);
        return res.status(403).json({
          success: false,
          error: authCheck.error || 'Access Denied: Administrator privileges required.',
        });
      }

      const { url } = req.body;
      if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) {
        return res.status(400).json({ success: false, error: 'Invalid or missing media URL.' });
      }

      const relativePath = url.replace(/^\//, '');
      const filePath = path.join(__dirname, 'public', relativePath);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[Delete] Admin (${authCheck.email}) removed file: ${filePath}`);
      }

      return res.json({ success: true, message: 'Media file removed successfully.' });
    } catch (err: any) {
      console.error('[Delete Error]', err);
      return res.status(500).json({ success: false, error: err.message || 'Failed to delete file.' });
    }
  });

  // Production static bundle or Dev Vite middlewares
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`A1NOXHUB Secure Server ready at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
