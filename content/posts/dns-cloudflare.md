---
title: "Le DNS 1.1.1.3 : un internet plus propre pour toute la maison"
slug: dns-cloudflare
date: 2026-08-18
category: Filtrage
tags: [dns, réseau, cloudflare, famille]
excerpt: "Deux adresses à changer, deux minutes, et tous tes appareils sont filtrés. Sans logiciel, sans compte, sans abonnement."
icon: wifi
source: https://one.one.one.one/fr-FR/family/
sourceLabel: one.one.one.one
---

Pas de filtre à la maison ? Tu veux au minimum bloquer les sites douteux et activer SafeSearch partout, sans installer quoi que ce soit sur chaque appareil ?

La méthode la plus simple tient en deux adresses IP : **1.1.1.3** et **1.0.0.3**, les DNS « Families » de Cloudflare.

## Comment ça marche

Le DNS est l'annuaire d'internet : il traduit un nom de site en adresse. En utilisant un annuaire qui refuse les domaines indésirables, tu bloques **en amont**, pour tous les appareils du réseau.

- **Sites non adaptés bloqués** (contenus adultes, jeux en ligne, etc.).
- **SafeSearch forcé** sur Google, YouTube, Bing.
- **Tous les appareils protégés** : ordinateurs, téléphones, tablettes, consoles.
- **Aucune inscription**, aucun logiciel, et un bonus de rapidité.

## Mise en place

- **Sur ta box** : remplace les DNS par `1.1.1.3` et `1.0.0.3` dans les réglages réseau.
- **Sur un ordinateur** : modifie les DNS de la connexion active.
- **Sur smartphone** : installe l'application *1.1.1.1* et choisis le mode « Famille ».

:::tip Le Pro-Tip ARIBAZ — le piège IPv6 qui annule tout
Ta configuration IPv4 peut être parfaite et le filtrage **totalement contourné**. De plus en plus de box (Orange, Bouygues, SFR) et d'appareils récents privilégient **IPv6**. Si tu ne changes que les DNS IPv4, l'appareil interroge le DNS IPv6 de la box… et passe à travers le filtre sans que tu le saches.

Ajoute donc les adresses IPv6 de Cloudflare Families :

- `2606:4700:4700::1113`
- `2606:4700:4700::1003`

Dernier point : le DNS filtre **par domaine**, pas le contenu d'une page. Une image problématique sur un site autorisé passera. C'est un premier rempart, pas un filtre complet.
:::

## Verdict

Le meilleur rapport protection / effort de toute cette sélection. Deux minutes, zéro euro, et toute la maison est filtrée.

**Documentation :** [one.one.one.one/fr-FR/family](https://one.one.one.one/fr-FR/family/)
