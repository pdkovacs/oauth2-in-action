import * as randomstring from "randomstring";

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
        sub: "alice.wonderland@example.com",
        preferred_username: "alice",
        name: "Alice",
        email: "alice.wonderland@example.com",
        email_verified: true,
        authorities: [
            "ROLE_TEAM_ADMIN"
        ],
        groups: [
            "VIP"
        ]
    },

    bob: {
        sub: "bob.loblob@example.net",
        preferred_username: "bob",
        name: "Bob",
        email: "bob.loblob@example.net",
        email_verified: false,
        authorities: [
            "ROLE_USER"
        ],
        groups: [
            "USER",
            "EXTERNAL"
        ]
    },

    carol: {
        sub: "carol.lewis@example.net",
        preferred_username: "carol",
        name: "Carol",
        email: "carol.lewis@example.net",
        email_verified: true,
        authorities: [
            "ROLE_TEAM_USER"
        ],
        groups: [
            "EXTERNAL"
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

const clients: IClient[] = [
    {
        client_id: "oauth-client-1",
        client_secret: "oauth-client-secret-1",
        redirect_uris: ["http://design.test/icons/login"],
        scope: "foo bar"
    },
    {
        client_id: "oauth-client-2",
        client_secret: "oauth-client-secret-2",
        redirect_uris: ["http://localhost:8080/oauth2-login"],
        scope: "bar"
    },
    {
        client_id: "marvin-live",
        client_secret: "Design Hub",
        redirect_uris: ["http://192.168.68.112:8888/domains/synergy/callback"],
        scope: "bar openid read"
    },
    {
        client_id: "native-client-1",
        client_secret: "oauth-native-secret-1",
        redirect_uris: ["mynativeapp://"],
        scope: "openid profile email phone address"
    }
];

export const getClient = (clientId: string) => clients.find(client => client.client_id === clientId);
export const getClients = () => clients;

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
