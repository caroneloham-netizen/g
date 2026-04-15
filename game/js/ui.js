// ============================================
// HUD & UI
// ============================================

class UI {
    constructor() {
        this.notifications = [];
        this.showInventory = false;
        this.showNotebook = false;
        this.titleScreen = true;
        this.gameOver = false;
        this.victory = false;
        this.finalVictory = false;
        this.titleBlinkTimer = 0;
    }

    addNotification(text, duration = 120) {
        this.notifications.push({ text, timer: duration });
    }

    update() {
        // Notifications
        this.notifications = this.notifications.filter(n => {
            n.timer--;
            return n.timer > 0;
        });
        this.titleBlinkTimer++;
    }

    drawHUD(ctx, player) {
        // Coeurs
        const heartSize = 24;
        const startX = 10;
        const startY = 10;

        for (let i = 0; i < player.maxHp / 2; i++) {
            const x = startX + i * (heartSize + 4);
            const hp = player.hp - i * 2;

            if (hp >= 2) {
                // Coeur plein
                this.drawHeart(ctx, x, startY, heartSize, '#ff4444');
            } else if (hp === 1) {
                // Demi-coeur
                this.drawHeart(ctx, x, startY, heartSize, '#ff4444', true);
            } else {
                // Coeur vide
                this.drawHeart(ctx, x, startY, heartSize, '#333333');
            }
        }

        // Cle (Acte 1)
        if (player.hasKey && !this._act2) {
            ctx.fillStyle = '#ffd700';
            ctx.font = '16px monospace';
            ctx.textAlign = 'right';
            ctx.fillText('Cle Sacree', ctx.canvas.width - 10, 25);
        }

        // Acte 2 HUD
        if (this._act2) {
            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'right';
            ctx.fillText('ACTE 2 - ENQUETE', ctx.canvas.width - 10, 18);

            const clueCount = (this._clueCount || 0);
            const evidenceCount = (this._evidenceCount || 0);
            const total = clueCount + evidenceCount;
            ctx.fillStyle = total >= 6 ? '#44ff44' : '#ffffff';
            ctx.font = '11px monospace';
            ctx.fillText('Indices: ' + clueCount + '/6  Preuves: ' + evidenceCount + '/3', ctx.canvas.width - 10, 34);
            ctx.fillStyle = '#888';
            ctx.fillText('[TAB] Carnet', ctx.canvas.width - 10, 48);
        }

        // Zone actuelle
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '11px monospace';
        ctx.textAlign = 'right';
        // (sera rempli par main.js)

        // RPG Level + XP bar
        if (this._rpg) {
            const rpg = this._rpg;

            // Niveau a cote des coeurs
            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'left';
            const lvlX = 10 + (player.maxHp / 2) * (heartSize + 4) + 8;
            ctx.fillText('Niv.' + rpg.level, lvlX, 28);

            // Barre XP en bas
            const barW = 200;
            const barH = 6;
            const barX = (ctx.canvas.width - barW) / 2;
            const barY = ctx.canvas.height - 18;

            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barW, barH);
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(barX, barY, barW * rpg.getXPProgress(), barH);

            ctx.fillStyle = 'rgba(255,170,0,0.6)';
            ctx.font = '9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(rpg.xp + ' / ' + rpg.getXPForNextLevel() + ' XP', ctx.canvas.width / 2, barY - 3);

            // Skills cooldowns
            let skillY = 42;
            if (rpg.hasSkill('dash') && rpg.dashCooldown > 0) {
                ctx.fillStyle = '#888';
                ctx.font = '10px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('Dash: ' + Math.ceil(rpg.dashCooldown / 60) + 's', 10, skillY);
                skillY += 14;
            }
            if (rpg.hasSkill('heal') && rpg.healCooldown > 0) {
                ctx.fillStyle = '#888';
                ctx.font = '10px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('Soin: ' + Math.ceil(rpg.healCooldown / 60) + 's', 10, skillY);
                skillY += 14;
            }
            if (rpg.hasSkill('shield') && rpg.shieldCooldown > 0) {
                ctx.fillStyle = '#888';
                ctx.font = '10px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('Bouclier: ' + Math.ceil(rpg.shieldCooldown / 60) + 's', 10, skillY);
                skillY += 14;
            }
            // Combo counter
            if (rpg.comboCount > 0) {
                ctx.fillStyle = '#ffdd00';
                ctx.font = 'bold 14px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('COMBO x' + rpg.comboCount, ctx.canvas.width / 2, ctx.canvas.height - 30);
            }
            // Charge indicator
            if (rpg.charging && rpg.hasSkill('chargedAttack')) {
                const progress = Math.min(1, rpg.chargeTimer / SKILLS.chargedAttack.chargeTime);
                ctx.fillStyle = rpg.chargeReady ? '#ffdd00' : '#ff8800';
                ctx.font = rpg.chargeReady ? 'bold 14px monospace' : '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(rpg.chargeReady ? 'CHARGE !' : 'Charge...', ctx.canvas.width / 2, ctx.canvas.height - 44);
            }
            // Shield indicator
            if (rpg.shielded) {
                ctx.fillStyle = 'rgba(50,150,255,0.3)';
                ctx.strokeStyle = '#44aaff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, 40, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }

        // Notifications
        let ny = 55;
        for (const notif of this.notifications) {
            const alpha = Math.min(1, notif.timer / 20);
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.7})`;
            ctx.fillRect(ctx.canvas.width / 2 - 150, ny - 14, 300, 24);
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            ctx.font = '13px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(notif.text, ctx.canvas.width / 2, ny + 2);
            ny += 30;
        }
    }

    drawHeart(ctx, x, y, size, color, half = false) {
        ctx.fillStyle = '#111';
        ctx.fillRect(x - 1, y - 1, size + 2, size + 2);

        if (half) {
            // Moitie gauche pleine, moitie droite vide
            ctx.fillStyle = color;
            ctx.fillRect(x, y, size / 2, size);
            ctx.fillStyle = '#333333';
            ctx.fillRect(x + size / 2, y, size / 2, size);
        } else {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, size, size);
        }

        // Forme de coeur simplifiee
        ctx.fillStyle = color === '#333333' ? '#222' : '#ff6666';
        ctx.fillRect(x + 2, y + 2, 4, 4);
    }

    drawTitleScreen(ctx, w, h) {
        // Fond
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, w, h);

        // Etoiles
        for (let i = 0; i < 50; i++) {
            const sx = (Math.sin(i * 73.7) * 0.5 + 0.5) * w;
            const sy = (Math.cos(i * 51.3) * 0.5 + 0.5) * h;
            const brightness = Math.sin(Date.now() * 0.003 + i) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255,255,255,${brightness})`;
            ctx.fillRect(sx, sy, 2, 2);
        }

