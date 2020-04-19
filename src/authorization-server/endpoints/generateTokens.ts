import { IUserInfo } from "../data";
import * as randomstring from "randomstring";
import nosql from "../store";
import logger from "../../logger";

import { publicAddress } from "../data";

// tslint:disable-next-line
const jose = require("jsrsasign");

const sendPublicKeyAsJWK: boolean = process.env.SEND_PUBLIC_KEY_AS !== "PEM-RSA";

/* tslint:disable */
const privateRsaKey =  { kty: 'RSA',
n: 'nE4xn_P1_Zzhi6ovBAlfCP3u2sNyK0V48DmPL1YSqQHvzdXo0_44HDZ9vOPBXPAZ9OztCybGi_567QYQZsjIZvOvmror5Y3_XRe6NAEA_Xbsql59CZ2-oPCmQ9NQGVMzlA_-oUFxImAVntYcjBK-ewVUN03xpqy-ri9u1fnsGTVXDtdjP1x7IegTsd10EhrbLrxUlg-gobNVNPR-e5yv9k8PqtssVOR0AjdDxkTk3w860s4LW03kpeoNq88ZTG28OLYd5y3WFJ0J8eP8mnDWewpEntJmxlYmhNQZPGOuV2hZmi3mFxvKy1J6SmK0t0cQ49Gncqdcc-RqKUVHrVJkVw',
e: 'AQAB',
d: 'inpEQN_UmgH5WNFHoh3jUoYWrT3m0itUgA-eqWNqWM1cdVIEWnypnWUxdL2bPAmEFZgqUmziDnlA0ulCcq2DzqIqe7xg05lAGmvBDf2tsOFBv5bC1Fgq4U8THpgCKM2rrouVHaxq3Pefb_9lfzvEAh2whObLJs14ib2ARpaK87EHxnwZpb_XzaXs_7w51taWnxIGr6amqpjK1eKTswUlgwnqIu3hQPSjj45dvgKWvb15f4cQm8DrnblXKJQHN4xTVl3gJLzOWzIDK1l83OrpSrLgQnPUxAr6sw96oKmX0PDs0flYLhti31m3zM9_555FoIpevvKLnjmpTgEgeex2AQ',
p: '3aQViu1OsQFK54h9zieVV8wlwYSxgQZrOE4pk15hoXCmbKUWDLI65EW1ykBrxSiTuHa8p_vpp54COEne6KUoUW8QiK2zzllkLAvTwZoKwmaTN9gXZDq44KTmxUD2EPjqaGGYIS0qNz4CojT-jMDcOMij1Nb3ndHeLv1S8JPTM4E',
q: 'tIk9_ImRAXjwFjk5KKG-TfdZAdWMVonHsA5V-42SAF4-fMiE3WYFNNH8s-f-KCZ9YcxvbKePu3r--jCfMjdRXKGo8LyW93G2Wz4pqT6RWSU-ySugo2Xh78qqas_NxA1RScTfVqLoDqi5lhzRt_VL8ttcqvt7Nl8NuEbAf3Sno9c',
dp: 'Ojkgb55nTZhJVQlGAyHi2W2HfY6eEobdI61kvpHMk9xD28aCRFONpOmrF7ZUmTZPl-WZKYfDmYSokKDXLcY1ES9b6Iu48DwLVIbG2dTdfrPzeHgLrQjACENJXAf0nADHkyQQEqcKr_haOMIzHEaNk10hrIfMBGldNHrXjttGYAE',
dq: 'K8LwwZxfB-pW2Cw6zLyYMrH4Y1duUzPGschn0zg34dr2bqz0d-5Y6LrV9I4Rr43U6rXxdHcRgjKISAEtNbDvCfMtzl0IgyaPO4LP-nRuKxu6Im1u3Oy_Xa7UrFt-1z0bLTSJpqiKc7M2eUq3E05kgJPn3JJlBYL5Amg0FTEjybU',
qi: 'accVhlQlH3BHbxNs-mgSLwQCDkxsIApvHm9cKBS8HK0XvQrB4FQttx97f6h0cSZVqesGJKIeE8swHVCcgQaYNHgTlJvuGfJVWlwXuR-rI-J0kBcWoBB-r-KcNTqh4YHdsmBIze0ET9U_MrZKfI6xh6tQ0VsnvpYszlCir0UHsV8' };

const kid = jose.KJUR.jws.JWS.getJWKthumbprint(privateRsaKey);

