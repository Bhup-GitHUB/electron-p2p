# Use an official Node.js runtime as a parent image
FROM node:18-bullseye

# Install system dependencies for Electron and Python
# (These are real dependencies needed if one were to actually run it in Docker)
RUN apt-get update && apt-get install -y \
    python3 \
    libnss3 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libxss1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the signaling server port
EXPOSE 3000

# Define environment variable for P2P coordination
ENV P2P_ENV=production

# Command to run the application
# Note: In a real headless Docker env, you'd likely run the signaling server
# or use xvfb for the Electron client.
CMD ["npm", "start"]
