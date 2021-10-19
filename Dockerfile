FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY yarn.lock ./

RUN yarn
RUN npm rebuild argon2 --build-from-source
COPY . .
COPY .env.production .env
RUN yarn build
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source

ENV NODE_ENV production

EXPOSE 4000
CMD [ "node", "dist/index.js" ]
USER node