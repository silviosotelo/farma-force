export class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    create() {
        const { width, height } = this.cameras.main;

        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0a2e, 0x0a0a2e, 0x16213e, 0x16213e, 1);
        bg.fillRect(0, 0, width, height);

        this.add.particles(0, 0, 'bullet', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            speed: { min: 10, max: 30 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 3000,
            frequency: 100,
            tint: 0x00ffff
        });

        const title = this.add.text(width / 2, 100, 'FARMA-FORCE', {
            fontSize: '72px',
            fill: '#00ffff',
            stroke: '#000',
            strokeThickness: 8,
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            y: 90,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const subtitle = this.add.text(width / 2, 160, 'OPERACIÓN ALIVIO', {
            fontSize: '28px',
            fill: '#ffffff',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        this.add.text(width / 2, 220, 'SELECCIONA TU NANO-FARMACÉUTICO', {
            fontSize: '20px',
            fill: '#ffaa00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.characters = [
            {
                id: 'BOTICARIO',
                name: 'EL BOTICARIO',
                class: 'TANQUE',
                health: 150,
                speed: 180,
                damage: 1.0,
                desc: 'Lento pero resistente.\nIdeal para jugadores defensivos.',
                color: 0x4444ff
            },
            {
                id: 'BIOQUIMICA',
                name: 'LA BIO-QUÍMICA',
                class: 'DPS',
                health: 80,
                speed: 280,
                damage: 1.5,
                desc: 'Rápida y letal.\nMáximo daño por segundo.',
                color: 0xff4444
            },
            {
                id: 'CLINICO',
                name: 'EL CLÍNICO',
                class: 'EQUILIBRADO',
                health: 100,
                speed: 250,
                damage: 1.2,
                desc: 'Balanceado en todo.\nRegenera vida gradualmente.',
                color: 0x44ff44
            }
        ];

        const startX = width / 2 - 320;
        const startY = 320;

        this.characterCards = [];

        this.characters.forEach((char, index) => {
            const x = startX + (index * 320);
            const y = startY;

            const card = this.add.container(x, y);

            const cardBg = this.add.rectangle(0, 0, 280, 320, 0x1a1a2e);
            cardBg.setStrokeStyle(4, char.color);
            card.add(cardBg);

            const preview = this.add.circle(0, -80, 50, char.color);
            card.add(preview);

            const glow = this.add.circle(0, -80, 55, char.color, 0.3);
            card.add(glow);

            this.tweens.add({
                targets: glow,
                scaleX: 1.2,
                scaleY: 1.2,
                alpha: 0,
                duration: 1000,
                repeat: -1
            });

            const nameText = this.add.text(0, 0, char.name, {
                fontSize: '22px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            card.add(nameText);

            const classText = this.add.text(0, 25, `[${char.class}]`, {
                fontSize: '16px',
                fill: Phaser.Display.Color.IntegerToColor(char.color).rgba
            }).setOrigin(0.5);
            card.add(classText);

            const stats = [
                `HP: ${char.health}`,
                `Velocidad: ${char.speed}`,
                `Daño: ${char.damage}x`
            ];

            stats.forEach((stat, i) => {
                card.add(this.add.text(0, 60 + (i * 20), stat, {
                    fontSize: '14px',
                    fill: '#aaaaaa'
                }).setOrigin(0.5));
            });

            const button = this.add.rectangle(0, 140, 240, 50, char.color, 0.2);
            button.setStrokeStyle(2, char.color);
            button.setInteractive({ useHandCursor: true });
            card.add(button);

            const buttonText = this.add.text(0, 140, 'SELECCIONAR', {
                fontSize: '18px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            card.add(buttonText);

            button.on('pointerover', () => {
                button.setFillStyle(char.color, 0.4);
                this.tweens.add({
                    targets: card,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 200
                });
            });

            button.on('pointerout', () => {
                button.setFillStyle(char.color, 0.2);
                this.tweens.add({
                    targets: card,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200
                });
            });

            button.on('pointerdown', () => {
                this.selectCharacter(char);
            });

            this.characterCards.push(card);
        });

        this.add.text(width / 2, height - 80, 'CONTROLES:', {
            fontSize: '18px',
            fill: '#ffaa00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const controls = [
            'WASD/Flechas: Mover | Mouse: Apuntar | Click Izq: Disparar',
            'Espacio: Saltar | Shift/Doble Espacio: Dash | 1-5: Cambiar Arma/Item'
        ];

        controls.forEach((text, i) => {
            this.add.text(width / 2, height - 55 + (i * 20), text, {
                fontSize: '14px',
                fill: '#cccccc'
            }).setOrigin(0.5);
        });
    }

    selectCharacter(character) {
        this.cameras.main.flash(300, 0, 255, 255);

        this.time.delayedCall(300, () => {
            this.scene.start('LevelSelect', { character });
        });
    }
}
