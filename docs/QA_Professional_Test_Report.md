# Rapport de Test Professionnel (UAT) - PEQ Grader v1.0

Ce document sert de guide de validation finale avant le déploiement général. 
**Objectif :** Valider la robustesse du flux "Local-First" sur tablette.

## 1. Environnement de Test
- [ ] **Appareil :** (ex: iPad Air, Samsung Galaxy Tab)
- [ ] **Navigateur :** (ex: Safari, Chrome)
- [ ] **Mode d'installation :** PWA (Icône sur l'écran d'accueil)

## 2. Protocole de Validation

### Phase A : Préparation et Importation
| ID | Action | Résultat Attendu | Statut |
|:---|:---|:---|:---:|
| A1 | Ouvrir l'app via l'icône d'accueil | L'app s'ouvre en plein écran (sans barre d'adresse) | |
| A2 | Importer un fichier CSV d'élèves | Les élèves apparaissent instantanément dans la liste | |
| A3 | Créer une grille avec indicateurs critiques | La grille est sauvegardée et modifiable | |

### Phase B : Évaluation en "Mode Atelier" (HORS-LIGNE)
| ID | Action | Résultat Attendu | Statut |
|:---|:---|:---|:---:|
| B1 | Couper le Wi-Fi (Mode Avion) | L'app reste fluide et fonctionnelle | |
| B2 | Noter un élève (Réussite 100%) | Le statut passe à **ACQUIS** (Vert) | |
| B3 | Noter un élève (Remédiation < 75%) | Le statut passe à **REMEDIATION** (Orange) | |
| B4 | Noter un élève (Manque 1 critique) | Le statut passe à **NON ACQUIS** (Rouge) | |
| B5 | Utiliser les flèches de navigation | Passage fluide d'un élève à l'autre dans le modal | |

### Phase C : Sorties et Exports (Validation Administrative)
| ID | Action | Résultat Attendu | Statut |
|:---|:---|:---|:---:|
| C1 | Générer un PDF individuel | Le PDF est lisible et contient les bonnes données | |
| C2 | Cliquer sur "Tout exporter (ZIP)" | Un ZIP contenant tous les PDF se télécharge | |
| C3 | Export JSON de sauvegarde | Un fichier .json est généré avec toutes les données | |

### Phase D : Résilience
| ID | Action | Résultat Attendu | Statut |
|:---|:---|:---|:---:|
| D1 | Recharger la page (F5 / Refresh) | Toutes les notes saisies sont conservées | |
| D2 | Vider la DB et Ré-importer le JSON | L'état exact de la session est restauré | |

## 3. Observations & Remarques (UX/UI)
*Notez ici tout ce qui pourrait être amélioré sur le terrain (taille des boutons, lisibilité, etc.)*
- 
- 

## 4. Verdict Final
- [ ] **PRÊT POUR LA PRODUCTION**
- [ ] **MODIFICATIONS REQUISES**

---
*Date du test : 28/02/2026*
*Testeur : Laurent Quenon*
