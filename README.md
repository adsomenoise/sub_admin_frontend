# Fanflix Sub Admin Frontend

Een React admin dashboard voor het beheren van talents, orders en content voor Fanflix. Deze interface is specifiek ontworpen voor sub-administrators.

## 🚀 Installatie en Setup

### Vereisten
- Node.js (versie 16 of hoger)
- Yarn package manager
- Git
- Toegang tot Strapi backend

### Stap 1: Clone de repository
```bash
git clone <repository-url>
cd sub_admin_frontend
```

### Stap 2: Installeer dependencies
```bash
yarn install
```

### Stap 3: Environment variabelen
Maak een `.env` bestand aan in de root directory:
```env
REACT_APP_API_BASE_URL=http://localhost:1337
```

### Stap 4: Start de development server
```bash
yarn start
```

De applicatie opent automatisch op [http://localhost:3000](http://localhost:3000).

## 🛠 Tech Stack

- **React** - Frontend framework
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **Axios** - HTTP client voor API calls
- **Strapi** - Headless CMS backend
- **JWT** - Authenticatie

## 📁 Project Structuur

```
src/
├── components/
│   ├── Navigation.jsx   # Hoofd navigatie
│   ├── PrivateRoute.jsx # Route beveiliging
│   ├── Sidebar.jsx      # Zijbalk navigatie
│   └── OrderModal.jsx   # Order detail modal
├── pages/
│   ├── Dashboard.jsx    # Hoofd dashboard
│   ├── Login.jsx        # Inlog pagina
│   ├── Orders.jsx       # Order beheer
│   ├── Talents.jsx      # Talent beheer
│   └── Organize.jsx     # Content organisatie
└── api/                 # API configuratie
```

## 🔐 Authenticatie

Het systeem gebruikt JWT tokens voor authenticatie:
1. Login via `/login` met credentials
2. Token wordt opgeslagen in localStorage
3. Privé routes zijn beveiligd met PrivateRoute component

## 🎯 Features

### Dashboard
- 📊 **Overzicht** van recente orders
- 👥 **Spotlighted talents** weergave
- 💰 **Financieel overzicht**

### Talent Management
- ➕ **Toevoegen** van nieuwe talents
- ✏️ **Bewerken** van bestaande talents
- 🗑️ **Verwijderen** van talents
- 📁 **Categorieën en tags** beheer
- 🖼️ **Afbeelding uploads**
- ✅ **Status management** (actief/gearchiveerd)

### Order Management
- 📋 **Order overzicht** met filtering
- 🔄 **Status updates**
- 📄 **Detail weergave**
- 🎬 **Video uploads**

## 🔧 Beschikbare Scripts

### `yarn start`
Start de ontwikkelingsserver op port 3000.

### `yarn build`
Bouwt de app voor productie in de `build` folder.

### `yarn test`
Start de test runner.

## 🎨 Styling

Het project gebruikt **Tailwind CSS** voor styling. Configuratie:
- `tailwind.config.js` - Tailwind configuratie
- `src/index.css` - Globale styles
- Custom CSS classes voor specifieke componenten

### Belangrijke CSS Classes
- `.bg-gray` - Grijze achtergrond
- `.rounded-blocks` - Afgeronde hoeken
- `.w-blocks` - Standaard container breedte

## 🔗 API Integratie

De frontend communiceert met de Strapi backend voor:
- **Authenticatie** - Login/logout
- **Talents** - CRUD operaties
- **Orders** - Beheer en status updates
- **Categories/Tags** - Content organisatie
- **File uploads** - Afbeeldingen en video's

### Belangrijke Endpoints
```
POST /api/auth/local          # Login
GET /api/talents              # Talents ophalen
POST /api/talents             # Talent aanmaken
PUT /api/talents/:id          # Talent bijwerken
DELETE /api/talents/:id       # Talent verwijderen
GET /api/orders               # Orders ophalen
POST /api/upload              # Bestanden uploaden
```

## 🚀 Deployment

Voor productie deployment:

1. Zet environment variabelen voor productie:
```env
REACT_APP_API_BASE_URL=https://your-strapi-backend.com
```

2. Bouw de applicatie:
```bash
yarn build
```

3. Upload de `build` folder naar je hosting provider.

## 🔒 Beveiliging

- JWT token authenticatie
- Protected routes met PrivateRoute component
- Role-based access (sub-admin niveau)
- Automatische logout bij token expiry

## 🐛 Troubleshooting

### Login problemen
- Controleer of Strapi backend draait op poort 1337
- Verificeer credentials in Strapi admin panel
- Check browser console voor API errors

### Upload problemen
- Controleer file size limits in Strapi
- Verificeer upload permissions
- Check browser network tab voor errors

---

*Voor meer informatie over het Strapi backend, raadpleeg de backend README.*
# Auto-deploy trigger
