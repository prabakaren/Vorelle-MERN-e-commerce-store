export const notFound = (req, _res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

// Central error handler: converts any error into a clean JSON response.
export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  } else if (err.code === 11000) {
    status = 409;
    message = 'That email is already registered';
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
};
