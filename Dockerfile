# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application to the working directory
COPY . .

# Build the Nuxt.js application
RUN npm run build

# Expose port 80
EXPOSE 80

# Set the environment variable for the port
ENV PORT 80

# Start the application
CMD ["npm", "start"]
