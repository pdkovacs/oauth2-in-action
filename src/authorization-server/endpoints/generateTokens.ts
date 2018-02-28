import { IUserInfo } from "../data";
import * as randomstring from "randomstring";
import nosql from "../store";
import logger from "../../logger";

// tslint:disable-next-line
const jose = require("jsrsasign");

/* tslint:disable */
const privateRsaKey =  {
    kty: 'RSA',
    n: 'hriFh7nnhFjiVsoNt5C-aYOkD8OrnjsorNzTLrmUbbOSLFLJJD3Ws7Mw9Dd0UGlEr3gp8s4dsGD-A-KLXNGCeH2bo7H8UyRQkzw47FrEgV4KovuJs-0ccpfn765_gBLZ9y95aDpZh5TM8aF7HXGCiToYZwayZur8Bg1J9hUFj6MNuKJ4FKdJmirSi3GjuCgmjnRPjC3H0kJymapwlrDmBiChYzGd5Hlf6Kfp3iwFONOV6oa9VCig42bsxKkdhviN-MBuIvSAXNMFSBkMFRwuiTniWAGdLRXriZlOPq47TU3syYYZ9A0aBkjga6Y-0S87HbtKON-WVJPX_m96gEr1Cw',
    e: 'AQAB',
    d: 'ZlR6eOHozUqGgc3wJWK4f4USdTb3gLUG7Ga_slocOEeR3ED1r6WZE94kbRxCKWIMXgw0MM4HFxZVW7YUjWhGZiditTBYrP6EhZHU2xMG-Azqn2nY6uZMGW7xKcmt5yZqkatp2JWZs7Z_BXrW_UJfGMUcDAW2NR6AWEh3yYemNbdVawgd9yU-VH44DZeX0EpqF_EpPYjA4Y61RTUwQj6N2M7kdhbxufkB-1JR88XXeclZ5OPIZ7oU0jEZOG5ffh5RHs2ugtKnEhDBQiNtjUt7s77rusrFQxNEm0otl1PLIP6mj5jFMA-upcLDmeR7IQOuGQW2ZufL-iM_OMGjel8joQ',
    p: 'yjS-TGj4EhTZ9ULSikQeMBHaZo4VKaWQHzUllmWqa7qZch9aXdG_Ey3ghHR7dMi3JO9uZNQ1hpGZKq58vR8Eao_TZBIJFAy9lW019laQsRHULa4gM5q8mgLPM2H7iywFAbTnhVaADTkJZpw6CHr6H_SXQoLsUZ3abhzSuayc800',
    q: 'qo-w3NPiHw2yDqdkQrKfnyHZE3o1V6rmFlG5tgLJ9XQ2dZxw6baj24dEzti1tfCcXvhZwNYA_C6uFSR40SaHtw8pklKTH-5K3K3Ad2OJHo7a0Pr6KI8y6jqU_MJ76qttXxtzyjKEpK_dsnqHHPx25SjVSgbiSG1VKqCAkgdmrbc',
    dp: 'BkHTkbG923FhvUEwGq847-vdgkbrSLqi1xRh8WF8AJFppipqNXUEIKfOxsqD930ujaoLFHusnFltD_EOUxvemx2QQQx9020BgNo8TT8ogxI2KqO0w2QKagmkN8bUbd4S2Zarg2jF1aLqM46qDREhJFQBSkGa5nuoArhJnQ1GXhE',
    dq: 'U13Sg81o6-bEzlbRMayfSqe_s757DjOxLN2bWTR5xGieKdRieEnWQ3oVjsjr4FcQB3d6Xz_60Uh7vEfMaeZcVYSqvCNyWBwgKUcgGPrkzbPjjlvuJB8CMuyZYAYrjWNnHSKM8RrKLLjtMsyi9-8Kqi3QOtOsjNwr0Z8L2NSXQnc',
    qi: 'aQIs-h62BSQLEtAw9PJQAKgb8wxh2Lq9gZS7avJB9mi03Y51OkDsPszxzvVr6hMhOcDV5uc-0it0ZSBJp2RcTMt_l1-V6Rnxm1TejL-yRKgZolzTFi-gT7XqiRPVqa9vir0CDwqbq-PL0uCEfxizJV9091v3j3dOIgoAZ0AMVd0'
};

const publicRsaKeyPEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhriFh7nnhFjiVsoNt5C+
aYOkD8OrnjsorNzTLrmUbbOSLFLJJD3Ws7Mw9Dd0UGlEr3gp8s4dsGD+A+KLXNGC
eH2bo7H8UyRQkzw47FrEgV4KovuJs+0ccpfn765/gBLZ9y95aDpZh5TM8aF7HXGC
iToYZwayZur8Bg1J9hUFj6MNuKJ4FKdJmirSi3GjuCgmjnRPjC3H0kJymapwlrDm
BiChYzGd5Hlf6Kfp3iwFONOV6oa9VCig42bsxKkdhviN+MBuIvSAXNMFSBkMFRwu
iTniWAGdLRXriZlOPq47TU3syYYZ9A0aBkjga6Y+0S87HbtKON+WVJPX/m96gEr1
CwIDAQAB
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
    iat: number;
    exp: number;
    jti: string;
    authorities?: string[];
    username?: string;
    nonce?: string;
}

const packUpTokenPayload = (header: any, payload: ITokenPayload) => {
    const stringHeader = JSON.stringify(header);
    const stringPayload = JSON.stringify(payload);
    const privateKey = jose.KEYUTIL.getKey(privateRsaKey);
    return jose.jws.JWS.sign("RS256", stringHeader, stringPayload, privateKey);
};

const generateTokens = (clientId: string, user: IUserInfo, scope: string[],
                        nonce?: string, generateRefreshToken?: boolean) => {
    let refreshToken = null;

    if (generateRefreshToken) {
        refreshToken = randomstring.generate();
    }

    const header = { typ: "JWT", alg: "RS256", kid: jose.KJUR.jws.JWS.getJWKthumbprint(privateRsaKey) };

    const accessTokenPayload: ITokenPayload = {
        iss: "http://localhost:9001/",
        sub: user.sub,
        aud: clientId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (5 * 60),
        jti: randomstring.generate(),
        authorities: user.authorities,
        username: user.email
    };

    if (nonce) {
        accessTokenPayload.nonce = nonce;
    }

    const idTokenPayload: ITokenPayload = {
        iss: "http://localhost:9001",
        sub: user.sub,
        aud: clientId,
        iat: Math.floor(Date.now() / 1000),
        exp:  Math.floor(Date.now() / 1000) + (5 * 60),
        jti: randomstring.generate(),
        authorities: user.authorities,
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

    const tokenResponse = { access_token: accessToken, token_type: "Bearer", id_token: idToken };

    return tokenResponse;
};

export default generateTokens;

export const getPublickey = () => {
    return publicRsaKeyPEM;
};
