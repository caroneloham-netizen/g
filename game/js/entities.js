// ============================================
// ENTITES - Ennemis, PNJ, Items
// ============================================

class Enemy {
    constructor(config) {
        this.type = config.type;
        this.x = config.x;
        this.y = config.y;
        this.px = config.x * SCALED_TILE;
        this.py = config.y * SCALED_TILE;
        this.startX = this.px;
        this.startY = this.py;
        this.maxHp = config.hp;
        this.hp = config.hp;
        // Knockback
        this.knockbackX = 0;
        this.knockbackY = 0;
        this.speed = config.speed;
        this.behavior = config.behavior;
        this.alive = true;
        this.animFrame = 0;
        this.animTimer = 0;
        this.hitFlash = 0;
        this.deathTimer = 0;

        // Wander
        this.wanderDx = 0;
        this.wanderDy = 0;
        this.wanderTimer = 0;

        // Boss
        this.bossPhase = 0;
        this.bossChargeTimer = 0;
        this.bossChargeDx = 0;
        this.bossChargeDy = 0;
    }

    update(player, map) {
        if (!this.alive) {
            this.deathTimer++;
            return;
        }

        // Animation
        this.animTimer++;
        if (this.animTimer >= 20) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 2;
        }

        if (this.hitFlash > 0) this.hitFlash--;

        // Knockback
        if (Math.abs(this.knockbackX) > 0.1 || Math.abs(this.knockbackY) > 0.1) {
            if (!this.checkCollision(this.px + this.knockbackX, this.py, map)) {
                this.px += this.knockbackX;
            }
            if (!this.checkCollision(this.px, this.py + this.knockbackY, map)) {
                this.py += this.knockbackY;
            }
            this.knockbackX *= 0.7;
            this.knockbackY *= 0.7;
        }

        // Comportement
        switch (this.behavior) {
            case 'wander': this.doWander(map); break;
            case 'chase': this.doChase(player, map); break;
            case 'boss': this.doBoss(player, map); break;
        }

        // Update tile pos
        this.x = this.px / SCALED_TILE;
        this.y = this.py / SCALED_TILE;

