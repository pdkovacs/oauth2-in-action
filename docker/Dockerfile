FROM node:carbon

COPY dist/ /usr/src/app
COPY dist/package*.json /usr/src/app/

WORKDIR /usr/src/app
RUN npm install --only=production

EXPOSE 9001

CMD [ "node", "authorization-server/server.js" ]
