# syntax=docker/dockerfile:1

FROM node:22-alpine@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32 AS dev

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

EXPOSE 3000

CMD ["npm", "run", "dev"]
