FROM node:20.9-alpine

WORKDIR /srv

# Install requirements
ADD package.json package-lock.json ./

RUN npm install

# Add the source
ADD . ./

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "dev"]