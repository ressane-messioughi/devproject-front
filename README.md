<div align="center">

<img src="docs/logo.png" width="110" alt="DevProject">

# DevProject

**Le suivi de projet d'une petite équipe, au même endroit.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io)

<a href="#démarrage-rapide">🚀 Démarrage rapide</a> ·
<a href="#ce-que-ça-fait">Fonctionnalités</a> ·
<a href="#le-temps-réel-la-partie-qui-ma-le-plus-appris">Le temps réel</a> ·
<a href="#les-tests">Tests</a> ·
<a href="#ce-que-je-nai-pas-fait">Limites</a> ·
<a href="https://github.com/ressane-messioughi/devproject-back">Backend</a>

</div>

---

## Démarrage rapide

**Toute l'application — interface, API et base de données — en une commande.**
Seul [Docker](https://docs.docker.com/get-started/get-docker/) est nécessaire :
ni Node, ni MySQL, ni configuration de base de données.

```bash
# 1. Les deux dépôts, côte à côte dans le même dossier
git clone https://github.com/ressane-messioughi/devproject-front.git DPJ-Frontend
git clone https://github.com/ressane-messioughi/devproject-back.git  DPJ-Backend

# 2. Les variables d'environnement
cd DPJ-Frontend
cp .env.example .env

# 3. On lance
docker compose up -d --build
```

Avant la troisième commande, ouvrez le `.env` et renseignez ces trois valeurs :

```bash
DB_PASSWORD=un_mot_de_passe_au_choix
JWT_SECRET=une_longue_chaine_aleatoire
DB_NAME=projetdiplome
```

Les trois clés `CLOUDINARY_*` ne servent qu'à l'envoi des photos de profil.
Laissées vides, l'application fonctionne normalement — seul l'upload d'avatar
sera indisponible.

Comptez **deux à trois minutes** la première fois : Docker télécharge MySQL et
nginx, construit les deux images et crée les 11 tables de la base.

### ➜ L'application est sur **http://localhost:8080**

### Le parcours de découverte, en 5 minutes

Le plus court chemin pour voir toutes les fonctionnalités, y compris le temps
réel. Il faut **deux fenêtres de navigateur**, dont une en navigation privée.

| | Fenêtre 1 | Fenêtre 2 <sub>(privée)</sub> |
|---|---|---|
| **1** | Créer un compte, puis se connecter | |
| **2** | Créer un projet — il devient le projet actif | |
| **3** | Le **code d'équipe** et son QR code s'affichent sur le tableau de bord | |
| **4** | | Créer un second compte |
| **5** | | Saisir le code d'équipe pour demander à rejoindre le projet |
| **6** | Page **Équipe** : accepter la demande, attribuer un rôle | |
| **7** | 👀 L'avatar du second compte **apparaît en direct** dans la barre des membres connectés, et une notification s'affiche | |
| **8** | | Publier dans le **Journal** ou signaler un **Bug** |
| **9** | 👀 La notification arrive **sans recharger la page** | |

Les étapes **7** et **9** sont la fonctionnalité temps réel : c'est là que
Socket.IO travaille.

<details>
<summary><b>Pourquoi la base est vide au départ</b></summary>

<br>

Le script `docker/init/01-schema.sql` crée les 11 tables au premier démarrage,
mais **aucune donnée n'est importée** : le jeu de données de développement
contient de vraies adresses e-mail et des empreintes de mots de passe, il est
donc exclu du dépôt.

La base démarre donc structurée et vide. Le parcours ci-dessus part de là, et
c'est aussi ce qui le rend représentatif : vous voyez l'application se remplir
comme un vrai utilisateur la remplirait.

Pour vérifier que les tables ont bien été créées :

```bash
docker compose exec db mysql -uroot -p"votre_mot_de_passe" projetdiplome \
  -e "SHOW TABLES;"
```

</details>

<details>
<summary><b>Les trois conteneurs, et ce qu'ils font</b></summary>

<br>

| Conteneur | Image | Port | Rôle |
|---|---|---|---|
| `devproject-front` | construite depuis `Dockerfile` | `8080` | L'interface React, compilée puis servie par nginx |
| `devproject-back` | construite depuis `../DPJ-Backend` | `3000` | L'API Express et le serveur Socket.IO |
| `devproject-db` | `mysql:8.4` | `3308` | MySQL, avec le schéma et les données importés au premier démarrage |

Le port `3308` évite le conflit avec un MySQL déjà installé sur la machine
(XAMPP occupe `3306`, Homebrew `3307`).

</details>

<details>
<summary><b>Vérifier, consulter les journaux, arrêter</b></summary>

<br>

```bash
docker compose ps          # l'état des trois conteneurs
docker compose logs -f     # les journaux en direct
docker compose logs back   # ceux de l'API seulement

docker compose down        # arrêter, en gardant les données
docker compose down -v     # arrêter et repartir d'une base vierge
```

</details>

<details>
<summary><b>Si quelque chose ne démarre pas</b></summary>

<br>

| Symptôme | Cause probable | Solution |
|---|---|---|
| `port is already allocated` | Un service occupe déjà `8080`, `3000` ou `3308` | Modifier le port de gauche dans `docker-compose.yml` |
| Le back redémarre en boucle | La base n'était pas prête | `docker compose logs back` — le `healthcheck` fait normalement patienter le back |
| La page est blanche | Le build du front a échoué | `docker compose logs front` |
| Connexion refusée à la base | Le `.env` a changé après le 1er démarrage | `docker compose down -v` puis relancer : le mot de passe n'est lu qu'à la création du volume |

</details>

---

## Pourquoi ce projet

À chaque projet de groupe pendant ma formation, la même chose se reproduisait. Les décisions se prenaient sur Discord, les bugs finissaient dans un fichier texte que personne ne rouvrait, et au bout de deux semaines plus personne ne savait qui avait fait quoi. On perdait moins de temps à coder qu'à se retrouver.

DevProject est ma réponse à ça. Une équipe, un projet, et tout ce qui le concerne au même endroit : le journal des décisions, les bugs, les membres et leurs rôles. Avec une contrainte que je me suis fixée dès le départ — **si quelqu'un publie quelque chose, les autres doivent le voir immédiatement**, sans recharger la page. C'est ce qui m'a poussé vers les WebSockets, et c'est de loin la partie qui m'a le plus appris.

C'est aussi mon projet de fin de formation pour le titre professionnel **Développeur Web et Web Mobile**.

---

## À quoi ça ressemble

|  |  |
|:--:|:--:|
| <img src="docs/maquettes/equipe.png" alt="Page équipe"> | <img src="docs/maquettes/profil.png" alt="Page profil"> |
| **L'équipe et ses rôles** | **Le profil** |

---

## Ce que ça fait

On crée un projet, ou on rejoint celui de quelqu'un d'autre avec un code d'équipe ou un lien d'invitation. Le propriétaire valide les demandes et distribue les rôles — développeur front, back, designer, et ainsi de suite. Ce rôle-là n'a rien à voir avec le rôle applicatif : c'est un rôle *dans le projet*, et c'est lui qui décide de ce qu'on peut faire.

Ensuite, chaque projet a son journal de bord pour tracer les décisions, et son suivi de bugs avec pièce jointe et changement de statut. Les membres connectés apparaissent en direct, et toute publication déclenche une notification chez les autres dans la seconde.

L'authentification passe par un JWT, les mots de passe sont hachés côté serveur avec bcrypt, et les photos de profil sont hébergées sur Cloudinary.

---

## Du cahier des charges à l'application

Le cahier des charges a été rédigé avant la conception. Voici, point par point,
ce qui a été livré — et ce qui ne l'a pas été.

| Besoin exprimé | État | Ce qui a été fait |
|---|:--:|---|
| Créer un compte, se connecter, se déconnecter | ✅ | JWT, mots de passe hachés avec bcrypt |
| Modifier ses informations, gérer son profil | ✅ | Pseudo, téléphone, ville, mot de passe, avatar |
| Rôles et permissions | ✅ | Rôle applicatif (`USER` / `ADMIN`) et rôle dans le projet (propriétaire, développeur, designer…) |
| Créer, modifier, supprimer un projet | ✅ | Avec code d'équipe et lien Trello |
| Ajouter ou retirer des membres | ✅ | Demandes d'adhésion validées par le propriétaire, code d'équipe et QR code d'invitation |
| Consulter l'état d'avancement | ✅ | Journal de bord et suivi des bugs par projet |
| Échanger des publications, suivre l'activité | ✅ | Journal du projet, avec notification en temps réel |
| Entraide sur les blocages | ✅ | Suivi de bugs avec pièce jointe et changement de statut |
| Gestion des tâches (priorité, échéance, statut) | ⚠️ | Les routes, contrôleurs et tables existent côté backend. L'interface n'a pas été construite. |
| Récupération du mot de passe par e-mail | ❌ | Reporté : demandait un service d'envoi d'e-mails, hors du périmètre du MVP |

**Le choix assumé :** j'ai préféré livrer un petit nombre de fonctionnalités
réellement terminées plutôt qu'un ensemble plus large à moitié fini. La gestion
des tâches et la récupération de mot de passe sont les deux arbitrages que j'ai
faits, et je les assume — le cahier des charges prévoyait justement une première
version limitée aux fonctionnalités indispensables.

---

## La stack, et pourquoi

**React 19** avec les hooks, sans bibliothèque d'état externe : deux contextes suffisent largement à l'échelle du projet, et Redux aurait été de la complexité gratuite.

**Vite 8** parce que le rechargement est instantané et que le build tient en moins d'une seconde.

**Tailwind CSS 4**, et là c'est un choix assumé : j'ai supprimé toutes mes classes CSS personnalisées pour ne garder que du Tailwind. Ça se répète parfois dans le JSX, mais je n'ai plus jamais à me demander où une règle est définie ni si je casse autre chose en la modifiant.

**React Hook Form** pour la validation, qui limite les rendus inutiles, **React Router 7** pour les routes imbriquées et la protection par rôle, **Socket.IO** pour le temps réel, et **Framer Motion** pour les transitions entre pages.

Côté qualité, **ESLint et Prettier** sont enchaînés par **Husky** et **lint-staged** : impossible de commiter du code non formaté, la vérification se lance toute seule.

---

## Comment c'est organisé

```
src/
├── components/
│   ├── ui/        Design system. Aucun composant ici ne connaît le métier.
│   ├── auth/      Connexion, inscription
│   ├── layout/    Tableau de bord et navigation
│   ├── landing/   Page d'accueil publique
│   └── app/       Un dossier par domaine
│       └── bug · home · journal · profile · project · team
├── pages/         Les écrans, un par route
├── context/       AuthProvider, ProjectProvider
├── hooks/         useFetch, usePageTitle, useIsOwner, PrivateRoute
├── constants/     Valeurs partagées
├── utils/         Fonctions utilitaires
└── socket.js      L'instance Socket.IO, une seule pour toute l'app
```

La règle que je me suis donnée : un composant de `ui/` reçoit tout par props et ne sait rien du projet. S'il faut y importer un contexte, c'est qu'il n'a rien à faire là.

---

## Installation sans Docker

Pour développer sur le front, le [démarrage rapide](#démarrage-rapide) ne suffit
pas : il faut le serveur Vite et son rechargement à chaud.

Il vous faut **Node 20 ou plus**, le [backend](https://github.com/ressane-messioughi/devproject-back) démarré, et une base **MySQL** accessible.

```bash
git clone https://github.com/ressane-messioughi/devproject-front.git
cd devproject-front
npm install
cp .env.example .env
```

Remplissez ensuite les trois variables :

| Variable | À quoi ça sert | Exemple |
|---|---|---|
| `VITE_API_URL` | L'API du backend | `http://localhost:3000/api` |
| `VITE_SOCKET_URL` | Le serveur Socket.IO | `http://localhost:3000` |
| `VITE_APP_URL` | Le front, pour les liens d'invitation | `http://localhost:5173` |

Le préfixe `VITE_` n'est pas décoratif : sans lui, Vite n'expose pas la variable au navigateur et vous récupérerez `undefined` au moment où vous en aurez besoin.

```bash
npm run dev
```

<details>
<summary><b>Les autres commandes</b></summary>

<br>

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement, rechargement à chaud |
| `npm run build` | Build de production dans `dist/` |
| `npm run preview` | Sert le build de production en local |
| `npm run lint` | Analyse ESLint |
| `npm run lint:fix` | ESLint avec correction automatique |
| `npm run format` | Prettier sur tout le projet |

</details>

---

## Les tests

Les tests tournent avec **Vitest** et **Testing Library**, côté front comme côté
back.

```bash
npm test              # lance la suite
npm test -- --watch   # relance à chaque modification
```

Le choix a été de ne pas viser une couverture large, mais de **tester ce dont
une régression coûterait le plus cher** : la validation des formulaires et
l'affichage des erreurs.

**6 tests répartis dans 5 fichiers.**

| Ce qui est testé | Fichier |
|---|---|
| Le formulaire de création refuse un envoi vide | `ButtonProject.test.jsx` |
| Il refuse un nom de projet trop court | `ButtonProject.test.jsx` |
| Le formulaire de connexion affiche l'erreur renvoyée par le serveur | `LoginComponentLeft.test.jsx` |
| `useIsOwner` renvoie `true` pour le propriétaire du projet | `useIsOwner.test.jsx` |
| `FieldError` affiche le message de l'erreur | `FieldError.test.jsx` |
| `Button` déclenche l'action au clic | `Button.test.jsx` |

Le principe des tests de formulaire mérite un mot, parce que c'est ce qui les
rend fiables : `useFetch` et `react-toastify` sont **remplacés par des
doublures**. Aucun appel réseau n'est fait, aucune donnée n'est créée. On simule
un utilisateur qui clique et qui tape, puis on vérifie deux choses — les messages
d'erreur s'affichent, et **la fonction d'appel à l'API n'a jamais été appelée**.

C'est la preuve que la validation bloque *avant* l'envoi, et pas seulement que
le serveur aurait refusé la requête.

---

## Le temps réel, la partie qui m'a le plus appris

L'idée de départ paraissait simple : quand quelqu'un publie, les autres voient. En pratique, c'est là que j'ai passé le plus de temps, et surtout que j'ai trouvé mes deux vrais bugs.

**Une seule connexion pour toute l'application.** `socket.js` crée l'instance dans un module ES. Comme un module n'est évalué qu'une fois, tous les composants qui l'importent partagent la même connexion. J'ai vu des projets ouvrir un socket par composant — c'est une fuite garantie.

**Deux espaces par utilisateur.** Chacun rejoint une salle personnelle à son identifiant, et la salle du projet qu'il a sélectionné. La salle personnelle m'a semblé superflue au début, jusqu'à ce que je bute sur un cas concret : quand le propriétaire accepte une demande d'adhésion, le demandeur n'est encore dans aucune salle de projet. Sans casier personnel, impossible de le prévenir.

**Deux façons de diffuser, à ne pas confondre :**

```js
socket.to(room).emit(…)   // tout le monde sauf moi
io.to(room).emit(…)       // tout le monde, moi compris
```

La première annonce une arrivée — je n'ai pas besoin d'apprendre que je viens d'arriver. La seconde rediffuse la liste des membres connectés, que tout le monde doit recevoir à jour, moi le premier.

### Les deux bugs

Le premier était visible : en changeant de projet, je restais affiché « en ligne » dans le précédent. Le socket rejoignait bien la nouvelle salle, mais ne quittait jamais l'ancienne. Deux lignes à ajouter, une fois la cause comprise.

Le second m'a coûté bien plus cher, parce qu'il ne produisait **aucune erreur**. Les notifications s'arrêtaient, c'est tout. Un rechargement et ça repartait. J'ai fini par cartographier tous les `emit` et tous les `on` du projet, et la cause est apparue : après une coupure réseau ou une mise en veille, Socket.IO rétablit le transport automatiquement, mais ne rejoint aucune salle. Le socket était connecté, et sourd.

Le correctif écoute l'événement `connect` et rejoue l'entrée dans les salles à chaque reconnexion. Ce qui m'a marqué, c'est qu'une cause unique expliquait trois symptômes que je croyais sans rapport.

---

## Ce que j'ai retenu

**`fetch` ne lève pas d'exception sur une erreur HTTP.** Un 400 ou un 500 est une réponse reçue normalement : un `try/catch` seul ne les voit pas passer. Il faut tester `response.ok` pour l'erreur métier et garder le `try/catch` pour la panne réseau. Les deux ne traitent pas le même problème.

**Sur macOS, un renommage de casse peut passer inaperçu.** Le système ne distingue pas `Button.jsx` de `button.jsx`, Git et Linux si. Un `mv` sur un fichier suivi ne change rien en local puis casse le déploiement. Depuis, j'utilise `git mv` et je vérifie avec `git status`.

**Une fonction recréée à chaque rendu ne doit pas partir dans un tableau de dépendances** sans être stabilisée, sinon c'est la boucle infinie. La solution est `useCallback` au niveau du hook qui la fournit — pas un `eslint-disable` posé sur chaque effet, ce que j'avais commencé à faire avant de comprendre.

**Le mode responsive du navigateur ne remplace pas un vrai téléphone.** Sur iPhone, la barre d'adresse de Safari occupe le bas de l'écran et masquait mon bouton de déconnexion, parfaitement visible en simulation.

---

## La base de données

<div align="center">

| Conceptuel | Logique | Physique |
|:--:|:--:|:--:|
| <img src="docs/schemas/mcd.png" alt="MCD"> | <img src="docs/schemas/mld.png" alt="MLD"> | <img src="docs/schemas/mpd.png" alt="MPD"> |

</div>

Modélisation Merise, sans ORM côté backend : les requêtes SQL sont écrites à la main avec `mysql2`. C'était volontaire — je voulais comprendre mes jointures avant de laisser une bibliothèque les écrire à ma place.

---

## Ce que je n'ai pas fait

Autant le dire moi-même plutôt que d'attendre qu'on le trouve.

**Les routes de lecture ne revérifient pas l'appartenance à l'équipe.** Seules les actions réservées au propriétaire sont contrôlées côté serveur. Un membre retiré d'un projet ne verra plus rien dans l'interface, mais l'API répondrait encore à une requête directe.

**La connexion temps réel n'est pas authentifiée.** Aucun jeton n'est transmis à l'ouverture du socket, et l'entrée dans une salle n'est pas contrôlée. C'est la même faille que ci-dessus, vue depuis le temps réel.

**La liste des membres connectés vit en mémoire.** Un redémarrage du serveur l'efface, et une mise à l'échelle sur plusieurs instances demanderait un stockage partagé.

**La couverture de tests est volontairement étroite.** Elle porte sur la validation des formulaires et l'authentification, là où une régression se verrait le plus. Les contextes, le temps réel et les pages ne sont pas couverts — c'est le chantier que je regrette le plus de ne pas avoir ouvert plus tôt, parce qu'écrire les tests après coup demande bien plus d'efforts que de les écrire au fil de l'eau.

---

<div align="center">
<br>
<sub>Ressane Messioughi — projet de fin de formation, titre professionnel DWWM</sub>
</div>
