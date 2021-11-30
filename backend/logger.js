const { createLogger, transports, format } = require("winston")
const { combine, timestamp, printf, colorize, align, errors } = format

const expressWinston = require('express-winston');

const config = require("./config")

const loggingFormatString = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}] ${stack || message}`;
});

const loggingFormat = combine(
    colorize(),
    timestamp({ format: "DD-MM-YYYY hh:mm:ss" }),
    align(),
    errors({ stack: true }),
    loggingFormatString
)

const logger = createLogger({
    level: config.loggingLevel,
    format: loggingFormat,
    transports: [
        new transports.Console()
    ]
})

const expressLogger = expressWinston.logger({
    transports: [
        new transports.Console()
    ],
    format: loggingFormat,
    meta: false,
    msg: "HTTP {{req.method}} (Status {{res.statusCode}}, {{res.responseTime}}ms) {{req.url}}",
    expressFormat: false,
    colorize: true
})

module.exports = { logger, expressLogger }