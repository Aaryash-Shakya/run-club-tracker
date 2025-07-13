import { DateTime } from "luxon";

// Time zone constant
const TIME_ZONE = "Asia/Kathmandu";

interface DateRange {
	startDate: Date;
	endDate: Date;
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
			// Sunday to Saturday (Nepal week format)
			const currentDay = nptDate.weekday; // Monday = 1, Sunday = 7
			const daysFromSunday = currentDay === 7 ? 0 : currentDay;
			startDateTime = nptDate.minus({ days: daysFromSunday }).startOf("day");
			endDateTime = startDateTime.plus({ days: 6 }).endOf("day");
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
};
