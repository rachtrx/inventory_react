class MissingIdError extends Error {
    constructor(missingId, message="") {
        super(message);
        this.name = this.constructor.name;
        this.missingId = missingId;
        // this.errorCode = errorCode; // can pass into params if required in future
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = MissingIdError;