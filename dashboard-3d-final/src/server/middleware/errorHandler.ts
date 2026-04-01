import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError, ApiResponse } from '../types';

/**
 * Handle Mongoose CastError (invalid ObjectId)
 */
const handleCastError = (err: mongoose.Error.CastError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose ValidationError
 */
const handleValidationError = (err: mongoose.Error.ValidationError): AppError => {
  const messages = Object.values(err.errors).map((e) => e.message);
  const message = `Validation failed: ${messages.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB duplicate key error
 */
const handleDuplicateKeyError = (err: any): AppError => {
  const field = Object.keys(err.keyValue || {})[0];
  const value = err.keyValue?.[field];
  const message = `Duplicate value '${value}' for field '${field}'. Please use a different value.`;
  return new AppError(message, 409);
};

/**
 * Send error response in development mode (with stack trace)
 */
const sendErrorDev = (err: AppError, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: err.message,
    message: err.message,
  };

  // Include stack in dev
  (response as any).stack = err.stack;

  res.status(err.statusCode).json(response);
};

/**
 * Send error response in production mode (sanitized)
 */
const sendErrorProd = (err: AppError, res: Response): void => {
  if (err.isOperational) {
    const response: ApiResponse = {
      success: false,
      error: err.message,
      message: err.message,
    };
    res.status(err.statusCode).json(response);
  } else {
    // Programming or unknown error — don't leak details
    console.error('UNEXPECTED ERROR:', err);
    const response: ApiResponse = {
      success: false,
      error: 'An unexpected error occurred',
      message: 'Something went wrong. Please try again later.',
    };
    res.status(500).json(response);
  }
};

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else if (err.name === 'CastError') {
    error = handleCastError(err);
  } else if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  } else if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  } else if (err.name === 'SyntaxError' && 'body' in err) {
    error = new AppError('Invalid JSON in request body', 400);
  } else {
    error = new AppError(err.message || 'Internal Server Error', err.statusCode || 500);
    error.isOperational = false;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${error.statusCode} - ${error.message}`);
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Handle 404 - Route Not Found
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};