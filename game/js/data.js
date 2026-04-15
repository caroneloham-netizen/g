// ============================================
// DONNEES DU JEU - Maps, dialogues, quetes
// ============================================

const TILE_SIZE = 16;
const SCALE = 3;
const SCALED_TILE = TILE_SIZE * SCALE;

// Legende tiles:
// 0 = herbe, 1 = eau, 2 = pierre, 3 = arbre (collision), 4 = mur (collision)
// 5 = toit (collision), 6 = porte (transition), 7 = dirt
// 8 = fleurs, 9 = dungeon_wall (collision), 10 = dungeon_floor
// 11 = dungeon_door (transition), 12 = chest_tile
// 13 = mobilhome_body (collision), 14 = mobilhome_roof (collision)
// 15 = mobilhome_door (transition), 16 = mobilhome_window (collision)

const MAPS = {
    village: {
        width: 30,
        height: 25,
        playerStart: { x: 14, y: 20 },
        tiles: [
            // Rangee 0-2: eau en haut
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            // Rangee 3-5: arbres haut + espace
            [3,3,3,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,3,3,3,3],
            [3,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,3,3],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            // Rangee 6-8: maison 1 (haut gauche)
            [0,0,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5,5,5,0,0,0,0],
            [0,0,4,4,4,4,4,0,0,0,8,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,0,0,0,0],
            [0,0,4,6,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,6,4,4,0,0,0,0],
            // Rangee 9-11: espace central
            [0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,2,2,7,7,7,7,2,2,0,0,0,0,0,0,0,0,0,0,0],
            // Rangee 12-14: place du village (fontaine au centre)
            [0,0,0,0,0,8,0,0,0,0,0,2,7,7,1,1,7,7,2,0,0,0,0,0,8,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,2,7,7,1,1,7,7,2,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,2,2,7,7,7,7,2,2,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0],
            // Rangee 16-18: sud village
            [0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,5,5,5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0],
            [0,0,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,4,4,6,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0],
            // Rangee 20-22: bas village, chemin vers foret
            [0,0,0,0,7,0,0,0,0,0,0,0,0,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,3,0],
            [3,3,0,0,0,0,0,3,3,0,0,0,0,7,7,7,7,0,0,0,0,3,3,0,0,0,3,3,3,3],
            [3,3,3,3,3,3,3,3,3,3,0,0,0,7,7,7,7,0,0,0,3,3,3,3,3,3,3,3,3,3],
            [3,3,3,3,3,3,3,3,3,3,3,0,0,7,7,7,7,0,0,3,3,3,3,3,3,3,3,3,3,3],
        ],
        collisions: [1, 3, 4, 5, 2], // tiles qui bloquent
        transitions: [
            { tile: 6, x: 3, y: 8, target: 'village', tx: 3, ty: 9 }, // portes = just TP devant
            { tile: 6, x: 23, y: 8, target: 'village', tx: 23, ty: 9 },
            { tile: 6, x: 4, y: 19, target: 'village', tx: 4, ty: 20 },
        ],
        // Sortie sud vers la foret
        exits: [
            { side: 'south', fromX: 13, toX: 16, target: 'forest', tx: 14, ty: 1 },
        ],
        npcs: [
            { id: 'sage', sprite: 'sage', x: 10, y: 5, dialogue: 'sage_intro' },
            { id: 'villager1', sprite: 'villager1', x: 5, y: 12, dialogue: 'villager1_intro' },
            { id: 'villager2', sprite: 'villager2', x: 22, y: 12, dialogue: 'villager2_intro' },
            { id: 'guard', sprite: 'guard', x: 14, y: 22, dialogue: 'guard_intro' },
        ],
        enemies: [],
        items: [],
    },

    forest: {
        width: 35,
        height: 30,
        playerStart: { x: 14, y: 1 },
        tiles: (function() {
            const m = [];
            for (let y = 0; y < 30; y++) {
                const row = [];
                for (let x = 0; x < 35; x++) {
                    // Bordures = arbres (sauf sortie est pour le camp)
                    if ((x === 0 || x === 34 || y === 29) && !(x === 34 && y >= 19 && y <= 21)) {
                        row.push(3);
                    }
                    // Chemin d'entree nord
                    else if (y <= 2 && x >= 12 && x <= 17) {
                        row.push(7);
                    }
                    // Chemin principal vertical
                    else if (x >= 14 && x <= 16 && y >= 2 && y <= 20) {
                        row.push(7);
                    }
                    // Chemin horizontal vers coffre
                    else if (y >= 14 && y <= 15 && x >= 5 && x <= 14) {
                        row.push(7);
                    }
                    // Clairiere du coffre
                    else if (x >= 3 && x <= 8 && y >= 12 && y <= 17) {
                        row.push(8);
                    }
                    // Chemin vers sortie est (donjon)
                    else if (y >= 19 && y <= 21 && x >= 16 && x <= 34) {
                        row.push(7);
                    }
                    // Eau (petit lac)
                    else if (x >= 22 && x <= 27 && y >= 6 && y <= 10) {
                        row.push(1);
                    }
                    // Arbres disperses (moins denses, plus espaces)
                    else if (
                        (x % 6 === 0 && y % 5 === 0 && x > 2 && x < 33 && y > 3) ||
                        (x % 7 === 3 && y % 6 === 2 && x > 2 && x < 33 && y > 3)
                    ) {
                        // Pas d'arbre sur les chemins
                        if ((x >= 14 && x <= 16 && y <= 20) ||
                            (y >= 14 && y <= 15 && x >= 5 && x <= 14) ||
                            (y >= 19 && y <= 21 && x >= 16) ||
                            (x >= 3 && x <= 8 && y >= 12 && y <= 17)) {
                            row.push(0);
                        } else {
                            row.push(3);
                        }
                    }
                    else {
                        row.push(0);
                    }
                }
                m.push(row);
            }
            // Entree de la foret (nord) - ouvert
            m[0] = m[0].map((t, x) => (x >= 12 && x <= 17) ? 7 : 3);
            return m;
        })(),
        collisions: [1, 3],
        exits: [
            { side: 'north', fromX: 12, toX: 17, target: 'village', tx: 14, ty: 23 },
            { side: 'east', fromY: 19, toY: 21, target: 'camp', tx: 1, ty: 10 },
        ],
        npcs: [],
        enemies: [
            { type: 'slime', x: 10, y: 8, hp: 2, speed: 0.3, behavior: 'wander' },
            { type: 'slime', x: 20, y: 12, hp: 2, speed: 0.3, behavior: 'wander' },
            { type: 'slime', x: 8, y: 20, hp: 2, speed: 0.3, behavior: 'wander' },
            { type: 'slime', x: 25, y: 16, hp: 2, speed: 0.3, behavior: 'wander' },
            { type: 'slime', x: 30, y: 24, hp: 2, speed: 0.3, behavior: 'wander' },
        ],
        items: [
            { type: 'chest', x: 5, y: 14, contains: 'key', id: 'forest_chest' },
            { type: 'potion', x: 20, y: 4, id: 'forest_potion1' },
        ],
    },

    camp: {
        width: 25,
        height: 22,
        playerStart: { x: 1, y: 10 },
        tiles: [
            // Rangee 0-1: arbres haut
            [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
            [3,0,0,0,7,7,7,0,0,0,0,0,0,7,7,0,0,0,0,0,0,0,0,0,3],
            // Rangee 2-4: Mobilhome 3 (haut gauche)
            [3,0,14,14,14,0,0,0,14,14,14,14,0,0,7,0,14,14,14,0,0,0,0,0,3],
            [3,0,16,13,13,0,0,0,16,13,13,16,0,0,0,0,13,13,16,0,0,0,0,0,3],
            [3,0,13,15,13,0,0,0,13,15,13,13,0,0,0,0,13,15,13,0,0,0,0,0,3],
            // Rangee 5: espace + numeros
            [3,0,0,7,0,0,0,0,0,7,0,0,0,0,7,0,0,7,0,0,0,0,0,0,3],
            // Rangee 6-8: Mobilhome 7, 11
            [3,0,0,0,0,0,14,14,14,14,0,0,0,0,0,0,14,14,14,14,0,0,0,0,3],
            [3,0,0,0,0,0,16,13,13,16,0,0,0,0,0,0,16,13,13,16,0,0,0,0,3],
            [3,0,0,0,0,0,13,15,13,13,0,0,0,0,0,0,13,15,13,13,0,0,0,0,3],
            // Rangee 9: chemins
            [7,7,0,0,7,0,0,7,0,0,0,7,0,0,7,0,0,7,0,0,0,7,0,0,3],
            // Rangee 10: chemin principal est-ouest
            [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,3],
            // Rangee 11: chemins
            [7,7,0,0,7,0,0,7,0,0,0,7,0,0,7,0,0,7,0,0,0,7,0,0,3],
            // Rangee 12-14: Mobilhome 13, 17 (LE FAMEUX)
            [3,0,0,0,0,0,14,14,14,14,0,0,0,0,0,14,14,14,14,14,0,0,0,0,3],
            [3,0,0,0,0,0,16,13,13,16,0,0,0,0,0,16,13,13,13,16,0,0,0,0,3],
            [3,0,0,0,0,0,13,15,13,13,0,0,0,0,0,13,13,15,13,13,0,0,0,0,3],
            // Rangee 15: espace + chemin vers #17 porte arriere
            [3,0,0,0,0,0,0,7,0,0,0,0,7,0,0,13,13,7,13,13,0,0,0,0,3],
            // Rangee 16-18: Mobilhome 21, 25
            [3,0,14,14,14,0,0,0,0,0,14,14,14,14,0,0,0,0,0,14,14,14,0,0,3],
            [3,0,16,13,13,0,0,0,0,0,16,13,13,16,0,0,0,0,0,16,13,16,0,0,3],
            [3,0,13,15,13,0,0,0,0,0,13,15,13,13,0,0,0,0,0,13,15,13,0,0,3],
            // Rangee 19-20: bas
            [3,0,0,7,0,0,0,0,0,0,0,7,0,0,0,0,7,0,0,0,0,7,0,0,3],
            [3,0,0,0,0,8,0,0,0,0,0,0,0,8,0,0,0,0,8,0,0,0,0,0,3],
            [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
        ],
        collisions: [3, 13, 14, 16],
        exits: [
            { side: 'west', fromY: 9, toY: 11, target: 'forest', tx: 33, ty: 20 },
        ],
        npcs: [
            { id: 'camper1', sprite: 'villager1', x: 3, y: 6, dialogue: 'camper1_talk' },
            { id: 'camper2', sprite: 'villager2', x: 12, y: 11, dialogue: 'camper2_talk' },
        ],
        enemies: [],
        items: [],
        // Porte speciale du mobilhome 17 (tile 15 a x:17, y:14)
        specialDoors: [
            { x: 17, y: 14, target: 'dungeon', tx: 1, ty: 10, id: 'mh17', requiresKey: true, dialogue: 'mh17_enter' },
            // Autres portes = juste des dialogues
            { x: 3, y: 4, id: 'mh3', dialogue: 'mh_random1' },
            { x: 9, y: 4, id: 'mh5', dialogue: 'mh_random2' },
            { x: 17, y: 4, id: 'mh9', dialogue: 'mh_random3' },
            { x: 7, y: 8, id: 'mh7', dialogue: 'mh_random1' },
            { x: 17, y: 8, id: 'mh11', dialogue: 'mh_random2' },
            { x: 7, y: 14, id: 'mh13', dialogue: 'mh_random3' },
            { x: 3, y: 18, id: 'mh21', dialogue: 'mh_random1' },
            { x: 11, y: 18, id: 'mh23', dialogue: 'mh_random2' },
            { x: 20, y: 18, id: 'mh25', dialogue: 'mh_random3' },
        ],
    },

    dungeon: {
        width: 45,
        height: 40,
        playerStart: { x: 2, y: 19 },
        tiles: (function() {
            const W = 45, H = 40;
            const m = [];
            for (let y = 0; y < H; y++) {
                const row = [];
                for (let x = 0; x < W; x++) row.push(9); // tout mur
                m.push(row);
            }

            // Fonction pour creuser une salle
            function room(x1,y1,x2,y2) {
                for (let y=y1;y<=y2;y++) for (let x=x1;x<=x2;x++) m[y][x]=10;
            }
            // Couloir horizontal
            function hallH(y1,y2,x1,x2) {
                for (let y=y1;y<=y2;y++) for (let x=x1;x<=x2;x++) m[y][x]=10;
            }
            // Couloir vertical
            function hallV(x1,x2,y1,y2) {
                for (let y=y1;y<=y2;y++) for (let x=x1;x<=x2;x++) m[y][x]=10;
            }

            // === SALLE 1 : Entree (ouest) ===
            room(1, 16, 9, 22);
            // Entree
            m[18][0] = 10; m[19][0] = 10; m[20][0] = 10;

            // === COULOIR 1 : Est vers Salle 2 ===
            hallH(18, 20, 9, 15);

            // === SALLE 2 : Salle des Piques (centre-gauche) ===
            room(15, 14, 25, 24);
            // Piques (tiles speciaux) - motif en damier
            for (let y = 15; y <= 23; y++) {
                for (let x = 16; x <= 24; x++) {
                    if ((x + y) % 3 === 0 && m[y][x] === 10) {
                        m[y][x] = 11; // spike tile (on va l'ajouter)
                    }
                }
            }
            // Chemin sur = le bord gauche et bas
            for (let y = 14; y <= 24; y++) m[y][15] = 10;
            for (let x = 15; x <= 25; x++) m[24][x] = 10;
            for (let y = 14; y <= 24; y++) m[y][25] = 10;

            // === COULOIR 2 : Nord vers Salle 3 ===
            hallV(19, 21, 8, 14);

            // === SALLE 3 : Arene du Mini-Boss (nord) ===
            room(14, 2, 26, 8);

            // === COULOIR 3 : Est depuis Salle 2 vers Salle 4 ===
            hallH(18, 20, 25, 31);

            // === SALLE 4 : Salle des Squelettes (est) ===
            room(31, 14, 39, 24);
            // Piliers dans la salle
            m[16][33] = 9; m[16][37] = 9;
            m[22][33] = 9; m[22][37] = 9;
            m[19][35] = 9; // pilier central

            // === COULOIR 4 : Nord depuis Salle 4 vers Salle du Boss ===
            hallV(34, 36, 8, 14);

            // === SALLE 5 : SALLE DU BOSS (grande, nord-est) ===
            room(30, 1, 43, 9);
            // Trone/autel au fond
            m[2][36] = 9; m[2][37] = 9;
            m[3][36] = 10; m[3][37] = 10; // espace devant le trone

            // Couloir secret avec potion (sud-est)
            hallH(28, 30, 39, 43);
            room(41, 26, 43, 32);

            return m;
        })(),
        collisions: [9],
        exits: [
            { side: 'west', fromY: 18, toY: 20, target: 'camp', tx: 23, ty: 15 },
        ],
        npcs: [],
        enemies: [
            // Salle 1 : 2 squelettes d'accueil
            { type: 'skeleton', x: 5, y: 17, hp: 3, speed: 0.5, behavior: 'chase' },
            { type: 'skeleton', x: 5, y: 21, hp: 3, speed: 0.5, behavior: 'chase' },

            // Couloir 1 : 1 squelette patrouilleur
            { type: 'skeleton', x: 12, y: 19, hp: 3, speed: 0.6, behavior: 'chase' },

            // Salle 2 (piques) : 3 squelettes parmi les pieges
            { type: 'skeleton', x: 18, y: 16, hp: 4, speed: 0.4, behavior: 'wander' },
            { type: 'skeleton', x: 22, y: 20, hp: 4, speed: 0.4, behavior: 'wander' },
            { type: 'skeleton', x: 20, y: 22, hp: 4, speed: 0.4, behavior: 'wander' },

            // Salle 3 (mini-boss) : Mini-boss squelette geant + 2 gardes
            { type: 'skeleton', x: 16, y: 5, hp: 3, speed: 0.6, behavior: 'chase' },
            { type: 'skeleton', x: 24, y: 5, hp: 3, speed: 0.6, behavior: 'chase' },
            { type: 'boss', x: 20, y: 4, hp: 6, speed: 0.5, behavior: 'boss' }, // mini-boss

            // Couloir 3 : 2 squelettes
            { type: 'skeleton', x: 28, y: 19, hp: 4, speed: 0.5, behavior: 'chase' },
            { type: 'skeleton', x: 30, y: 19, hp: 4, speed: 0.5, behavior: 'chase' },

            // Salle 4 : 4 squelettes forts dans les piliers
            { type: 'skeleton', x: 33, y: 16, hp: 5, speed: 0.6, behavior: 'chase' },
            { type: 'skeleton', x: 37, y: 16, hp: 5, speed: 0.6, behavior: 'chase' },
            { type: 'skeleton', x: 33, y: 22, hp: 5, speed: 0.6, behavior: 'chase' },
            { type: 'skeleton', x: 37, y: 22, hp: 5, speed: 0.6, behavior: 'chase' },

            // Salle 5 : LE BOSS FINAL - Seigneur des Ombres
            { type: 'boss', x: 36, y: 5, hp: 15, speed: 0.5, behavior: 'boss' },
        ],
        items: [
            // Potions reparties dans le donjon
            { type: 'potion', x: 3, y: 17, id: 'dg_pot1' },
            { type: 'potion', x: 20, y: 7, id: 'dg_pot2' },      // salle mini-boss
            { type: 'potion', x: 35, y: 19, id: 'dg_pot3' },     // salle 4
            { type: 'potion', x: 42, y: 29, id: 'dg_pot_secret' }, // salle secrete
            { type: 'potion', x: 38, y: 3, id: 'dg_pot_boss' },  // pres du boss
        ],
        locked: true,
        // Spike tiles font des degats
        spikeTiles: [11],
    },

    // ============================================
    // ACTE 2 - GRAND VILLAGE
    // ============================================
    grand_village: {
        width: 35,
        height: 32,
        playerStart: { x: 17, y: 20 },
        tiles: (function() {
            const m = [];
            for (let y = 0; y < 32; y++) {
                const row = [];
                for (let x = 0; x < 35; x++) {
                    // Bordures
                    if (x === 0 || x === 34 || y === 0 || y === 31) {
                        row.push(3); // arbres
                    }
                    // CHATEAU D'ABDEL (nord, centre) - enorme
                    else if (y >= 1 && y <= 3 && x >= 10 && x <= 24) {
                        row.push(17); // castle_wall (collision)
                    }
                    else if (y === 4 && x >= 10 && x <= 24) {
                        if (x >= 16 && x <= 18) row.push(19); // castle_door
                        else row.push(17);
                    }
                    else if (y >= 5 && y <= 6 && x >= 10 && x <= 24) {
                        row.push(18); // castle_floor
                    }
                    // Jardins du chateau
                    else if (y >= 7 && y <= 8 && x >= 11 && x <= 23) {
                        if (x === 13 || x === 17 || x === 21) row.push(8); // fleurs
                        else row.push(0); // herbe
                    }
                    // Place du marche (centre)
                    else if (y >= 13 && y <= 17 && x >= 12 && x <= 22) {
                        row.push(20); // cobblestone
                    }
                    // Fontaine au centre du marche
                    else if (y >= 14 && y <= 16 && x >= 16 && x <= 18) {
                        if (y === 15 && x === 17) row.push(1); // eau
                        else row.push(2); // pierre
                    }
                    // Rues principales (nord-sud)
                    else if (x >= 16 && x <= 18 && y >= 4 && y <= 30) {
                        row.push(20); // cobblestone
                    }
                    // Rue est-ouest
                    else if (y >= 14 && y <= 16 && (x >= 2 && x <= 32)) {
                        row.push(20);
                    }
                    // TAVERNE (est)
                    else if (y >= 11 && y <= 12 && x >= 26 && x <= 31) {
                        row.push(22); // tavern_roof (collision)
                    }
                    else if (y === 13 && x >= 26 && x <= 31) {
                        if (x === 28) row.push(6); // porte
                        else row.push(21); // tavern_wall (collision)
                    }
                    // Maisons residences (ouest)
                    else if (y >= 11 && y <= 12 && x >= 3 && x <= 8) {
                        row.push(5); // roof (collision)
                    }
                    else if (y === 13 && x >= 3 && x <= 8) {
                        if (x === 5) row.push(6);
                        else row.push(4); // wall (collision)
                    }
                    // 2eme maison ouest
                    else if (y >= 18 && y <= 19 && x >= 3 && x <= 8) {
                        row.push(5);
                    }
                    else if (y === 20 && x >= 3 && x <= 8) {
                        if (x === 6) row.push(6);
                        else row.push(4);
                    }
                    // Maison est basse
                    else if (y >= 19 && y <= 20 && x >= 26 && x <= 31) {
                        row.push(5);
                    }
                    else if (y === 21 && x >= 26 && x <= 31) {
                        if (x === 29) row.push(6);
                        else row.push(4);
                    }
                    // PARC (sud)
                    else if (y >= 24 && y <= 29 && x >= 5 && x <= 14) {
                        if ((x === 7 || x === 12) && (y === 25 || y === 28)) row.push(3); // arbres
                        else if (x === 9 && y === 26) row.push(1); // petit bassin
                        else if ((x + y) % 5 === 0) row.push(8); // fleurs
                        else row.push(0);
                    }
                    // RUELLE SOMBRE (sud-est)
                    else if (y >= 25 && y <= 29 && x >= 27 && x <= 32) {
                        if (x === 27 || x === 32) row.push(4); // murs (collision)
                        else row.push(7); // dirt sombre
                    }
                    // Arbres decoratifs
                    else if (
                        (x === 2 && y === 9) || (x === 33 && y === 9) ||
                        (x === 2 && y === 22) || (x === 33 && y === 22) ||
                        (x === 10 && y === 22) || (x === 24 && y === 22)
                    ) {
                        row.push(3);
                    }
                    // Reste = herbe
                    else {
                        row.push(0);
                    }
                }
                m.push(row);
            }
            return m;
        })(),
        collisions: [3, 4, 5, 17, 21, 22, 2],
        exits: [],
        npcs: [
            // Abdel dans le chateau
            { id: 'abdel', sprite: 'abdel', x: 17, y: 5, dialogue: 'abdel_intro' },
            // Ilyesse se balade
            { id: 'ilyesse', sprite: 'ilyesse', x: 14, y: 15, dialogue: 'ilyesse_phase0' },
            // Gardes du chateau
            { id: 'garde_chateau', sprite: 'guard', x: 14, y: 4, dialogue: 'garde_chateau_talk' },
            // 6 temoins
            { id: 'samira', sprite: 'woman1', x: 18, y: 14, dialogue: 'samira_talk' },
            { id: 'nadia', sprite: 'woman2', x: 28, y: 12, dialogue: 'nadia_talk' },
            { id: 'fatima', sprite: 'woman1', x: 9, y: 26, dialogue: 'fatima_talk' },
            { id: 'leila', sprite: 'woman2', x: 5, y: 14, dialogue: 'leila_talk' },
            { id: 'yasmine', sprite: 'woman1', x: 29, y: 27, dialogue: 'yasmine_talk' },
            { id: 'sarah', sprite: 'woman2', x: 20, y: 8, dialogue: 'sarah_talk' },
        ],
        enemies: [],
        items: [
            // Preuves cachees
            { type: 'chest', x: 30, y: 28, contains: 'evidence_letter', id: 'ev_letter' },
            { type: 'chest', x: 8, y: 27, contains: 'evidence_bijou', id: 'ev_bijou' },
            { type: 'chest', x: 27, y: 17, contains: 'evidence_carnet', id: 'ev_carnet' },
            // Potions
            { type: 'potion', x: 6, y: 21, id: 'gv_potion1' },
            { type: 'potion', x: 30, y: 22, id: 'gv_potion2' },
        ],
    },
};

// ============================================
// DIALOGUES
// ============================================

const DIALOGUES = {
    sage_intro: [
        { speaker: 'Sage Aldric', text: "Redouane... Enfin, tu es la. Eloham nous avait predit ta venue." },
        { speaker: 'Sage Aldric', text: "Le Createur t'a envoye ici pour une raison. Une malediction s'abat sur notre royaume." },
        { speaker: 'Sage Aldric', text: "Le Seigneur des Ombres s'est installe dans le donjon au-dela de la foret." },
        { speaker: 'Sage Aldric', text: "Tu dois trouver la Cle Sacree dans la foret pour ouvrir le donjon, puis vaincre cette creature." },
        { speaker: 'Sage Aldric', text: "Eloham croit en toi, Redouane. Ne le decois pas." },
    ],
    sage_has_key: [
        { speaker: 'Sage Aldric', text: "Tu as la Cle Sacree ! Va au sud, traverse la foret, et entre dans le donjon a l'est." },
        { speaker: 'Sage Aldric', text: "Que la lumiere d'Eloham te guide, Redouane." },
    ],
    villager1_intro: [
        { speaker: 'Marie', text: "Bienvenue dans notre village, etranger ! On dit qu'Eloham lui-meme t'a envoye." },
        { speaker: 'Marie', text: "Fait attention dans la foret au sud... Des slimes y rodent." },
        { speaker: 'Marie', text: "Si tu trouves des potions, elles te rendront un coeur de vie." },
    ],
    villager2_intro: [
        { speaker: 'Thomas', text: "Hola ! T'es le fameux Redouane ? Celui envoye par le Createur ?" },
        { speaker: 'Thomas', text: "Au-dela de la foret, y'a un camp de mobilhomes. Le donjon serait cache dans l'un d'eux..." },
        { speaker: 'Thomas', text: "Cherche la cle dans la foret d'abord. Et reviens en un seul morceau !" },
    ],
    guard_intro: [
        { speaker: 'Garde Roland', text: "Halte ! La foret au sud est dangereuse, mais si tu es vraiment l'elu d'Eloham..." },
        { speaker: 'Garde Roland', text: "...alors je n'ai pas a te retenir. Bonne chance, Redouane." },
    ],
    guard_has_key: [
        { speaker: 'Garde Roland', text: "Tu as la cle ! Traverse la foret vers l'est, tu trouveras un camp de mobilhomes. Le donjon est dans le numero 17." },
    ],
    chest_key: [
        { speaker: '', text: "Tu as trouve la Cle Sacree ! Tu peux maintenant ouvrir le donjon." },
    ],
    dungeon_locked: [
        { speaker: '', text: "La porte du donjon est verrouillee. Il te faut une cle..." },
    ],
    boss_defeated: [
        { speaker: '', text: "Le Seigneur des Ombres est vaincu ! La malediction est levee !" },
        { speaker: 'Voix d\'Eloham', text: "Bien joue, Redouane. Tu as accompli ta mission. Le royaume est sauve." },
        { speaker: 'Voix d\'Eloham', text: "Tu peux etre fier de toi. Ton nom restera dans les legendes de ce monde." },
    ],

    // --- Camp de mobilhomes ---
    camper1_talk: [
        { speaker: 'Jean-Michel', text: "Salut mec ! Bienvenue au camp. Y'a plein de mobilhomes ici." },
        { speaker: 'Jean-Michel', text: "Chacun a un numero. Si tu cherches quelque chose de louche, essaie le 17..." },
        { speaker: 'Jean-Michel', text: "On entend des trucs bizarres qui viennent de la-bas. Des cris, des bruits..." },
    ],
    camper2_talk: [
        { speaker: 'Brigitte', text: "Ah, toi aussi t'as entendu les cris du mobilhome 17 ?" },
        { speaker: 'Brigitte', text: "C'est Pierre qui habite la. Personne ose y aller..." },
        { speaker: 'Brigitte', text: "Si t'as une cle, tente la porte de derriere. Fais-toi discret." },
    ],

    // Mobilhome 17 - la blague
    mh17_enter: [
        { speaker: '', text: "* AAAAH ! OUIII ! AAAAH ! *" },
        { speaker: 'Redouane', text: "C'est quoi ce bordel ?! C'est bien le mobilhome 17..." },
        { speaker: '', text: "* Des bruits... compromettants... viennent de la premiere piece *" },
        { speaker: 'Redouane', text: "Oh non... C'est Pierre avec une meuf la-dedans..." },
        { speaker: 'Redouane', text: "Bon, je vais prendre la deuxieme porte discretement..." },
        { speaker: '', text: "* Tu te faufiles en silence vers la porte du fond... *" },
        { speaker: 'Redouane', text: "Pourvu qu'il m'ait pas entendu. Allez, on entre..." },
    ],
    mh17_locked: [
        { speaker: '', text: "Le mobilhome 17... On entend des cris de femme a l'interieur. La porte est verrouillee." },
        { speaker: 'Redouane', text: "Il me faut la cle. C'est clairement louche ce mobilhome." },
    ],

    // Autres mobilhomes - dialogues randoms
    mh_random1: [
        { speaker: '', text: "Toc toc... Pas de reponse. Ce mobilhome a l'air vide." },
    ],
    mh_random2: [
        { speaker: 'Voix de l\'interieur', text: "C'est occupe ! Revenez plus tard !" },
        { speaker: 'Redouane', text: "Pardon, pardon... C'est pas celui-la." },
    ],
    mh_random3: [
        { speaker: '', text: "La porte est fermee a cle. Un chat miaule a l'interieur." },
        { speaker: 'Redouane', text: "C'est pas ici non plus..." },
    ],

    // ============================================
    // ACTE 2 - DIALOGUES
    // ============================================

    // Transition Acte 1 -> Acte 2
    // Choix moral apres le boss
    boss_defeated_choice: [
        { speaker: '', text: "Le Seigneur des Ombres est a terre... Il gémit de douleur." },
        { speaker: 'Seigneur des Ombres', text: "Pitie... Je n'etais qu'un pantin... Quelqu'un m'a force a faire ca..." },
        { speaker: 'Redouane', text: "..." },
    ],
    boss_spared: [
        { speaker: 'Redouane', text: "...Je t'epargne. Mais dis-moi ce que tu sais." },
        { speaker: 'Seigneur des Ombres', text: "Merci... La vraie menace n'est pas ici. Un predateur sevit dans le Grand Village." },
        { speaker: 'Seigneur des Ombres', text: "Mefiez-vous de ceux qui sourient trop. Le mal se cache derriere les visages amicaux." },
        { speaker: 'Voix d\'Eloham', text: "Tu as choisi la clemence, Redouane. C'est la marque d'un vrai heros." },
        { speaker: 'Voix d\'Eloham', text: "Ta VRAIE mission commence. Un predateur terrorise le Grand Village." },
        { speaker: 'Voix d\'Eloham', text: "Trouve-le. Interroge les temoins. Et fais attention a qui tu fais confiance." },
    ],
    boss_killed: [
        { speaker: 'Redouane', text: "...Non. C'est fini pour toi." },
        { speaker: '', text: "* Le Seigneur des Ombres disparait dans un nuage de fumee noire *" },
        { speaker: 'Voix d\'Eloham', text: "Justice expeditive. Soit. Le resultat est le meme." },
        { speaker: 'Voix d\'Eloham', text: "Mais souviens-toi : la force sans pitie, c'est la brutalite. Pas l'heroisme." },
        { speaker: 'Voix d\'Eloham', text: "Ta VRAIE mission commence. Un predateur terrorise le Grand Village." },
        { speaker: 'Voix d\'Eloham', text: "Trouve-le. Et cette fois, reflechis avant d'agir." },
    ],

    // ABDEL - Le riche
    abdel_intro: [
        { speaker: 'Abdel', text: "Ah, un visiteur ! Bienvenue dans MON village. Enfin, le village du roi, mais bon..." },
        { speaker: 'Abdel', text: "...entre nous, c'est MOI qui finance tout ici. Ce chateau ? C'est moi. Les routes ? Moi. La fontaine ? MOI." },
        { speaker: 'Redouane', text: "Oui oui, c'est tres impressionnant. Ecoute, je suis la pour enqueter sur un predateur qui-" },
        { speaker: 'Abdel', text: "Ah OUI, cette histoire. Tres embetant pour l'image du village. MON village." },
        { speaker: 'Abdel', text: "Des femmes se sont plaintes. Un type louche qui les suit, leur envoie des messages, rode la nuit..." },
        { speaker: 'Abdel', text: "J'ai fait mettre des lampadaires en OR pour la securite. 500 pieces d'or chacun. Mais bon." },
        { speaker: 'Redouane', text: "...En or. Evidemment. T'as des noms de temoins ?" },
        { speaker: 'Abdel', text: "Samira au marche, Nadia a la taverne, et d'autres. Interroge-les. Et admire mon chateau en passant." },
        { speaker: '', text: "[Indice obtenu : Abdel confirme l'existence du predateur]" },
    ],
    abdel_later: [
        { speaker: 'Abdel', text: "T'as trouve le coupable ? Ca me coute une fortune en securite cette histoire." },
        { speaker: 'Abdel', text: "Tu sais combien coute un garde ? 50 pieces d'or PAR JOUR. J'en ai 12. FAIS LE CALCUL." },
        { speaker: 'Redouane', text: "Oui oui Abdel, j'y travaille..." },
    ],

    // GARDE DU CHATEAU
    garde_chateau_talk: [
        { speaker: 'Garde du Chateau', text: "Halte ! Seuls les invites d'Abdel peuvent entrer. Et accessoirement, les enqueteurs." },
        { speaker: 'Garde du Chateau', text: "T'es enqueteur ? Ah ben entre alors. Abdel est au fond, sur son trone en or." },
        { speaker: 'Garde du Chateau', text: "Oui, un trone en or. Il est pas roi mais il a un trone. Pose pas de questions." },
    ],

    // ILYESSE - 4 phases
    ilyesse_phase0: [
        { speaker: 'Ilyesse', text: "REDOUANE ?! Mon frere ! Ca fait une ETERNITE !" },
        { speaker: 'Ilyesse', text: "Tu te souviens quand on jouait ensemble etant gamins ? Les bons souvenirs mec !" },
        { speaker: 'Redouane', text: "Ilyesse ! Qu'est-ce que tu fous la ?!" },
        { speaker: 'Ilyesse', text: "J'habite ici maintenant ! Village tranquille, gens sympa... C'est le paradis." },
        { speaker: 'Ilyesse', text: "Et toi, qu'est-ce qui t'amene ? Tu visites ?" },
        { speaker: 'Redouane', text: "En quelque sorte... Je fais une petite enquete." },
        { speaker: 'Ilyesse', text: "Oh cool ! Si t'as besoin d'aide, hesite pas frero ! Je connais tout le monde ici." },
    ],
    ilyesse_phase1: [
        { speaker: 'Ilyesse', text: "Hey Redouane ! Alors cette enquete, ca avance ?" },
        { speaker: 'Redouane', text: "Ouais, j'ai parle a quelques personnes. Y'a un mec chelou qui traine apparemment." },
        { speaker: 'Ilyesse', text: "Ah ouais ? C'est qui ? Dis-moi, je peux peut-etre t'aider a le trouver !" },
        { speaker: 'Ilyesse', text: "...Au fait, t'as parle a qui exactement ?" },
        { speaker: 'Redouane', text: "Quelques temoins. Pourquoi tu demandes ?" },
        { speaker: 'Ilyesse', text: "Non non, pour rien ! Juste curieux haha. Bon courage frero !" },
    ],
    ilyesse_phase2: [
        { speaker: 'Ilyesse', text: "...Redouane. T'enquetes sur quoi au juste ?" },
        { speaker: 'Redouane', text: "Un predateur qui s'en prend aux femmes du village." },
        { speaker: 'Ilyesse', text: "Et... t'as des suspects ?" },
        { speaker: 'Redouane', text: "Pas encore. Mais les temoignages se recoupent. Le mec est quelqu'un de connu." },
        { speaker: 'Ilyesse', text: "...Quelqu'un de connu. Hmm." },
        { speaker: 'Ilyesse', text: "Ecoute, fais gaffe a pas accuser n'importe qui hein. Les gens parlent beaucoup ici." },
        { speaker: 'Redouane', text: "(Il a l'air bizarre la...)" },
    ],
    ilyesse_phase3: [
        { speaker: 'Ilyesse', text: "Arrete de fouiner partout Redouane. Serieux." },
        { speaker: 'Redouane', text: "Pourquoi ? Ca te derange ?" },
        { speaker: 'Ilyesse', text: "Non ! C'est juste que... tu fais peur aux gens avec tes questions." },
        { speaker: 'Redouane', text: "C'est marrant, les temoins disent toutes la meme chose : un mec sympa, gentil, que tout le monde apprecie..." },
        { speaker: 'Ilyesse', text: "Et alors ? Y'a plein de mecs sympa ici !" },
        { speaker: 'Redouane', text: "...Ouais. Plein." },
        { speaker: '', text: "(Ilyesse transpire. Il evite ton regard.)" },
    ],

    // CONFRONTATION (quand 6+ indices)
    ilyesse_confrontation: [
        { speaker: 'Redouane', text: "Ilyesse. Faut qu'on parle." },
        { speaker: 'Ilyesse', text: "...De quoi ?" },
        { speaker: 'Redouane', text: "J'ai la lettre anonyme que tu as envoyee a Yasmine. C'est TON ecriture." },
        { speaker: 'Redouane', text: "J'ai le bijou que t'as offert a Fatima pour 'l'amadouer'. Elle l'a reconnu." },
        { speaker: 'Redouane', text: "Et j'ai ton carnet. Avec les NOMS. Les ADRESSES. Les HEURES." },
        { speaker: 'Ilyesse', text: "C'est... c'est pas ce que tu crois !" },
        { speaker: 'Redouane', text: "6 femmes temoignent, Ilyesse. SIX. Toutes decrivent le meme mec." },
        { speaker: 'Redouane', text: "Un mec sympa. Gentil. Que tout le monde apprecie. Mon pote d'enfance." },
        { speaker: 'Ilyesse', text: "FERME-LA ! T'ES QU'UN TRAITRE ! ON ETAIT FRERES !" },
        { speaker: 'Redouane', text: "Non. TOI t'es le traitre. T'es un predateur." },
        { speaker: 'Ilyesse', text: "TU VAS LE REGRETTER !!!" },
        { speaker: '', text: "* Ilyesse entre dans une rage folle ! Combat ! *" },
    ],

    // TEMOINS
    samira_talk: [
        { speaker: 'Samira', text: "Tu enquetes sur le predateur ? Enfin quelqu'un qui fait quelque chose..." },
        { speaker: 'Samira', text: "Un mec m'a suivie l'autre soir apres le marche. J'ai couru jusqu'a chez moi." },
        { speaker: 'Samira', text: "Je l'ai pas bien vu, mais il avait l'air... normal. Pas un clochard ou un fou." },
        { speaker: 'Samira', text: "C'est ca qui fait peur. Il a l'air de quelqu'un de bien." },
        { speaker: '', text: "[Indice obtenu : Le suspect a l'air d'un homme normal et respectable]" },
    ],
    nadia_talk: [
        { speaker: 'Nadia', text: "Le mec chelou ? Oh putain oui je le connais. Enfin, je connais ses MESSAGES." },
        { speaker: 'Nadia', text: "Il m'ecrivait des trucs genre 'T'es trop belle, on devrait se voir en prive'..." },
        { speaker: 'Nadia', text: "Au debut c'etait gentil, apres c'est devenu TRES insistant. Des trucs degueulasses." },
        { speaker: 'Nadia', text: "Le pire c'est qu'il se fait passer pour un gentil mec. Tout le monde l'aime au village." },
        { speaker: 'Redouane', text: "Tout le monde l'aime... Tu sais a quoi il ressemble ?" },
        { speaker: 'Nadia', text: "Pas vraiment, les messages etaient anonymes. Mais il connait le village par coeur." },
        { speaker: '', text: "[Indice obtenu : Le suspect est apprecie au village et connait tout le monde]" },
    ],
    fatima_talk: [
        { speaker: 'Fatima', text: "J'ose a peine en parler..." },
        { speaker: 'Fatima', text: "Un homme rode pres de chez moi la nuit. Je l'entends marcher devant ma fenetre." },
        { speaker: 'Fatima', text: "Une fois, il m'a laisse un cadeau devant la porte. Un bijou. Comme si c'etait romantique." },
        { speaker: 'Redouane', text: "Un bijou ? Tu l'as encore ?" },
        { speaker: 'Fatima', text: "Non, je l'ai jete dans le parc pres du bassin. Ca me degoutait." },
        { speaker: 'Redouane', text: "(Je devrais chercher ce bijou dans le parc...)" },
        { speaker: '', text: "[Indice obtenu : Le suspect offre des cadeaux et rode la nuit. Un bijou est dans le parc]" },
    ],
    leila_talk: [
        { speaker: 'Leila', text: "Tu veux savoir pour le pervers ? Ouais j'ai un truc a te raconter." },
        { speaker: 'Leila', text: "Un mec m'a invite chez lui pour 'voir sa collection de trucs rares'. A 23h. LOL." },
        { speaker: 'Leila', text: "J'ai dit non evidemment. Mais il a INSISTE. Genre 5 fois." },
        { speaker: 'Redouane', text: "Et tu le connais ce mec ?" },
        { speaker: 'Leila', text: "Il a dit qu'il etait nouveau ici mais tout le monde le connait. Ca colle pas." },
        { speaker: 'Leila', text: "Ah et il se la joue super sympa devant les autres. Genre le mec parfait." },
        { speaker: '', text: "[Indice obtenu : Le suspect pretend etre nouveau mais est connu. Double personnalite]" },
    ],
    yasmine_talk: [
        { speaker: 'Yasmine', text: "...Je sais pas si je devrais en parler." },
        { speaker: 'Redouane', text: "S'il te plait. C'est important. D'autres femmes ont temoigne." },
        { speaker: 'Yasmine', text: "...Il m'a envoye une lettre. Une longue lettre. Avec des trucs... horribles dedans." },
        { speaker: 'Yasmine', text: "Je l'ai jetee dans la ruelle derriere la taverne. J'arrivais plus a la garder chez moi." },
        { speaker: 'Yasmine', text: "Mais je sais qui c'est." },
        { speaker: 'Redouane', text: "QUI ?!" },
        { speaker: 'Yasmine', text: "...C'est quelqu'un que TOUT LE MONDE aime ici. Quelqu'un d'au-dessus de tout soupcon." },
        { speaker: 'Yasmine', text: "Si je donne son nom sans preuve, personne me croira. Trouve la lettre." },
        { speaker: '', text: "[Indice CLE obtenu : Yasmine connait l'identite ! Une lettre est dans la ruelle]" },
    ],
    sarah_talk: [
        { speaker: 'Sarah', text: "Je l'ai VU. De mes propres yeux." },
        { speaker: 'Sarah', text: "Il trainait pres du chateau a 2h du matin. Un mec avec un sourire chelou." },
        { speaker: 'Sarah', text: "Il avait des vetements verts. Et il sifflotait. Comme si c'etait NORMAL de trainer a 2h du mat." },
        { speaker: 'Redouane', text: "Des vetements verts... Un sourire... Et il trainait pres du chateau ?" },
        { speaker: 'Sarah', text: "Ouais. Et quand il m'a vue, il a fait genre 'Bonsoir mademoiselle !' tout naturel." },
        { speaker: 'Sarah', text: "Mais ses yeux... Y'avait un truc pas net dans son regard." },
        { speaker: '', text: "[Indice obtenu : Le suspect porte du vert, sourire chelou, traine la nuit]" },
    ],

    // PREUVES PHYSIQUES
    evidence_letter_found: [
        { speaker: '', text: "Tu as trouve la LETTRE ANONYME dans la ruelle !" },
        { speaker: 'Redouane', text: "Putain... C'est degeulasse ce qui est ecrit la-dedans." },
        { speaker: 'Redouane', text: "Mais je reconnais cette ecriture... C'est celle d'Ilyesse." },
        { speaker: '', text: "[PREUVE obtenue : Lettre anonyme - ecriture d'Ilyesse]" },
    ],
    evidence_bijou_found: [
        { speaker: '', text: "Tu as trouve le BIJOU dans le parc, pres du bassin !" },
        { speaker: 'Redouane', text: "C'est le bijou dont parlait Fatima. Et il y a une gravure derriere..." },
        { speaker: 'Redouane', text: "'Pour toi, de ton admirateur secret - I.' ... I comme Ilyesse ?!" },
        { speaker: '', text: "[PREUVE obtenue : Bijou grave avec initiale 'I']" },
    ],
    evidence_carnet_found: [
        { speaker: '', text: "Tu as trouve un CARNET derriere la taverne !" },
        { speaker: 'Redouane', text: "C'est un carnet avec des noms de femmes, leurs adresses, leurs horaires..." },
        { speaker: 'Redouane', text: "C'est le carnet d'un STALKER. Et la couverture... c'est la meme que le carnet d'Ilyesse qu'il avait gamin." },
        { speaker: 'Redouane', text: "Mon dieu... C'est lui. C'est Ilyesse. Mon ami d'enfance est le predateur." },
        { speaker: '', text: "[PREUVE DECISIVE obtenue : Carnet de stalking appartenant a Ilyesse]" },
    ],

    // VICTOIRE FINALE
    final_victory: [
        { speaker: '', text: "Ilyesse s'effondre, vaincu." },
        { speaker: 'Ilyesse', text: "...Tu m'as... battu..." },
        { speaker: 'Redouane', text: "C'est fini Ilyesse. Les gardes d'Abdel vont s'occuper de toi." },
        { speaker: 'Ilyesse', text: "On etait freres... Comment t'as pu..." },
        { speaker: 'Redouane', text: "C'est TOI qui as trahi. Pas moi. Ces femmes avaient le droit de vivre en paix." },
        { speaker: 'Voix d\'Eloham', text: "Redouane. Tu as accompli ta mission. La vraie." },
        { speaker: 'Voix d\'Eloham', text: "Le predateur est arrete. Les femmes du village sont en securite." },
        { speaker: 'Voix d\'Eloham', text: "Tu as prouve que meme face a un ami, la justice passe avant tout." },
        { speaker: 'Voix d\'Eloham', text: "Tu es un vrai heros, Redouane. Eloham est fier de toi." },
    ],

    // ============================================
    // DARK PATH - Redouane est le predateur
    // ============================================
    dark_confrontation: [
        { speaker: 'Redouane', text: "Ilyesse. Faut qu'on parle. J'ai les preuves." },
        { speaker: 'Ilyesse', text: "...Les preuves de QUOI, Redouane ?" },
        { speaker: 'Redouane', text: "La lettre. Le bijou. Le carnet. C'est TOI le-" },
        { speaker: 'Ilyesse', text: "ARRETE." },
        { speaker: 'Ilyesse', text: "Tu veux vraiment faire ca ? Devant tout le monde ?" },
        { speaker: 'Ilyesse', text: "Parce que moi aussi j'ai des preuves, Redouane." },
        { speaker: 'Redouane', text: "...De quoi tu parles ?" },
        { speaker: 'Ilyesse', text: "La lettre ? C'est TON ecriture. Je la reconnais depuis l'enfance." },
        { speaker: 'Ilyesse', text: "Le bijou ? C'est TOI qui l'as achete au marche. Samira t'a vu." },
        { speaker: 'Ilyesse', text: "Et le carnet... C'est le TIEN. Celui que tu planquais sous ton lit quand on etait gamins." },
        { speaker: 'Redouane', text: "C'est... c'est n'importe quoi !" },
        { speaker: 'Ilyesse', text: "Ah oui ? Alors pourquoi t'as menace Yasmine pour qu'elle se taise ?" },
        { speaker: 'Ilyesse', text: "Pourquoi t'as utilise Nadia comme appat au lieu de la proteger ?" },
        { speaker: 'Ilyesse', text: "Pourquoi t'as culpabilise Fatima alors qu'elle PLEURAIT devant toi ?" },
        { speaker: 'Redouane', text: "Je... je faisais mon enquete..." },
        { speaker: 'Ilyesse', text: "Non, Redouane. Tu faisais TA couverture." },
    ],

    dark_revelation: [
        { speaker: 'Voix d\'Eloham', text: "...Redouane." },
        { speaker: 'Voix d\'Eloham', text: "Je t'ai observe. Chaque choix. Chaque mot. Chaque geste." },
        { speaker: 'Voix d\'Eloham', text: "Je t'ai envoye ici pour TROUVER le predateur..." },
        { speaker: 'Voix d\'Eloham', text: "...et tu l'as trouve." },
        { speaker: 'Voix d\'Eloham', text: "C'etait toi depuis le debut." },
        { speaker: 'Redouane', text: "NON ! C'est faux ! C'est Ilyesse qui-" },
        { speaker: 'Voix d\'Eloham', text: "Ilyesse essayait de te STOPPER. Il te surveillait." },
        { speaker: 'Voix d\'Eloham', text: "Quand il posait des questions sur ton enquete, c'etait pas de la nervosité." },
        { speaker: 'Voix d\'Eloham', text: "C'etait de la PEUR. Peur de ce que tu allais faire aux femmes du village." },
        { speaker: 'Ilyesse', text: "Je t'ai suivi depuis le debut, Redouane. Je savais. Tout le monde savait." },
        { speaker: 'Ilyesse', text: "Tu as menace les victimes. Tu as utilise les temoins. Tu as fait pression partout." },
        { speaker: 'Ilyesse', text: "Tu te croyais au-dessus de tout. Le heros. L'elu d'Eloham." },
        { speaker: 'Ilyesse', text: "Mais t'es juste un monstre qui se cachait derriere une mission." },
        { speaker: 'Voix d\'Eloham', text: "Les gardes arrivent, Redouane. C'est fini." },
        { speaker: 'Voix d\'Eloham', text: "Tu avais le choix d'etre bienveillant. Tu as choisi la cruaute." },
        { speaker: 'Voix d\'Eloham', text: "La vraie mission n'etait pas de trouver le predateur." },
        { speaker: 'Voix d\'Eloham', text: "C'etait de voir QUI TU ETAIS quand tu avais du pouvoir." },
        { speaker: '', text: "* Les gardes d'Abdel encerclent Redouane... *" },
    ],

    // ============================================
    // CHOIX MORAUX - DIALOGUES
    // ============================================

    // Abdel
    abdel_helped: [
        { speaker: 'Abdel', text: "Ah, un homme de parole ! Tiens, prends cette potion de luxe. Coutait 200 pieces d'or." },
        { speaker: 'Abdel', text: "Et voila 3 gardes supplementaires pour le village. De rien." },
        { speaker: 'Redouane', text: "Merci Abdel. T'es pas si mal au final." },
        { speaker: 'Abdel', text: "Pas si mal ?! Je suis MAGNIFIQUE. Allez, au boulot." },
    ],
    abdel_insulted: [
        { speaker: 'Abdel', text: "...Pardon ?! MA thune a construit ce village ! Sans moi c'est un champ de patates !" },
        { speaker: 'Abdel', text: "Garde ! Sors-moi cet insolent de mon chateau !" },
        { speaker: 'Garde du Chateau', text: "(En vous raccompagnant) Psst... Le mec louche, il traine souvent pres du parc la nuit." },
    ],
    abdel_threatened: [
        { speaker: 'Redouane', text: "Ecoute bien Abdel. Tu me donnes les infos ou je retourne tout ton chateau." },
        { speaker: 'Abdel', text: "Tu... tu oses me MENACER ?! Dans MON chateau ?!" },
        { speaker: 'Abdel', text: "...D'accord d'accord ! Le suspect, on l'a vu pres de la taverne a 2h du mat !" },
        { speaker: 'Abdel', text: "Maintenant DEGAGE de chez moi !" },
        { speaker: '', text: "(Les gardes vous regardent avec mefiance...)" },
    ],

    // Yasmine revisit + choix
    yasmine_revisit: [
        { speaker: 'Yasmine', text: "...Tu es revenu." },
        { speaker: 'Yasmine', text: "J'ai... j'ai reflechi a ce que tu m'as dit." },
    ],
    yasmine_gentle: [
        { speaker: 'Yasmine', text: "...Merci. Merci de pas me brusquer." },
        { speaker: 'Yasmine', text: "C'est... c'est quelqu'un en qui tu as confiance. Un ami." },
        { speaker: 'Yasmine', text: "Il se fait passer pour quelqu'un de bien, mais la nuit..." },
        { speaker: 'Yasmine', text: "La nuit c'est un MONSTRE." },
        { speaker: '', text: "(Yasmine vous serre la main. Elle a confiance en vous.)" },
    ],
    yasmine_pressured: [
        { speaker: 'Yasmine', text: "...OK. OK je parle." },
        { speaker: 'Yasmine', text: "C'est un mec du village. Il porte souvent du vert. Il sourit tout le temps." },
        { speaker: 'Yasmine', text: "C'est tout ce que je dirai. Laissez-moi tranquille maintenant." },
    ],
    yasmine_intimidated: [
        { speaker: 'Yasmine', text: "...!!" },
        { speaker: 'Yasmine', text: "V-vous etes... vous etes comme LUI..." },
        { speaker: 'Yasmine', text: "Laissez-moi tranquille ! AU SECOURS !" },
        { speaker: '', text: "(Yasmine s'enfuit en pleurant. Les passants vous regardent avec degout.)" },
    ],

    // Nadia revisit + choix
    nadia_revisit: [
        { speaker: 'Nadia', text: "Yo, j'ai une idee. Si on tendait un piege au mec chelou ?" },
        { speaker: 'Nadia', text: "Genre, je fais semblant d'etre seule la nuit et tu te planques..." },
    ],
    nadia_protected: [
        { speaker: 'Redouane', text: "Non. C'est trop dangereux. Je vais le trouver autrement." },
        { speaker: 'Nadia', text: "...C'est gentil de ta part. La plupart des mecs s'en foutraient." },
        { speaker: 'Nadia', text: "T'es un bon gars, Redouane. Je le sens." },
    ],
    nadia_accepted: [
        { speaker: 'Redouane', text: "OK mais je serai juste a cote. Au moindre probleme, je debarque." },
        { speaker: 'Nadia', text: "Deal. On fait ca ce soir." },
    ],
    nadia_used: [
        { speaker: 'Redouane', text: "Parfait. Tu vas l'attirer et moi je le chope. Fais exactement ce que je dis." },
        { speaker: 'Nadia', text: "...Euh, OK ? T'es un peu flippant quand tu parles comme ca." },
        { speaker: 'Nadia', text: "Genre... c'est moi l'appat quoi. Cool." },
        { speaker: '', text: "(Nadia a l'air mal a l'aise. Elle evite votre regard.)" },
    ],

    // Fatima revisit + choix
    fatima_revisit: [
        { speaker: 'Fatima', text: "V-vous etes revenu... J'ai encore fait des cauchemars cette nuit..." },
    ],
    fatima_comforted: [
        { speaker: 'Redouane', text: "Hey. Ecoute-moi. Je te PROMETS que ca va s'arreter." },
        { speaker: 'Redouane', text: "Personne ne devrait vivre dans la peur comme ca. Je vais le trouver." },
        { speaker: 'Fatima', text: "...Merci. Vous etes la premiere personne qui me prend au serieux." },
        { speaker: '', text: "(Fatima sourit timidement. Premiere fois depuis longtemps.)" },
    ],
    fatima_dismissed: [
        { speaker: 'Redouane', text: "Je note tout ca. Merci pour le temoignage, c'est utile." },
        { speaker: 'Fatima', text: "...C'est tout ? 'Utile' ?" },
        { speaker: 'Fatima', text: "Je vous parle de mes CAUCHEMARS et c'est 'utile'..." },
    ],
    fatima_blamed: [
        { speaker: 'Redouane', text: "Franchement, t'aurais du aller voir les gardes plus tot. Pourquoi t'as attendu ?" },
        { speaker: 'Fatima', text: "...Parce que j'avais PEUR ! Personne me croyait !" },
        { speaker: 'Fatima', text: "Et vous... vous etes pareil que les autres." },
        { speaker: '', text: "(Fatima claque la porte. Des voisins vous fixent avec hostilite.)" },
    ],

    // ============================================
    // QUETES DE SEDUCTION (karma negatif si insistant)
    // ============================================

    // Samira - flirt au marche
    samira_flirt: [
        { speaker: 'Samira', text: "Tu repasses encore ? T'as pas d'enquete a mener ?" },
        { speaker: 'Redouane', text: "Si mais... j'avais aussi envie de te revoir." },
        { speaker: 'Samira', text: "Oh... c'est gentil. Mais je suis la pour bosser hein." },
    ],
    samira_flirt_gentle: [
        { speaker: 'Redouane', text: "T'as raison, je suis la pour le boulot. Prends soin de toi, Samira." },
        { speaker: 'Samira', text: "Merci Redouane. T'es un mec bien." },
        { speaker: '', text: "(Elle rougit legerement. Karma +5)" },
    ],
    samira_flirt_push: [
        { speaker: 'Redouane', text: "Allez, juste un verre apres ton service ? On a le droit de se detendre non ?" },
        { speaker: 'Samira', text: "...Je sais pas trop. Avec tout ce qui se passe au village..." },
        { speaker: 'Redouane', text: "Justement ! Une raison de plus de pas rester seul le soir." },
        { speaker: 'Samira', text: "OK... peut-etre. Mais juste un verre." },
        { speaker: '', text: "(Elle a dit oui mais elle a l'air pas super a l'aise. Karma -5)" },
    ],
    samira_flirt_creepy: [
        { speaker: 'Redouane', text: "Tu sais, t'es vraiment la plus belle du village. Je pourrais te proteger, moi..." },
        { speaker: 'Samira', text: "...Euh, c'est gentil mais je peux me debrouiller." },
        { speaker: 'Redouane', text: "Non mais serieux, un mec comme moi a tes cotes, personne t'embeterait." },
        { speaker: 'Samira', text: "Tu me fais un peu flipper la en fait. Merci mais... non." },
        { speaker: '', text: "(Les gens au marche vous regardent bizarrement. Karma -15)" },
    ],

    // Nadia - seduction a la taverne
    nadia_flirt: [
        { speaker: 'Nadia', text: "Tiens, le beau gosse enqueteur est de retour !" },
        { speaker: 'Redouane', text: "Haha, 'beau gosse'. Continue comme ca." },
        { speaker: 'Nadia', text: "Qu'est-ce que tu veux, charmeur ?" },
    ],
    nadia_flirt_charm: [
        { speaker: 'Redouane', text: "Juste profiter de la compagnie. T'es la seule qui me fait rire dans ce village." },
        { speaker: 'Nadia', text: "Pfff flatteur va. Mais c'est cute. Tiens, un verre, c'est cadeau." },
        { speaker: '', text: "(Ambiance detendue. Nadia apprecie. Karma +5)" },
    ],
    nadia_flirt_heavy: [
        { speaker: 'Redouane', text: "Et si on continuait cette conversation chez toi ce soir ?" },
        { speaker: 'Nadia', text: "Wow, direct. T'es pas du genre patient toi." },
        { speaker: 'Nadia', text: "...J'hesite. T'es mignon mais c'est peut-etre pas le moment avec ce taré qui rode." },
        { speaker: 'Redouane', text: "Raison de plus, je te protege toute la nuit." },
        { speaker: 'Nadia', text: "...T'es chaud toi. Bon, passe vers 22h. Mais t'as interet a etre sage." },
        { speaker: '', text: "(Ca a marche mais... tu profites de la situation ? Karma -10)" },
    ],
    nadia_flirt_aggressive: [
        { speaker: 'Redouane', text: "Ecoute Nadia, on se connait maintenant. Viens chez moi, on sera tranquilles." },
        { speaker: 'Nadia', text: "Euh... C'est un peu rapide la non ?" },
        { speaker: 'Redouane', text: "T'as peur de quoi ? Je suis l'enqueteur, le heros du village." },
        { speaker: 'Nadia', text: "...T'es serieux ? C'est exactement le genre de truc que le PREDATEUR dirait." },
        { speaker: 'Nadia', text: "Casse-toi Redouane. Et reviens pas ici." },
        { speaker: '', text: "(Nadia te jette dehors. Le barman aussi. Karma -20)" },
    ],

    // Leila - la plus directe
    leila_flirt: [
        { speaker: 'Leila', text: "Re. T'as l'air fatigue, l'enqueteur." },
        { speaker: 'Redouane', text: "C'est dur d'etre un heros. J'aurais besoin de reconfort." },
        { speaker: 'Leila', text: "Oh oh. C'est une technique de drague ca ?" },
    ],
    leila_flirt_honest: [
        { speaker: 'Redouane', text: "Haha ouais, un peu. Mais c'est vrai que t'es cool." },
        { speaker: 'Leila', text: "T'es honnete au moins. C'est rare. On verra apres l'enquete, OK ?" },
        { speaker: '', text: "(Leila respecte ton honnetete. Karma +5)" },
    ],
    leila_flirt_manipulate: [
        { speaker: 'Redouane', text: "En fait j'ai besoin de ton aide... Il faut que tu viennes chez moi ce soir examiner des preuves." },
        { speaker: 'Leila', text: "Examiner des preuves... chez toi... a la nuit tombee." },
        { speaker: 'Leila', text: "C'est EXACTEMENT ce que le mec chelou m'avait dit. 'Viens voir ma collection'." },
        { speaker: 'Leila', text: "T'es vraiment en train de me faire le meme coup ?!" },
        { speaker: '', text: "(Leila part furieuse. Elle a fait le lien. Karma -20)" },
    ],

    // Sarah - pres du chateau
    sarah_flirt: [
        { speaker: 'Sarah', text: "Oh, l'enqueteur. Comment avance l'affaire ?" },
        { speaker: 'Redouane', text: "Bien. Mais la vue d'ici est pas mal non plus..." },
        { speaker: 'Sarah', text: "*rit* T'es pas subtil." },
    ],
    sarah_flirt_sweet: [
        { speaker: 'Redouane', text: "Non c'est vrai, t'as un beau sourire. Ca fait du bien dans cette affaire sombre." },
        { speaker: 'Sarah', text: "Merci... C'est gentil. Fais attention a toi la-bas, OK ?" },
        { speaker: '', text: "(Sarah est touchee par ta sincerite. Karma +5)" },
    ],
    sarah_flirt_pressure: [
        { speaker: 'Redouane', text: "Serieusement, qu'est-ce que tu dirais d'un diner avec moi ? Ce soir ?" },
        { speaker: 'Sarah', text: "Euh... la ? Maintenant ? Avec un predateur qui rode ?" },
        { speaker: 'Redouane', text: "Justement, tu seras en securite avec moi." },
        { speaker: 'Sarah', text: "...Mouais. T'as un drole de sens des priorites pour un enqueteur." },
        { speaker: '', text: "(Sarah est perplexe. Tu devrais te concentrer sur l'enquete. Karma -10)" },
    ],
};

// Tile type mapping pour le rendu
const TILE_RENDER_MAP = {
    0: 'grass',
    1: 'water',
    2: 'stone',
    3: 'tree',
    4: 'wall',
    5: 'roof',
    6: 'door',
    7: 'dirt',
    8: 'flower_grass',
    9: 'dungeon_wall',
    10: 'dungeon_floor',
    13: 'mobilhome_body',
    14: 'mobilhome_roof',
    15: 'mobilhome_door',
    16: 'mobilhome_window',
    11: 'spike_floor',
    // Acte 2
    17: 'castle_wall',
    18: 'castle_floor',
    19: 'castle_door',
    20: 'cobblestone',
    21: 'tavern_wall',
    22: 'tavern_roof',
};
