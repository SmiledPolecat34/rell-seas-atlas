# RELL Seas · Atlas des mers

Site statique dans `dist/`, avec un petit serveur local (`server.py`).

## Lancer

```powershell
python server.py
```

Puis ouvrez http://localhost:8000. Sans `server.py` (par exemple `python -m http.server 8000 --directory dist`), le site marche, mais sans IA ni stockage serveur.

## Pages

- `index.html` : atlas, factions, races, combat, exploration.
- `factions.html` : dossier des factions, rangs, prisons, Hades Asylum.
- `metiers.html` : les 8 métiers.
- `builder.html` : créateur de build.
- `codex.html` et `builds.html` : cartes, fruits, mers, armes, builds types.

## Chatbot

- Fonctionne **sans clé** : réponses préfaites (`dist/kb.json`) et suggestions. Touche `C` pour l'ouvrir.
- Pour activer l'IA (Groq) sur les questions sans réponse préfaite et le retour IA des builds, définissez la clé dans l'environnement avant de lancer le serveur. Elle n'est écrite dans aucun fichier :

```powershell
$env:GROQ_API_KEY = "votre_cle"
python server.py
```

- Ne mettez jamais la clé dans le code du site. Pour un site en ligne, il faut une fonction serveur qui joue le rôle de `server.py`.
- Pour ajouter une réponse préfaite, ajoutez une entrée à `dist/kb.json` (`q`, `k` mots-clés, `a` réponse, `l` lien, `t` sujet).

## Builds enregistrés

Le créateur de build stocke les builds dans `data/builds.json` (serveur, ignoré par git). Sans serveur, ils restent dans le navigateur (localStorage). Export et import en JSON disponibles. Il n'y a pas de comptes : tous les visiteurs du même serveur partagent la liste.

## Images et aperçus

- Les illustrations (mers, prisons, factions, races, traits, armes, métiers) et les aperçus animés des fruits et des Haki sont des **dessins générés**, pas des captures de jeu. Pour les régénérer : `python tools/make_art.py` (écrit dans `dist/visuals/art/`).
- `dist/summaries.json` (résumés des cartes et des fruits pour le créateur) a été extrait de `codex.html` ; à refaire si les fiches changent.
- Couches ajoutées : `atlas-plus.css` (menu, responsive), `atlas-components.css` (cartes, filtres, créateur), `menu.js`, `enhance.js`, `builder-ui.js` (tuiles et sélecteur visuel), `builder-smart.js` (objectifs, profil des stats, menus déroulants).

- `dist/visuals/wiki/` : images des armes (27) et des 10 races téléchargées depuis rellseaswiki.com (captures du jeu relevées par le wiki communautaire). Les armes sans image sur le wiki gardent une icône dessinée.
- `dist/acces.html` est généré par `python tools/make_acces.py` à partir de textes déjà présents sur le site.
