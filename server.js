import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import session from 'express-session';
import passport from './config/passport.js';
import cors from 'cors';
import helmet from 'helmet';
import fileup_router from './routes/fileup_route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const app = express();
app.set('trust proxy', 1); 

// Basic security
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP for dev, configure for production
}));

// CORS for development
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
}
// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-this',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/', fileup_router);

// Serve React in production
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));

  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
  
}

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`Mode: ${NODE_ENV}`);
  if (NODE_ENV === 'development') {
    console.log(`Frontend (run separately): ${FRONTEND_URL}`);
    console.log(`API: http://localhost:${PORT}/api`);
  }
});

export default app;