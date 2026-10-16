# Le Dragon d'Or — Site de restaurant chinois

Menu en ligne, réservation de table, livraison (paiement à la livraison) et espace administrateur.

- **Backend** : Python FastAPI + SQLAlchemy + SQLite (`backend/`)
- **Frontend** : React + Vite + React Router (`frontend/`)

## Lancer le projet

### 1. Backend (terminal 1)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows (Linux/Mac : source .venv/bin/activate)
pip install -r requirements.txt
python -m app.seed              # crée la base + menu d'exemple + compte admin
uvicorn app.main:app --reload
```
API : http://localhost:8000 — documentation interactive : http://localhost:8000/docs

### 2. Frontend (terminal 2)
```bash
cd frontend
npm install
npm run dev
```
Site : http://localhost:5173

## Compte administrateur
`admin@resto.com` / `admin123` (à changer en production).

## Fonctionnalités
| Client | Admin (`/admin`) |
|---|---|
| Menu par catégorie, filtres végétarien / non épicé | Tableau de bord (commandes en cours, réservations, CA du jour) |
| Panier (sauvegardé dans le navigateur) | Commandes : faire avancer le statut, annuler |
| Commande en livraison, paiement à la livraison | Réservations : confirmer / annuler, filtre par date |
| Suivi de commande (n° + téléphone), actualisation auto | Menu : ajouter, modifier, supprimer, rendre indisponible |
| Réservation avec attribution automatique de table | |
| Compte optionnel : historique, annulation de réservation | |

## Réglages
Dans `backend/app/config.py` :
- horaires de réservation, durée d'occupation d'une table (2 h) ;
- frais de livraison (3 €) et seuil de livraison offerte (30 €) ;
- `SECRET_KEY` (à définir avec la variable d'environnement `SECRET_KEY` en production).

La devise affichée se change dans `frontend/src/api.js` (`CURRENCY`). Les tables du restaurant se définissent dans `backend/app/seed.py`.

Pour remettre la base à zéro : `python -m app.seed --reset`.