const jwkPub2 = { kty: 'RSA',
"use": "sig",
"kid": kid,
"alg": "RS256",
n: 'nE4xn_P1_Zzhi6ovBAlfCP3u2sNyK0V48DmPL1YSqQHvzdXo0_44HDZ9vOPBXPAZ9OztCybGi_567QYQZsjIZvOvmror5Y3_XRe6NAEA_Xbsql59CZ2-oPCmQ9NQGVMzlA_-oUFxImAVntYcjBK-ewVUN03xpqy-ri9u1fnsGTVXDtdjP1x7IegTsd10EhrbLrxUlg-gobNVNPR-e5yv9k8PqtssVOR0AjdDxkTk3w860s4LW03kpeoNq88ZTG28OLYd5y3WFJ0J8eP8mnDWewpEntJmxlYmhNQZPGOuV2hZmi3mFxvKy1J6SmK0t0cQ49Gncqdcc-RqKUVHrVJkVw',
e: 'AQAB' };

const publicRsaKeyPEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnE4xn/P1/Zzhi6ovBAlf
CP3u2sNyK0V48DmPL1YSqQHvzdXo0/44HDZ9vOPBXPAZ9OztCybGi/567QYQZsjI
ZvOvmror5Y3/XRe6NAEA/Xbsql59CZ2+oPCmQ9NQGVMzlA/+oUFxImAVntYcjBK+
ewVUN03xpqy+ri9u1fnsGTVXDtdjP1x7IegTsd10EhrbLrxUlg+gobNVNPR+e5yv
9k8PqtssVOR0AjdDxkTk3w860s4LW03kpeoNq88ZTG28OLYd5y3WFJ0J8eP8mnDW
ewpEntJmxlYmhNQZPGOuV2hZmi3mFxvKy1J6SmK0t0cQ49Gncqdcc+RqKUVHrVJk
VwIDAQAB
-----END PUBLIC KEY-----`
/* tslint:enable */

/**
 * Allows the payload to be a hybrid of both auth and id tokens for the use case
 * where plain OAuth 2 is used (as an OpenID Connect on diet) for authentication
 * and a single token is issued to act both as an access token and as an ID token.
 */
interface ITokenPayload {
    iss: string;
    sub: string;
    aud: string;
    azp: string;
    iat: number;
    exp: number;
    jti: string;
    authorities?: string[];
    group?: string[];
    username?: string;
    nonce?: string;
}

const packUpTokenPayload = (header: any, payload: ITokenPayload) => {
    const stringHeader = JSON.stringify(header);
    const stringPayload = JSON.stringify(payload);
    const privateKey = jose.KEYUTIL.getKey(privateRsaKey);
    return jose.jws.JWS.sign("RS256", stringHeader, stringPayload, privateKey);
};

const generateTokens = (serverSpec: string, clientId: string, user: IUserInfo, scope: string[],
                        nonce?: string, generateRefreshToken?: boolean) => {

    const ctxLogger = logger.createChild("generateTokens");

    let refreshToken = null;

    if (generateRefreshToken) {
        refreshToken = randomstring.generate();
    }

    const header = { typ: "JWT", alg: "RS256", kid };

    const accessTokenPayload: ITokenPayload = {
        iss: publicAddress(serverSpec),
        sub: user.sub,
        aud: clientId,
        azp: clientId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (5 * 60),
        jti: randomstring.generate(),
        authorities: user.authorities,
        group: user.groups,
        username: user.email
    };

    if (nonce) {
        accessTokenPayload.nonce = nonce;
    }

    const idTokenPayload: ITokenPayload = {
        iss: publicAddress(serverSpec),
        sub: user.sub,
        aud: clientId,
        azp: clientId,
        iat: Math.floor(Date.now() / 1000),
        exp:  Math.floor(Date.now() / 1000) + (5 * 60),
        jti: randomstring.generate(),
        authorities: user.authorities,
        group: user.groups,
        username: user.email
    };

    if (nonce) {
        idTokenPayload.nonce = nonce;
    }

    const accessToken = packUpTokenPayload(header, accessTokenPayload);
    const idToken = packUpTokenPayload(header, idTokenPayload);

    if (refreshToken) {
        nosql.insert({ refresh_token: refreshToken, client_id: clientId, scope, user });
    }

    ctxLogger.info("Issuing access token %s", accessToken);
    if (refreshToken) {
        ctxLogger.info("and refresh token %s", refreshToken);
    }
    ctxLogger.info("with scope %s", accessToken, scope);
    ctxLogger.info("Iussing ID token %s", idToken);

    let cscope = null;
    if (scope) {
        cscope = scope.join(" ");
    }

    const tokenResponse = { access_token: accessToken, token_type: "Bearer", id_token: idToken };

    return tokenResponse;
};

export default generateTokens;

export const getPublickey = () => {
    if (sendPublicKeyAsJWK) {
        return {
            "keys": [ jwkPub2 ]
        };
    } else {
        return {
            value: publicRsaKeyPEM
        };
    }
};
