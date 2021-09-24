import * as randomstring from "randomstring";

import { promisify } from "util";
import * as fs from "fs";
const readFile = promisify(fs.readFile);

export const serverPort = 9001;
export const publicAddress = (serverSpec: string) => process.env.PUBLIC_ADDRESS || `http://${serverSpec}`;

export interface IUserInfo {
    sub: string;
    preferred_username: string;
    name: string;
    email: string;
    email_verified: boolean;
    username?: string;
    password?: string;
    authorities?: string[];
    groups?: string[];
}

const userInfos: { [key: string]: IUserInfo } = {
    alice: {
        sub: "9XE3-JI34-00132A",
        preferred_username: "alice",
        name: "Alice",
        email: "alice.wonderland@example.com",
        email_verified: true,
        authorities: [
            "ROLE_TEAM_ADMIN"
        ],
        groups: [
            "admin"
        ]
    },

    bob: {
        sub: "1ZT5-OE63-57383B",
        preferred_username: "bob",
        name: "Bob",
        email: "bob.loblob@example.net",
        email_verified: false,
        authorities: [
            "ROLE_USER"
        ],
        groups: [
            "user"
        ]
    },

    carol: {
        sub: "F5Q1-L6LGG-959FS",
        preferred_username: "carol",
        name: "Carol",
        email: "carol.lewis@example.net",
        email_verified: true,
        authorities: [
            "ROLE_TEAM_USER"
        ],
        groups: [
            "user"
        ]
    }
};

export const getUserInfos: () => { [key: string]: IUserInfo } = () => userInfos;

export const getUserInfo: (userId: string) => IUserInfo = userId => userInfos[userId];

// client information
interface IClient {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
    scope: string;
}

const configFile = process.env.CONFIG_FILE || "config.json";

export const getClients = async (): Promise<IClient[]> => {
    const content = await readFile(configFile, "utf8");
    return JSON.parse(content).clients;
};

export const getClient = async (clientId: string): Promise<IClient> => {
    const clients = await getClients();
    return clients.find(client => client.client_id === clientId);
};

export interface IAuthorizationRequest {
    response_type: string;
    scope: string;
    client_id: string;
    redirect_uri: string;
    state: string;
}

let authorizationRequests: { [key: string]: IAuthorizationRequest };
authorizationRequests = {};

export const addAuthorizationRequest: (authRequest: IAuthorizationRequest) => string = authRequest => {
    const requid = randomstring.generate(8);
    authorizationRequests[requid] = authRequest;
    return requid;
};

export const getAuthorizationRequest = (reqid: string) => {
    const query = authorizationRequests[reqid];
    delete authorizationRequests[reqid];
    return query;
};

interface IAuthorizationCode {
    request: IAuthorizationRequest;
    scope: string[];
    user: string;
    clientId: string;
}

let codes: { [key: string]: IAuthorizationCode };
codes = {};

export const addAuthorizationCode = (authRequest: IAuthorizationRequest,
                                     scope: string[],
                                     user: string,
                                     clientId: string) => {
    const code: string = randomstring.generate(8);
    codes[code] = { request: authRequest, scope, user, clientId };
    return code;
};

export const getAuthorizationCode = (codeId: string) => {
    const code: IAuthorizationCode = codes[codeId];
    if (code) {
        delete codes[codeId];
    }
    return code;
};
