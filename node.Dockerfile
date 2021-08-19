# Setup Node
FROM node:16.7.0

# Create  workdir, npm install, copy files. 
WORKDIR /home/node/podo
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Expose the port. (Port is set to 8080)
EXPOSE 8080
