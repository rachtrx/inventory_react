# Base image
FROM node:21

# Set working directory
WORKDIR /workspace

# Copy package.json and package-lock.json
COPY package*.json ./

# ARG is only available at build time
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

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