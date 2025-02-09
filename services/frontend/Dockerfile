# Base image
FROM node:21

# Set working directory
WORKDIR /workspace

# Copy package.json and package-lock.json
COPY package*.json ./

# ARG is only available at build time
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

ARG REACT_APP_SSO_GRAPH_API_ENDPOINT
ENV REACT_APP_SSO_GRAPH_API_ENDPOINT=${REACT_APP_SSO_GRAPH_API_ENDPOINT}

ARG REACT_APP_SSO_REDIRECT_URI
ENV REACT_APP_SSO_REDIRECT_URI=${REACT_APP_SSO_REDIRECT_URI}

ARG REACT_APP_SSO_TENANT_ID
ENV REACT_APP_SSO_TENANT_ID=${REACT_APP_SSO_TENANT_ID}

ARG REACT_APP_SSO_CLIENT_ID
ENV REACT_APP_SSO_CLIENT_ID=${REACT_APP_SSO_CLIENT_ID}

# Install npm dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React app with production mode
RUN npm run build

# Expose the build directory as a static server
RUN npm install -g serve

# Set the command to serve the built app
CMD ["serve", "-s", "build", "-l", "3000"]