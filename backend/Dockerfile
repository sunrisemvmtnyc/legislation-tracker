FROM node:16.17-alpine

WORKDIR /srv

# Install requirements
ADD package.json package-lock.json ./
RUN npm install

# Add the source
ADD . ./

CMD ["npm", "run", "dev"]
