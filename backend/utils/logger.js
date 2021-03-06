const { createLogger, transports, format } = require("winston")
const { combine, timestamp, printf, colorize, align, errors } = format

const expressWinston = require("express-winston")

const config = require("./config")

const loggingFormatString = printf(({ level, message, timestamp, label, stack }) => {
    const labelString = label ? ` [${label}]` : "\t"
    return `${timestamp} [${level}]${labelString} ${stack || message}`
})

const addHostToMessage = format(log => {
    if (log.host) {
        if (log.stack) {
            log.stack = `[${log.host}]\t${log.stack}`
        } else {
            log.message = `[${log.host}]\t${log.message}`
        }
    }
    return log
})

const loggingFormat = combine(
    colorize(),
    timestamp({ format: "DD-MM-YYYY hh:mm:ss" }),
    addHostToMessage(),
    align(),
    errors({ stack: true }),
    loggingFormatString
)

const logger = createLogger({
    level: config.loggingLevel,
    format: loggingFormat,
    transports: [new transports.Console()],
})

const expressLogger = expressWinston.logger({
    winstonInstance: logger,
    baseMeta: { label: "http" },
    msg: "{{req.method}} (Status {{res.statusCode}}, {{res.responseTime}}ms) {{req.url}}",
    expressFormat: false,
    colorize: true,
})

module.exports = { logger, expressLogger }
