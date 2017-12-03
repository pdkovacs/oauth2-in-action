import { Request, Response, NextFunction } from "express";
import * as querystring from "querystring";
import * as randomstring from "randomstring";
import * as __ from "underscore";

import { getClient, getUserInfo, getAuthorizationCode } from "../data";

import logger from "../../logger";
import nosql from "../store";
import generateTokens from "./generateTokens";

export default (req: Request, res: Response) => {
    let clientCredentials: string[];
    let clientId: string;
    let clientSecret: string;

    const auth = req.headers.authorization as string;
    if (auth) {
        // check the auth header
        clientCredentials = new Buffer(auth.slice("basic ".length), "base64").toString().split(":");
        clientId = querystring.unescape(clientCredentials[0]);
        clientSecret = querystring.unescape(clientCredentials[1]);
    }

    // otherwise, check the post body
    if (req.body.client_id) {
        if (clientId) {
            // if we"ve already seen the client"s credentials in the authorization header, this is an error
            logger.log("error", "Client attempted to authenticate with multiple methods");
            res.status(401).json({error: "invalid_client"});
            return;
        }

        clientId = req.body.client_id;
        clientSecret = req.body.client_secret;
    }

    const client = getClient(clientId);
    if (!client) {
        logger.log("error", "Unknown client %s", clientId);
        res.status(401).json({error: "invalid_client"});
        return;
    }

    if (client.client_secret !== clientSecret) {
        logger.log("error", "Mismatched client secret, expected %s got %s", client.client_secret, clientSecret);
        res.status(401).json({error: "invalid_client"});
        return;
    }

    if (req.body.grant_type === "authorization_code") {

        const code = getAuthorizationCode(req.body.code);

        if (code) {
            if (code.request.client_id === clientId) {

                const accessToken = randomstring.generate();

                nosql.insert({ access_token: accessToken, client_id: clientId, scope: code.scope });

                logger.log("info", "Issuing access token %s, with scope %s", accessToken, code.scope);

                const cscope = code.scope ? code.scope.join(" ") : null;

                const tokenResponse = { access_token: accessToken, token_type: "Bearer", scope: cscope };

                res.status(200).json(tokenResponse);
                logger.log("info", "Issued tokens for code %s", req.body.code);

                return;
            } else {
                logger.log("error", "Client mismatch, expected %s got %s", code.request.client_id, clientId);
                res.status(400).json({error: "invalid_grant"});
                return;
            }
        } else {
            logger.log("error", "Unknown code, %s", req.body.code);
            res.status(400).json({error: "invalid_grant"});
            return;
        }
    } else if (req.body.grant_type === "client_credentials") {
        const scope = req.body.scope ? req.body.scope.split(" ") : undefined;
        const client1 = getClient(req.query.client_id); // FIXME: client1 -> client | FIXME (?req?).query
        const cscope = client1.scope ? client1.scope.split(" ") : undefined;
        if (__.difference(scope, cscope).length > 0) {
            // client asked for a scope it couldn"t have
            res.status(400).json({error: "invalid_scope"});
            return;
        }

        const accessToken = randomstring.generate();
        const tokenResponse = { access_token: accessToken, token_type: "Bearer", scope: scope.join(" ") };
        nosql.insert({ access_token: accessToken, client_id: clientId, scope });
        logger.log("info", "Issuing access token %s", accessToken);
        res.status(200).json(tokenResponse);
        return;

    } else if (req.body.grant_type === "refresh_token") {
        nosql.all((token: any) => {
            return (token.refresh_token === req.body.refresh_token);
        }, (err: any, tokens: any[]) => {
            if (tokens.length === 1) {
                const token = tokens[0];
                if (token.client_id !== clientId) {
                    logger.log("error", "Invalid client using a refresh token, expected %s got %s",
                               token.client_id, clientId);
                    // tslint:disable-next-line:no-empty
                    nosql.remove((found: any) => (found === token), () => {} );
                    res.status(400).end();
                    return;
                }
                logger.log("info", "We found a matching token: %s", req.body.refresh_token);
                const accessToken = randomstring.generate();
                const tokenResponse = { access_token: accessToken, token_type: "Bearer",
                                         refresh_token: req.body.refresh_token };
                nosql.insert({ access_token: accessToken, client_id: clientId });
                logger.log("info", "Issuing access token %s for refresh token %s",
                            accessToken, req.body.refresh_token);
                res.status(200).json(tokenResponse);
                return;
            } else {
                logger.log("error", "No matching token was found.");
                res.status(401).end();
            }
        });
    } else if (req.body.grant_type === "password") {
        const username = req.body.username;
        const user = getUserInfo(username);
        if (!user) {
            logger.log("error", "Unknown user %s", user);
            res.status(401).json({error: "invalid_grant"});
            return;
        }
        logger.log("info", "user is %j ", user);

        const password = req.body.password;
        if (user.password !== password) {
            logger.log("error", "Mismatched resource owner password, expected %s got %s", user.password, password);
            res.status(401).json({error: "invalid_grant"});
            return;
        }

        const scope = req.body.scope;

        const tokenResponse = generateTokens(clientId, user, scope);

        res.status(200).json(tokenResponse);
        return;
    } else {
        logger.log("error", "Unknown grant type %s", req.body.grant_type);
        res.status(400).json({error: "unsupported_grant_type"});
    }
};
