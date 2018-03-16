import * as util from "util";
import * as winston from "winston";

const tsFormat = () => new Date().toISOString();
const baseLogger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: tsFormat,
            colorize: false
        })
    ]
});

const createChild: (context: string) => ContextAwareLogger = context => {
    return new ContextAwareLogger(context);
};

type CreateChildContext = (context: string) => winston.LoggerInstance;

const contextPrefix = (context: string) => context ? context + ": " : "";

class ContextAwareLogger {
    private context: string;

    constructor(context: string) {
        this.context = context;
    }

    public log(level: string, msg: string, ...meta: any[]) {
        (this as any)[level](util.format(meta));
    }

    public error(msg: string, ...meta: any[]) {
        baseLogger.error(contextPrefix(this.context) + msg, meta);
    }

    public warn(msg: string, ...meta: any[]) {
        baseLogger.warn(contextPrefix(this.context) + msg, meta);
    }

    public info(msg: string, ...meta: any[]) {
        baseLogger.info(contextPrefix(this.context) + msg, meta);
    }

    public debug(msg: string, ...meta: any[]) {
        baseLogger.debug(contextPrefix(this.context) + msg, meta);
    }

    public verbose(msg: string, ...meta: any[]) {
        baseLogger.verbose(contextPrefix(this.context) + msg, meta);
    }

    public silly(msg: string, ...meta: any[]) {
        baseLogger.silly(contextPrefix(this.context) + msg, meta);
    }

    public isLevelEnabled(level: string) {
        // @ts-ignore
        return baseLogger.levels[level] >= baseLogger.level;
    }

    public setLevel(level: string) {
        baseLogger.level = level;
    }

    public createChild(context: string): ContextAwareLogger {
        return createChild(context);
    }
}

export default createChild("");
