# Use the LTS version of Node
FROM node:lts

# Create app directory
WORKDIR /app

# Copy lock and manifest first
COPY package.json pnpm-lock.yaml ./

# Install pnpm, then dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy remaining files
COPY . .

# Expose any needed port (e.g., 8000)
EXPOSE 8000

# Command to start
CMD ["pnpm", "run", "dev"]