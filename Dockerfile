FROM node:12.1.0 as builder

WORKDIR /usr/share/nginx/html

COPY . .
ENV APP_ENV=prod
ENV API_BASE=https://links-login.getlinks.jp/api
ENV LOGIN_BASE=https://oauth.getlinks.jp
ENV CLIENT_ID=3a6c513a-a189-4586-a0f8-cba80ed84de8
RUN yarn
RUN yarn build


FROM nginx:1.12-alpine

WORKDIR /usr/share/nginx/html
COPY --from=0 /usr/share/nginx/html/umd .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
