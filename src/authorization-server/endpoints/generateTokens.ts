import { IUserInfo } from "../data";
import * as randomstring from "randomstring";
import nosql from "../store";
import logger from "../../logger";

// tslint:disable-next-line
const jose = require("jsrsasign");

interface ITokenPayload {
    iss: string;
    sub: string;
    aud: string;
    iat: number;
    exp: number;
    jti?: string;
    nonce?: string;
}

/* tslint:disable */
const rsaKey = {
    "alg": "RS256",
    "d": "ZXFizvaQ0RzWRbMExStaS_-yVnjtSQ9YslYQF1kkuIoTwFuiEQ2OywBfuyXhTvVQxIiJqPNnUyZR6kXAhyj__wS_Px1EH8zv7BHVt1N5TjJGlubt1dhAFCZQmgz0D-PfmATdf6KLL4HIijGrE8iYOPYIPF_FL8ddaxx5rsziRRnkRMX_fIHxuSQVCe401hSS3QBZOgwVdWEb1JuODT7KUk7xPpMTw5RYCeUoCYTRQ_KO8_NQMURi3GLvbgQGQgk7fmDcug3MwutmWbpe58GoSCkmExUS0U-KEkHtFiC8L6fN2jXh1whPeRCa9eoIK8nsIY05gnLKxXTn5-aPQzSy6Q",
    "e": "AQAB",
    "n": "p8eP5gL1H_H9UNzCuQS-vNRVz3NWxZTHYk1tG9VpkfFjWNKG3MFTNZJ1l5g_COMm2_2i_YhQNH8MJ_nQ4exKMXrWJB4tyVZohovUxfw-eLgu1XQ8oYcVYW8ym6Um-BkqwwWL6CXZ70X81YyIMrnsGTyTV6M8gBPun8g2L8KbDbXR1lDfOOWiZ2ss1CRLrmNM-GRp3Gj-ECG7_3Nx9n_s5to2ZtwJ1GS1maGjrSZ9GRAYLrHhndrL_8ie_9DS2T-ML7QNQtNkg2RvLv4f0dpjRYI23djxVtAylYK4oiT_uEMgSkc4dxwKwGuBxSO0g9JOobgfy0--FUHHYtRi0dOFZw",
    "kty": "RSA",
    "kid": "authserver"
};
/* tslint:enable */

const generateTokens = (clientId: string, user: IUserInfo, scope: string[],
                        nonce?: string, generateRefreshToken?: boolean) => {
    const accessToken: string = randomstring.generate();

    let refreshToken = null;

    if (generateRefreshToken) {
        refreshToken = randomstring.generate();
    }

    const header = { typ: "JWT", alg: "RS256", kid: rsaKey.kid };

    const payload: ITokenPayload = {
        iss: "http://localhost:9001/",
        sub: user.sub,
        aud: clientId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (5 * 60)
    };

    if (nonce) {
        payload.nonce = nonce;
    }

    const stringHeader = JSON.stringify(header);
    const stringPayload = JSON.stringify(payload);
    const privateKey = jose.KEYUTIL.getKey(rsaKey);
    const idToken = jose.jws.JWS.sign("RS256", stringHeader, stringPayload, privateKey);

    nosql.insert({ access_token: accessToken, client_id: clientId, scope, user });

    if (refreshToken) {
        nosql.insert({ refresh_token: refreshToken, client_id: clientId, scope, user });
    }

    logger.log("info", "Issuing access token %s", accessToken);
    if (refreshToken) {
        logger.log("info", "and refresh token %s", refreshToken);
    }
    logger.log("info", "with scope %s", accessToken, scope);
    logger.log("info", "Iussing ID token %s", idToken);

    let cscope = null;
    if (scope) {
        cscope = scope.join(" ");
    }

    const tokenResponse = { access_token: accessToken, token_type: "Bearer",
                            refresh_token: refreshToken, scope: cscope, id_token: idToken };

    return tokenResponse;
};

export default generateTokens;
