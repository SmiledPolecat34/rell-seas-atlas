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
