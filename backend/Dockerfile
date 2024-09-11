FROM node:20.9-alpine

WORKDIR /srv

# Install requirements
ADD package.json package-lock.json ./
RUN npm install

# Add the source
ADD . ./

# Expose application port
EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
