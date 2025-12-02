# Use official Node.js LTS image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package files first (for caching dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the project files
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["node", "main.js"]
