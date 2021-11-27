const { createLogger, transports, format } = require("winston")
const { combine, timestamp, printf, colorize, align, errors } = format

const config = require("./config")

const loggingFormat = printf(({ level, message, label, timestamp, stack }) => {
    return `${timestamp} [${level}] ${stack || message}`;
});

const logger = createLogger({
    level: config.loggingLevel,
    format: combine(
        colorize(),
        timestamp({ format: "DD-MM-YYYY hh:mm:ss" }),
        align(),
        errors({ stack: true }),
        loggingFormat
    ),
    transports: [
        new transports.Console()
    ]
})

module.exports = logger