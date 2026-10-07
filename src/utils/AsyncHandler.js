const AsyncHandler = (response) => {
    return (req, res, next) => {
        Promise.resolve(response(req, res, next)).catch((error) => next(error));
    }
}

export { AsyncHandler };