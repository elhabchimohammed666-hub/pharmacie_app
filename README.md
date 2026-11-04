## License
   © 2026 Elhabchi Mohammed. All Rights Reserved.

# pharmacie_app

Application de gestion de pharmacie : API Express/Mongoose et interface React/Vite.

## Prérequis

- Node.js 20+
- MongoDB (les transactions de vente nécessitent un replica set, y compris en local)

## Démarrage

1. Installer les dépendances depuis la racine : `npm install`
2. Copier `backend/.env.example` vers `backend/.env` et définir les secrets.
3. Créer le compte gérant : `npm run seed:admin --workspace backend`
4. Démarrer l'API : `npm run dev`
5. Dans un autre terminal, démarrer l'interface : `npm run dev:frontend`

Le frontend est disponible sur `http://localhost:5173` et l'API sur `http://localhost:5000/api`.
Le compte initial est fourni via `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans l'environnement du backend.

## API principale

- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET|POST /api/medicines`, `GET|PATCH|DELETE /api/medicines/:id`
- `POST /api/sales`, `GET /api/sales/:id`
- `GET /api/dashboard/summary`

Les ventes déduisent le stock dans une transaction MongoDB et utilisent les prix enregistrés côté serveur. Les montants sont des entiers en centimes. La suppression d'un médicament est un archivage logique.

## Rôles

- `admin` : tableau de bord, inventaire et administration.
- `pharmacien` : consultation/modification de l'inventaire et encaissement.

Les fichiers d'ordonnance, la gestion détaillée des lots, les fournisseurs, les clients et les rapports exportables sont des modules à compléter avant mise en production. Les prescriptions et données de santé doivent être stockées avec des contrôles d'accès et une politique de conservation appropriés.
