import adminRouter from './modules/admin/admin.router.js';
import cookieParser from 'cookie-parser';
import progressRouter from './modules/progress/progress.router.js';
import vocabularyRouter from './modules/vocabulary/vocabulary.router.js';
import shadowingRouter from './modules/shadowing/shadowing.router.js';
import dictationRouter from './modules/dictation/dictation.router.js';
import lessonRouter from './modules/lesson/lesson.router.js';
import userRouter from './modules/user/user.router.js';
import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorHandler.js';
import authRouter from './modules/auth/auth.router.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/lesson', lessonRouter);
app.use('/api/v1/dictation', dictationRouter);
app.use('/api/v1/shadowing', shadowingRouter);
app.use('/api/v1/vocabulary', vocabularyRouter);
app.use('/api/v1/progress', progressRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
