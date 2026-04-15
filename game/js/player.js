// ============================================
// JOUEUR - Redouane
// ============================================

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.px = x * SCALED_TILE; // position pixel
        this.py = y * SCALED_TILE;
        this.speed = 2.5;
        this.sprintSpeed = 4.5;
        this.sprinting = false;
        this.direction = 'down';
        this.animFrame = 0;
        this.animTimer = 0;
        this.moving = false;

        // Combat
        this.maxHp = 6;
        this.hp = 6;
        this.attacking = false;
        this.attackTimer = 0;
        this.attackDuration = 8; // frames (was 15 - plus rapide)
        this.attackCooldown = 0;
        this.attackRange = SCALED_TILE * 1.2;

        // Invincibilite
        this.invincible = false;
        this.invincibleTimer = 0;
        this.invincibleDuration = 60; // frames
        this.visible = true;

        // Inventaire
        this.inventory = [];
        this.hasKey = false;
    }

    update(input, map, rpg) {
        // Invincibilite
        if (this.invincible) {
            this.invincibleTimer--;
            this.visible = Math.floor(this.invincibleTimer / 4) % 2 === 0;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                this.visible = true;
            }
        }

        // Bouclier actif = glow bleu
        if (rpg && rpg.shielded) {
            this.invincible = true;
            this.invincibleTimer = 2;
            this.visible = true; // Pas de clignotement pendant bouclier
        }

        // Dash en cours = mouvement force
        if (rpg && rpg.dashing) {
            const newPx = this.px + rpg.dashDx;
            const newPy = this.py + rpg.dashDy;
            if (!this.checkCollision(newPx, this.py, map)) this.px = newPx;
            if (!this.checkCollision(this.px, newPy, map)) this.py = newPy;
            this.x = this.px / SCALED_TILE;
            this.y = this.py / SCALED_TILE;
            return;
        }

        // Skills : Dash (C), Heal (H), Shield (B)
        if (rpg) {
            if (rpg.tryDash(this, input)) return;
            if (input.isJustPressed('h')) rpg.tryHeal(this);
            if (input.isJustPressed('b')) rpg.tryShield(this);
            rpg.updateCharge(input);
        }

        // Attaque
        if (this.attacking) {
            this.attackTimer--;
            if (this.attackTimer <= 0) {
                this.attacking = false;
                // Relacher attaque chargee
                if (rpg && rpg.isChargeReady()) {
                    this.chargedAttack = true;
                    rpg.releaseCharge();
                }
            }
            return;
        }

        if (this.attackCooldown > 0) this.attackCooldown--;

        // Attaquer (normal ou relache de charge)
        this.chargedAttack = false;
        if (input.action && this.attackCooldown <= 0) {
            // Check si c'est une attaque chargee
            if (rpg && rpg.isChargeReady()) {
                this.chargedAttack = true;
                rpg.releaseCharge();
            }
            this.attacking = true;
            this.attackTimer = this.chargedAttack ? 12 : this.attackDuration;
            this.attackCooldown = this.chargedAttack ? 20 : 12;
            // Combo
            if (rpg) {
                this.comboFinisher = rpg.registerAttack();
            }
            return;
        }

        // Sprint
        this.sprinting = input.sprint;
        const currentSpeed = this.sprinting ? this.sprintSpeed : this.speed;

        // Mouvement
        let dx = 0, dy = 0;
        this.moving = false;

        if (input.up) { dy = -currentSpeed; this.direction = 'up'; this.moving = true; }
        else if (input.down) { dy = currentSpeed; this.direction = 'down'; this.moving = true; }
        if (input.left) { dx = -currentSpeed; this.direction = 'left'; this.moving = true; }
        else if (input.right) { dx = currentSpeed; this.direction = 'right'; this.moving = true; }

        // Diagonal = normalize
        if (dx !== 0 && dy !== 0) {
            const norm = Math.sqrt(dx * dx + dy * dy);
            dx = (dx / norm) * currentSpeed;
            dy = (dy / norm) * currentSpeed;
        }

        // Collision X
        const newPx = this.px + dx;
        if (!this.checkCollision(newPx, this.py, map)) {
            this.px = newPx;
        }

        // Collision Y
        const newPy = this.py + dy;
        if (!this.checkCollision(this.px, newPy, map)) {
            this.py = newPy;
        }

        // Clamp dans la map
        this.px = Math.max(0, Math.min(this.px, (map.width - 1) * SCALED_TILE));
        this.py = Math.max(0, Math.min(this.py, (map.height - 1) * SCALED_TILE));

        // Update tile position
        this.x = this.px / SCALED_TILE;
        this.y = this.py / SCALED_TILE;

        // Animation (plus rapide en sprint)
        if (this.moving) {
            this.animTimer++;
            const animSpeed = this.sprinting ? 5 : 10;
            if (this.animTimer >= animSpeed) {
                this.animTimer = 0;
                const frames = PLAYER_SPRITES[this.direction]?.length || 2;
                this.animFrame = (this.animFrame + 1) % frames;
            }
        } else {
            this.animFrame = 0;
            this.animTimer = 0;
        }
    }

    checkCollision(px, py, map) {
        // Hitbox plus petite que le sprite (centre)
        const margin = 6;
        const left = px + margin;
        const right = px + SCALED_TILE - margin;
        const top = py + margin;
        const bottom = py + SCALED_TILE - margin;

        // Verifier les 4 coins
        const points = [
            { x: left, y: top },
            { x: right, y: top },
            { x: left, y: bottom },
            { x: right, y: bottom },
        ];

        for (const p of points) {
            const tileX = Math.floor(p.x / SCALED_TILE);
            const tileY = Math.floor(p.y / SCALED_TILE);

            if (tileX < 0 || tileX >= map.width || tileY < 0 || tileY >= map.height) {
                return true; // Hors map = collision
            }

            const tile = map.tiles[tileY][tileX];
            if (map.collisions.includes(tile)) {
                return true;
            }
        }

        return false;
    }

    takeDamage(amount) {
        if (this.invincible) return;
        this.hp = Math.max(0, this.hp - amount);
        this.invincible = true;
        this.invincibleTimer = this.invincibleDuration;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    getAttackHitbox() {
        const cx = this.px + SCALED_TILE / 2;
        const cy = this.py + SCALED_TILE / 2;
        const range = this.attackRange;

        switch (this.direction) {
            case 'up':    return { x: cx - range/2, y: cy - range, w: range, h: range };
            case 'down':  return { x: cx - range/2, y: cy, w: range, h: range };
            case 'left':  return { x: cx - range, y: cy - range/2, w: range, h: range };
            case 'right': return { x: cx, y: cy - range/2, w: range, h: range };
        }
    }

    draw(renderer) {
        if (!this.visible) return;

        let spriteData;
        if (this.attacking) {
            spriteData = PLAYER_SPRITES.attack[0];
        } else {
            spriteData = PLAYER_SPRITES[this.direction][this.animFrame];
        }

        renderer.drawSpriteAtPixel(spriteData, this.px, this.py);

        // Dessiner l'epee pendant l'attaque
        if (this.attacking) {
            this.drawAttackEffect(renderer);
        }
    }

    drawAttackEffect(renderer) {
        const ctx = renderer.ctx;
        const hitbox = this.getAttackHitbox();
        const screenX = hitbox.x - renderer.camera.renderX;
        const screenY = hitbox.y - renderer.camera.renderY;

        // Arc d'attaque avec glow
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(255,255,200,0.6)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(screenX, screenY, hitbox.w, hitbox.h);
        ctx.restore();

        // Ligne d'epee avec glow
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(200,200,255,0.8)';
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        const cx = this.px + SCALED_TILE / 2 - renderer.camera.renderX;
        const cy = this.py + SCALED_TILE / 2 - renderer.camera.renderY;
        const len = this.attackRange * 0.8;

        switch (this.direction) {
            case 'up':    ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - len); break;
            case 'down':  ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + len); break;
            case 'left':  ctx.moveTo(cx, cy); ctx.lineTo(cx - len, cy); break;
            case 'right': ctx.moveTo(cx, cy); ctx.lineTo(cx + len, cy); break;
        }
        ctx.stroke();
        ctx.restore();
    }

    getTileX() { return Math.round(this.x); }
    getTileY() { return Math.round(this.y); }
}
