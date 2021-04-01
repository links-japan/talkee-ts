FROM node:12.1.0 as builder

WORKDIR /usr/share/nginx/html

COPY . .
RUN yarn
RUN yarn build


FROM nginx:1.12-alpine

WORKDIR /usr/share/nginx/html
COPY --from=0 /usr/share/nginx/html/umd .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
