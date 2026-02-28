# Brief Projet : PEQ_Grader

**Date :** 06/01/2026
**Statut :** BROUILLON (Mode YOLO)

## 1. Introduction
Ce document définit le projet **PEQ_Grader**. Il sert de base au développement du produit, selon les besoins exprimés par un Chef d'Atelier dans une école secondaire technique en Belgique. Le projet vise à numériser le processus d'évaluation du "Parcours d'Enseignement Qualifiant" (PEQ).

## 2. Résumé Exécutif (Executive Summary)
**PEQ_Grader** est une application "Tablet-First" conçue pour moderniser et automatiser la cotation des épreuves pratiques (Qualifiantes) de l'enseignement technique belge (PEQ). Elle résout le problème de l'inefficacité de la cotation papier en offrant une interface intuitive et tactile permettant aux professeurs d'évaluer les compétences des étudiants ("Acquis", "Non Acquis", "En voie d'acquisition") en temps réel. La valeur principale réside dans la simplification du processus de qualification et la garantie d'un suivi numérique précis des compétences des élèves.

## 3. Définition du Problème
*   **État Actuel :** La cotation des épreuves PEQ est probablement manuelle ou utilise des outils disparates non adaptés à l'environnement d'un atelier.
*   **Points de Douleur (Pain Points) :**
    *   Difficulté à gérer des grilles de cotation complexes (Compétences vs Indicateurs).
    *   Manque de mobilité : L'enseignant doit se déplacer dans l'atelier / autour du poste de travail de l'élève.
    *   Lourdeur administrative pour consolider les résultats en vue de la qualification.
*   **Urgence :** Avec le passage au système PEQ, la conformité et l'efficacité dans la validation des compétences sont critiques pour la délivrance des diplômes (CESS/CQ6/7).

## 4. Solution Proposée
Une **application web/mobile** optimisée pour tablettes (interface tactile) qui fonctionne également sur PC.
*   **Concept Central :** Un porte-bloc numérique. L'enseignant charge une épreuve, sélectionne un élève, et touche l'écran pour noter les compétences au fur et à mesure de l'observation.
*   **Différenciateurs Clés :**
    *   **Priorité Mobile/Tactile :** Gros boutons, navigation aisée, conçue pour être utilisée debout en marchant.
    *   **Spécifique au PEQ :** Intègre nativement la logique "Acquis / Non Acquis" et la terminologie de l'enseignement belge.
    *   **Polyvalente :** Fonctionne sur la tablette de l'atelier pour la cotation et sur le PC du bureau pour la configuration/administration.

## 5. Utilisateurs Cibles
### Segment Principal : Le Professeur d'Atelier / Chef d'Atelier
*   **Contexte :** Travaille dans une école technique (atelier).
*   **Comportement :** Se déplace durant les épreuves, observe des tâches pratiques.
*   **Besoins :** Saisie rapide (minimiser la frappe pendant la cotation), vue claire des critères, fiabilité (pas de perte de données).
*   **Objectifs :** Valider les compétences des élèves efficacement selon les grilles officielles.

## 6. Objectifs & Indicateurs de Succès
### Objectifs Business
*   Simplifier l'administration des évaluations PEQ.
*   Assurer la standardisation des grilles de cotation au sein de l'école/département.

### Indicateurs de Succès Utilisateur
*   **Temps de cotation :** Réduction du temps passé sur les tâches administratives post-épreuve.
*   **Précision :** Moins d'erreurs dans le calcul du statut de qualification.

## 7. Périmètre MVP (Minimum Viable Product)
### Fonctionnalités Clés (Indispensables)
*   **Gestion des Grilles :** Créer/Éditer des grilles de cotation (Compétences, Indicateurs).
*   **Gestion des Élèves :** Importer/Créer une liste d'élèves.
*   **Interface de Cotation (Mode Tablette) :**
    *   Sélectionner Élève > Sélectionner Épreuve.
    *   Vue grille optimisée pour le tactile (grands contrôles).
    *   Bascule interactive pour "Acquis" / "Non Acquis" / "En voie".
*   **Persistance des Résultats :** Sauvegarder et consulter les cotes.
*   **Support multi-plateforme :** Web App Responsive (PWA) accessible via Navigateur sur Tablette et PC.

### Hors Périmètre pour le MVP
*   Intégrations complexes avec les systèmes de gestion scolaire externes (démarrage en mode autonome).
*   Tableaux de bord d'analyse avancés (résultats basiques uniquement).
*   Portail Étudiant (Interface Professeur uniquement pour l'instant).

## 8. Considérations Techniques
### Prérequis Plateforme
*   **Plateformes Cibles :** Tablettes (iPad/Android) et Ordinateur de bureau (Windows/Mac).
*   **Préférences Technologiques (Suggérées) :**
    *   **Frontend :** React (Next.js) avec Tailwind CSS (pour une UI facile, responsive et contrastée).
    *   **Backend :** Node.js ou une approche "Local-First" / BaaS (comme Supabase ou Firebase) pour la synchro temps réel et la simplicité. *À affiner dans le PRD.*
*   **Matériel :** L'utilisation de l'écran tactile est mandataire pour la vue de cotation.

## 9. Contraintes & Hypothèses
### Contraintes
*   **Environnement :** Doit être utilisable efficacement sur la taille d'écran d'une tablette.
*   **OS :** Agnostique (Solution Web préférée pour couvrir iOS/Android/Windows).

### Hypothèses
*   Une connexion internet est disponible dans l'atelier (ou un mode hors-ligne sera nécessaire - point à discuter).
*   La "Logique de Cotation" implique que les indicateurs s'additionnent ou déterminent le statut de la compétence (règles exactes à définir).

## 10. Risques & Questions Ouvertes
*   **Accès Hors-Ligne :** Le Wifi est-il fiable dans les ateliers ? (Critique pour une Web App).
*   **Confidentialité des Données :** Gestion des noms et résultats des élèves (Respect RGPD).
*   **Spécificités Logiques :** Quelles sont les règles exactes pour "En voie d'acquisition" ? Est-ce considéré comme un échec pour la qualification ?

## 11. Prochaines Étapes
1.  **Valider ce Brief :** Confirmer le périmètre et la compréhension.
2.  **Générer le PRD :** Détailler la logique spécifique de cotation et les flux d'écrans.
3.  **Prototype :** Construire l'interface de cotation (UI) en premier pour tester l'ergonomie sur tablette.
