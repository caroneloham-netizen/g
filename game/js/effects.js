// ============================================
// EFFETS VISUELS - Optimise pour la performance
// ============================================

class ScreenEffects {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.w = canvas.width;
        this.h = canvas.height;

        // Screen shake
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;

        // Flash
        this.flashColor = '#fff';
        this.flashAlpha = 0;
        this.flashDecay = 0.05;

        // Zone tint
        this.currentTint = 'rgba(0,0,0,0)';
        this.currentDarkness = 0;
        this.targetDarkness = 0;

        // Precalc vignette as offscreen canvas
        this._vignetteCanvas = document.createElement('canvas');
        this._vignetteCanvas.width = this.w;
        this._vignetteCanvas.height = this.h;
        this._vignetteIntensity = 0;
        this._buildVignette(0.25);

        this.time = 0;
        this.lights = [];
    }

    _buildVignette(intensity) {
        if (Math.abs(intensity - this._vignetteIntensity) < 0.01) return;
        this._vignetteIntensity = intensity;
        const ctx = this._vignetteCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.w, this.h);
        const cx = this.w / 2;
        const cy = this.h / 2;
        const r = Math.max(this.w, this.h) * 0.7;
        const gradient = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, `rgba(0,0,0,${intensity})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.w, this.h);
    }

    update() {
        this.time += 0.016;

        if (this.shakeDuration > 0) {
            this.shakeDuration--;
            this.shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
            this.shakeIntensity *= 0.9;
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }

        if (this.flashAlpha > 0) {
            this.flashAlpha -= this.flashDecay;
            if (this.flashAlpha < 0) this.flashAlpha = 0;
        }

        this.currentDarkness += (this.targetDarkness - this.currentDarkness) * 0.03;
    }

    shake(intensity = 5, duration = 15) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    flash(color = '#fff', alpha = 0.5, decay = 0.05) {
        this.flashColor = color;
        this.flashAlpha = alpha;
        this.flashDecay = decay;
    }

    setZoneTint(zone) {
        switch (zone) {
            case 'village':
                this.currentTint = 'rgba(255,240,200,0.03)';
                this.targetDarkness = 0;
                this._buildVignette(0.2);
                break;
            case 'forest':
                this.currentTint = 'rgba(20,60,20,0.06)';
                this.targetDarkness = 0.08;
                this._buildVignette(0.3);
                break;
            case 'camp':
                this.currentTint = 'rgba(40,30,10,0.04)';
                this.targetDarkness = 0.05;
                this._buildVignette(0.25);
                break;
            case 'dungeon':
                this.currentTint = 'rgba(10,10,30,0.1)';
                this.targetDarkness = 0.25;
                this._buildVignette(0.45);
                break;
            case 'grand_village':
                this.currentTint = 'rgba(255,230,180,0.03)';
                this.targetDarkness = 0;
                this._buildVignette(0.2);
                break;
            default:
                this.currentTint = 'rgba(0,0,0,0)';
                this.targetDarkness = 0;
        }
    }

    setLights(lights) {
        this.lights = lights;
    }

    getShakeOffset() {
        return { x: this.shakeOffsetX, y: this.shakeOffsetY };
    }

    applyPostProcessing(cameraX, cameraY) {
        const ctx = this.ctx;

        // Simple tint overlay
        ctx.fillStyle = this.currentTint;
        ctx.fillRect(0, 0, this.w, this.h);

        // Darkness
        if (this.currentDarkness > 0.01) {
            ctx.fillStyle = `rgba(0,0,0,${this.currentDarkness})`;
            ctx.fillRect(0, 0, this.w, this.h);
        }

        // Simple torch lights (just bright circles, no expensive compositing)
        if (this.currentDarkness > 0.05) {
            for (const light of this.lights) {
                if (light.id === 'player') continue;
                const sx = light.x - cameraX;
                const sy = light.y - cameraY;
                if (sx < -100 || sx > this.w + 100 || sy < -100 || sy > this.h + 100) continue;

                const flicker = 0.8 + Math.sin(this.time * light.flicker) * 0.2;
                ctx.globalAlpha = 0.08 * flicker;
                ctx.fillStyle = '#ffaa44';
                const r = light.radius * 0.5;
                ctx.beginPath();
                ctx.arc(sx, sy, r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        // Precalculated vignette (fast blit)
        ctx.drawImage(this._vignetteCanvas, 0, 0);

        // Flash
        if (this.flashAlpha > 0) {
            ctx.globalAlpha = this.flashAlpha;
            ctx.fillStyle = this.flashColor;
            ctx.fillRect(0, 0, this.w, this.h);
            ctx.globalAlpha = 1;
        }
    }
}

// ============================================
// ANIMATED WATER - Simplified for performance
// ============================================

class WaterRenderer {
    constructor() {
        this.time = 0;
        // Precalc water frames
        this._frames = [];
        this._frameIndex = 0;
        this._frameTimer = 0;
        this._buildFrames();
    }

    _buildFrames() {
        // 12 frames d'eau avec vraies vagues visibles
        const colors = [
            '#3868a8', '#4878b8', '#3060a0', '#5088c8', // bleu profond -> clair
            '#4070b0', '#3565a5', '#4a80c0', '#3058a0',
        ];
        for (let f = 0; f < 12; f++) {
            const canvas = document.createElement('canvas');
            canvas.width = 16;
            canvas.height = 16;
            const ctx = canvas.getContext('2d');
            const t = f / 12 * Math.PI * 2;

            // Base water
            for (let py = 0; py < 16; py++) {
                for (let px = 0; px < 16; px++) {
                    // Vague horizontale bien visible
                    const wave1 = Math.sin(py * 0.8 + px * 0.3 + t) * 0.5;
                    const wave2 = Math.sin(px * 0.6 - py * 0.2 + t * 1.3) * 0.3;
                    const val = wave1 + wave2;

                    let r, g, b;
                    if (val > 0.4) {
                        // Crete de vague = clair
                        r = 90; g = 155; b = 220;
                    } else if (val > 0) {
                        // Milieu
                        r = 60; g = 120; b = 190;
                    } else if (val > -0.3) {
                        // Creux
                        r = 40; g = 90; b = 160;
                    } else {
                        // Fond sombre
                        r = 30; g = 70; b = 140;
                    }

                    ctx.fillStyle = `rgb(${r},${g},${b})`;
                    ctx.fillRect(px, py, 1, 1);
                }
            }

            // Reflets blancs (cretes de vague)
            for (let i = 0; i < 4; i++) {
                const wx = Math.floor((Math.sin(t + i * 1.7) * 0.5 + 0.5) * 13);
                const wy = Math.floor((Math.cos(t * 0.8 + i * 2.3) * 0.5 + 0.5) * 13);
                ctx.fillStyle = 'rgba(200,230,255,0.5)';
                ctx.fillRect(wx, wy, 2, 1);
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(wx + 1, wy, 1, 1);
            }

            this._frames.push(canvas);
        }
    }

    update() {
        this._frameTimer++;
        if (this._frameTimer >= 6) {
            this._frameTimer = 0;
            this._frameIndex = (this._frameIndex + 1) % this._frames.length;
        }
    }

    drawAnimatedWater(ctx, screenX, screenY, scale) {
        ctx.drawImage(this._frames[this._frameIndex],
            0, 0, 16, 16,
            Math.floor(screenX), Math.floor(screenY),
            16 * scale, 16 * scale);
    }
}

// ============================================
// SHADOW (simple ellipse)
// ============================================

class ShadowRenderer {
    drawShadow(ctx, screenX, screenY, width, height) {
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(
            screenX + width / 2,
            screenY + height - 2,
            width * 0.35,
            height * 0.12,
            0, 0, Math.PI * 2
        );
        ctx.fill();
    }
}

// ============================================
// TRAIL EFFECT (boss charge)
// ============================================

class TrailRenderer {
    constructor() {
        this.trails = [];
    }

    addTrail(x, y, spriteData, alpha = 0.3) {
        this.trails.push({ x, y, spriteData, alpha, decay: 0.03 });
        // Limit trail count
        if (this.trails.length > 10) this.trails.shift();
    }

    update() {
        this.trails = this.trails.filter(t => {
            t.alpha -= t.decay;
            return t.alpha > 0;
        });
    }

    draw(ctx, cameraX, cameraY) {
        for (const trail of this.trails) {
            ctx.globalAlpha = trail.alpha;
            drawSprite(ctx, trail.spriteData, trail.x - cameraX, trail.y - cameraY, SCALE);
        }
        ctx.globalAlpha = 1;
    }
}
