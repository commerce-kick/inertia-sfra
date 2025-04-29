const winston = require('winston');

/**
 * Default logger. All b2c-tools logs to this logger. The defaults here
 * are for library use.
 *
 * The CLI will re-configure this when executed; Library users
 * should also provide their own configuration to consume logs
 */
const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console({
            level: 'error',
            format: winston.format.combine(
                winston.format.splat(),
                winston.format.simple()
            )
        })
    ]
});

module.exports = logger;
