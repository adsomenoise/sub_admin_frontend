FROM node:22.18.0-alpine AS build

WORKDIR /app

RUN corepack enable

ARG REACT_APP_API_BASE_URL
ARG REACT_APP_TALENT_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_TALENT_BASE_URL=$REACT_APP_TALENT_BASE_URL

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Create nginx config
RUN echo 'server { \
  listen 8080; \
  server_name _; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
    try_files $uri $uri/ /index.html; \
  } \
  location /static/ { \
    expires 1y; \
    add_header Cache-Control "public, immutable"; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]