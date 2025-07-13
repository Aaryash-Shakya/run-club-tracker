import { DateTime } from "luxon";

// Time zone constant
const TIME_ZONE = "Asia/Kathmandu";

interface DateRange {
	startDate: Date;
	endDate: Date;
}

/**
 * Get week range based on when the current month started
 * If month starts on Tuesday, week starts from Tuesday
 */
function getMonthBasedWeekRange(date: Date = new Date()): {
	weekStart: DateTime;
	weekEnd: DateTime;
} {
	const nptDate = DateTime.fromJSDate(date).setZone(TIME_ZONE);
	const startOfMonth = nptDate.startOf("month");
	const dayOfWeekMonthStarts = startOfMonth.weekday; // Monday = 1, Sunday = 7

	// Calculate how many days into the current "month-based week" we are
	const currentDay = nptDate.weekday;
	let daysFromWeekStart: number;

	if (dayOfWeekMonthStarts === 7) {
		// Month starts on Sunday
		daysFromWeekStart = currentDay === 7 ? 0 : currentDay;
	} else {
		// Month starts on any other day
		if (currentDay >= dayOfWeekMonthStarts) {
			daysFromWeekStart = currentDay - dayOfWeekMonthStarts;
		} else {
			daysFromWeekStart = 7 - dayOfWeekMonthStarts + currentDay;
		}
	}

	const weekStart = nptDate.minus({ days: daysFromWeekStart }).startOf("day");
	const weekEnd = weekStart.plus({ days: 6 }).endOf("day");

	return { weekStart, weekEnd };
}

/**
 * Format week range for display (e.g., "Jul 7 - Jul 13")
 */
function formatWeekRange(date: Date = new Date()): string {
	const { weekStart, weekEnd } = getMonthBasedWeekRange(date);

	const startFormat = weekStart.toFormat("MMM d");
	const endFormat = weekEnd.toFormat("MMM d");

	return `${startFormat} - ${endFormat}`;
}

function getDateRange(period: "daily" | "weekly" | "monthly", date: Date = new Date()): DateRange {
	const nptDate = DateTime.fromJSDate(date).setZone(TIME_ZONE);

	let startDateTime: DateTime;
	let endDateTime: DateTime;

	switch (period) {
		case "daily":
			// Start of day to start of next day
			startDateTime = nptDate.startOf("day");
			endDateTime = startDateTime.plus({ days: 1 });
			break;

		case "weekly": {
			// Use month-based week calculation
			const { weekStart, weekEnd } = getMonthBasedWeekRange(date);
			startDateTime = weekStart;
			endDateTime = weekEnd;
			break;
		}

		case "monthly":
			// Start of month to start of next month
			startDateTime = nptDate.startOf("month");
			endDateTime = startDateTime.plus({ months: 1 });
			break;

		default:
			throw new Error(`Invalid period: ${period}. Must be "daily", "weekly", or "monthly"`);
	}

	return {
		startDate: startDateTime.toUTC().toJSDate(),
		endDate: endDateTime.toUTC().toJSDate(),
	};
}

export default {
	TIME_ZONE,
	getDateRange,
	getMonthBasedWeekRange,
	formatWeekRange,
};
