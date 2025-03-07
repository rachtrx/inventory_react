class ValidationError extends Error {
    constructor(errors) {
        super("Validation Error");
        this.errors = errors; // Store the array
        this.name = "ValidationError";
    }
}