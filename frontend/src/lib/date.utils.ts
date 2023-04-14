/**
 *
 * @returns unix time at midnight of the current day
 */
export function getToday(): number {
  return new Date().setHours(0, 0, 0, 0);
}

/**
 *
 * @returns unix time at midnight of the next day
 */
export function getTomorrow(): number {
  return getToday() + 24 * 60 * 60 * 1000;
}

function convertUnixTimeToDateString(unixTime: number): string {
  const date = new Date(unixTime);
  return date.toLocaleDateString();
}

export function getTodayString(): string {
  return convertUnixTimeToDateString(getToday());
}
