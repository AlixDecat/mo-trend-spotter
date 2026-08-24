# M&O Trend Spotter

PWA mobile first et hors ligne pour capter les tendances sur un salon (Maison et Objet) :
observations de stands, signal en une phrase, photos, score /25, familles de signaux,
et génération d'une page « Direction de collection » à partir des meilleures observations.

Pensée pour une saisie à une main sur un écran 6 à 7 pouces (Android Chrome en priorité).
Aucune authentification, aucun serveur : toutes les données restent dans le navigateur
du téléphone (IndexedDB). D'où l'importance des sauvegardes (bouton Export).

## Fonctionnalités

- **Saisie rapide** (1 écran) : hall, stand, marque, signal, 5 scores, photo ambiance, famille, décision
- **Observation complète** en 9 étapes : identification, signal, design (palette, matière, formes), usage dedans/dehors, collection, merchandising, photos (5 types), score /25, transposition
- Enregistrement automatique en continu (aucun bouton « sauvegarder » à penser)
- **Top scores** avec filtres : hall, catégorie, famille de signaux, décision, score minimum
- **Direction de collection** : sélection de 3 à 10 observations, pré-remplissage automatique (couleurs, matières, formes, scènes, merchandising les plus fréquents), export Markdown et impression PDF
- **Exports** : sauvegarde JSON en 1 tap, CSV pour Excel, ZIP complet (données + photos), résumés Markdown (un fichier par observation) ; partage natif Android (Web Share API)
- **Import** d'une sauvegarde JSON ou ZIP (fusion : la fiche la plus récente gagne)
- **Mode salon** : contraste renforcé et cibles tactiles plus grandes
- Photos compressées avant stockage (max 1600 px, JPEG qualité 0,75)
- PWA installable, fonctionne entièrement hors ligne après la première visite

## Stack

Vite · React · TypeScript · Tailwind CSS 4 · idb (IndexedDB) · zod · jszip · vite-plugin-pwa

## Développement

```bash
npm install
npm run dev        # http://localhost:5183
```

```bash
npm run build      # vérification TypeScript + build de production dans dist/
npm run preview    # sert le build sur http://localhost:5184
npm run icons      # régénère les icônes PWA depuis le SVG (public/icons/)
```

## Déploiement

Deux pipelines sont prêts, le build est publié à chaque push sur `main` :

- **GitHub Pages** (actif) : `.github/workflows/deploy.yml` →
  https://alixdecat.github.io/mo-trend-spotter/
- **GitLab Pages** : `.gitlab-ci.yml` prendra le relais dès que Pages sera activé
  sur l'instance GitLab interne (l'URL apparaîtra alors dans **Deploy → Pages**).

Le build utilise une base relative (`base: './'`), l'app fonctionne donc aussi bien à la
racine d'un domaine que sous un sous-chemin de Pages. Elle peut aussi être hébergée sur
n'importe quel hébergement statique en copiant le contenu de `dist/`.

Le service worker (mode hors ligne) exige HTTPS, ce que GitLab Pages fournit.

## Installer l'app sur le téléphone

1. Ouvrir l'URL de l'app dans Chrome (Android) une première fois avec du réseau.
2. Menu Chrome → « Ajouter à l'écran d'accueil » (ou accepter l'invitation d'installation).
3. L'app s'ouvre ensuite comme une application, y compris sans réseau.

Sur iPhone : Safari → Partager → « Sur l'écran d'accueil ».

## Données et sauvegardes

- Les données vivent uniquement dans le navigateur du téléphone (IndexedDB).
- **Chaque soir de salon : Export → Sauvegarde JSON ou ZIP complet** (le ZIP inclut les photos et se réimporte sur un autre appareil).
- « Protéger le stockage » demande au navigateur de ne jamais purger les données automatiquement.
- Effacer les données de navigation du site supprime les observations : exporter d'abord.
