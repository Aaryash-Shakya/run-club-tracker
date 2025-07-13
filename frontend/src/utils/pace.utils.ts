/**
 * Calculates pace in minutes per kilometer from time and distance.
 * @param {number} timeInSeconds - Moving time in seconds.
 * @param {number} distanceInMeter - Distance in meters.
 * @returns {number} Pace in minutes per kilometer.
 * @throws {Error} If distance is less than or equal to zero.
 */
function getPaceFromTimeAndDistance(timeInSeconds: number, distanceInMeter: number): number {
  if (distanceInMeter <= 0) {
    throw new Error('Distance must be greater than zero to calculate pace.')
  }
  // Convert moving time from seconds to minutes and distance from meters to kilometers
  const timeInMinutes = timeInSeconds / 60
  const distanceInKilometer = distanceInMeter / 1000
  const pace = timeInMinutes / distanceInKilometer // pace in minutes per kilometer
  return pace
}

/**
 * Formats a pace value (minutes per kilometer) as a string in mm:ss format.
 * @param {number} pace - Pace in minutes per kilometer.
 * @returns {string} Formatted pace string (e.g., "5:23").
 */
function formatPaceToString(pace: number): string {
  const minutes = Math.floor(pace)
  const seconds = Math.round((pace - minutes) * 60)
  // Pad seconds with leading zero if needed
  const secondsStr = seconds.toString().padStart(2, '0')
  return `${minutes}:${secondsStr}`
}

export default {
  getPaceFromTimeAndDistance,
  formatPaceToString,
}
