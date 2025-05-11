# Howard Burger Website

Application web pour visualiser et gérer les entreprises en liquidation.

## 🚀 Fonctionnalités

- **Listing des entreprises** : Visualisation et filtrage des entreprises en liquidation
- **Carte interactive** : Affichage géographique des entreprises avec marqueurs colorés
- **Gestion des favoris** : Marquer des entreprises comme favorites
- **Filtres avancés** : Filtrage par département, score, etc.
- **Mises à jour en temps réel** : Synchronisation automatique des données via Supabase

## 🔧 Technologies

- [Next.js](https://nextjs.org/) - Framework React
- [Supabase](https://supabase.io/) - Backend et base de données
- [Leaflet](https://leafletjs.com/) - Cartes interactives
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [shadcn/ui](https://ui.shadcn.com/) - Composants UI

## 📂 Structure du projet

```
howard-burger-website/
├── app/ - Routes et layouts Next.js
│   ├── app/ - Application principale
│   │   ├── layout.tsx - Layout principal avec Context Provider
│   │   ├── listing/ - Page de liste des entreprises
│   │   └── map/ - Page de carte interactive
├── components/ - Composants réutilisables
│   ├── Map.tsx - Base de la carte Leaflet
│   ├── MapWithEntreprises.tsx - Carte avec données d'entreprises
│   └── EntrepriseModal.tsx - Modal de détails d'entreprise
├── lib/ - Utilitaires et types
│   ├── types.ts - Types TypeScript
│   └── utils.ts - Fonctions utilitaires
├── public/ - Assets statiques
└── utils/ - Utilitaires spécifiques
    └── supabase/ - Configuration Supabase
```

## 🧠 Mécanismes clés

### Gestion d'état global

Le projet utilise React Context API pour partager les données d'entreprises entre les composants :

```tsx
// Dans app/layout.tsx
const EntreprisesContext = createContext<{
  entreprises: Entreprise[];
  loading: boolean;
  updateEntreprise: (updated: Entreprise) => void;
  removeEntreprise: (id: string) => void;
} | null>(null);

// Utilisation dans les composants
const { entreprises, loading } = useEntreprises();
```

### Abonnements en temps réel

Les données sont synchronisées en temps réel avec Supabase :

```tsx
useEffect(() => {
  const channel = supabase
    .channel("realtime-entreprises")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "entreprise" },
      (payload) => {
        // Mise à jour de l'état en fonction des changements
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Carte interactive

La carte utilise Leaflet et affiche les entreprises géolocalisées avec des marqueurs colorés selon leur score. Un panneau latéral s'ouvre au clic sur un marqueur pour afficher les détails de l'entreprise.

## 🚦 Installation et démarrage

1. Cloner le dépôt
   ```
   git clone https://github.com/username/howard-burger-website.git
   cd howard-burger-website
   ```

2. Installer les dépendances
   ```
   npm install
   ```

3. Configurer les variables d'environnement
   ```
   cp .env.example .env.local
   ```
   Remplir avec vos clés Supabase

4. Générer les marqueurs colorés (optionnel)
   ```
   npm install -g jimp
   node scripts/generate-markers.js
   ```

5. Démarrer le serveur de développement
   ```
   npm run dev
   ```

6. Ouvrir [http://localhost:3000](http://localhost:3000)

## 📊 Modèle de données

La principale entité est `Entreprise` avec les propriétés :

- `id`: Identifiant unique
- `nom_complet`: Nom de l'entreprise
- `social_ville`: Ville du siège social
- `social_code_postal`: Code postal
- `dateparution`: Date de parution de l'annonce
- `score`: Score de l'entreprise (0-10)
- `latitude/longitude`: Coordonnées géographiques
- `favori`: Statut de favori

## 🧩 Extension du projet

### Ajout de fonctionnalités

1. Créer un composant dans `/components`
2. Ajouter la logique business
3. Intégrer dans les pages existantes

### Ajout de pages

1. Créer un nouveau dossier dans `/app/app/`
2. Ajouter un fichier `page.tsx`
3. Utiliser le Context pour accéder aux données

## 📜 Licence

Ce projet est sous licence MIT.