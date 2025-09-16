FROM node:22.11.0-alpine AS build_stage

RUN apk add --update python3 build-base

COPY src /app/src
COPY view /app/view
COPY common /app/common
COPY content /app/content

COPY package.json /app
COPY package-lock.json /app
COPY tsconfig.json /app
COPY tsconfig.src.json /app
COPY tsconfig.view.json /app
COPY vite.config.mts /app
COPY .eslintrc.cjs /app
COPY start-prod.sh /app

WORKDIR /app
RUN npm ci

# Build args
ARG NODE_ENV
ARG SERVER_PORT
ARG DB_MIGRATIONS

# Build the app
RUN npm run build
RUN npm run build:client

# Clean up for runtime image
RUN rm package-lock.json vite.config.mts .eslintrc.cjs
RUN rm tsconfig.json tsconfig.view.json
RUN rm -rf view

FROM node:22.11.0-alpine AS runtime_stage

COPY --from=build_stage /app /app

# Verify the build output - remove this later
RUN ls -la /app/
RUN ls -la /app/dist/
RUN ls -la /app/dist/src/
RUN ls -la /app/dist/view/
RUN ls -la /app/dist/common/

ENV DB_MIGRATIONS=${DB_MIGRATIONS}
CMD [ "sh", "/app/start-prod.sh" ]