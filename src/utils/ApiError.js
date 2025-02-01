class ApiError extends Error {
    /**
     * Create an ApiError.
     * @param {number} statusCode - The HTTP status code.
     * @param {string} [message="Something went wrong"] - The error message.
     * @param {Array} [errors=[]] - Additional error details.
     * @param {string} [stack=""] - The stack trace.
     */
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;
