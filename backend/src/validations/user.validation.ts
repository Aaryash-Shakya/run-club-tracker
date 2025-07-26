import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// MongoDB ObjectId validation
const mongoIdSchema = z
	.string()
	.trim()
	.regex(/^[0-9a-fA-F]{24}$/, {
		message: "Invalid MongoDB ObjectId format",
	});

// Validate userId in params
export const userIdSchema = z.object({
	userId: mongoIdSchema,
});

export type TUserIdParams = z.infer<typeof userIdSchema>;

// Middleware to validate userId in request params
export const validateUserIdParams = (req: Request, res: Response, next: NextFunction): void => {
	try {
		const validatedParams = userIdSchema.parse(req.params);
		req.params = validatedParams;
		next();
	} catch (error) {
		res.status(400).json({
			error: "Invalid userId format",
			details: error instanceof z.ZodError ? error.issues : "Invalid parameters",
		});
	}
};
