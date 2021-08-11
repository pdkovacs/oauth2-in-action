import { Request, Response } from "express";
import { getPublickey } from "./generateTokens";
import logger from "../../logger";

export default (req: Request, res: Response) => {
    const publicKey: any = getPublickey();
    logger.child("getPublicKey").info("Public key is being served: %o", publicKey);
    res.send(publicKey);
};
