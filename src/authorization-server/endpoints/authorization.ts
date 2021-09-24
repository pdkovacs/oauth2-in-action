import { Request, Response } from "express";
import { getClient, addAuthorizationRequest } from "../data";

import logger from "../../logger";
import { buildUrl } from "../../utils";

import { getUserInfos, IAuthorizationRequest } from "../data";

import * as __ from "underscore";

export default async (req: Request, res: Response) => {

    const client = await getClient(req.query.client_id as string);

    if (!client) {
        logger.log("error", "Unknown client %s", req.query.client_id as string);
        res.render("error", {error: "Unknown client"});
        return;
    } else if (!__.contains(client.redirect_uris, req.query.redirect_uri)) {
        logger.log("error", "Mismatched redirect URI, expected %s got %s",
                    client.redirect_uris, req.query.redirect_uri);
        res.render("error", {error: "Invalid redirect URI"});
        return;
    } else {
        const rscope = req.query.scope ? (req.query.scope as string).split(" ") : undefined;
        const cscope = client.scope ? client.scope.split(" ") : undefined;
        if (__.difference(rscope, cscope).length > 0) {
            // client asked for a scope it couldn"t have
            const urlParsed = buildUrl(req.query.redirect_uri as string, {
                error: "invalid_scope"
            });
            res.redirect(urlParsed);
            return;
        }
// @ts-ignore
        const reqid = addAuthorizationRequest(req.query);

        res.render("approve", {client, reqid, scope: rscope, userInfos: getUserInfos()});
        return;
    }
};
