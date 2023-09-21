/**
 *
 * @returns unix time at midnight of the current day
 */
export function getToday(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // JavaScript's months are 0-indexed
  const day = today.getDate();

  const yyyy = year.toString();
  const mm = month < 10 ? `0${month}` : month.toString();
  const dd = day < 10 ? `0${day}` : day.toString();

  return `${yyyy}-${mm}-${dd}`;
}

/**
 *
 * @returns tmr's date in yyyymmdd format
 */
export function getTomorrow(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = tomorrow.getMonth() + 1; // JavaScript's months are 0-indexed
  const day = tomorrow.getDate();

  const yyyy = year.toString();
  const mm = month < 10 ? `0${month}` : month.toString();
  const dd = day < 10 ? `0${day}` : day.toString();

  return `${yyyy}-${mm}-${dd}`;
}
