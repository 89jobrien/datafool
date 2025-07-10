FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Build the production version of the app
RUN npm run build

# --- Serve Stage ---
# Use a tiny, efficient Nginx server to host the static files
FROM nginx:stable-alpine

# Copy the built files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx will automatically serve the index.html file
EXPOSE 80

# Command to start the Nginx server
CMD ["nginx", "-g", "daemon off;"]