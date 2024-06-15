# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the work ing directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application to the working directory
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
