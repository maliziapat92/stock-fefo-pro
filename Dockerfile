FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend code
COPY server.js .
COPY routes ./routes
COPY database ./database
COPY .env* ./

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
RUN npm run build

# Back to root for server
WORKDIR /app

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
