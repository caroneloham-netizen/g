// ============================================
// SYSTEME RPG - XP, Niveaux, Competences, Degats
// ============================================

// Table de niveaux
const LEVEL_TABLE = [
    { level: 1,  xpNeeded: 0,    hpBonus: 0, speedBonus: 0,   dmgBonus: 0 },
    { level: 2,  xpNeeded: 50,   hpBonus: 1, speedBonus: 0.2, dmgBonus: 0 },
    { level: 3,  xpNeeded: 120,  hpBonus: 2, speedBonus: 0.3, dmgBonus: 1 },
    { level: 4,  xpNeeded: 220,  hpBonus: 3, speedBonus: 0.4, dmgBonus: 1 },
    { level: 5,  xpNeeded: 350,  hpBonus: 4, speedBonus: 0.5, dmgBonus: 1 },
    { level: 6,  xpNeeded: 520,  hpBonus: 5, speedBonus: 0.6, dmgBonus: 2 },
    { level: 7,  xpNeeded: 730,  hpBonus: 6, speedBonus: 0.7, dmgBonus: 2 },
    { level: 8,  xpNeeded: 1000, hpBonus: 8, speedBonus: 0.8, dmgBonus: 2 },
    { level: 9,  xpNeeded: 1350, hpBonus: 10, speedBonus: 0.9, dmgBonus: 3 },
    { level: 10, xpNeeded: 1800, hpBonus: 12, speedBonus: 1.0, dmgBonus: 3 },
];

// XP par action
const XP_REWARDS = {
    slime: 10,
    skeleton: 25,
    boss: 100,
    ilyesse_boss: 200,
    talk_npc: 5,
    find_item: 15,
    find_evidence: 25,
    choice_spare: 30,
    choice_kill: 50,
};

// Competences
const SKILLS = {
    dash: {
        name: 'Dash',
        key: 'C',
        description: 'Esquive rapide avec invincibilite',
        levelRequired: 2,
        cooldown: 45, // frames
        duration: 8,
    },
    chargedAttack: {
        name: 'Attaque Chargee',
        key: 'ESPACE (maintenir)',
        description: 'Coup puissant x2 degats',
        levelRequired: 3,
        chargeTime: 30, // frames pour charger
    },
    heal: {
        name: 'Soin',
        key: 'H',
        description: 'Regenere 2 PV',
        levelRequired: 2,
        cooldown: 900, // 15 sec a 60fps
    },
    shield: {
        name: 'Bouclier',
        key: 'B',
        description: 'Invincible 2 secondes',
        levelRequired: 4,
        cooldown: 600, // 10 sec
        duration: 120,  // 2 sec
    },
    combo: {
        name: 'Combo',
        key: 'ESPACE x3',
        description: '3 coups rapides avec bonus final',
        levelRequired: 5,
        comboWindow: 20, // frames entre chaque coup
    },
    sprintPlus: {
        name: 'Sprint+',
        key: 'SHIFT',
        description: 'Sprint illimite et plus rapide',
        levelRequired: 6,
    },
};

class RPGSystem {
    constructor() {
        this.xp = 0;
        this.level = 1;
        this.totalXpGained = 0;

        // Skills state
        this.unlockedSkills = new Set();
        this.cooldowns = {};  // skillName -> remaining frames
        this.activeSkills = {}; // skillName -> remaining duration

        // Dash
        this.dashing = false;
        this.dashTimer = 0;
        this.dashDx = 0;
        this.dashDy = 0;
        this.dashCooldown = 0;

        // Charged attack
        this.charging = false;
        this.chargeTimer = 0;
        this.chargeReady = false;

        // Combo
        this.comboCount = 0;
        this.comboTimer = 0;

        // Shield
        this.shielded = false;
        this.shieldTimer = 0;
        this.shieldCooldown = 0;

        // Heal
        this.healCooldown = 0;

        // Damage numbers (floating text)
        this.damageNumbers = [];

        // Level up queue
        this.pendingLevelUps = [];
    }

    addXP(amount, game) {
        this.xp += amount;
        this.totalXpGained += amount;

        // Check level up
        const newLevel = this.calculateLevel();
        while (newLevel > this.level) {
            this.level++;
            this.onLevelUp(this.level, game);
        }
    }

    calculateLevel() {
        for (let i = LEVEL_TABLE.length - 1; i >= 0; i--) {
            if (this.xp >= LEVEL_TABLE[i].xpNeeded) {
                return LEVEL_TABLE[i].level;
            }
        }
        return 1;
    }

    getLevelData() {
        return LEVEL_TABLE[this.level - 1] || LEVEL_TABLE[0];
    }

    getXPForNextLevel() {
        if (this.level >= LEVEL_TABLE.length) return 0;
        return LEVEL_TABLE[this.level].xpNeeded;
    }

