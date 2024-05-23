FROM node:21-alpine3.17 AS development

WORKDIR /jobchain

COPY package*.json ./

RUN npm install glob rimraf

RUN npm install

COPY ../../ .

RUN npm run build

FROM node:21-alpine3.17 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /editor

COPY package*.json ./

RUN npm install --only=production

COPY ../../ .

COPY --from=development /jobchain/dist ./dist

CMD ["node", "dist/main"]
