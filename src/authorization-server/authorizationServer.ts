import * as bodyParser from "body-parser";
import * as cons from "consolidate";
import * as express from "express";

import { getClients } from "./data";

import authorizationEndpoint from "./endpoints/authorization";
import approveEndpoint from "./endpoints/approve";
import tokenEndpoint from "./endpoints/token";
import publickeyEndpoint from "./endpoints/publickey";

import nosql from "./store";
import logger from "../logger";

// tslint:disable-next-line
const base64url = require("base64url");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // support form-encoded bodies (for the token endpoint)

app.engine("html", cons.underscore);
app.set("view engine", "html");
app.set("views", "src/authorization-server/views");
app.set("json spaces", 4);

// authorization server information
const authServer = {
    authorizationEndpoint: "http://localhost:9001/authorize",
    tokenEndpoint: "http://localhost:9001/token"
};

app.get("/", (req, res) => {
    res.render("index", {clients: getClients(), authServer});
});

app.get("/authorize", authorizationEndpoint);
app.post("/approve", approveEndpoint);
app.post("/token", tokenEndpoint);
app.get("/publickey", publickeyEndpoint);

app.use("/", express.static("files/authorizationServer"));

// clear the database
nosql.clear();

const server = app.listen(9001, "localhost", () => {
  const host = server.address().address;
  const port = server.address().port;

  logger.log("info", "OAuth Authorization Server is listening at http://%s:%s", host, port);
});