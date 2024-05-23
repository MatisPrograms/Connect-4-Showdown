FROM node:18-slim
LABEL maintainer="Matis HERRMANN"
LABEL name="PS8-Connect-4-Server"
WORKDIR /connect4server

COPY package*.json ./
RUN npm install

EXPOSE 8000
CMD if [ "$PROD" = "dev_start" ]; then npm run dev_start; else npm run start; fi
