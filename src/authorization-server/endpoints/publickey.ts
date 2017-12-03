import { Request, Response } from "express";
import { getPublickey } from "./generateTokens";
import logger from "../../logger";

export default (req: Request, res: Response) => {
    logger.log("info", "Public key served");
    res.send({value: getPublickey()});
};
