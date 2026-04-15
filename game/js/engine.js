// ============================================
// MOTEUR DE JEU - Rendu, Camera, Input
// ============================================

class Camera {
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.width = width;
        this.height = height;
        this.lerp = 0.08; // Smooth follow speed
        this.shakeX = 0;
        this.shakeY = 0;
    }

    follow(target, mapWidth, mapHeight) {
        // Target = centre sur la cible
        this.targetX = target.x * SCALED_TILE + SCALED_TILE / 2 - this.width / 2;
        this.targetY = target.y * SCALED_TILE + SCALED_TILE / 2 - this.height / 2;

        // Clamp aux limites de la map
        const maxX = mapWidth * SCALED_TILE - this.width;
        const maxY = mapHeight * SCALED_TILE - this.height;
        this.targetX = Math.max(0, Math.min(this.targetX, maxX));
        this.targetY = Math.max(0, Math.min(this.targetY, maxY));

        // Lerp pour mouvement fluide
        this.x += (this.targetX - this.x) * this.lerp;
        this.y += (this.targetY - this.y) * this.lerp;
    }

    // Snap instantane (pour les transitions de map)
    snapTo(target, mapWidth, mapHeight) {
        this.targetX = target.x * SCALED_TILE + SCALED_TILE / 2 - this.width / 2;
        this.targetY = target.y * SCALED_TILE + SCALED_TILE / 2 - this.height / 2;
        const maxX = mapWidth * SCALED_TILE - this.width;
        const maxY = mapHeight * SCALED_TILE - this.height;
        this.x = Math.max(0, Math.min(this.targetX, maxX));
        this.y = Math.max(0, Math.min(this.targetY, maxY));
    }

    // Position avec shake
    get renderX() { return this.x + this.shakeX; }
    get renderY() { return this.y + this.shakeY; }
}

class InputManager {
    constructor() {
        this.keys = {};
        this.justPressed = {};
        this._prevKeys = {};

        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (['arrowup','arrowdown','arrowleft','arrowright',' ','tab'].includes(e.key.toLowerCase()) ||
                ['arrowup','arrowdown','arrowleft','arrowright',' ','Tab'].includes(e.key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    update() {
        for (const key in this.keys) {
            this.justPressed[key] = this.keys[key] && !this._prevKeys[key];
        }
        this._prevKeys = { ...this.keys };
    }

    isDown(key) { return !!this.keys[key]; }
    isJustPressed(key) { return !!this.justPressed[key]; }

    get up() { return this.isDown('z') || this.isDown('arrowup'); }
    get down() { return this.isDown('s') || this.isDown('arrowdown'); }
    get left() { return this.isDown('q') || this.isDown('arrowleft'); }
    get right() { return this.isDown('d') || this.isDown('arrowright'); }
    get action() { return this.isJustPressed(' '); }
    get interact() { return this.isJustPressed('e') || this.isJustPressed('enter'); }
    get sprint() { return this.isDown('shift'); }
    get inventory() { return this.isJustPressed('i'); }
    get notebook() { return this.isJustPressed('tab'); }
    get pause() { return this.isJustPressed('escape'); }
}

class Renderer {
    constructor(ctx, camera) {
        this.ctx = ctx;
        this.camera = camera;
        this.waterRenderer = new WaterRenderer();
        this.shadowRenderer = new ShadowRenderer();
    }

    clear() {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    drawMap(map) {
        const camX = this.camera.renderX;
        const camY = this.camera.renderY;
        const startCol = Math.floor(camX / SCALED_TILE);
        const endCol = Math.ceil((camX + this.camera.width) / SCALED_TILE);
        const startRow = Math.floor(camY / SCALED_TILE);
        const endRow = Math.ceil((camY + this.camera.height) / SCALED_TILE);

        this.waterRenderer.update();

        for (let y = Math.max(0, startRow); y <= endRow && y < map.tiles.length; y++) {
            for (let x = Math.max(0, startCol); x <= endCol && x < map.tiles[y].length; x++) {
                const tileId = map.tiles[y][x];
                const screenX = x * SCALED_TILE - camX;
                const screenY = y * SCALED_TILE - camY;

                // Tiles avec transparence = dessiner herbe en dessous d'abord
                const needsGrassBelow = [3, 6, 8, 15, 19]; // arbre, porte, fleurs, mh_door, castle_door
                if (needsGrassBelow.includes(tileId)) {
                    drawTile(this.ctx, 'grass', screenX, screenY, SCALE);
                }

                // Eau animee
                if (tileId === 1) {
                    this.waterRenderer.drawAnimatedWater(this.ctx, screenX, screenY, SCALE);
                } else {
                    const tileType = TILE_RENDER_MAP[tileId];
                    if (tileType) {
                        drawTile(this.ctx, tileType, screenX, screenY, SCALE);
                    }
                }
            }
        }
    }

    drawShadowAt(worldX, worldY) {
        const screenX = worldX * SCALED_TILE - this.camera.renderX;
        const screenY = worldY * SCALED_TILE - this.camera.renderY;
        this.shadowRenderer.drawShadow(this.ctx, screenX, screenY, SCALED_TILE, SCALED_TILE);
    }

    drawShadowAtPixel(px, py) {
        const screenX = px - this.camera.renderX;
        const screenY = py - this.camera.renderY;
        this.shadowRenderer.drawShadow(this.ctx, screenX, screenY, SCALED_TILE, SCALED_TILE);
    }

    drawSpriteAt(spriteData, worldX, worldY) {
        const screenX = worldX * SCALED_TILE - this.camera.renderX;
        const screenY = worldY * SCALED_TILE - this.camera.renderY;
        drawSprite(this.ctx, spriteData, screenX, screenY, SCALE);
    }

    drawSpriteAtPixel(spriteData, pixelX, pixelY) {
        const screenX = pixelX - this.camera.renderX;
        const screenY = pixelY - this.camera.renderY;
        drawSprite(this.ctx, spriteData, screenX, screenY, SCALE);
    }
}
