# Use an official Node runtime as a parent image
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to workdir
COPY package*.json ./

RUN apt-get update && \
    apt-get install -y postgresql-client \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# RUN npm install -g npm@10.6.0
# # Install any needed packages specified in package.json
RUN npm install

# Bundle app source inside Docker image
COPY . .

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/usr/local/bin/entrypoint.sh", "node", "--inspect", "server.js"]
