### STAGE 1: Build ###
FROM trion/ng-cli AS build
RUN mkdir -p /app #&& chown node:node /app
# RUN mkdir -p /app/node_modules && chown node:node /app/node_modules
# RUN ln -s /app/node_modules/.bin/ng /usr/local/bin/ng
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --quiet
COPY frontend /app
# RUN chmod +x app/docker-entrypoint.sh
RUN npm run build-prod
# EXPOSE 4200
# ENTRYPOINT [ "./docker-entrypoint.sh" ]
# CMD ["npm", "run", "build-prod"]

### STAGE 2: Run ###
FROM nginx:1.23.2
RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY frontend/nginx.conf /etc/nginx/nginx.conf
RUN rm /usr/share/nginx/html/index.html
COPY --from=build /app/dist/veggie-battle-frontend /usr/share/nginx/html
EXPOSE 80 443
ENTRYPOINT ["nginx", "-g", "daemon off;"]
