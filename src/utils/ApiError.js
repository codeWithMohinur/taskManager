class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        data,
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.data = null;
    }
}

export { ApiError };