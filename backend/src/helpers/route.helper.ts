import { Request } from "express";

interface ActivityQueryParams {
	period: "daily" | "weekly" | "monthly";
	date?: Date;
}

/**
 * Parse and validate query parameters for activity routes
 * @param req Express request object
 * @returns Parsed query parameters
 * @throws Error if parameters are invalid
 */
function parseActivityQueryParams(req: Request): ActivityQueryParams {
	const { period, date } = req.query;

	// Validate period parameter
	if (!period) {
		throw new Error("Period parameter is required. Must be 'daily', 'weekly', or 'monthly'");
	}

	if (typeof period !== "string" || !["daily", "weekly", "monthly"].includes(period)) {
		throw new Error("Invalid period parameter. Must be 'daily', 'weekly', or 'monthly'");
	}

	const validatedPeriod = period as "daily" | "weekly" | "monthly";

	// Parse and validate date parameter if provided
	let validatedDate: Date | undefined;
	if (date) {
		if (typeof date !== "string") {
			throw new Error("Date parameter must be a string in format yyyy-mm-dd");
		}

		// Validate date format (yyyy-mm-dd)
		const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
		if (!dateRegex.test(date)) {
			throw new Error("Date parameter must be in format yyyy-mm-dd");
		}

		validatedDate = new Date(date);

		// Check if date is valid
		if (isNaN(validatedDate.getTime())) {
			throw new Error("Invalid date provided. Date must be in format yyyy-mm-dd");
		}
	}

	return {
		period: validatedPeriod,
		date: validatedDate,
	};
}

export default {
	parseActivityQueryParams,
};
