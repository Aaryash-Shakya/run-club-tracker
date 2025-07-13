import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
	statusCode?: number;
	isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
	statusCode: number;
	isOperational: boolean;

	constructor(message: string, statusCode: number = 500) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

// Global error handler middleware
export const errorHandler = (
	err: AppError,
	req: Request,
	res: Response,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	next: NextFunction
): void => {
	const statusCode = err.statusCode || 500;
	const message = err.message || "Internal Server Error";

	console.error("❌ Error:", {
		message,
		statusCode,
		stack: err.stack,
		url: req.url,
		method: req.method,
	});

	res.status(statusCode).json({
		success: false,
		error: {
			message,
			...(process.env.NODE_ENV === "development" && { stack: err.stack }),
		},
	});
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
	res.status(404).json({
		success: false,
		error: {
			message: `Route ${req.originalUrl} not found`,
		},
	});
};

// Async error wrapper
export const asyncHandler = (
	fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};
