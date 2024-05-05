const { createLogger, format, transports } = require('winston');
const path = require('path');

const fs = require('fs');
const dir = path.join(__dirname, 'logs');
console.log(dir);

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),  // to log the stack trace
        format.splat(),
        format.prettyPrint()
    ),
    defaultMeta: { service: 'inventory_express' },
    transports: [
        new transports.File({ filename: path.join(dir, 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(dir, 'combined.log') })
    ]
});

// If we're not in production then log to the `console` with the format:
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.simple()
    }));
}

module.exports = logger