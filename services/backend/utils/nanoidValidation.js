const validateNanoID = (id, length = 21) => {
    const nanoidRegex = new RegExp(`^[a-zA-Z0-9_-]{${length}}$`);
    return nanoidRegex.test(id);
}

module.exports = { validateNanoID }