/**
 * IClockService interface defines the contract for time-related operations.
 * This allows us to mock the passage of time in unit and integration tests.
 */
export interface IClockService {
  /** Returns current timestamp in milliseconds */
  now(): number;
  /** Returns current Date object */
  nowDate(): Date;
  /** Returns current time in ISO string format */
  nowIso(): string;
}

/**
 * SystemClockService implements IClockService using the standard Node.js Date API.
 * This is used for production and standard development environments.
 */
export class SystemClockService implements IClockService {
  now(): number {
    return Date.now();
  }

  nowDate(): Date {
    return new Date();
  }

  nowIso(): string {
    return new Date().toISOString();
  }
}
