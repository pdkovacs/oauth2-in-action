import { getAuthorizationRequest, getClient, addAuthorizationCode, getUserInfo } from "../data";
import logger from "../../logger";
import { buildUrl } from "../../utils";
import generateTokens from "./generateTokens";

import * as randomstring from "randomstring";
import * as qs from "qs";

import * as __ from "underscore";
import * as __string from "underscore.string";

export default (req: any, res: any) => {

    const reqid = req.body.reqid;
    const query = getAuthorizationRequest(reqid);

    if (!query) {
        // there was no matching saved request, this is an error
        res.render("error", {error: "No matching authorization request"});
        return;
    }

    if (req.body.approve) {
        if (query.response_type === "code") {
            // user approved access
            const user = req.body.user;
            // save the code and request for later
            const code = addAuthorizationCode(query, [], user, query.client_id);
            const urlParsed = buildUrl(query.redirect_uri, {
                code,
                state: query.state
            });
            res.redirect(urlParsed);
            return;
        } else if (query.response_type === "token") { // implicite grant
            const user: string = req.body.user;

            const scope = getScopesFromForm(req.body);

            const client = getClient(query.client_id);
            const cscope = client.scope ? client.scope.split(" ") : undefined;
            if (__.difference(scope, cscope).length > 0) {
                // client asked for a scope it couldn't have
                const urlParsedInvalid = buildUrl(query.redirect_uri, {
                    error: "invalid_scope"
                });
                res.redirect(urlParsedInvalid);
                return;
            }

            const userInfo = getUserInfo(user);
            if (!user) {
                logger.log("error", "Unknown user %s", user);
                res.status(500).render("error", {error: "Unknown user " + user});
                return;
            }

            logger.log("info", "User %j", user);

            const tokenResponse = generateTokens(query.client_id, userInfo, cscope);

            const params = query.state ? {state: query.state} : {};
            const urlParsed = buildUrl(query.redirect_uri, params, qs.stringify(tokenResponse));
            res.redirect(urlParsed);
            return;
        } else {
            // we got a response type we don't understand
            const urlParsed = buildUrl(query.redirect_uri, {
                error: "unsupported_response_type"
            });
            res.redirect(urlParsed);
            return;
        }
    } else {
        // user denied access
        const urlParsed = buildUrl(query.redirect_uri, {
            error: "access_denied"
        });
        res.redirect(urlParsed);
        return;
    }

};

const getScopesFromForm = (body: any) => {
    return __.filter(__.keys(body), s => __string.startsWith(s, "scope_"))
                .map(s => s.slice("scope_".length));
};
