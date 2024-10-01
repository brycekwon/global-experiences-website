# Dockerfile
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app
COPY . .

# Expose port (change if your app uses a different port)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