    getXPProgress() {
        const current = LEVEL_TABLE[this.level - 1]?.xpNeeded || 0;
        const next = this.getXPForNextLevel();
        if (next === 0) return 1;
        return (this.xp - current) / (next - current);
    }

    onLevelUp(newLevel, game) {
        // Debloquer les skills
        for (const [name, skill] of Object.entries(SKILLS)) {
            if (skill.levelRequired === newLevel && !this.unlockedSkills.has(name)) {
                this.unlockedSkills.add(name);
                this.pendingLevelUps.push({
                    level: newLevel,
                    skill: name,
                    skillName: skill.name,
                    skillDesc: skill.description,
                    skillKey: skill.key,
                });
            }
        }

        // Si pas de skill debloque, juste notifier le level
        if (!this.pendingLevelUps.length || this.pendingLevelUps[this.pendingLevelUps.length - 1].level !== newLevel) {
            this.pendingLevelUps.push({ level: newLevel });
        }

        // Appliquer les bonus de stats au joueur
        if (game && game.player) {
            const data = this.getLevelData();
            game.player.maxHp = 6 + data.hpBonus;
            game.player.hp = game.player.maxHp; // Full heal on level up
            game.player.speed = 2.5 + data.speedBonus;
            game.player.sprintSpeed = 4.5 + data.speedBonus;
        }

        // Effets visuels
        if (game) {
            game.effects.shake(4, 15);
            game.effects.flash('#ffd700', 0.3, 0.02);
            if (game.player) {
                game.particles.emit(
                    game.player.px + SCALED_TILE / 2,
                    game.player.py + SCALED_TILE / 2,
                    PARTICLE_PRESETS.pickupSparkle, 20
                );
            }
        }
    }

    hasSkill(name) {
        return this.unlockedSkills.has(name);
    }

    // Calcul des degats
    getAttackDamage(isCharged = false, isComboFinisher = false) {
        const data = this.getLevelData();
        let dmg = 1 + data.dmgBonus;
        if (isCharged) dmg *= 2;
        if (isComboFinisher) dmg = Math.ceil(dmg * 1.5);
        return dmg;
    }

    // Update cooldowns
    update() {
        if (this.dashCooldown > 0) this.dashCooldown--;
        if (this.healCooldown > 0) this.healCooldown--;
        if (this.shieldCooldown > 0) this.shieldCooldown--;

        if (this.dashing) {
            this.dashTimer--;
            if (this.dashTimer <= 0) this.dashing = false;
        }

        if (this.shielded) {
            this.shieldTimer--;
            if (this.shieldTimer <= 0) this.shielded = false;
        }

        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) this.comboCount = 0;
        }

        // Damage numbers float up and fade
        this.damageNumbers = this.damageNumbers.filter(dn => {
            dn.y -= 0.8;
            dn.life--;
            return dn.life > 0;
        });
    }

    // Ajouter un numero de degats flottant
    addDamageNumber(x, y, amount, isCritical = false) {
        this.damageNumbers.push({
            x, y,
            text: '-' + amount,
            life: 40,
            maxLife: 40,
            color: isCritical ? '#ffdd00' : '#ff4444',
            size: isCritical ? 18 : 14,
        });
    }

    addHealNumber(x, y, amount) {
        this.damageNumbers.push({
            x, y,
            text: '+' + amount,
            life: 40,
            maxLife: 40,
            color: '#44ff44',
            size: 16,
        });
    }

    addXPNumber(x, y, amount) {
        this.damageNumbers.push({
            x, y,
            text: '+' + amount + ' XP',
            life: 50,
            maxLife: 50,
            color: '#ffaa00',
            size: 12,
        });
    }

    drawDamageNumbers(ctx, cameraX, cameraY) {
        for (const dn of this.damageNumbers) {
            const alpha = Math.min(1, dn.life / 10);
            const screenX = dn.x - cameraX;
            const screenY = dn.y - cameraY;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = `bold ${dn.size}px monospace`;
            ctx.textAlign = 'center';

            // Ombre
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillText(dn.text, screenX + 1, screenY + 1);

            // Texte
            ctx.fillStyle = dn.color;
            ctx.fillText(dn.text, screenX, screenY);

            ctx.restore();
        }
    }

    // --- ACTIONS SKILLS ---

    tryDash(player, input) {
        if (!this.hasSkill('dash')) return false;
        if (this.dashCooldown > 0 || this.dashing) return false;
        if (!input.isJustPressed('c')) return false;

        this.dashing = true;
        this.dashTimer = SKILLS.dash.duration;
        this.dashCooldown = SKILLS.dash.cooldown;

        // Direction du dash
        const speed = 8;
        switch (player.direction) {
            case 'up':    this.dashDx = 0; this.dashDy = -speed; break;
            case 'down':  this.dashDx = 0; this.dashDy = speed; break;
            case 'left':  this.dashDx = -speed; this.dashDy = 0; break;
            case 'right': this.dashDx = speed; this.dashDy = 0; break;
        }

        // Invincible pendant le dash
        player.invincible = true;
        player.invincibleTimer = SKILLS.dash.duration + 5;

        return true;
    }

    tryHeal(player) {
        if (!this.hasSkill('heal')) return false;
        if (this.healCooldown > 0) return false;
        if (player.hp >= player.maxHp) return false;

        this.healCooldown = SKILLS.heal.cooldown;
        player.heal(2);
        return true;
    }

    tryShield(player) {
        if (!this.hasSkill('shield')) return false;
        if (this.shieldCooldown > 0 || this.shielded) return false;

        this.shielded = true;
        this.shieldTimer = SKILLS.shield.duration;
        this.shieldCooldown = SKILLS.shield.cooldown;
        player.invincible = true;
        player.invincibleTimer = SKILLS.shield.duration;
        return true;
    }

    // Gere le combo counter
    registerAttack() {
        if (!this.hasSkill('combo')) {
            this.comboCount = 0;
            return false; // pas de combo
        }
        this.comboCount++;
        this.comboTimer = SKILLS.combo.comboWindow;
        if (this.comboCount >= 3) {
            this.comboCount = 0;
            this.comboTimer = 0;
            return true; // combo finisher !
        }
        return false;
    }

    // Charge attack
    updateCharge(input) {
        if (!this.hasSkill('chargedAttack')) {
            this.charging = false;
            return;
        }

        if (input.isDown(' ')) {
            if (!this.charging) {
                this.charging = true;
                this.chargeTimer = 0;
            }
            this.chargeTimer++;
            this.chargeReady = this.chargeTimer >= SKILLS.chargedAttack.chargeTime;
        } else {
            this.charging = false;
            this.chargeTimer = 0;
        }
    }

    isChargeReady() {
        return this.chargeReady && this.charging;
    }

    releaseCharge() {
        const was = this.chargeReady;
        this.charging = false;
        this.chargeTimer = 0;
        this.chargeReady = false;
        return was;
    }
}

