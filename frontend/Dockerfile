FROM node:16-alpine

WORKDIR /usr/src/nuxt-app

COPY package.json package-lock.json* ./
RUN npm install

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000
ENV NODE_ENV=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]
