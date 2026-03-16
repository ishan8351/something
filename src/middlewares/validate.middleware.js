import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    } catch (error) {
        // Extract Zod errors into a readable format
        const errorDetails = error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
        }));
        
        // Pass to your global error handler
        next(new ApiError(400, "Validation Failed", errorDetails));
    }
};