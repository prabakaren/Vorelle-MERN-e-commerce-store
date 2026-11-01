// Wraps async route handlers so thrown errors reach the error middleware.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Small helper to throw an error with an HTTP status.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
