
### STAGE 1: Build ###
FROM node:latest AS build
RUN mkdir -p /usr/src/app && chown node:node /usr/src/app
RUN mkdir -p /usr/src/app/node_modules && chown node:node /usr/src/app/node_modules
RUN ln -s /usr/src/app\@angular/cli/bin/ng /usr/local/bin/ng
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
COPY . .
RUN chmod +x docker-entrypoint.sh
RUN npm ci --quiet
# RUN npm run build
EXPOSE 4200
# ENTRYPOINT [ "./docker-entrypoint.sh" ]

### STAGE 2: Run ###
FROM nginx:1.23.2
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/veggie-battle-frontend /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
