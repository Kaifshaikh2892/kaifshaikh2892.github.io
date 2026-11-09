# ARIBAZ — arielbaz.github.io

Blog tech personnel : astuces concrètes, outils gratuits, vie privée et filtrage.
Site 100 % statique, sans dépendance, hébergé sur GitHub Pages.

**En ligne :** https://arielbaz.github.io

## Publier un nouvel article

1. Crée un fichier dans `content/posts/mon-sujet.md` :

```md
---
title: "Titre de l'article"
slug: mon-sujet
date: 2026-11-20
category: Sécurité          # Productivité | Sécurité | Filtrage | Alternatives | Mobile
tags: [mot-cle, autre]
excerpt: "Une phrase de résumé, affichée sur les cartes."
icon: shield                # shield, globe, lock, folder, camera, text, mic, book, usb,
                            # eye, eye-off, wifi, phone, image, breach, clipboard, sim, layers
source: https://exemple.com
sourceLabel: exemple.com
featured: true              # optionnel : article mis en avant sur l'accueil
---

Premier paragraphe (chapô).

## Une section

Du texte avec du **gras**, des [liens](https://exemple.com) et du `code`.

:::tip Le Pro-Tip ARIBAZ
L'encart bleu qui met en avant l'astuce d'expert.
:::
```

2. Génère le site :

```bash
node tools/build.mjs
```

3. Publie :

```bash
git add -A && git commit -m "Nouvel article : ..." && git push
```

GitHub Pages republie automatiquement en une minute environ.

## Structure

```
content/posts/   articles en markdown (source unique)
tools/build.mjs  générateur statique (Node, zéro dépendance)
assets/          CSS, JS, images
articles/        pages générées (ne pas éditer à la main)
index.html       accueil généré
feed.xml         flux RSS
```
