/**
 * Converts a number of seconds to a formatted string with hours, minutes, and seconds.
 * @param {number} totalSeconds - The total number of seconds to format.
 * @returns {string} Formatted time string (e.g., "1h 23m 45s", "5m 02s", "30s").
 */
export function formatSecondsToHMS(totalSeconds: number): string {
	const days = Math.floor(totalSeconds / 86400)
	const hours = Math.floor((totalSeconds % 86400) / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = Math.floor(totalSeconds % 60)
	const parts = []
	if (days > 0) parts.push(`${days}d`)
	if (hours > 0 || days > 0) parts.push(`${hours}h`)
	if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`)
	parts.push(`${seconds.toString().padStart(2, '0')}s`)
	return parts.join(' ')
}

export function toNepaliDateString(zuluDateStr: string | Date): string {
	const date = new Date(zuluDateStr)

	// Add 5 hours and 45 minutes to convert to Nepal time
	const nepalOffsetMs = (5 * 60 + 45) * 60 * 1000
	const localNepaliDate = new Date(date.getTime() + nepalOffsetMs)

	// Format to YYYY-MM-DD
	const year = localNepaliDate.getUTCFullYear()
	const month = String(localNepaliDate.getUTCMonth() + 1).padStart(2, '0')
	const day = String(localNepaliDate.getUTCDate()).padStart(2, '0')

	return `${year}-${month}-${day}`
}
