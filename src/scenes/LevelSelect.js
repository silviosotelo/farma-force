import { LEVELS } from '../constants.js';

export class LevelSelect extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelect' });
    }

    init(data) {
        this.selectedCharacter = data.character;
    }

    create() {
        const { width, height } = this.cameras.main;

        const bg = this.add.graphics();
        bg.fillGradientStyle(0x0a0a2e, 0x0a0a2e, 0x16213e, 0x16213e, 1);
        bg.fillRect(0, 0, width, height);

        this.add.text(width / 2, 60, 'SELECCIONA NIVEL', {
            fontSize: '48px',
            fill: '#00ffff',
            stroke: '#000',
            strokeThickness: 6,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, 120, `Personaje: ${this.selectedCharacter.name}`, {
            fontSize: '20px',
            fill: Phaser.Display.Color.IntegerToColor(this.selectedCharacter.color).rgba
        }).setOrigin(0.5);

        const levels = Object.values(LEVELS);
        const startY = 200;

        levels.forEach((level, index) => {
            const y = startY + (index * 120);

            const card = this.add.container(width / 2, y);

            const bg = this.add.rectangle(0, 0, 600, 100, 0x1a1a2e);
            bg.setStrokeStyle(3, level.bgColors[0]);
            card.add(bg);

            const icon = this.add.circle(-250, 0, 30, level.bgColors[0]);
            card.add(icon);

            const nameText = this.add.text(-200, -20, level.name, {
                fontSize: '24px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            card.add(nameText);

            const infoText = this.add.text(-200, 10, `Enemigos: ${level.enemyType} | Jefe: ${level.boss}`, {
                fontSize: '14px',
                fill: '#aaaaaa'
            }).setOrigin(0, 0.5);
            card.add(infoText);

            const button = this.add.rectangle(200, 0, 120, 60, level.bgColors[0], 0.3);
            button.setStrokeStyle(2, level.bgColors[0]);
            button.setInteractive({ useHandCursor: true });
            card.add(button);

            const buttonText = this.add.text(200, 0, 'INICIAR', {
                fontSize: '18px',
                fill: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            card.add(buttonText);

            button.on('pointerover', () => {
                button.setFillStyle(level.bgColors[0], 0.6);
                this.tweens.add({
                    targets: card,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 200
                });
            });

            button.on('pointerout', () => {
                button.setFillStyle(level.bgColors[0], 0.3);
                this.tweens.add({
                    targets: card,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200
                });
            });

            button.on('pointerdown', () => {
                this.startLevel(level.key);
            });
        });
    }

    startLevel(levelKey) {
        this.cameras.main.fade(500, 0, 0, 0);

        this.time.delayedCall(500, () => {
            this.scene.start('GameSceneV2', {
                level: levelKey,
                character: this.selectedCharacter,
                score: 0
            });
        });
    }
}
