// tslint:disable-next-line
const jose = require("jsrsasign");

const kp2 = jose.KEYUTIL.generateKeypair("RSA", 2048);
const jwkPrv2 = jose.KEYUTIL.getJWKFromKey(kp2.prvKeyObj);
const jwkPub2 = jose.KEYUTIL.getJWKFromKey(kp2.pubKeyObj);
console.log("jwkPrv2", jwkPrv2);
console.log("jwkPub2", jose.KEYUTIL.getPEM(kp2.pubKeyObj));
