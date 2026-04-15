// ============================================
// SYSTEME DE DIALOGUES
// ============================================

class DialogueSystem {
    constructor() {
        this.active = false;
        this.lines = [];
        this.currentLine = 0;
        this.displayedChars = 0;
        this.charTimer = 0;
        this.charSpeed = 2; // frames par caractere
        this.finished = false; // tout le texte de la ligne actuelle est affiche
    }

    start(dialogueLines) {
        this.active = true;
        this.lines = dialogueLines;
        this.currentLine = 0;
        this.displayedChars = 0;
        this.charTimer = 0;
        this.finished = false;
    }

    update(input) {
        if (!this.active) return;

        const line = this.lines[this.currentLine];
        if (!line) {
            this.close();
            return;
        }

        // Animation texte lettre par lettre
        if (!this.finished) {
            this.charTimer++;
            if (this.charTimer >= this.charSpeed) {
                this.charTimer = 0;
                this.displayedChars++;
                if (this.displayedChars >= line.text.length) {
                    this.finished = true;
                }
            }

            // Skip l'animation avec espace/enter
            if (input.action || input.interact) {
                this.displayedChars = line.text.length;
                this.finished = true;
            }
        } else {
            // Passer a la ligne suivante
            if (input.action || input.interact) {
                this.currentLine++;
                if (this.currentLine >= this.lines.length) {
                    this.close();
                } else {
                    this.displayedChars = 0;
                    this.charTimer = 0;
                    this.finished = false;
                }
            }
        }
    }

    close() {
        this.active = false;
        this.lines = [];
        this.currentLine = 0;
    }

    draw(ctx, canvasWidth, canvasHeight) {
        if (!this.active) return;

        const line = this.lines[this.currentLine];
        if (!line) return;

        const boxHeight = 90;
        const boxY = canvasHeight - boxHeight - 10;
        const boxX = 10;
        const boxWidth = canvasWidth - 20;

        // Fond de la boite de dialogue
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // Bordure
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Nom du speaker
        if (line.speaker) {
            ctx.fillStyle = '#d4af37';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(line.speaker, boxX + 15, boxY + 22);
        }

        // Texte
        const text = line.text.substring(0, this.displayedChars);
        ctx.fillStyle = '#ffffff';
        ctx.font = '13px monospace';
        ctx.textAlign = 'left';

        // Word wrap
        const maxWidth = boxWidth - 30;
        const words = text.split(' ');
        let currentLine = '';
        let yPos = line.speaker ? boxY + 42 : boxY + 25;

        for (const word of words) {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && currentLine !== '') {
                ctx.fillText(currentLine.trim(), boxX + 15, yPos);
                currentLine = word + ' ';
                yPos += 18;
            } else {
                currentLine = testLine;
            }
        }
        ctx.fillText(currentLine.trim(), boxX + 15, yPos);

        // Indicateur "suite"
        if (this.finished && this.currentLine < this.lines.length - 1) {
            const blink = Math.floor(Date.now() / 400) % 2;
            if (blink) {
                ctx.fillStyle = '#d4af37';
                ctx.font = '16px monospace';
                ctx.textAlign = 'right';
                ctx.fillText('▼', boxX + boxWidth - 15, boxY + boxHeight - 10);
            }
        }

        // Indicateur "fin"
        if (this.finished && this.currentLine === this.lines.length - 1) {
            ctx.fillStyle = '#888';
            ctx.font = '11px monospace';
            ctx.textAlign = 'right';
            ctx.fillText('[Espace/Enter]', boxX + boxWidth - 15, boxY + boxHeight - 10);
        }
    }
}
