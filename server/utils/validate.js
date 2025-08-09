import Joi from 'joi';
import { ApiError } from './error.js';

const validate = (schema) => (req, res, next) => {
  const validSchema = ['params', 'query', 'body', 'files'].filter(key => schema[key]);
  const object = {};
  
  validSchema.forEach((key) => {
    object[key] = req[key];
  });

  const { value, error } = Joi.compile(schema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(400, errorMessage));
  }

  Object.assign(req, value);
  return next();
};

// Common validation schemas
const schemas = {
  idParam: Joi.object().keys({
    id: Joi.string().required().pattern(/^[a-f\d]{24}$/i).message('Invalid ID format')
  }),
  
  pagination: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  }),
  
  // Add more common schemas as needed
};

export { validate, schemas };