// ============================================
// SYSTEME DE CHOIX
// ============================================

class ChoiceSystem {
    constructor() {
        this.active = false;
        this.choices = [];
        this.selectedIndex = 0;
        this.title = '';
        this.description = '';
        this.callback = null;
    }

    show(title, description, choices, callback) {
        this.active = true;
        this.title = title;
        this.description = description;
        this.choices = choices;
        this.selectedIndex = 0;
        this.callback = callback;
    }

    update(input) {
        if (!this.active) return;

        if (input.up || input.isJustPressed('z') || input.isJustPressed('arrowup')) {
            this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        }
        if (input.down || input.isJustPressed('s') || input.isJustPressed('arrowdown')) {
            this.selectedIndex = Math.min(this.choices.length - 1, this.selectedIndex + 1);
        }

        if (input.action || input.interact) {
            const chosen = this.choices[this.selectedIndex];
            this.active = false;
            if (this.callback) {
                this.callback(chosen.id, this.selectedIndex);
            }
        }
    }

    draw(ctx, w, h) {
        if (!this.active) return;

        // Fond
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(60, 60, w - 120, h - 120);

        // Bordure doree
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.strokeRect(60, 60, w - 120, h - 120);

        // Titre
        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.title, w / 2, 100);

        // Description
        ctx.fillStyle = '#aaa';
        ctx.font = '13px monospace';
        ctx.fillText(this.description, w / 2, 125);

        // Choix
        let y = 170;
        for (let i = 0; i < this.choices.length; i++) {
            const choice = this.choices[i];
            const selected = i === this.selectedIndex;

            // Fond du choix
            if (selected) {
                ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
                ctx.fillRect(80, y - 18, w - 160, 55);
                ctx.strokeStyle = '#d4af37';
                ctx.strokeRect(80, y - 18, w - 160, 55);
            }

            // Fleche
            if (selected) {
                ctx.fillStyle = '#d4af37';
                ctx.font = '16px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('>', 90, y + 2);
            }

            // Texte du choix
            ctx.fillStyle = selected ? '#ffffff' : '#888';
            ctx.font = selected ? 'bold 14px monospace' : '14px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(choice.label, 110, y + 2);

            // Description
            ctx.fillStyle = selected ? '#aaa' : '#555';
            ctx.font = '11px monospace';
            ctx.fillText(choice.desc, 110, y + 20);

            y += 65;
        }

        // Instructions
        ctx.fillStyle = '#555';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Fleches pour choisir | ESPACE pour confirmer', w / 2, h - 80);
    }
}
