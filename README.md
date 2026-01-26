# INVENTORY

**A MSFT App Registration in Azure is required to start the OAuth flow**

## Development
- Set up all `.env` files in `.env`, `services/frontend/.env`, `services/backend/.env`
- Have 2 terminals open
```bash

# Terminal 1
docker-compose up db -d

cd services/backend
npm install
npx nodemon server.js

# Terminal 2
cd services/frontend
npm install
npm start
```

## Deployment
```bash
docker-compose -f docker-compose.yml up --build -d
```
_Note: This configuration may have issues and has not been tested in months. `docker-compose.prod.yml` is the configuration to run if there is a already a database running on the deployment server and has been tested frequently._

## Use Cases:
1. Bulk create assets categorised by their type
2. Bulk create users categorised by their department
3. Bulk create accessories
4. Bulk loan assets and accessories to users grouped through unique loan IDs
5. Bulk return assets and accessories individually (not tied to loan ID)
6. Bulk Remove assets and users
7. Bulk update accessory stock count when necessary
8. Bulk tag assets and users for enhanced grouping
9. Bulk untag assets and users
10. View paginated Assets, Users, Accessories and Events, with advanced filters, multi-select, and Excel export features
11. View comprehensive details of individual Device, User, Accessory, including a timeline of events for each item
12. Dashboard provides administrators with a broad overview of the top assets, users, budget etc, to get an understanding of the entire inventory
