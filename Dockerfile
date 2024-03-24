FROM node:alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --production

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]