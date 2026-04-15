// ============================================
// MAIN - Game Loop & Game State (Enhanced)
// ============================================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = 640;
        this.canvas.height = 480;
        this.ctx.imageSmoothingEnabled = false;

        // Core systems
        this.input = new InputManager();
        this.camera = new Camera(this.canvas.width, this.canvas.height);
        this.renderer = new Renderer(this.ctx, this.camera);
        this.dialogue = new DialogueSystem();
        this.ui = new UI();
        this.audio = new AudioManager();

        // Effect systems
        this.particles = new ParticleSystem();
        this.effects = new ScreenEffects(this.canvas);
        this.trails = new TrailRenderer();

        // RPG systems
        this.rpg = new RPGSystem();
        this.choices = new ChoiceSystem();

        // Game state
        this.state = {
            hasKey: false,
            bossDefeated: false,
            collectedItems: new Set(),
            currentMap: 'village',
            visitedMaps: new Set(['village']),
            // Acte 2
            act: 1,
            clues: [],
            evidence: [],
            ilyessePhase: 0,
            confrontation: false,
            talkedTo: new Set(),
            moralChoice: null,    // spare/kill
            // Karma cache (0-100, commence a 50)
            // > 50 = bienveillant → Ilyesse est le predateur
            // < 30 = sombre → Redouane est le predateur (twist)
            karma: 50,
            karmaChoices: [],     // historique des choix
            darkPath: false,      // true si karma < 30 au moment de la confrontation
        };

        // Entities
        this.player = null;
        this.enemies = [];
        this.npcs = [];
        this.items = [];
        this.currentMap = null;

        // Transition
        this.transitioning = false;
        this.transitionAlpha = 0;
        this.transitionTarget = null;
        this.transitionPlayerPos = null;

        // Ambient particle timers
        this._ambientTimer = 0;
        this._footstepTimer = 0;
        this._bossTrailTimer = 0;

        // Init
        this.loadMap('village');

        // Game loop with fallback for background tabs
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
        this._rafId = null;
        this._startLoop();
    }

    _startLoop() {
        this._lastRafTime = 0;

        const loop = (time) => {
            this._lastRafTime = time;
            this.gameLoop(time);
            this._rafId = requestAnimationFrame(loop);
        };
        this._rafId = requestAnimationFrame(loop);

        // Fallback ONLY when rAF is paused (background tab)
        this._fallbackInterval = setInterval(() => {
            // Only run if rAF hasn't fired in 100ms
            if (performance.now() - this._lastRafTime > 100) {
                this.gameLoop(performance.now());
            }
        }, 50);
    }

    loadMap(mapName, playerX, playerY) {
        const mapData = MAPS[mapName];
        if (!mapData) return;

        this.currentMap = mapData;
        this.state.currentMap = mapName;
        this.state.visitedMaps.add(mapName);

        const px = playerX !== undefined ? playerX : mapData.playerStart.x;
        const py = playerY !== undefined ? playerY : mapData.playerStart.y;

        if (!this.player) {
            this.player = new Player(px, py);
        } else {
            this.player.x = px;
            this.player.y = py;
            this.player.px = px * SCALED_TILE;
            this.player.py = py * SCALED_TILE;
        }

        this.enemies = mapData.enemies.map(e => new Enemy({ ...e }));
        this.npcs = mapData.npcs.map(n => new NPC(n));
        this.items = mapData.items
            .filter(i => !this.state.collectedItems.has(i.id))
            .map(i => new Item(i));

        // Set zone visual effects
        this.effects.setZoneTint(mapName);

        // Musique selon la zone
        this.audio.setZoneMusic(mapName);

        // Setup lights for dungeon
        this.updateLights();

        // Clear old particles
        this.particles = new ParticleSystem();
        this.trails = new TrailRenderer();

        // Snap camera
        this.camera.snapTo(this.player, this.currentMap.width, this.currentMap.height);
    }

    updateLights() {
        const lights = [];
        const map = this.state.currentMap;

        // Player always emits light
        if (this.player) {
            lights.push({
                id: 'player',
                x: this.player.px + SCALED_TILE / 2,
                y: this.player.py + SCALED_TILE / 2,
                radius: map === 'dungeon' ? 120 : 200,
                flicker: 5,
                color: 'rgba(255,220,150,0.1)',
            });
        }

        // Dungeon torches
        if (map === 'dungeon') {
            const torchPositions = [
                { x: 3, y: 9 }, { x: 3, y: 11 },
                { x: 10, y: 6 }, { x: 10, y: 14 },
                { x: 17, y: 9 }, { x: 17, y: 11 },
                { x: 19, y: 4 }, { x: 22, y: 4 },
                { x: 19, y: 15 }, { x: 22, y: 15 },
            ];
            for (const tp of torchPositions) {
                lights.push({
                    x: tp.x * SCALED_TILE + SCALED_TILE / 2,
                    y: tp.y * SCALED_TILE + SCALED_TILE / 2,
                    radius: 80 + Math.random() * 20,
                    flicker: 6 + Math.random() * 4,
                    color: 'rgba(255,150,50,0.12)',
                });
            }
        }

        this.effects.setLights(lights);
    }

    gameLoop(time) {
        const dt = time - this.lastTime;
        this.lastTime = time;

        this.input.update();
        this.ui.update();
        this.effects.update();
        this.particles.update();
        this.trails.update();
        this.rpg.update();

        if (this.ui.titleScreen) {
            this.updateTitle();
            this.drawTitle();
        } else if (this.ui.gameOver) {
            this.updateGameOver();
            this.drawGameOver();
        } else if (this.ui.victory) {
            this.updateVictory();
            this.drawVictory();
        } else {
            this.update();
            this.draw();
        }
    }

    updateTitle() {
        if (this.input.action) {
            this.ui.titleScreen = false;
            this.audio.init();
            this.audio.transition();
        }
    }

    updateGameOver() {
        if (this.input.action) {
            this.ui.gameOver = false;
            this.state.hasKey = false;
            this.state.bossDefeated = false;
            this.state.collectedItems.clear();
            this.player = null;
            this.loadMap('village');
        }
    }

    updateVictory() {
        // Victory particles
        if (Math.random() < 0.3) {
            this.particles.emit(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height,
                { ...PARTICLE_PRESETS.pickupSparkle, life: 60 },
                1
            );
        }
    }

    update() {
        if (this.transitioning) {
            this.updateTransition();
            return;
        }

        if (this.dialogue.active) {
            this.dialogue.update(this.input);
            if (!this.dialogue.active) {
                // After-dialogue action (choix moral, etc.)
                if (this._afterDialogueAction) {
                    const action = this._afterDialogueAction;
                    this._afterDialogueAction = null;
                    action();
                    return;
                }
                // Transition en attente
                if (this._pendingTransition) {
                    const t = this._pendingTransition;
                    this._pendingTransition = null;
                    this.startTransition(t.target, t.tx, t.ty);
                }
                // Confrontation Ilyesse → spawn boss
                if (this.state.confrontation && !this._ilyesseBossSpawned) {
                    this._ilyesseBossSpawned = true;

                    if (this.state.darkPath) {
                        // DARK ENDING : Pas de combat, juste la revelation
                        this.effects.shake(15, 50);
                        this.effects.flash('#000', 0.8, 0.005);
                        setTimeout(() => {
                            this.dialogue.start(DIALOGUES.dark_revelation);
                            this._afterDialogueAction = () => {
                                this.ui.victory = true;
                                this.ui.darkEnding = true;
                            };
                        }, 500);
                    } else {
                        // LIGHT ENDING : Combat contre Ilyesse
                        this.effects.shake(10, 30);
                        this.effects.flash('#ff0000', 0.5, 0.02);
                        this.audio.attack();
                        this.npcs = this.npcs.filter(n => n.id !== 'ilyesse');
                        this.enemies.push(new Enemy({
                            type: 'ilyesse_boss', x: 14, y: 14,
                            hp: 10, speed: 0.7, behavior: 'boss'
                        }));
                        this.ui.addNotification('ILYESSE ATTAQUE !');
                    }
                }
            }
            return;
        }

        // Choices screen
        if (this.choices.active) {
            this.choices.update(this.input);
            return;
        }

        // Level up pending?
        if (this.rpg.pendingLevelUps.length > 0) {
            const lu = this.rpg.pendingLevelUps.shift();
            if (lu.skill) {
                this.ui.addNotification('NIVEAU ' + lu.level + ' ! Competence : ' + lu.skillName + ' (' + lu.skillKey + ')');
            } else {
                this.ui.addNotification('NIVEAU ' + lu.level + ' !');
            }
            this.audio.pickup();
        }

        // Player
        this.player.update(this.input, this.currentMap, this.rpg);

        if (this.player.hp <= 0) {
            this.ui.gameOver = true;
            this.audio.gameOver();
            this.effects.shake(8, 30);
            this.effects.flash('#ff0000', 0.6, 0.02);
            return;
        }

        // Camera smooth follow
        this.camera.follow(this.player, this.currentMap.width, this.currentMap.height);

        // Apply shake to camera
        const shake = this.effects.getShakeOffset();
        this.camera.shakeX = shake.x;
        this.camera.shakeY = shake.y;

        // Update lights (player position changes)
        this.updateLights();

        // Enemies
        for (const enemy of this.enemies) {
            enemy.update(this.player, this.currentMap);

            // Boss charge trail
            if (enemy.type === 'boss' && enemy.alive && enemy.bossChargeTimer > 0) {
                this._bossTrailTimer++;
                if (this._bossTrailTimer % 3 === 0) {
                    const sprites = ENEMY_SPRITES.boss;
                    this.trails.addTrail(enemy.px, enemy.py, sprites[enemy.animFrame % sprites.length], 0.25);
                    this.particles.emit(
                        enemy.px + SCALED_TILE / 2,
                        enemy.py + SCALED_TILE / 2,
                        PARTICLE_PRESETS.bossCharge, 2
                    );
                }
            }
        }

        // Items
        for (const item of this.items) {
            item.update();
        }

        // Pierre proximity sound in camp
        if (this.state.currentMap === 'camp') {
            this.audio.updatePierreProximity(this.player.x, this.player.y);
        }

        // Ambient effects
        this.updateAmbientEffects();

        // Footstep particles
        this.updateFootstepParticles();

        // Interactions
        this.checkInteractions();
        this.checkCombat();
        this.checkTransitions();
        this.checkItems();
        this.checkSpikes();
        this.checkSpecialDoors();
    }

    updateAmbientEffects() {
        this._ambientTimer++;
        const map = this.state.currentMap;

        if (map === 'forest') {
            // Falling leaves
            if (this._ambientTimer % 40 === 0) {
                const viewX = this.camera.x + Math.random() * this.canvas.width;
                const viewY = this.camera.y - 20;
                this.particles.emit(viewX, viewY, PARTICLE_PRESETS.fallingLeaf, 1);
            }
        }

        if (map === 'dungeon') {
            // Torch embers
            if (this._ambientTimer % 15 === 0) {
                for (const light of this.effects.lights) {
                    if (light.id === 'player') continue;
                    if (Math.random() < 0.3) {
                        this.particles.emit(light.x, light.y - 10, PARTICLE_PRESETS.ember, 1);
                    }
                    if (Math.random() < 0.15) {
                        this.particles.emit(light.x, light.y - 5, PARTICLE_PRESETS.torchGlow, 1);
                    }
                }
            }
        }

        if (map === 'village') {
            // Water drops near fountain
            if (this._ambientTimer % 30 === 0) {
                this.particles.emit(
                    14 * SCALED_TILE + Math.random() * SCALED_TILE * 2,
                    13 * SCALED_TILE,
                    PARTICLE_PRESETS.waterDrop, 1
                );
            }
        }
    }

    updateFootstepParticles() {
        if (this.player.moving && !this.player.attacking) {
            this._footstepTimer++;
            if (this._footstepTimer % 8 === 0) {
                this.particles.emit(
                    this.player.px + SCALED_TILE / 2,
                    this.player.py + SCALED_TILE - 2,
                    PARTICLE_PRESETS.footstep, 2
                );
            }
        }
    }

    checkInteractions() {
        let nearNPC = null;
        for (const npc of this.npcs) {
            if (npc.isNearPlayer(this.player)) {
                nearNPC = npc;
                break;
            }
        }

        if (nearNPC && this.input.interact) {
            let dialogue = null;

            // ACTE 2 : logique speciale
            if (this.state.act === 2 && nearNPC.id === 'ilyesse') {
                dialogue = this.getIlyesseDialogue();
            } else if (this.state.act === 2 && nearNPC.id === 'abdel' && this.state.clues.length > 0) {
                dialogue = DIALOGUES.abdel_later;
                // Choix avec Abdel (une seule fois)
                if (!this.state.karmaChoices.includes('abdel_choice')) {
                    this._afterDialogueAction = () => {
                        this.choices.show(
                            'Abdel te propose un deal...',
                            '"Je peux t\'aider... moyennant un service."',
                            [
                                { id: 'help', label: 'Aider Abdel avec sa securite', desc: 'Il te paye et te file une potion. Karma +10' },
                                { id: 'insult', label: '"Ta thune regle pas tout, Abdel."', desc: 'Il se vexe mais un garde te file un indice par pitie. Karma -5' },
                                { id: 'threaten', label: 'Le menacer pour des infos', desc: 'Tu obtiens des infos par la force. Karma -15' },
                            ],
                            (id) => {
                                this.state.karmaChoices.push('abdel_choice');
                                if (id === 'help') {
                                    this.state.karma += 10;
                                    this.dialogue.start(DIALOGUES.abdel_helped);
                                    this.player.heal(4);
                                } else if (id === 'insult') {
                                    this.state.karma -= 5;
                                    this.dialogue.start(DIALOGUES.abdel_insulted);
                                } else {
                                    this.state.karma -= 15;
                                    this.dialogue.start(DIALOGUES.abdel_threatened);
                                }
                            }
                        );
                    };
                }
            } else if (this.state.act === 2 && nearNPC.id === 'yasmine' && !this.state.karmaChoices.includes('yasmine_choice') && this.state.talkedTo.has('yasmine')) {
                // 2eme visite a Yasmine = choix
                this._afterDialogueAction = () => {
                    this.choices.show(
                        'Yasmine hesite a parler...',
                        'Elle a peur. Comment tu reagis ?',
                        [
                            { id: 'gentle', label: 'La rassurer avec douceur', desc: '"Prends ton temps, je suis la pour aider." Karma +10' },
                            { id: 'pressure', label: 'Insister fermement', desc: '"J\'ai besoin de savoir, c\'est urgent." Karma -5' },
                            { id: 'intimidate', label: 'L\'intimider pour qu\'elle parle', desc: '"PARLE ou je te considere complice !" Karma -20' },
                        ],
                        (id) => {
                            this.state.karmaChoices.push('yasmine_choice');
                            if (id === 'gentle') {
                                this.state.karma += 10;
                                this.dialogue.start(DIALOGUES.yasmine_gentle);
                            } else if (id === 'pressure') {
                                this.state.karma -= 5;
                                this.dialogue.start(DIALOGUES.yasmine_pressured);
                            } else {
                                this.state.karma -= 20;
                                this.dialogue.start(DIALOGUES.yasmine_intimidated);
                            }
                        }
                    );
                };
                dialogue = DIALOGUES.yasmine_revisit;
            } else if (this.state.act === 2 && nearNPC.id === 'nadia' && !this.state.karmaChoices.includes('nadia_choice') && this.state.talkedTo.has('nadia')) {
                this._afterDialogueAction = () => {
                    this.choices.show(
                        'Nadia te fait une proposition...',
                        '"J\'ai une idee pour pieger le mec..."',
                        [
                            { id: 'protect', label: 'Refuser : trop dangereux pour elle', desc: '"Non, je veux pas te mettre en danger." Karma +10' },
                            { id: 'accept', label: 'Accepter son aide', desc: '"OK mais je serai la pour te proteger." Karma +0' },
                            { id: 'use', label: 'L\'utiliser comme appat', desc: '"Parfait, tu vas l\'attirer et je le chope." Karma -15' },
                        ],
                        (id) => {
                            this.state.karmaChoices.push('nadia_choice');
                            if (id === 'protect') {
                                this.state.karma += 10;
                                this.dialogue.start(DIALOGUES.nadia_protected);
                            } else if (id === 'accept') {
                                this.dialogue.start(DIALOGUES.nadia_accepted);
                            } else {
                                this.state.karma -= 15;
                                this.dialogue.start(DIALOGUES.nadia_used);
                            }
                        }
                    );
                };
                dialogue = DIALOGUES.nadia_revisit;
            } else if (this.state.act === 2 && nearNPC.id === 'fatima' && !this.state.karmaChoices.includes('fatima_choice') && this.state.talkedTo.has('fatima')) {
                this._afterDialogueAction = () => {
                    this.choices.show(
                        'Fatima pleure...',
                        '"J\'ai tellement peur le soir..."',
                        [
                            { id: 'comfort', label: 'La reconforter', desc: '"Je te promets que ca va s\'arreter." Karma +10' },
                            { id: 'dismiss', label: 'Rester professionnel', desc: '"Je note. Merci pour le temoignage." Karma -5' },
                            { id: 'blame', label: 'La culpabiliser', desc: '"T\'aurais du aller voir les gardes plus tot." Karma -20' },
                        ],
                        (id) => {
                            this.state.karmaChoices.push('fatima_choice');
                            if (id === 'comfort') {
                                this.state.karma += 10;
                                this.dialogue.start(DIALOGUES.fatima_comforted);
                            } else if (id === 'dismiss') {
                                this.state.karma -= 5;
                                this.dialogue.start(DIALOGUES.fatima_dismissed);
                            } else {
                                this.state.karma -= 20;
                                this.dialogue.start(DIALOGUES.fatima_blamed);
                            }
                        }
                    );
                };
                dialogue = DIALOGUES.fatima_revisit;
            }
            // QUETES DE SEDUCTION - Revisiter des temoins deja interroges
            else if (this.state.act === 2 && this.state.talkedTo.has(nearNPC.id) && !dialogue) {
                const flirtTargets = ['samira', 'nadia', 'leila', 'sarah'];
                const flirtKey = nearNPC.id + '_flirt';
                if (flirtTargets.includes(nearNPC.id) && !this.state.karmaChoices.includes(flirtKey)) {
                    const flirtDialogue = DIALOGUES[nearNPC.id + '_flirt'];
                    if (flirtDialogue) {
                        dialogue = flirtDialogue;
                        const npcId = nearNPC.id;
                        this._afterDialogueAction = () => {
                            const options = this.getFlirtOptions(npcId);
                            this.choices.show(
                                'Comment tu reagis ?',
                                '',
                                options,
                                (id) => {
                                    this.state.karmaChoices.push(npcId + '_flirt');
                                    const resultDialogue = DIALOGUES[npcId + '_flirt_' + id];
                                    if (resultDialogue) this.dialogue.start(resultDialogue);
                                    // Karma
                                    if (id === 'gentle' || id === 'charm' || id === 'honest' || id === 'sweet') {
                                        this.state.karma += 5;
                                    } else if (id === 'push' || id === 'heavy' || id === 'pressure') {
                                        this.state.karma -= 10;
                                    } else if (id === 'creepy' || id === 'aggressive' || id === 'manipulate') {
                                        this.state.karma -= 20;
                                    }
                                }
                            );
                        };
                    }
                }
                if (!dialogue) dialogue = nearNPC.getDialogue(this.state);
            }
            else {
                dialogue = nearNPC.getDialogue(this.state);
            }

            if (dialogue) {
                this.dialogue.start(dialogue);
                this.audio.dialogue();

                // Acte 2 : enregistrer l'indice si c'est un temoin
                if (this.state.act === 2) {
                    this.processAct2Interaction(nearNPC.id);
                }
            }
        }

        // Carnet d'enquete (TAB)
        if (this.state.act === 2 && this.input.notebook) {
            this.ui.showNotebook = !this.ui.showNotebook;
        }

        this._nearNPC = nearNPC;
    }

    getIlyesseDialogue() {
        const totalClues = this.state.clues.length + this.state.evidence.length;

        if (totalClues >= 6) {
            this.state.ilyessePhase = 4;

            // KARMA CHECK : dark path ou light path ?
            if (this.state.karma < 30) {
                // DARK ENDING : Redouane est le predateur !
                this.state.darkPath = true;
                this.state.confrontation = true;
                return DIALOGUES.dark_confrontation;
            } else {
                // LIGHT ENDING : Ilyesse est le predateur
                this.state.confrontation = true;
                return DIALOGUES.ilyesse_confrontation;
            }
        } else if (totalClues >= 4) {
            this.state.ilyessePhase = 3;
            return DIALOGUES.ilyesse_phase3;
        } else if (totalClues >= 2) {
            this.state.ilyessePhase = 2;
            return DIALOGUES.ilyesse_phase2;
        } else if (totalClues >= 1) {
            this.state.ilyessePhase = 1;
            return DIALOGUES.ilyesse_phase1;
        }
        return DIALOGUES.ilyesse_phase0;
    }

    getFlirtOptions(npcId) {
        switch (npcId) {
            case 'samira': return [
                { id: 'gentle', label: 'Rester respectueux', desc: '"Prends soin de toi, Samira." Karma +5' },
                { id: 'push', label: 'Proposer un verre', desc: '"Juste un verre apres ton service ?" Karma -5' },
                { id: 'creepy', label: 'Etre insistant et lourd', desc: '"Je pourrais te proteger moi..." Karma -15' },
            ];
            case 'nadia': return [
                { id: 'charm', label: 'Charmer avec humour', desc: '"T\'es la seule qui me fait rire ici." Karma +5' },
                { id: 'heavy', label: 'Proposer de venir chez elle', desc: '"On continue chez toi ce soir ?" Karma -10' },
                { id: 'aggressive', label: 'Insister lourdement', desc: '"Viens chez moi, on sera tranquilles." Karma -20' },
            ];
            case 'leila': return [
                { id: 'honest', label: 'Etre honnete', desc: '"T\'es cool, on verra apres l\'enquete." Karma +5' },
                { id: 'manipulate', label: 'Manipuler avec les preuves', desc: '"Viens examiner des preuves chez moi..." Karma -20' },
            ];
            case 'sarah': return [
                { id: 'sweet', label: 'Compliment sincere', desc: '"Ton sourire fait du bien." Karma +5' },
                { id: 'pressure', label: 'Proposer un diner direct', desc: '"Diner ce soir ? Avec moi." Karma -10' },
            ];
            default: return [];
        }
    }

    processAct2Interaction(npcId) {
        const witnessIds = ['samira', 'nadia', 'fatima', 'leila', 'yasmine', 'sarah', 'abdel'];
        if (witnessIds.includes(npcId) && !this.state.talkedTo.has(npcId)) {
            this.state.talkedTo.add(npcId);
            this.rpg.addXP(XP_REWARDS.talk_npc, this);
            if (npcId !== 'abdel' || this.state.clues.length === 0) {
                this.state.clues.push(npcId);
                this.ui.addNotification('Indice ' + this.state.clues.length + '/6 obtenu !');
                this.rpg.addXP(XP_REWARDS.find_evidence, this);
            }
        }
    }

    checkCombat() {
        if (!this.player.attacking) return;
        // Only hit on the first frame of attack
        const atkFrame = this.player.chargedAttack ?
            (this.player.attackTimer === 11) :
            (this.player.attackTimer === this.player.attackDuration - 1);
        if (!atkFrame) return;

        const isCharged = this.player.chargedAttack;
        const isCombo = this.player.comboFinisher;
        const damage = this.rpg.getAttackDamage(isCharged, isCombo);

        this.audio.attack();

        // Attack spark particles (more for charged)
        const hitbox = this.player.getAttackHitbox();
        this.particles.emit(
            hitbox.x + hitbox.w / 2,
            hitbox.y + hitbox.h / 2,
            PARTICLE_PRESETS.attackSpark, isCharged ? 12 : 5
        );

        // Shake (bigger for charged)
        this.effects.shake(isCharged ? 5 : 2, isCharged ? 10 : 5);

        // Knockback direction
        const kbDir = { x: 0, y: 0 };
        switch (this.player.direction) {
            case 'up':    kbDir.y = -1; break;
            case 'down':  kbDir.y = 1; break;
            case 'left':  kbDir.x = -1; break;
            case 'right': kbDir.x = 1; break;
        }

        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;

            const ex = enemy.px;
            const ey = enemy.py;
            const es = SCALED_TILE;

            if (hitbox.x < ex + es && hitbox.x + hitbox.w > ex &&
                hitbox.y < ey + es && hitbox.y + hitbox.h > ey) {
                enemy.takeDamage(damage, kbDir);
                this.audio.hit();

                // Damage number
                this.rpg.addDamageNumber(
                    ex + es / 2, ey - 5,
                    damage, isCharged || isCombo
                );

                // Hit particles
                this.particles.emit(
                    ex + es / 2, ey + es / 2,
                    PARTICLE_PRESETS.enemyHit, 8
                );

                // Hit shake
                this.effects.shake(3, 8);
                this.effects.flash('#fff', 0.1, 0.05);

                if (!enemy.alive) {
                    this.audio.enemyDeath();

                    // XP reward
                    const xpReward = XP_REWARDS[enemy.type] || 10;
                    this.rpg.addXP(xpReward, this);
                    this.rpg.addXPNumber(ex + es / 2, ey - 20, xpReward);

                    // Death explosion particles
                    this.particles.emit(
                        ex + es / 2, ey + es / 2,
                        PARTICLE_PRESETS.deathBurst, 20
                    );

                    // Big shake + flash
                    this.effects.shake(6, 15);
                    this.effects.flash('#fff', 0.25, 0.03);

                    if (enemy.type === 'boss' && this.state.act === 1) {
                        this.state.bossDefeated = true;
                        this.audio.victory();
                        this.effects.shake(12, 40);
                        this.effects.flash('#d4af37', 0.6, 0.01);

                        this.particles.emit(
                            ex + es / 2, ey + es / 2,
                            PARTICLE_PRESETS.deathBurst, 50
                        );

                        // Choix moral puis transition Acte 2
                        setTimeout(() => {
                            this.dialogue.start(DIALOGUES.boss_defeated_choice);
                            // Apres le dialogue, montrer le choix
                            this._afterDialogueAction = () => {
                                this.choices.show(
                                    'Le Seigneur des Ombres est a terre...',
                                    'Que fais-tu ?',
                                    [
                                        { id: 'spare', label: 'Epargner le Seigneur des Ombres', desc: 'Il te donne un indice pour ta prochaine mission. +30 XP.' },
                                        { id: 'kill', label: 'L\'achever sans pitie', desc: 'Tu recois son epee maudite. +50 XP. Mais a quel prix...' },
                                    ],
                                    (choiceId) => {
                                        this.state.moralChoice = choiceId;
                                        if (choiceId === 'spare') {
                                            this.rpg.addXP(XP_REWARDS.choice_spare, this);
                                            this.state.karma += 15;
                                            this.state.karmaChoices.push('spare_boss');
                                            this.dialogue.start(DIALOGUES.boss_spared);
                                        } else {
                                            this.rpg.addXP(XP_REWARDS.choice_kill, this);
                                            this.state.karma -= 15;
                                            this.state.karmaChoices.push('kill_boss');
                                            this.dialogue.start(DIALOGUES.boss_killed);
                                        }
                                        this._pendingTransition = { target: 'grand_village', tx: 17, ty: 20 };
                                        this.state.act = 2;
                                        this.player.hp = this.player.maxHp;
                                    }
                                );
                            };
                        }, 1500);
                    }

                    if (enemy.type === 'ilyesse_boss') {
                        this.audio.victory();
                        this.effects.shake(15, 50);
                        this.effects.flash('#fff', 0.8, 0.008);
                        this.particles.emit(ex + es/2, ey + es/2, PARTICLE_PRESETS.deathBurst, 50);
                        setTimeout(() => {
                            this.dialogue.start(DIALOGUES.final_victory);
                            setTimeout(() => { this.ui.victory = true; this.ui.finalVictory = true; }, 10000);
                        }, 1500);
                    }

                    // Drop coeur
                    if (Math.random() < 0.5 && this.player.hp < this.player.maxHp) {
                        this.player.heal(2);
                        this.ui.addNotification('+1 Coeur');
                        this.particles.emit(
                            this.player.px + SCALED_TILE / 2,
                            this.player.py + SCALED_TILE / 2,
                            PARTICLE_PRESETS.healParticle, 10
                        );
                    }
                }
            }
        }
    }

    checkItems() {
        for (const item of this.items) {
            if (item.collected) continue;
            if (!item.isNearPlayer(this.player)) continue;

            if (item.type === 'chest') {
                if (this.input.interact) {
                    item.collected = true;
                    this.state.collectedItems.add(item.id);
                    this.audio.pickup();

                    // Sparkle particles
                    this.particles.emit(
                        item.x * SCALED_TILE + SCALED_TILE / 2,
                        item.y * SCALED_TILE + SCALED_TILE / 2,
                        PARTICLE_PRESETS.pickupSparkle, 15
                    );
                    this.effects.flash('#ffd700', 0.2, 0.03);

                    if (item.contains === 'key') {
                        this.state.hasKey = true;
                        this.player.hasKey = true;
                        this.dialogue.start(DIALOGUES.chest_key);
                        this.ui.addNotification('Cle Sacree obtenue !');
                    }
                    // Preuves Acte 2
                    else if (item.contains === 'evidence_letter') {
                        this.state.evidence.push('letter');
                        this.dialogue.start(DIALOGUES.evidence_letter_found);
                        this.ui.addNotification('PREUVE : Lettre anonyme !');
                    }
                    else if (item.contains === 'evidence_bijou') {
                        this.state.evidence.push('bijou');
                        this.dialogue.start(DIALOGUES.evidence_bijou_found);
                        this.ui.addNotification('PREUVE : Bijou grave !');
                    }
                    else if (item.contains === 'evidence_carnet') {
                        this.state.evidence.push('carnet');
                        this.dialogue.start(DIALOGUES.evidence_carnet_found);
                        this.ui.addNotification('PREUVE DECISIVE : Carnet !');
                    }
                }
            } else if (item.type === 'potion') {
                item.collected = true;
                this.state.collectedItems.add(item.id);
                this.player.heal(2);
                this.audio.pickup();
                this.ui.addNotification('+1 Coeur');

                this.particles.emit(
                    item.x * SCALED_TILE + SCALED_TILE / 2,
                    item.y * SCALED_TILE + SCALED_TILE / 2,
                    PARTICLE_PRESETS.healParticle, 12
                );
            }
        }
    }

    checkSpecialDoors() {
        if (!this.currentMap.specialDoors) return;
        if (!this.input.interact) return;

        const px = this.player.getTileX();
        const py = this.player.getTileY();

        for (const door of this.currentMap.specialDoors) {
            // Verifier si le joueur est adjacent a la porte
            const dist = Math.abs(px - door.x) + Math.abs(py - door.y);
            if (dist > 2) continue;

            // Mobilhome 17 = entree du donjon
            if (door.id === 'mh17') {
                if (door.requiresKey && !this.state.hasKey) {
                    this.dialogue.start(DIALOGUES.mh17_locked);
                } else {
                    // Scene de Pierre !
                    this.dialogue.start(DIALOGUES.mh17_enter);
                    // Apres le dialogue, transition vers le donjon
                    this._pendingTransition = { target: door.target, tx: door.tx, ty: door.ty };
                }
                return;
            }

            // Autres mobilhomes = dialogues randoms
            if (door.dialogue && DIALOGUES[door.dialogue]) {
                this.dialogue.start(DIALOGUES[door.dialogue]);
                return;
            }
        }
    }

    checkTransitions() {
        if (!this.currentMap.exits) return;

        const px = this.player.getTileX();
        const py = this.player.getTileY();

        for (const exit of this.currentMap.exits) {
            let triggered = false;

            switch (exit.side) {
                case 'south':
                    triggered = py >= this.currentMap.height - 1 && px >= exit.fromX && px <= exit.toX;
                    break;
                case 'north':
                    triggered = py <= 0 && px >= exit.fromX && px <= exit.toX;
                    break;
                case 'east':
                    triggered = px >= this.currentMap.width - 1 && py >= exit.fromY && py <= exit.toY;
                    break;
                case 'west':
                    triggered = px <= 0 && py >= exit.fromY && py <= exit.toY;
                    break;
            }

            if (triggered) {
                if (exit.target === 'dungeon' && !this.state.hasKey) {
                    this.dialogue.start(DIALOGUES.dungeon_locked);
                    this.player.px -= (exit.side === 'east' ? 1 : -1) * SCALED_TILE;
                    this.player.py -= (exit.side === 'south' ? 1 : exit.side === 'north' ? -1 : 0) * SCALED_TILE;
                    return;
                }

                this.startTransition(exit.target, exit.tx, exit.ty);
                return;
            }
        }
    }

    startTransition(mapName, px, py) {
        this.transitioning = true;
        this.transitionAlpha = 0;
        this.transitionTarget = mapName;
        this.transitionPlayerPos = { x: px, y: py };
        this.audio.transition();
    }

    updateTransition() {
        this.transitionAlpha += 0.04;

        if (this.transitionAlpha >= 1 && this.transitionTarget) {
            this.loadMap(this.transitionTarget, this.transitionPlayerPos.x, this.transitionPlayerPos.y);
            this.transitionTarget = null;
        }

        if (this.transitionAlpha >= 2) {
            this.transitioning = false;
            this.transitionAlpha = 0;
        }
    }

    // ============================================
    // DRAW
    // ============================================

    draw() {
        this.renderer.clear();

        // Map
        this.renderer.drawMap(this.currentMap);

        // --- Shadows (below entities) ---
        for (const npc of this.npcs) {
            this.renderer.drawShadowAt(npc.x, npc.y);
        }
        for (const enemy of this.enemies) {
            if (enemy.alive) {
                this.renderer.drawShadowAtPixel(enemy.px, enemy.py);
            }
        }
        this.renderer.drawShadowAtPixel(this.player.px, this.player.py);

        // --- Items ---
        for (const item of this.items) {
            item.draw(this.renderer);
        }

        // --- Trails (below enemies) ---
        this.trails.draw(this.ctx, this.camera.renderX, this.camera.renderY);

        // --- NPCs ---
        for (const npc of this.npcs) {
            npc.draw(this.renderer);
        }

        // --- Enemies ---
        for (const enemy of this.enemies) {
            enemy.draw(this.renderer);
        }

        // --- Player ---
        this.player.draw(this.renderer);

        // --- Particles (above everything) ---
        this.particles.draw(this.ctx, this.camera.renderX, this.camera.renderY);

        // --- Post-processing ---
        this.effects.applyPostProcessing(this.camera.renderX, this.camera.renderY);

        // --- HUD (on top of post-processing) ---
        // Pass data to UI
        this.ui._act2 = this.state.act === 2;
        this.ui._clueCount = this.state.clues.length;
        this.ui._evidenceCount = this.state.evidence.length;
        this.ui._rpg = this.rpg;
        this.ui.drawHUD(this.ctx, this.player);

        // Damage numbers (above HUD)
        this.rpg.drawDamageNumbers(this.ctx, this.camera.renderX, this.camera.renderY);

        // Choices screen
        this.choices.draw(this.ctx, this.canvas.width, this.canvas.height);

        // Zone name
        const zoneNames = { village: 'Village', forest: 'Foret', dungeon: 'Donjon', camp: 'Camp', grand_village: 'Grand Village' };
        this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
        this.ctx.font = '11px monospace';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(zoneNames[this.state.currentMap] || '', this.canvas.width - 10, this.canvas.height - 10);

        // NPC interaction hint
        if (this._nearNPC && !this.dialogue.active) {
            this.ui.drawInteractionHint(this.ctx, this.canvas.width, this.canvas.height);
        }

        // Chest interaction hint
        for (const item of this.items) {
            if (!item.collected && item.type === 'chest' && item.isNearPlayer(this.player)) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.font = '12px monospace';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('[E] Ouvrir', this.canvas.width / 2, this.canvas.height - 115);
            }
        }

        // Dialogue
        this.dialogue.draw(this.ctx, this.canvas.width, this.canvas.height);

        // Carnet d'enquete
        if (this.ui.showNotebook && this.state.act === 2) {
            this.ui.drawNotebook(this.ctx, this.canvas.width, this.canvas.height, this.state);
        }

        // Transition fade
        if (this.transitioning) {
            const alpha = this.transitionAlpha <= 1 ? this.transitionAlpha : 2 - this.transitionAlpha;
            this.ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0, Math.min(1, alpha))})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawTitle() {
        this.ui.drawTitleScreen(this.ctx, this.canvas.width, this.canvas.height);
    }

    drawGameOver() {
        this.draw();
        this.ui.drawGameOver(this.ctx, this.canvas.width, this.canvas.height);
    }

    drawVictory() {
        if (this.ui.darkEnding) {
            this.ui.drawDarkEnding(this.ctx, this.canvas.width, this.canvas.height);
        } else if (this.ui.finalVictory) {
            this.ui.drawFinalVictory(this.ctx, this.canvas.width, this.canvas.height);
        } else {
            this.ui.drawVictory(this.ctx, this.canvas.width, this.canvas.height);
        }
        this.particles.draw(this.ctx, 0, 0); // Victory particles in screen space
    }
}

// Launch
window.addEventListener('load', () => {
    window.game = new Game();
});
