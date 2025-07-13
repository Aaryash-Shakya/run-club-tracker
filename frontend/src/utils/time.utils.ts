/**
 * Converts a number of seconds to a formatted string with hours, minutes, and seconds.
 * @param {number} totalSeconds - The total number of seconds to format.
 * @returns {string} Formatted time string (e.g., "1h 23m 45s", "5m 02s", "30s").
 */
export function formatSecondsToHMS(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`)
  parts.push(`${seconds.toString().padStart(2, '0')}s`)
  return parts.join(' ')
}
