# RELL Seas · Atlas des mers

Site statique dans `dist/`.

## Lancer

```powershell
python server.py
```

Puis ouvrez http://localhost:8000. (Lancer `python -m http.server 8000 --directory dist` marche aussi, mais sans l'IA du chatbot.)

## Chatbot

- Il fonctionne **sans clé** : réponses préfaites (`dist/kb.json`) et suggestions pendant la frappe. Touche `C` pour l'ouvrir.
- Pour activer l'IA (Groq) sur les questions sans réponse préfaite, définissez la clé dans l'environnement avant de lancer le serveur. Elle n'est écrite dans aucun fichier :

```powershell
$env:GROQ_API_KEY = "votre_cle"
python server.py
```

- Ne mettez jamais la clé dans le code du site : tout visiteur pourrait la lire. Pour un site en ligne, il faut une fonction serveur (Vercel, Netlify, Cloudflare Workers) qui joue le rôle de `server.py`.
- Pour ajouter une réponse préfaite, ajoutez une entrée à `dist/kb.json` (`q` question, `k` mots-clés, `a` réponse, `l` lien facultatif).
