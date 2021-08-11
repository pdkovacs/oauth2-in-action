import * as util from "util";
import * as winston from "winston";
import { createLogger, format as winstonFormat } from "winston";

const baseLogger = createLogger({
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
        winston.format.timestamp()
    ),
    transports: [
        new winston.transports.Console()
    ]
});

const createChild: (context: string) => winston.Logger = context => {
    return baseLogger.child(context);
};

const contextPrefix = (context: string) => context ? context + ": " : "";

export class ContextAwareLogger {
    private context: string;

    constructor(context: string) {
        this.context = context;
    }

    public log(level: string, msg: string, ...meta: any[]) {
        (this as any)[level](util.format(msg, meta));
    }

    public error(msg: string, ...meta: any[]) {
        baseLogger.error(util.format(contextPrefix(this.context) + msg, ...meta));
    }

    public warn(msg: string, ...meta: any[]) {
        baseLogger.warn(util.format(contextPrefix(this.context) + msg, ...meta));
    }

    public info(msg: string, ...meta: any[]) {
        baseLogger.info(util.format(contextPrefix(this.context) + msg, ...meta));
    }

    public debug(msg: string, ...meta: any[]) {
        baseLogger.debug(util.format(contextPrefix(this.context) + msg, ...meta));
    }

    public verbose(msg: string, ...meta: any[]) {
        baseLogger.verbose(util.format(contextPrefix(this.context) + msg, ...meta));
    }

    public silly(msg: string, ...meta: any[]) {
        baseLogger.silly(util.format(contextPrefix(this.context) + msg, ...meta));
    }

    public isLevelEnabled(level: string) {
        // @ts-ignore
        return baseLogger.levels[level] >= baseLogger.level;
    }

    public setLevel(level: string) {
        baseLogger.level = level;
    }

    public child(context: string): winston.Logger {
        return createChild(context);
    }
}

export default createChild("");
