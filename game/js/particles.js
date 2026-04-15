// ============================================
// SYSTEME DE PARTICULES
// ============================================

class Particle {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.vx = config.vx || 0;
        this.vy = config.vy || 0;
        this.life = config.life || 60;
        this.maxLife = this.life;
        this.size = config.size || 2;
        this.sizeEnd = config.sizeEnd !== undefined ? config.sizeEnd : 0;
        this.color = config.color || '#fff';
        this.colorEnd = config.colorEnd || null;
        this.gravity = config.gravity || 0;
        this.friction = config.friction || 1;
        this.alpha = config.alpha || 1;
        this.alphaFade = config.alphaFade !== undefined ? config.alphaFade : true;
        this.rotation = config.rotation || 0;
        this.rotationSpeed = config.rotationSpeed || 0;
        this.shape = config.shape || 'rect'; // rect, circle, star, leaf
        this.wobble = config.wobble || 0;
        this.wobbleSpeed = config.wobbleSpeed || 0.1;
        this.wobbleTimer = Math.random() * Math.PI * 2;
        this.glow = config.glow || false;
        this.glowSize = config.glowSize || 10;
        this.glowColor = config.glowColor || 'rgba(255,200,50,0.3)';
    }

    update() {
        this.life--;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;

        if (this.wobble) {
            this.wobbleTimer += this.wobbleSpeed;
            this.vx += Math.sin(this.wobbleTimer) * this.wobble;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        return this.life > 0;
    }

    draw(ctx, cameraX, cameraY) {
        const t = 1 - this.life / this.maxLife; // 0 -> 1
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;

        // Hors ecran?
        if (screenX < -50 || screenX > ctx.canvas.width + 50 ||
            screenY < -50 || screenY > ctx.canvas.height + 50) return;

        const size = this.size + (this.sizeEnd - this.size) * t;
        const alpha = this.alphaFade ? this.alpha * (1 - t) : this.alpha;

        if (alpha <= 0 || size <= 0) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(screenX, screenY);
        ctx.rotate(this.rotation);

        // Glow removed for performance - just use color

        // Couleur interpolee
        ctx.fillStyle = this.colorEnd ? lerpColor(this.color, this.colorEnd, t) : this.color;

        switch (this.shape) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'star':
                this.drawStar(ctx, size);
                break;
            case 'leaf':
                this.drawLeaf(ctx, size);
                break;
            default:
                ctx.fillRect(-size / 2, -size / 2, size, size);
        }

        ctx.restore();
    }

    drawStar(ctx, size) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = size / 2;
            if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
            else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
    }

    drawLeaf(ctx, size) {
        ctx.beginPath();
        ctx.ellipse(0, 0, size / 2, size / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Nervure
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-size / 2, 0);
        ctx.lineTo(size / 2, 0);
        ctx.stroke();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.emitters = [];
        this.maxParticles = 80; // Performance cap
    }

    emit(x, y, config, count = 1) {
        if (this.particles.length >= this.maxParticles) return;
        count = Math.min(count, this.maxParticles - this.particles.length);
        for (let i = 0; i < count; i++) {
            const spread = config.spread || 0;
            const px = x + (Math.random() - 0.5) * spread;
            const py = y + (Math.random() - 0.5) * spread;

            const vxBase = config.vx || 0;
            const vyBase = config.vy || 0;
            const vxRand = config.vxRandom || 0;
            const vyRand = config.vyRandom || 0;

            this.particles.push(new Particle(px, py, {
                ...config,
                vx: vxBase + (Math.random() - 0.5) * vxRand,
                vy: vyBase + (Math.random() - 0.5) * vyRand,
                life: config.life + (Math.random() - 0.5) * (config.lifeRandom || 0),
                size: config.size + (Math.random() - 0.5) * (config.sizeRandom || 0),
                rotation: Math.random() * Math.PI * 2,
            }));
        }
    }

    addEmitter(emitter) {
        this.emitters.push(emitter);
    }

    removeEmitter(id) {
        this.emitters = this.emitters.filter(e => e.id !== id);
    }

    update() {
        // Update emitters
        for (const emitter of this.emitters) {
            emitter.timer++;
            if (emitter.timer >= emitter.interval) {
                emitter.timer = 0;
                this.emit(emitter.x, emitter.y, emitter.config, emitter.count || 1);
            }
        }

        // Update particles
        this.particles = this.particles.filter(p => p.update());
    }

    draw(ctx, cameraX, cameraY) {
        for (const p of this.particles) {
            p.draw(ctx, cameraX, cameraY);
        }
    }

    get count() { return this.particles.length; }
}

// ============================================
// PRESETS DE PARTICULES
// ============================================

