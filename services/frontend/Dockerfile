# # Base image
FROM node:21

# # Avoid warnings by switching to noninteractive
# ENV DEBIAN_FRONTEND=noninteractive

# # Confirm the node and npm installations
# RUN node --version && npm --version

# # Set working directory
WORKDIR /workspace

# Copy package.json and package-lock.json
COPY package*.json ./

# # Install npm dependencies
RUN npm install

# # Copy the rest of the application files
COPY . .

# ARG REACT_APP_API_URL
# ENV REACT_APP_API_URL=$REACT_APP_API_URL
# ENV WATCHPACK_POLLING=true
# ENV WDS_SOCKET_HOST=127.0.0.1
# ENV WDS_SOCKET_PORT=3000

# Set the command to run when the container starts
CMD ["npm", "start"]

