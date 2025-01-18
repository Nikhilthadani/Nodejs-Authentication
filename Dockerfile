FROM node:alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port the app runs on
EXPOSE 5002
    # Run the application
CMD [ "node", "dist/index.js" ]
