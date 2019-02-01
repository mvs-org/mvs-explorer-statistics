# Build stage
FROM library/node:11.2-alpine
RUN npm i -g  typescript ts-node
WORKDIR /app
COPY . .
RUN npm i && tsc

# Make final image
FROM node:10-alpine
# Set the work directory
WORKDIR /app
# Add application files
COPY --from=0 /app/dist ./dist
# Add package.json and install dependencies
COPY --from=0 /app/package.json  .
RUN npm i --production
CMD ["node", "dist/index.js"]
