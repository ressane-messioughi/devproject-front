# ─────────────────────────────────────────────────────────────
# ETAPE 1 — CONSTRUIRE
# On a besoin de Node uniquement pour fabriquer les fichiers finaux.
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

# Le script "prepare" du projet lance Husky, qui installe les hooks git.
# Dans un conteneur il n'y a pas de depot git et aucun commit n'y sera fait :
# on retire ce script avant l'installation, sinon npm s'arrete en erreur.
RUN npm pkg delete scripts.prepare
RUN npm ci

COPY . .

# Vite remplace les variables VITE_* par leur valeur AU MOMENT DE LA
# CONSTRUCTION, pas au demarrage : elles doivent donc etre connues ici.
# Elles pointent vers localhost parce que c'est le NAVIGATEUR qui appellera
# l'API, et lui tourne sur la machine, pas dans le reseau des conteneurs.
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ARG VITE_APP_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_APP_URL=$VITE_APP_URL

RUN npm run build

# ─────────────────────────────────────────────────────────────
# ETAPE 2 — SERVIR
# Node ne sert plus a rien : on repart d'une image nginx vide et on n'y
# copie que le dossier dist. Resultat : une image de ~50 Mo au lieu de ~500.
# ─────────────────────────────────────────────────────────────
FROM nginx:alpine

# On recupere le resultat de l'etape 1
COPY --from=build /app/dist /usr/share/nginx/html

# Configuration nginx adaptee a une application React
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
