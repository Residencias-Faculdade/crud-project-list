FROM node:22-alpine AS build
WORKDIR /app
COPY mfe-project-list/package.json mfe-project-list/package-lock.json ./
RUN npm install --no-audit --no-fund
COPY mfe-project-list/ .
RUN npx ng build --configuration production --output-hashing=none

FROM nginx:1.29-alpine AS runtime
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/mfe-project-list/browser /usr/share/nginx/html
EXPOSE 80
