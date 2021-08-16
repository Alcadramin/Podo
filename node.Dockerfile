# Setup Node 14
FROM node:14

# Create  workdir, copy environment variables. (Port is set to 8080)
USER node
RUN mkdir -p /home/node/podo
WORKDIR /home/node/podo

COPY --chown=node:node . .
RUN npm install --only=prod

# Expose the port.
EXPOSE 8080
