FROM node:8.9.0
MAINTAINER Axel Amigo <adamigo@neversyn.com>

#Define the environment variables
ENV SERVER_PORT=2190
ENV DATABASE=mongodb://yeah:surebro@mongo:87057/lemongo

#Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

#Install the sexy dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source (this is not a sexy process)
COPY . /usr/src/app

EXPOSE ${SERVER_PORT}

CMD [ "npm", "start" ]