const PARTICLE_PRESETS = {
    // Poussiere quand le joueur marche
    footstep: {
        spread: 8,
        vxRandom: 0.8,
        vy: -0.3,
        vyRandom: 0.5,
        life: 25,
        lifeRandom: 10,
        size: 3,
        sizeRandom: 2,
        sizeEnd: 0,
        color: '#b8a88a',
        colorEnd: '#8a7a6a',
        gravity: 0.02,
        friction: 0.96,
        shape: 'circle',
        alpha: 0.6,
    },

    // Herbe qui bouge
    grassSway: {
        spread: 4,
        vx: 0,
        vy: -0.5,
        vyRandom: 0.3,
        life: 30,
        lifeRandom: 10,
        size: 2,
        sizeEnd: 0,
        color: '#5a8c3a',
        friction: 0.95,
        shape: 'rect',
        alpha: 0.4,
    },

    // Feuilles qui tombent (foret)
    fallingLeaf: {
        spread: 20,
        vx: 0.3,
        vxRandom: 0.6,
        vy: 0.5,
        vyRandom: 0.3,
        life: 180,
        lifeRandom: 60,
        size: 5,
        sizeRandom: 3,
        sizeEnd: 3,
        color: '#3a7a28',
        colorEnd: '#8b6914',
        gravity: 0.005,
        friction: 0.999,
        shape: 'leaf',
        wobble: 0.15,
        wobbleSpeed: 0.08,
        rotationSpeed: 0.02,
        alpha: 0.7,
    },

    // Braises (donjon)
    ember: {
        spread: 6,
        vxRandom: 0.5,
        vy: -0.8,
        vyRandom: 0.4,
        life: 80,
        lifeRandom: 30,
        size: 3,
        sizeRandom: 2,
        sizeEnd: 0,
        color: '#ff6600',
        colorEnd: '#ff2200',
        gravity: -0.01,
        friction: 0.99,
        shape: 'circle',
        glow: true,
        glowSize: 8,
        glowColor: 'rgba(255,100,0,0.4)',
        alpha: 0.9,
    },

    // Lueur torche
    torchGlow: {
        spread: 4,
        vxRandom: 0.3,
        vy: -1,
        vyRandom: 0.5,
        life: 40,
        lifeRandom: 15,
        size: 4,
        sizeRandom: 2,
        sizeEnd: 0,
        color: '#ffaa00',
        colorEnd: '#ff4400',
        gravity: -0.02,
        friction: 0.97,
        shape: 'circle',
        glow: true,
        glowSize: 12,
        glowColor: 'rgba(255,170,0,0.5)',
        alpha: 0.8,
    },

    // Impact d'attaque
    attackSpark: {
        spread: 4,
        vxRandom: 4,
        vyRandom: 4,
        life: 15,
        lifeRandom: 5,
        size: 4,
        sizeRandom: 2,
        sizeEnd: 0,
        color: '#ffffff',
        colorEnd: '#ffdd44',
        friction: 0.9,
        shape: 'star',
        rotationSpeed: 0.3,
        glow: true,
        glowSize: 6,
        glowColor: 'rgba(255,255,200,0.5)',
        alpha: 1,
    },

    // Hit ennemi
    enemyHit: {
        spread: 6,
        vxRandom: 3,
        vyRandom: 3,
        life: 20,
        lifeRandom: 8,
        size: 3,
        sizeRandom: 2,
        sizeEnd: 0,
        color: '#ff4444',
        colorEnd: '#880000',
        friction: 0.92,
        shape: 'circle',
        alpha: 0.9,
    },

    // Mort ennemi - explosion
    deathBurst: {
        spread: 10,
        vxRandom: 5,
        vyRandom: 5,
        life: 40,
        lifeRandom: 15,
        size: 5,
        sizeRandom: 3,
        sizeEnd: 0,
        color: '#ffffff',
        colorEnd: '#ffaa00',
        gravity: 0.05,
        friction: 0.95,
        shape: 'star',
        rotationSpeed: 0.15,
        glow: true,
        glowSize: 10,
        glowColor: 'rgba(255,200,50,0.4)',
        alpha: 1,
    },

    // Collecte item
    pickupSparkle: {
        spread: 8,
        vxRandom: 2,
        vy: -1.5,
        vyRandom: 1,
        life: 35,
        lifeRandom: 10,
        size: 3,
        sizeRandom: 2,
        sizeEnd: 0,
        color: '#ffd700',
        colorEnd: '#ffffff',
        gravity: -0.02,
        friction: 0.96,
        shape: 'star',
        rotationSpeed: 0.2,
        glow: true,
        glowSize: 8,
        glowColor: 'rgba(255,215,0,0.5)',
        alpha: 1,
    },

    // Gouttes d'eau
    waterDrop: {
        spread: 3,
        vxRandom: 0.3,
        vy: -1.5,
        vyRandom: 0.5,
        life: 30,
        lifeRandom: 10,
        size: 2,
        sizeRandom: 1,
        sizeEnd: 1,
        color: '#7090b0',
        colorEnd: '#5070a0',
        gravity: 0.08,
        friction: 0.98,
        shape: 'circle',
        alpha: 0.6,
    },

    // Heal
    healParticle: {
        spread: 12,
        vxRandom: 0.5,
        vy: -1,
        vyRandom: 0.3,
        life: 45,
        lifeRandom: 10,
        size: 5,
        sizeRandom: 2,
        sizeEnd: 0,
        color: '#44ff44',
        colorEnd: '#ffffff',
        gravity: -0.03,
        friction: 0.97,
        shape: 'circle',
        glow: true,
        glowSize: 10,
        glowColor: 'rgba(50,255,50,0.4)',
        alpha: 0.8,
    },

    // Poussiere de boss charge
    bossCharge: {
        spread: 15,
        vxRandom: 3,
        vyRandom: 3,
        life: 25,
        lifeRandom: 10,
        size: 6,
        sizeRandom: 3,
        sizeEnd: 0,
        color: '#8800aa',
        colorEnd: '#ff00ff',
        friction: 0.93,
        shape: 'rect',
        rotationSpeed: 0.1,
        glow: true,
        glowSize: 8,
        glowColor: 'rgba(150,0,200,0.4)',
        alpha: 0.8,
    },
};

// ============================================
// UTILITAIRE COULEUR
// ============================================

function lerpColor(a, b, t) {
    const ar = parseInt(a.slice(1, 3), 16);
    const ag = parseInt(a.slice(3, 5), 16);
    const ab = parseInt(a.slice(5, 7), 16);
    const br = parseInt(b.slice(1, 3), 16);
    const bg = parseInt(b.slice(3, 5), 16);
    const bb = parseInt(b.slice(5, 7), 16);
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return `rgb(${r},${g},${bl})`;
}
