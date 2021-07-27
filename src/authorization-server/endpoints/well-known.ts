import { Request, Response } from "express";
import logger from "../../logger";

export const wellKnown = (serverSpec: string) => (req: Request, resp: Response) => {
  logger.info("well known looked up");
  resp.status(200);
  resp.json(oidcConfiguration(serverSpec));
};

const oidcConfiguration = (serverSpec: string) => ({
  "issuer": `http://${serverSpec}`,
  "authorization_endpoint": `http://${serverSpec}/oauth/authorize`,
  "token_endpoint": `http://${serverSpec}/oauth/token`,
  // "userinfo_endpoint": `http://${serverSpec}/userinfo`,
  "jwks_uri": `http://${serverSpec}/jwks`,
  "scopes_supported":[
    "READ",
    "WRITE",
    "DELETE",
    "openid",
    "scope",
    "profile",
    "email",
    "address",
    "phone"
  ],
  "response_types_supported":[
    "code",
    "code id_token",
    "code token",
    "code id_token token",
    "token",
    "id_token",
    "id_token token"
  ],
  "grant_types_supported":[
    "authorization_code",
    "implicit",
    "password",
    "client_credentials",
    "urn:ietf:params:oauth:grant-type:jwt-bearer"
  ],
  "subject_types_supported":[
    "public"
  ],
  "id_token_signing_alg_values_supported":[
    "HS256",
    "HS384",
    "HS512",
    "RS256",
    "RS384",
    "RS512",
    "ES256",
    "ES384",
    "ES512",
    "PS256",
    "PS384",
    "PS512"
  ],
  "id_token_encryption_alg_values_supported":[
    "RSA1_5",
    "RSA-OAEP",
    "RSA-OAEP-256",
    "A128KW",
    "A192KW",
    "A256KW",
    "A128GCMKW",
    "A192GCMKW",
    "A256GCMKW",
    "dir"
  ],
  "id_token_encryption_enc_values_supported":[
    "A128CBC-HS256",
    "A192CBC-HS384",
    "A256CBC-HS512",
    "A128GCM",
    "A192GCM",
    "A256GCM"
  ],
  "token_endpoint_auth_methods_supported":[
    "client_secret_post",
    "client_secret_basic",
    "client_secret_jwt",
    "private_key_jwt"
  ],
  "token_endpoint_auth_signing_alg_values_supported":[
    "HS256",
    "RS256"
  ],
  "claims_parameter_supported":false,
  "request_parameter_supported":false,
  "request_uri_parameter_supported":false
});
