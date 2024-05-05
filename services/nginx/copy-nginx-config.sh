#!/bin/bash

if [ "$ENVIRONMENT" = "production" ]; then
  cp /nginx.prod.conf /etc/nginx/conf.d/default.conf
else
  cp /nginx.conf /etc/nginx/conf.d/default.conf
fi

# Start Nginx
nginx -g 'daemon off;'
