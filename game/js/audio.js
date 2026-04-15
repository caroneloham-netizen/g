// ============================================
// AUDIO - Sons + Musique par zone + Pierre proximity
// ============================================

class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;

        // Musique
        this.tracks = {
            ambient: null,
            combat: null,
        };
        this.currentTrack = null;
        this.currentTrackName = null;
        this.musicVolume = 0.4;
        this.fadeDuration = 1500;

        // Pierre proximity sound
        this.pierreSound = null;
        this.pierreMaxVolume = 0.8;
        this.pierreTargetX = 17; // mobilhome 17 tile position
        this.pierreTargetY = 14;
        this.pierreActive = false;
    }

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.enabled = false;
        }

        // Preload musiques
        this.tracks.ambient = new Audio('Moonlit Pixels Over Everdell.mp3');
        this.tracks.ambient.loop = true;
        this.tracks.ambient.volume = 0;

        this.tracks.combat = new Audio('Castle Clash at 8-Bit Dawn.mp3');
        this.tracks.combat.loop = true;
        this.tracks.combat.volume = 0;

        // Pierre sound
        this.pierreSound = new Audio('pierre.mp3');
        this.pierreSound.loop = true;
        this.pierreSound.volume = 0;
    }

    // Changer la musique selon la zone
    playMusic(trackName) {
        if (this.currentTrackName === trackName) return;

        if (this.currentTrack) {
            this._fadeOut(this.currentTrack);
        }

        const track = this.tracks[trackName];
        if (track) {
            this.currentTrack = track;
            this.currentTrackName = trackName;
            track.currentTime = 0;
            track.play().catch(() => {});
            this._fadeIn(track);
        }
    }

    setZoneMusic(zone) {
        switch (zone) {
            case 'village':
            case 'forest':
                this.playMusic('ambient');
                this.stopPierre();
                break;
            case 'camp':
                // Pas de musique dans le camp - juste Pierre
                this.stopMusic();
                this.startPierre();
                break;
            case 'dungeon':
                this.playMusic('combat');
                this.stopPierre();
                break;
            case 'grand_village':
                this.playMusic('ambient');
                this.stopPierre();
                break;
        }
    }

    stopMusic() {
        if (this.currentTrack) {
            this._fadeOut(this.currentTrack);
            this.currentTrack = null;
            this.currentTrackName = null;
        }
    }

    // --- Pierre proximity audio ---

    startPierre() {
        if (!this.pierreSound) return;
        if (!this.pierreActive) {
            this.pierreActive = true;
            this.pierreSound.volume = 0;
            this.pierreSound.play().catch(() => {});
        }
    }

    stopPierre() {
        if (!this.pierreSound) return;
        if (this.pierreActive) {
            this.pierreActive = false;
            this.pierreSound.pause();
            this.pierreSound.currentTime = 0;
            this.pierreSound.volume = 0;
        }
    }

    // Appele chaque frame dans le camp
    updatePierreProximity(playerX, playerY) {
        if (!this.pierreActive || !this.pierreSound) return;

        const dx = playerX - this.pierreTargetX;
        const dy = playerY - this.pierreTargetY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Volume max a distance 0, silence a distance 12+
        const maxDist = 12;
        const volume = Math.max(0, 1 - dist / maxDist);
        // Courbe quadratique pour que ca monte vite en s'approchant
        const finalVolume = volume * volume * this.pierreMaxVolume;

        this.pierreSound.volume = Math.min(1, Math.max(0, finalVolume));
    }

    // --- Fade ---

    _fadeIn(audio) {
        audio.volume = 0;
        const step = this.musicVolume / (this.fadeDuration / 50);
        const fade = setInterval(() => {
            if (audio.volume + step >= this.musicVolume) {
                audio.volume = this.musicVolume;
                clearInterval(fade);
            } else {
                audio.volume += step;
            }
        }, 50);
    }

    _fadeOut(audio) {
        const step = audio.volume / (this.fadeDuration / 50);
        const fade = setInterval(() => {
            if (audio.volume - step <= 0) {
                audio.volume = 0;
                audio.pause();
                clearInterval(fade);
            } else {
                audio.volume -= step;
            }
        }, 50);
    }

    // --- Effets sonores (Web Audio API) ---

    ensureContext() {
        if (!this.ctx) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(frequency, duration, type = 'square', volume = 0.1) {
        if (!this.enabled || !this.ctx) return;
        this.ensureContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    attack() {
        this.playTone(300, 0.1, 'sawtooth', 0.08);
        setTimeout(() => this.playTone(500, 0.08, 'sawtooth', 0.06), 50);
    }

    hit() {
        this.playTone(150, 0.15, 'square', 0.1);
    }

    playerHurt() {
        this.playTone(200, 0.1, 'sawtooth', 0.1);
        setTimeout(() => this.playTone(100, 0.2, 'sawtooth', 0.08), 100);
    }

    pickup() {
        this.playTone(523, 0.1, 'sine', 0.08);
        setTimeout(() => this.playTone(659, 0.1, 'sine', 0.08), 100);
        setTimeout(() => this.playTone(784, 0.15, 'sine', 0.08), 200);
    }

    dialogue() {
        const freq = 200 + Math.random() * 200;
        this.playTone(freq, 0.05, 'square', 0.03);
    }

    transition() {
        this.playTone(400, 0.2, 'sine', 0.06);
        setTimeout(() => this.playTone(500, 0.2, 'sine', 0.06), 150);
        setTimeout(() => this.playTone(600, 0.3, 'sine', 0.06), 300);
    }

    enemyDeath() {
        this.playTone(400, 0.1, 'square', 0.08);
        setTimeout(() => this.playTone(300, 0.1, 'square', 0.06), 80);
        setTimeout(() => this.playTone(200, 0.15, 'square', 0.04), 160);
    }

    victory() {
        this.stopMusic();
        this.stopPierre();
        const notes = [523, 659, 784, 1047];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.3, 'sine', 0.08), i * 200);
        });
    }

    gameOver() {
        this.stopMusic();
        this.stopPierre();
        const notes = [400, 350, 300, 200];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.4, 'sawtooth', 0.06), i * 300);
        });
    }
}
