import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

// Extend Express Request interface
declare module "express-serve-static-core" {
	interface Request {
		validatedQuery?: unknown;
	}
}

// Schema for activity query parameters
export const activityQuerySchema = z.object({
	period: z.enum(["daily", "weekly", "monthly"], {
		message: "Period must be 'daily', 'weekly', or 'monthly'",
	}),
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in format yyyy-mm-dd")
		.refine(
			(dateStr) => {
				const date = new Date(dateStr);
				return !isNaN(date.getTime());
			},
			{ message: "Invalid date provided" }
		)
		.transform((dateStr) => new Date(dateStr))
		.optional(),
});

// Type inference from the schema
export type ActivityQueryParams = z.infer<typeof activityQuerySchema>;

/**
 * Middleware factory for validating request query parameters
 * @param schema Zod schema to validate against
 * @returns Express middleware function
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			// Parse and validate query parameters
			const validatedData = schema.parse(req.query);

			// Attach validated data to request object
			(req as Request & { validatedQuery: T }).validatedQuery = validatedData;

			next();
		} catch (error) {
			if (error instanceof ZodError) {
				// Format Zod validation errors
				const errorMessages = error.issues.map((err) => ({
					field: err.path.join("."),
					message: err.message,
				}));

				res.status(400).json({
					status: "ERROR",
					message: "Validation failed",
					errors: errorMessages,
				});
				return;
			}

			// Handle other errors
			next(error);
		}
	};
}

// Specific middleware for activity query validation
export const validateActivityQuery = validateQuery(activityQuerySchema);