        // Titre
        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 42px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LA QUETE DE', w / 2, h / 2 - 80);

        ctx.fillStyle = '#ff6633';
        ctx.font = 'bold 56px monospace';
        ctx.fillText('REDOUANE', w / 2, h / 2 - 25);

        // Sous-titre
        ctx.fillStyle = '#8888cc';
        ctx.font = '16px monospace';
        ctx.fillText("Envoye par Eloham pour sauver le royaume", w / 2, h / 2 + 20);

        // Blink "press start"
        if (Math.floor(this.titleBlinkTimer / 30) % 2 === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '18px monospace';
            ctx.fillText('Appuie sur ESPACE pour commencer', w / 2, h / 2 + 80);
        }

        // Controles
        ctx.fillStyle = '#666';
        ctx.font = '12px monospace';
        ctx.fillText('ZQSD/Fleches = Bouger | SHIFT = Courir | ESPACE = Attaque | E = Interagir', w / 2, h - 40);

        // Credits
        ctx.fillStyle = '#444';
        ctx.fillText('Un jeu cree par Eloham', w / 2, h - 15);
    }

    drawGameOver(ctx, w, h) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', w / 2, h / 2 - 20);

        ctx.fillStyle = '#888';
        ctx.font = '16px monospace';
        ctx.fillText('Redouane est tombe au combat...', w / 2, h / 2 + 20);

        if (Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.fillStyle = '#fff';
            ctx.fillText('Appuie sur ESPACE pour reessayer', w / 2, h / 2 + 60);
        }
    }

    drawVictory(ctx, w, h) {
        ctx.fillStyle = 'rgba(0, 0, 20, 0.9)';
        ctx.fillRect(0, 0, w, h);

        // Particules dorees
        for (let i = 0; i < 30; i++) {
            const t = Date.now() * 0.001 + i;
            const px = w / 2 + Math.sin(t * 1.5 + i) * 200;
            const py = h / 2 + Math.cos(t * 0.8 + i * 2) * 150;
            ctx.fillStyle = `rgba(212, 175, 55, ${0.3 + Math.sin(t + i) * 0.3})`;
            ctx.fillRect(px, py, 4, 4);
        }

        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 42px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VICTOIRE !', w / 2, h / 2 - 60);

        ctx.fillStyle = '#ffffff';
        ctx.font = '18px monospace';
        ctx.fillText('Redouane a vaincu le Seigneur des Ombres !', w / 2, h / 2 - 10);

        ctx.fillStyle = '#8888cc';
        ctx.font = '16px monospace';
        ctx.fillText('Le royaume est sauve grace a Eloham', w / 2, h / 2 + 25);
        ctx.fillText('et au courage de son champion.', w / 2, h / 2 + 50);

        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 20px monospace';
        ctx.fillText('FIN', w / 2, h / 2 + 100);

        ctx.fillStyle = '#444';
        ctx.font = '12px monospace';
        ctx.fillText('Cree par Eloham', w / 2, h - 20);
    }

    drawInteractionHint(ctx, w, h) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[E] Parler', w / 2, h - 115);
    }

    drawNotebook(ctx, w, h, state) {
        // Fond
        ctx.fillStyle = 'rgba(20, 15, 10, 0.92)';
        ctx.fillRect(40, 30, w - 80, h - 70);

        // Bordure
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, 30, w - 80, h - 70);

        // Titre
        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CARNET D\'ENQUETE', w / 2, 62);

        // Ligne
        ctx.strokeStyle = '#d4af37';
        ctx.beginPath();
        ctx.moveTo(60, 72);
        ctx.lineTo(w - 60, 72);
        ctx.stroke();

        let y = 95;
        ctx.textAlign = 'left';

        // Temoignages
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('TEMOIGNAGES :', 60, y);
        y += 22;

        const witnessInfo = {
            abdel: 'Abdel - Confirme l\'existence du predateur',
            samira: 'Samira - Le suspect a l\'air normal et respectable',
            nadia: 'Nadia - Messages insistants, mec apprecie au village',
            fatima: 'Fatima - Il rode la nuit, offre des cadeaux',
            leila: 'Leila - Double personnalite, se dit nouveau',
            yasmine: 'Yasmine - Connait l\'identite ! Chercher la lettre',
            sarah: 'Sarah - Vetements verts, sourire chelou, traine la nuit',
        };

        ctx.font = '12px monospace';
        for (const [id, desc] of Object.entries(witnessInfo)) {
            if (state.talkedTo.has(id)) {
                ctx.fillStyle = '#44ff44';
                ctx.fillText('  [x] ' + desc, 60, y);
            } else {
                ctx.fillStyle = '#666';
                ctx.fillText('  [ ] ???', 60, y);
            }
            y += 17;
        }

        // Preuves
        y += 12;
        ctx.fillStyle = '#ff6644';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('PREUVES PHYSIQUES :', 60, y);
        y += 22;

        const evidenceInfo = {
            letter: 'Lettre anonyme - Ecriture d\'Ilyesse',
            bijou: 'Bijou grave avec initiale "I"',
            carnet: 'Carnet de stalking - Noms et adresses',
        };

        ctx.font = '12px monospace';
        for (const [id, desc] of Object.entries(evidenceInfo)) {
            if (state.evidence.includes(id)) {
                ctx.fillStyle = '#ff4444';
                ctx.fillText('  [x] ' + desc, 60, y);
            } else {
                ctx.fillStyle = '#666';
                ctx.fillText('  [ ] ???', 60, y);
            }
            y += 17;
        }

        // Conclusion
        const total = state.clues.length + state.evidence.length;
        y += 15;
        ctx.fillStyle = '#888';
        ctx.font = '11px monospace';
        ctx.fillText('Total indices : ' + total + '/9', 60, y);

        if (total >= 6) {
            y += 18;
            ctx.fillStyle = '#44ff44';
            ctx.font = 'bold 13px monospace';
            ctx.fillText('=> ASSEZ DE PREUVES ! Confronter Ilyesse !', 60, y);
        } else {
            y += 18;
            ctx.fillStyle = '#ffaa00';
            ctx.font = '11px monospace';
            ctx.fillText('Il faut au moins 6 indices pour confronter le suspect.', 60, y);
        }

        // Fermer
        ctx.fillStyle = '#666';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('[TAB] Fermer', w / 2, h - 50);
    }

    drawFinalVictory(ctx, w, h) {
        ctx.fillStyle = 'rgba(0, 5, 15, 0.95)';
        ctx.fillRect(0, 0, w, h);

        // Particules justice
        for (let i = 0; i < 40; i++) {
            const t = Date.now() * 0.001 + i;
            const px = w / 2 + Math.sin(t * 1.2 + i * 0.5) * 250;
            const py = h / 2 + Math.cos(t * 0.7 + i * 0.8) * 180;
            ctx.fillStyle = `rgba(255,50,50,${0.2 + Math.sin(t + i) * 0.2})`;
            ctx.fillRect(px, py, 3, 3);
        }

        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('JUSTICE RENDUE', w / 2, h / 2 - 80);

        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 24px monospace';
        ctx.fillText('ILYESSE ARRETE', w / 2, h / 2 - 40);

        ctx.fillStyle = '#ffffff';
        ctx.font = '15px monospace';
        ctx.fillText('Redouane a demasque le predateur.', w / 2, h / 2 + 10);
        ctx.fillText('Les femmes du village sont en securite.', w / 2, h / 2 + 35);

        ctx.fillStyle = '#8888cc';
        ctx.font = '14px monospace';
        ctx.fillText('Meme face a un ami d\'enfance,', w / 2, h / 2 + 70);
        ctx.fillText('la justice passe avant tout.', w / 2, h / 2 + 90);

        ctx.fillStyle = '#d4af37';
        ctx.font = 'bold 22px monospace';
        ctx.fillText('FIN', w / 2, h / 2 + 130);

        ctx.fillStyle = '#555';
        ctx.font = '12px monospace';
        ctx.fillText('Un jeu cree par Eloham', w / 2, h - 20);
    }

    drawDarkEnding(ctx, w, h) {
        // Fond rouge/noir sinistre
        ctx.fillStyle = '#0a0000';
        ctx.fillRect(0, 0, w, h);

        // Particules rouges menaçantes
        for (let i = 0; i < 40; i++) {
            const t = Date.now() * 0.0008 + i;
            const px = w / 2 + Math.sin(t * 1.5 + i * 0.7) * 280;
            const py = h / 2 + Math.cos(t * 0.9 + i * 1.1) * 200;
            ctx.fillStyle = `rgba(180,0,0,${0.15 + Math.sin(t + i) * 0.15})`;
            ctx.fillRect(px, py, 3, 3);
        }

        // Texte principal
        ctx.fillStyle = '#880000';
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LE PREDATEUR', w / 2, h / 2 - 90);

        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 42px monospace';
        ctx.fillText('C\'ETAIT TOI', w / 2, h / 2 - 45);

        ctx.fillStyle = '#cc4444';
        ctx.font = '14px monospace';
        ctx.fillText('Redouane. L\'elu d\'Eloham.', w / 2, h / 2);
        ctx.fillText('Le heros que tout le monde attendait.', w / 2, h / 2 + 22);

        ctx.fillStyle = '#aa3333';
        ctx.font = '13px monospace';
        ctx.fillText('Tu as menace les victimes.', w / 2, h / 2 + 55);
        ctx.fillText('Tu as utilise les temoins.', w / 2, h / 2 + 75);
        ctx.fillText('Tu as choisi la cruaute a chaque occasion.', w / 2, h / 2 + 95);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('Ilyesse essayait de te stopper.', w / 2, h / 2 + 130);

        ctx.fillStyle = '#880000';
        ctx.font = 'bold 20px monospace';

        // Clignotement sinistre
        if (Math.floor(Date.now() / 800) % 2 === 0) {
            ctx.fillText('TU ES LE MONSTRE.', w / 2, h / 2 + 170);
        }

        ctx.fillStyle = '#444';
        ctx.font = '12px monospace';
        ctx.fillText('Un jeu cree par Eloham', w / 2, h - 20);
    }
}
