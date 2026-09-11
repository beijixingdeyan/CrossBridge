FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY index.js ./
RUN mkdir -p uploads
EXPOSE 8081
CMD ["node","index.js"]
