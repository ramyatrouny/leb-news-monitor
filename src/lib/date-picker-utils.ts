/**
 * Date utilities for filtering articles by date range
 * 
 * This module handles date range calculations for article filtering,
 * ensuring proper time boundaries and chronological ordering.
 */

export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Check if a date is within a given range (inclusive)
 * 
 * @param date - The date to check
 * @param range - The date range (start and end)
 * @returns true if date >= start AND date <= end
 */
export function isDateInRange(date: Date, range: DateRange): boolean {
  return date >= range.start && date <= range.end;
}

/**
 * Format date for display (e.g., "Mar 8, 2026")
 * 
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format date for input[type="date"] (YYYY-MM-DD)
 * Useful for setting the value of HTML date inputs
 * 
 * @param date - The date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse input[type="date"] value to Date object at midnight
 * HTML date inputs only provide dates without times, so this sets time to 00:00:00
 * 
 * @param value - Date string in YYYY-MM-DD format
 * @returns Date object at midnight (00:00:00) of that day
 */
export function parseInputDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Get date range for a given number of days back from now
 * Useful for "last N days" filtering
 * 
 * @param daysBack - Number of days to go back
 * @returns DateRange from (daysBack) days ago to now
 */
export function getDateRangeDaysBack(daysBack: number): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysBack);
  // Set start to beginning of that day
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

/**
 * Get date range for today (00:00 - 23:59)
 * Useful for "articles published today" filtering
 * 
 * @returns DateRange covering the entire current day
 */
export function getTodayRange(): DateRange {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Normalize a date range to ensure proper chronological ordering and time boundaries
 * 
 * This function handles several important cases:
 * 1. Swaps startDate and endDate if they're in the wrong order
 * 2. Sets the start date to the beginning of that day (00:00:00)
 * 3. Sets the end date to:
 *    - Current time if it's today
 *    - End of day (23:59:59) if it's a past date
 * 4. Handles null dates appropriately
 * 
 * Example:
 *   Input: startDate=2026-03-10, endDate=2026-03-09
 *   Output: startDate=2026-03-09 00:00:00, endDate=2026-03-10 23:59:59
 * 
 * Example:
 *   Input: startDate=2026-03-08, endDate=2026-03-10 (today)
 *   Output: startDate=2026-03-08 00:00:00, endDate=2026-03-10 <current_time>
 * 
 * @param startDate - The start date (may be later than endDate)
 * @param endDate - The end date (may be earlier than startDate)
 * @returns Normalized DateRange with proper boundaries and chronological order
 */
export function normalizeDateRange(
  startDate: Date | null,
  endDate: Date | null
): DateRange | null {
  // If both are null, no date filtering
  if (!startDate && !endDate) {
    return null;
  }

  // Get today's date for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If only one date is provided, use it as an anchor
  let actualStart = startDate;
  let actualEnd = endDate;

  // If both dates provided, ensure chronological order
  if (startDate && endDate) {
    // Compare the dates (ignoring time)
    const startDateOnly = new Date(startDate);
    startDateOnly.setHours(0, 0, 0, 0);
    
    const endDateOnly = new Date(endDate);
    endDateOnly.setHours(0, 0, 0, 0);

    // If start is later than end, swap them
    if (startDateOnly > endDateOnly) {
      [actualStart, actualEnd] = [endDate, startDate];
    }
  }

  // Calculate the final range
  const range: DateRange = {
    start: new Date(0), // Default to epoch
    end: new Date(),    // Default to now
  };

  if (actualStart) {
    range.start = new Date(actualStart);
    range.start.setHours(0, 0, 0, 0); // Beginning of day
  }

  if (actualEnd) {
    range.end = new Date(actualEnd);
    
    // Check if end date is today
    const endDateOnly = new Date(actualEnd);
    endDateOnly.setHours(0, 0, 0, 0);
    
    if (endDateOnly.getTime() === today.getTime()) {
      // If it's today, use current time (no adjustment needed to Date())
      range.end = new Date();
    } else {
      // If it's a past date, set to end of day
      range.end.setHours(23, 59, 59, 999);
    }
  }

  return range;
}
