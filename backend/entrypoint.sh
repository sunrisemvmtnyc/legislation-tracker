#!/bin/sh
if [ ${NODE_ENV} == "production" ]
then
    npm start
else
    npm run dev
fi
