import { getClient, addAuthorizationRequest } from "../data";

import logger from "../../logger";
import { buildUrl } from "../../utils";

import * as randomstring from "randomstring";

import * as __ from "underscore";

export default (req: any, res: any) => {

    const client = getClient(req.query.client_id);

    if (!client) {
        logger.log("error", "Unknown client %s", req.query.client_id);
        res.render("error", {error: "Unknown client"});
        return;
    } else if (!__.contains(client.redirect_uris, req.query.redirect_uri)) {
        logger.log("error", "Mismatched redirect URI, expected %s got %s",
                    client.redirect_uris, req.query.redirect_uri);
        res.render("error", {error: "Invalid redirect URI"});
        return;
    } else {
        const rscope = req.query.scope ? req.query.scope.split(" ") : undefined;
        const cscope = client.scope ? client.scope.split(" ") : undefined;
        if (__.difference(rscope, cscope).length > 0) {
            // client asked for a scope it couldn"t have
            const urlParsed = buildUrl(req.query.redirect_uri, {
                error: "invalid_scope"
            });
            res.redirect(urlParsed);
            return;
        }

        const reqid = addAuthorizationRequest(req.query);

        res.render("approve", {client, reqid, scope: rscope});
        return;
    }
};