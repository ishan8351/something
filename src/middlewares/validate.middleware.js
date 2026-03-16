import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    } catch (error) {
        // Safely check if this is specifically a Zod validation error
        if (error.name === 'ZodError') {
            const errorDetails = error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));
            return next(new ApiError(400, 'Validation Failed', errorDetails));
        }

        // If it's a different kind of error, pass it along safely
        return next(error);
    }
};
