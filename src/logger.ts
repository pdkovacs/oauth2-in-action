import * as winston from "winston";

const tsFormat = () => new Date().toISOString();
export default new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: false
    })
  ]
});
