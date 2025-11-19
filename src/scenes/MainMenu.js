export class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    create() {
        const width = 1280;
        const height = 720;

        if (window.gameUIControl) {
            window.gameUIControl.showOverlay();
        }

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

        const title = this.add.text(width / 2, 70, 'FARMA-FORCE', {
            fontSize: '64px',
            fill: '#00ffff',
            stroke: '#000',
            strokeThickness: 8,
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            y: 65,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.add.text(width / 2, 130, 'OPERACIÓN ALIVIO', {
            fontSize: '24px',
            fill: '#ffffff',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        this.add.text(width / 2, 180, 'Sistema de Combate Nano-Farmacéutico v2.0', {
            fontSize: '14px',
            fill: '#666666',
            fontStyle: 'italic'
        }).setOrigin(0.5);

        this.characters = [
            {
                id: 'BOTICARIO',
                name: 'EL BOTICARIO',
                class: 'TANQUE',
                health: 150,
                speed: 180,
                damage: 1.0,
                color: 0x4444ff
            },
            {
                id: 'BIOQUIMICA',
                name: 'LA BIO-QUÍMICA',
                class: 'DPS',
                health: 80,
                speed: 280,
                damage: 1.5,
                color: 0xff4444
            },
            {
                id: 'CLINICO',
                name: 'EL CLÍNICO',
                class: 'EQUILIBRADO',
                health: 100,
                speed: 250,
                damage: 1.2,
                color: 0x44ff44
            }
        ];

        const startX = width / 2 - 360;
        const startY = 330;

        this.characterCards = [];

        this.characters.forEach((char, index) => {
            const x = startX + (index * 360);
            const y = startY;

            const card = this.add.container(x, y);

            const cardBg = this.add.rectangle(0, 0, 320, 280, 0x1a1a2e, 0.9);
            cardBg.setStrokeStyle(4, char.color, 0.8);
            card.add(cardBg);

            const preview = this.add.circle(0, -80, 45, char.color);
            card.add(preview);

            const glow = this.add.circle(0, -80, 50, char.color, 0.3);
            card.add(glow);

            this.tweens.add({
                targets: glow,
                scaleX: 1.3,
                scaleY: 1.3,
                alpha: 0,
                duration: 1000,
                repeat: -1
            });

            const nameText = this.add.text(0, -10, char.name, {
                fontSize: '20px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            card.add(nameText);

            const classText = this.add.text(0, 12, `[${char.class}]`, {
                fontSize: '14px',
                fill: Phaser.Display.Color.IntegerToColor(char.color).rgba
            }).setOrigin(0.5);
            card.add(classText);

            const stats = [
                `HP: ${char.health}`,
                `Velocidad: ${char.speed}`,
                `Daño: ${char.damage}x`
            ];

            stats.forEach((stat, i) => {
                card.add(this.add.text(0, 45 + (i * 18), stat, {
                    fontSize: '13px',
                    fill: '#aaaaaa'
                }).setOrigin(0.5));
            });

            const button = this.add.rectangle(0, 115, 260, 45, char.color, 0.2);
            button.setStrokeStyle(2, char.color);
            button.setInteractive({ useHandCursor: true });
            card.add(button);

            const buttonText = this.add.text(0, 115, 'SELECCIONAR', {
                fontSize: '16px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            card.add(buttonText);

            button.on('pointerover', () => {
                button.setFillStyle(char.color, 0.5);
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

        const controlsBg = this.add.rectangle(width / 2, height - 60, 1200, 100, 0x000000, 0.6);
        controlsBg.setStrokeStyle(2, 0x00ffff, 0.5);

        this.add.text(width / 2, height - 88, 'CONTROLES:', {
            fontSize: '16px',
            fill: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const controlPairs = [
            { key: 'WASD/Flechas', action: 'Movimiento' },
            { key: 'Mouse', action: 'Apuntar' },
            { key: 'Click izq', action: 'Disparar' },
            { key: 'Espacio', action: 'Saltar' },
            { key: 'Shift', action: 'Dash' },
            { key: '1-5', action: 'Cambiar Arma/Ítem' }
        ];

        const controlsPerRow = 3;
        const startControlX = width / 2 - 420;
        const row1Y = height - 65;
        const row2Y = height - 40;

        controlPairs.forEach((control, i) => {
            const row = Math.floor(i / controlsPerRow);
            const col = i % controlsPerRow;
            const x = startControlX + (col * 280);
            const y = row === 0 ? row1Y : row2Y;

            this.add.text(x, y, `${control.key}:`, {
                fontSize: '13px',
                fill: '#ffaa00',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);

            this.add.text(x + 100, y, control.action, {
                fontSize: '13px',
                fill: '#cccccc'
            }).setOrigin(0, 0.5);
        });

        this.add.text(width / 2, height - 10, '© 2024 Nano-Combat Systems | Elimina la infección, salva el paciente', {
            fontSize: '11px',
            fill: '#555555',
            fontStyle: 'italic'
        }).setOrigin(0.5);
    }

    selectCharacter(character) {
        this.cameras.main.flash(300, 0, 255, 255);

        this.time.delayedCall(300, () => {
            this.scene.start('LevelSelect', { character });
        });
    }
}
