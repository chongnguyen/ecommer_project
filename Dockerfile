FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
COPY .npmrc .npmrc
COPY yarn.lock ./
RUN yarn install
COPY . .
CMD ["yarn", "prd"]
