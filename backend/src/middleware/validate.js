import AppError from '../utils/appError.js';

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Assign parsed data (with Zod transformations like coercion) back to request
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    
    next();
  } catch (error) {
    if (error.errors) {
      const errorMessages = error.errors.map(err => {
        // Remove the outer key (body/query/params) from the error path
        const path = err.path.slice(1).join('.');
        return `${path || 'Field'}: ${err.message}`;
      });
      return next(new AppError(`Validation failed: ${errorMessages.join('; ')}`, 400));
    }
    return next(error);
  }
};

export default validate;
