import * as net from "net";
import * as os from "os";
import * as path from "path";
import * as bodyParser from "body-parser";
import * as cons from "consolidate";
import * as express from "express";

import { serverPort, getClients } from "./data";

import authorizationEndpoint from "./endpoints/authorization";
import approveEndpoint from "./endpoints/approve";
import tokenEndpoint from "./endpoints/token";
import publickeyEndpoint from "./endpoints/publickey";
import { getGroups as getGroupsEndpoint, getProjects  } from "./endpoints/api";

import nosql from "./store";
import logger from "../logger";
import { wellKnown } from "./endpoints/well-known";

// tslint:disable-next-line
const base64url = require("base64url");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support form-encoded bodies (for the token endpoint)

app.engine("html", cons.underscore);
app.set("view engine", "html");
app.set("views", path.join(__dirname, "views"));
app.set("json spaces", 4);

// authorization server information
const authServer = {
    authorizationEndpoint: "http://localhost:9001/oauth/authorize",
    tokenEndpoint: "http://localhost:9001/oauth/token"
};

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.info("Interceptor", req.url);
    next();
});

app.get("/", (req: express.Request, res: express.Response) => {
    res.render("index", {clients: getClients(), authServer});
});

app.get("/authorize", authorizationEndpoint);
app.get("/oauth/authorize", authorizationEndpoint);
app.get("/jwks", publickeyEndpoint);
app.get("/logout", (req: express.Request, res: express.Response) => {
    const log = logger.child("/logout place-holder");
    log.info("Request to redirect to %s after logging user back is noted", req.query.service);
    res.end();
});
app.get("/api/groups", getGroupsEndpoint);
app.get("/api/projects", getProjects); 

// app.options("/*", (req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//     res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
//     res.send(200);
// });

// app.use("/", express.static("files/authorizationServer"));

// clear the database
nosql.clear();

let listenAddress;
const networkInterfaces = os.networkInterfaces();
for (const netif of Object.keys(networkInterfaces)) {
    for (const ni of networkInterfaces[netif]) {
        if (ni.address.startsWith("192.")) {
            listenAddress = ni.address;
        }
    }
}

const server = app.listen(serverPort, "localhost", () => {
  const host = (server.address() as net.AddressInfo).address;
  const port = (server.address() as net.AddressInfo).port;
  const serverSpec = `${host}:${port}`;
  app.get("/oidc/.well-known/openid-configuration", wellKnown(serverSpec));
  app.post("/approve", approveEndpoint(serverSpec));
  app.post("/oauth/token", tokenEndpoint(serverSpec));
    
  logger.info("Open ID Connect provider is listening at http://%s:%d", host, port);
});
