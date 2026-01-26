exports.cleanField = (val) => {
    return val === "" ? null : val;
  };
  
exports.cleanString = (val) => {
    return val === "" ? null : val.toUpperCase();
  };
exports.cleanCost = (val) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed.toFixed(2);
};

exports.createMap = (keys, values) => {
    return new Map(keys.map((key, index) => [key, values[index]]));
}

exports.getSingaporeDateTime = () => {
    const now = new Date();
    const singaporeTime = now.toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });
    return new Date(singaporeTime);
}
