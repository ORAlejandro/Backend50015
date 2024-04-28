const winston = require("winston");
const configObject = require("../config/config.js");
const {node_env} = configObject;

const myLevels = {
    levelList: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colorsList: {
        fatal: "red",
        error: "yellow",
        warning: "blue",
        info: "green",
        http: "magenta",
        debug: "white"
    }
}

const loggerDesarrollo = winston.createLogger({
    levels: myLevels.levelList,
    transports: [
        new winston.transports.Console({
            level: "debug"
        })
    ]
})

const loggerProduccion = winston.createLogger({
    levels: myLevels.levelList,
    transports: [
        new winston.transports.File({
            filename: "./errors.log",
            level: "error"
        })
    ]
})

const logger = node_env === "produccion" ? loggerProduccion : loggerDesarrollo;

const addLogger = (req, res, next) => {
    req.logger = logger;
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`);
    next();
}

module.exports = addLogger;