# Setup Node
FROM node:14.17.4

# Create  workdir, npm install, copy files. 
WORKDIR /home/node/podo
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Expose the port. (Port is set to 8080)
EXPOSE 8080
