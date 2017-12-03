import { Request, Response } from "express";
import { getPublickey } from "./generateTokens";

export default (req: Request, res: Response) => {
    res.send({value: getPublickey()});
};