        // Contact damage
        if (this.alive && this.overlapsPlayer(player)) {
            player.takeDamage(this.type === 'boss' ? 2 : 1);
        }
    }

    doWander(map) {
        this.wanderTimer--;
        if (this.wanderTimer <= 0) {
            // Nouveau mouvement aleatoire
            const dir = Math.random() * 4;
            if (dir < 1) { this.wanderDx = this.speed; this.wanderDy = 0; }
            else if (dir < 2) { this.wanderDx = -this.speed; this.wanderDy = 0; }
            else if (dir < 3) { this.wanderDx = 0; this.wanderDy = this.speed; }
            else { this.wanderDx = 0; this.wanderDy = -this.speed; }
            this.wanderTimer = 30 + Math.random() * 60;
        }

        const newPx = this.px + this.wanderDx;
        const newPy = this.py + this.wanderDy;

        // Rester pas trop loin du spawn
        const distFromStart = Math.hypot(newPx - this.startX, newPy - this.startY);
        if (distFromStart < SCALED_TILE * 5 && !this.checkCollision(newPx, newPy, map)) {
            this.px = newPx;
            this.py = newPy;
        } else {
            this.wanderTimer = 0; // Changer de direction
        }
    }

    doChase(player, map) {
        const dx = player.px - this.px;
        const dy = player.py - this.py;
        const dist = Math.hypot(dx, dy);

        if (dist < SCALED_TILE * 6 && dist > 2) {
            const nx = (dx / dist) * this.speed;
            const ny = (dy / dist) * this.speed;

            if (!this.checkCollision(this.px + nx, this.py, map)) {
                this.px += nx;
            }
            if (!this.checkCollision(this.px, this.py + ny, map)) {
                this.py += ny;
            }
        } else {
            this.doWander(map);
        }
    }

    doBoss(player, map) {
        const dx = player.px - this.px;
        const dy = player.py - this.py;
        const dist = Math.hypot(dx, dy);

        // Phase change based on HP
        this.bossPhase = this.hp <= this.maxHp / 2 ? 1 : 0;
        const speed = this.bossPhase === 1 ? this.speed * 1.5 : this.speed;

        if (this.bossChargeTimer > 0) {
            // En charge
            this.bossChargeTimer--;
            const newPx = this.px + this.bossChargeDx * speed * 2;
            const newPy = this.py + this.bossChargeDy * speed * 2;
            if (!this.checkCollision(newPx, newPy, map)) {
                this.px = newPx;
                this.py = newPy;
            } else {
                this.bossChargeTimer = 0;
            }
        } else if (dist < SCALED_TILE * 8) {
            // Charger vers le joueur periodiquement
            if (Math.random() < 0.01 * (this.bossPhase + 1)) {
                this.bossChargeTimer = 30;
                this.bossChargeDx = dx / dist;
                this.bossChargeDy = dy / dist;
            } else {
                // Mouvement lent vers le joueur
                if (dist > SCALED_TILE) {
                    const nx = (dx / dist) * speed * 0.5;
                    const ny = (dy / dist) * speed * 0.5;
                    if (!this.checkCollision(this.px + nx, this.py, map)) this.px += nx;
                    if (!this.checkCollision(this.px, this.py + ny, map)) this.py += ny;
                }
            }
        }
    }

    checkCollision(px, py, map) {
        const margin = 4;
        const points = [
            { x: px + margin, y: py + margin },
            { x: px + SCALED_TILE - margin, y: py + margin },
            { x: px + margin, y: py + SCALED_TILE - margin },
            { x: px + SCALED_TILE - margin, y: py + SCALED_TILE - margin },
        ];

        for (const p of points) {
            const tileX = Math.floor(p.x / SCALED_TILE);
            const tileY = Math.floor(p.y / SCALED_TILE);
            if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) return true;
            if (map.collisions.includes(map.tiles[tileY][tileX])) return true;
        }
        return false;
    }

    overlapsPlayer(player) {
        const margin = 8;
        return (
            this.px + margin < player.px + SCALED_TILE - margin &&
            this.px + SCALED_TILE - margin > player.px + margin &&
            this.py + margin < player.py + SCALED_TILE - margin &&
            this.py + SCALED_TILE - margin > player.py + margin
        );
    }

    takeDamage(amount, knockbackDir) {
        this.hp -= amount;
        this.hitFlash = 10;

        // Knockback
        if (knockbackDir) {
            const force = amount >= 2 ? 6 : 3; // Plus fort si attaque chargee
            this.knockbackX = knockbackDir.x * force;
            this.knockbackY = knockbackDir.y * force;
        }

        if (this.hp <= 0) {
            this.alive = false;
            this.deathTimer = 0;
        }
    }

    draw(renderer) {
        if (!this.alive) {
            // Effet de mort
            if (this.deathTimer < 20) {
                const ctx = renderer.ctx;
                const screenX = this.px - renderer.camera.renderX;
                const screenY = this.py - renderer.camera.renderY;
                const alpha = 1 - this.deathTimer / 20;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#fff';
                const size = SCALED_TILE * (1 + this.deathTimer / 10);
                ctx.fillRect(
                    screenX + SCALED_TILE/2 - size/2,
                    screenY + SCALED_TILE/2 - size/2,
                    size, size
                );
                ctx.globalAlpha = 1;
            }
            return;
        }

        const sprites = ENEMY_SPRITES[this.type];
        if (!sprites) return;

        const frame = sprites[this.animFrame % sprites.length];

        if (this.hitFlash > 0 && this.hitFlash % 2 === 0) {
            // Flash blanc quand touche
            const ctx = renderer.ctx;
            const screenX = this.px - renderer.camera.renderX;
            const screenY = this.py - renderer.camera.renderY;
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillRect(screenX, screenY, SCALED_TILE, SCALED_TILE);
        } else {
            renderer.drawSpriteAtPixel(frame, this.px, this.py);
        }

        // Barre de vie pour le boss
        if (this.type === 'boss') {
            this.drawBossHP(renderer);
        }
    }

    drawBossHP(renderer) {
        const ctx = renderer.ctx;
        const barWidth = 200;
        const barHeight = 12;
        const x = (ctx.canvas.width - barWidth) / 2;
        const y = ctx.canvas.height - 50;

        // Fond
        ctx.fillStyle = '#333';
        ctx.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

        // Vie
        const hpRatio = this.hp / this.maxHp;
        ctx.fillStyle = hpRatio > 0.5 ? '#cc33cc' : '#ff0000';
        ctx.fillRect(x, y, barWidth * hpRatio, barHeight);

        // Texte
        ctx.fillStyle = '#fff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Seigneur des Ombres', ctx.canvas.width / 2, y - 6);
    }
}

class NPC {
    constructor(config) {
        this.id = config.id;
        this.sprite = config.sprite;
        this.x = config.x;
        this.y = config.y;
        this.dialogueKey = config.dialogue;
    }

    draw(renderer) {
        const spriteData = NPC_SPRITES[this.sprite];
        if (spriteData) {
            renderer.drawSpriteAt(spriteData, this.x, this.y);
        }
    }

    isNearPlayer(player) {
        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        return dist < 2;
    }

    getDialogue(gameState) {
        // Dialogues dynamiques selon l'etat du jeu
        if (this.id === 'sage' && gameState.hasKey) {
            return DIALOGUES.sage_has_key;
        }
        if (this.id === 'guard' && gameState.hasKey) {
            return DIALOGUES.guard_has_key;
        }
        return DIALOGUES[this.dialogueKey];
    }
}

class Item {
    constructor(config) {
        this.type = config.type;
        this.x = config.x;
        this.y = config.y;
        this.id = config.id;
        this.contains = config.contains;
        this.collected = false;
        this.bobTimer = 0;
    }

    update() {
        if (!this.collected) {
            this.bobTimer++;
        }
    }

    draw(renderer) {
        if (this.collected) return;

        const spriteData = ITEM_SPRITES[this.type];
        if (!spriteData) return;

        // Petit effet de flottement
        const bob = Math.sin(this.bobTimer * 0.05) * 3;
        const screenX = this.x * SCALED_TILE - renderer.camera.renderX;
        const screenY = this.y * SCALED_TILE - renderer.camera.renderY + bob;
        drawSprite(renderer.ctx, spriteData, screenX, screenY, SCALE);
    }

    isNearPlayer(player) {
        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        return dist < 1.5;
    }
}
