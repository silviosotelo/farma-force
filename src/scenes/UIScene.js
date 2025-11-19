export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    init(data) {
        this.levelName = data.levelName || 'ZONA DESCONOCIDA';
    }

    create() {
        const { width, height } = this.cameras.main;

        // Fondo oscuro para HUD
        this.add.rectangle(0, 0, width, 120, 0x000000, 0.6).setOrigin(0, 0).setScrollFactor(0).setDepth(100);

        // Título de Nivel con efecto
        const levelTitle = this.add.text(width / 2, 25, this.levelName, {
            fontSize: '28px',
            fill: '#00ffff',
            stroke: '#000',
            strokeThickness: 5,
            fontStyle: 'bold',
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, fill: true }
        }).setOrigin(0.5).setDepth(101);

        this.tweens.add({
            targets: levelTitle,
            scale: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Barra de Vida del Jugador
        this.add.text(20, 60, 'SALUD', {
            fontSize: '16px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setDepth(101);

        this.add.rectangle(20, 85, 204, 24, 0x330000).setOrigin(0, 0).setDepth(101);
        this.add.rectangle(22, 87, 200, 20, 0x660000).setOrigin(0, 0).setDepth(101);
        this.healthBar = this.add.rectangle(22, 87, 200, 20, 0x00ff00).setOrigin(0, 0).setDepth(102);

        this.healthText = this.add.text(122, 97, '100/100', {
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(103);

        // Panel de Armas con iconos
        this.weaponText = this.add.text(20, 120, 'ARMA: Ibu-MachineGun', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3
        }).setDepth(101);

        // Controles
        this.add.text(width - 20, 60, 'CONTROLES:', {
            fontSize: '14px',
            fill: '#ffaa00',
            fontStyle: 'bold'
        }).setOrigin(1, 0).setDepth(101);

        const controls = [
            'Flechas: Mover',
            'Z/UP: Saltar (Doble)',
            'X/SPACE: Disparar',
            'C: Dash',
            '1,2,3: Cambiar Arma'
        ];

        controls.forEach((text, i) => {
            this.add.text(width - 20, 85 + (i * 18), text, {
                fontSize: '12px',
                fill: '#cccccc'
            }).setOrigin(1, 0).setDepth(101);
        });

        // Barra de Toxicidad mejorada
        this.add.text(250, 60, 'TOXICIDAD', {
            fontSize: '16px',
            fill: '#ffaa00',
            fontStyle: 'bold'
        }).setDepth(101);

        this.add.rectangle(250, 85, 204, 24, 0x332200).setOrigin(0, 0).setDepth(101);
        this.add.rectangle(252, 87, 200, 20, 0x664400).setOrigin(0, 0).setDepth(101);
        this.toxicBar = this.add.rectangle(252, 87, 0, 20, 0x00ff00).setOrigin(0, 0).setDepth(102);

        this.toxicText = this.add.text(352, 97, '0%', {
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(103);

        this.toxicity = 0;

        // Área de notificaciones
        this.notificationText = this.add.text(width / 2, 160, '', {
            fontSize: '24px',
            fill: '#ffff00',
            stroke: '#000',
            strokeThickness: 4,
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(104).setAlpha(0);

        // Listeners
        const game = this.scene.get('GameScene');
        if (game) {
            game.events.on('player-shoot', (cost) => this.addToxicity(cost));
            game.events.on('weapon-change', (name) => this.weaponText.setText(`ARMA: ${name}`));
            game.events.on('player-health', (health, maxHealth) => this.updateHealth(health, maxHealth));
            game.events.on('effect-activated', (message) => this.showNotification(message));
            game.events.on('powerup-collected', (name) => this.showNotification(`¡${name} obtenido!`));
        }

        // Bajar toxicidad
        this.time.addEvent({ delay: 500, callback: () => this.addToxicity(-2), loop: true });
    }

    addToxicity(amount) {
        this.toxicity = Phaser.Math.Clamp(this.toxicity + amount, 0, 100);
        this.toxicBar.width = this.toxicity * 2;
        this.toxicText.setText(`${Math.floor(this.toxicity)}%`);

        if (this.toxicity > 80) {
            this.toxicBar.fillColor = 0xff0000;
            this.toxicText.setFill('#ff0000');
        } else if (this.toxicity > 50) {
            this.toxicBar.fillColor = 0xffff00;
            this.toxicText.setFill('#ffff00');
        } else {
            this.toxicBar.fillColor = 0x00ff00;
            this.toxicText.setFill('#00ff00');
        }

        // Efecto visual de peligro
        if (this.toxicity > 90) {
            this.cameras.main.flash(100, 255, 0, 0, false, 0.2);
        }
    }

    updateHealth(health, maxHealth) {
        const percentage = health / maxHealth;
        this.healthBar.width = 200 * percentage;
        this.healthText.setText(`${Math.max(0, health)}/${maxHealth}`);

        // Cambiar color según salud
        if (percentage > 0.6) {
            this.healthBar.fillColor = 0x00ff00;
        } else if (percentage > 0.3) {
            this.healthBar.fillColor = 0xffaa00;
        } else {
            this.healthBar.fillColor = 0xff0000;
        }
    }

    showNotification(message) {
        this.notificationText.setText(message);
        this.notificationText.setAlpha(1);

        this.tweens.add({
            targets: this.notificationText,
            alpha: 0,
            y: 140,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                this.notificationText.y = 160;
            }
        });
    }
}