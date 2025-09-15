# Set the TAG_VERSION argument to 18 by default
ARG TAG_VERSION=22
# --------------> The build image__
# Use the latest Node.js image as the base for the build image
FROM node:${TAG_VERSION} AS build

# Install dumb-init, a utility for initializing processes as PID 1 in containers
RUN apt-get update && \
        apt-get install -y --no-install-recommends dumb-init

# Set the working directory to /usr/src/app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to the working directory
COPY package*.json ./
COPY vanti-utils-* ./

# Install dependencies for building
RUN --mount=type=secret,mode=0644,id=npmrc,target=.npmrc \
        npm install --force --legacy-peer-deps

# Copy the rest of the application code to the working directory
COPY . .

# Configure run production dependency installation,
RUN npm run build && \
        npm ci --only=production --legacy-peer-deps

# --------------> The production image__
# Use the specified version of Node.js for the production image
FROM node:${TAG_VERSION}-bullseye-slim

RUN apt-get update && \
        apt-get install -y --no-install-recommends tzdata && \
        rm -rf /var/lib/apt/lists/*

# Set the NODE_ENV environment variable to 'production'
ENV NODE_ENV=production
ENV TZ=America/Bogota
ENV PORT=3000

# Copy dumb-init from the build image to the production image
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init

# Port to use
EXPOSE 3000

# Switch to the 'node' user to run the application with reduced privileges
USER node

# Set the working directory to /usr/src/app
WORKDIR /usr/src/app

# Set Healtcheck probe container
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD netstat -an | grep 3000 > /dev/null; if [ 0 != $? ]; then exit 1; fi;

# Copy the installed Node.js modules from the build image to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules node_modules/

# Copy the remaining application files to the production image
COPY --chown=node:node --from=build /usr/src/app/dist .

# Define the startup command to run the application
ENTRYPOINT [ "dumb-init" ]

# Options for the startup command to run the application
CMD [ "node", "index.js"]
