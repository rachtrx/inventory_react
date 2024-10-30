const createMap = function(keys, values) {
    return new Map(keys.map((key, index) => [key, values[index]]));
}

function getSingaporeDateTime() {
    const now = new Date();
    const singaporeTime = now.toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });
    return new Date(singaporeTime);
}

module.exports = { createMap, getSingaporeDateTime };