export class UISceneV2 extends Phaser.Scene {
    constructor() {
        super({ key: 'UISceneV2' });
    }

    init(data) {
        this.levelName = data.levelName || 'ZONA DESCONOCIDA';
        this.character = data.character;
    }

    create() {
        const { width, height } = this.cameras.main;

        const hudBg = this.add.graphics();
        hudBg.fillStyle(0x000000, 0.5);
        hudBg.fillRect(10, 10, 350, 80);
        hudBg.setScrollFactor(0).setDepth(100);

        this.add.rectangle(10, 10, 350, 80, 0x000000, 0)
            .setStrokeStyle(2, this.character.color, 0.8)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(100);

        const levelTitle = this.add.text(20, 20, this.levelName, {
            fontSize: '18px',
            fill: Phaser.Display.Color.IntegerToColor(this.character.color).rgba,
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0).setScrollFactor(0).setDepth(102);

        const healthLabel = this.add.text(20, 45, 'HP', {
            fontSize: '14px',
            fill: '#ff6666',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(101);

        this.add.rectangle(50, 43, 204, 18, 0x220000).setOrigin(0, 0).setScrollFactor(0).setDepth(101);
        this.add.rectangle(51, 44, 202, 16, 0x440000).setOrigin(0, 0).setScrollFactor(0).setDepth(101);
        this.healthBar = this.add.rectangle(51, 44, 202, 16, 0x00ff00).setOrigin(0, 0).setScrollFactor(0).setDepth(102);

        this.healthText = this.add.text(260, 52, '100/100', {
            fontSize: '13px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(103);

        const toxicLabel = this.add.text(20, 68, 'TOX', {
            fontSize: '14px',
            fill: '#ffaa00',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(101);

        this.add.rectangle(50, 66, 204, 18, 0x332200).setOrigin(0, 0).setScrollFactor(0).setDepth(101);
        this.add.rectangle(51, 67, 202, 16, 0x664400).setOrigin(0, 0).setScrollFactor(0).setDepth(101);
        this.toxicBar = this.add.rectangle(51, 67, 0, 16, 0xff6600).setOrigin(0, 0).setScrollFactor(0).setDepth(102);

        this.toxicText = this.add.text(260, 75, '0%', {
            fontSize: '13px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(103);

        this.toxicity = 0;

        this.weaponPanel = this.add.container(width - 230, 10).setScrollFactor(0).setDepth(101);

        const wpnBg = this.add.rectangle(0, 0, 220, 80, 0x000000, 0.5);
        wpnBg.setStrokeStyle(2, this.character.color, 0.8);
        this.weaponPanel.add(wpnBg);

        this.weaponTitle = this.add.text(0, -25, 'ARMA', {
            fontSize: '12px',
            fill: '#aaaaaa',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.weaponPanel.add(this.weaponTitle);

        this.weaponText = this.add.text(0, -5, 'Ibu-MachineGun', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.weaponPanel.add(this.weaponText);

        this.weaponLevel = this.add.text(0, 15, 'Nivel 1', {
            fontSize: '14px',
            fill: '#00ff00'
        }).setOrigin(0.5);
        this.weaponPanel.add(this.weaponLevel);

        this.itemsPanel = this.add.container(width / 2, height - 80).setScrollFactor(0).setDepth(101);

        const itemsBg = this.add.rectangle(0, 0, 300, 70, 0x000000, 0.5);
        itemsBg.setStrokeStyle(2, this.character.color, 0.8);
        this.itemsPanel.add(itemsBg);

        this.itemsPanel.add(this.add.text(0, -25, 'ITEMS EQUIPADOS', {
            fontSize: '12px',
            fill: '#aaaaaa',
            fontStyle: 'bold'
        }).setOrigin(0.5));

        this.itemSlots = [];
        for (let i = 0; i < 2; i++) {
            const slot = this.add.container(-70 + (i * 140), 5);

            const slotBg = this.add.rectangle(0, 0, 120, 40, 0x1a1a2e);
            slotBg.setStrokeStyle(2, 0x444466);
            slot.add(slotBg);

            const slotText = this.add.text(0, 0, `[${i + 4}] VACÍO`, {
                fontSize: '12px',
                fill: '#666666'
            }).setOrigin(0.5);
            slot.add(slotText);

            this.itemsPanel.add(slot);
            this.itemSlots.push(slotText);
        }

        const gameScene = this.scene.get('GameSceneV2');
        gameScene.events.on('health-update', this.updateHealth, this);
        gameScene.events.on('toxicity-update', this.updateToxicity, this);
        gameScene.events.on('weapon-change', this.updateWeapon, this);
        gameScene.events.on('item-equip', this.updateItem, this);
        gameScene.events.on('game-over', this.showGameOver, this);

        this.updateHealth(this.character.health, this.character.health);
    }

    updateHealth(current, max) {
        const percent = Phaser.Math.Clamp(current / max, 0, 1);
        this.healthBar.width = 202 * percent;

        if (percent > 0.5) {
            this.healthBar.setFillStyle(0x00ff00);
        } else if (percent > 0.25) {
            this.healthBar.setFillStyle(0xffff00);
        } else {
            this.healthBar.setFillStyle(0xff0000);
        }

        this.healthText.setText(`${Math.max(0, Math.floor(current))}/${max}`);
    }

    updateToxicity(value) {
        this.toxicity = Phaser.Math.Clamp(value, 0, 100);
        this.toxicBar.width = 202 * (this.toxicity / 100);

        if (this.toxicity < 50) {
            this.toxicBar.setFillStyle(0x00ff00);
        } else if (this.toxicity < 80) {
            this.toxicBar.setFillStyle(0xffaa00);
        } else {
            this.toxicBar.setFillStyle(0xff0000);
        }

        this.toxicText.setText(`${Math.floor(this.toxicity)}%`);
    }

    updateWeapon(name, level) {
        this.weaponText.setText(name);
        this.weaponLevel.setText(`Nivel ${level}`);

        this.tweens.add({
            targets: this.weaponPanel,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 150,
            yoyo: true
        });
    }

    updateItem(slot, itemName) {
        if (slot >= 0 && slot < this.itemSlots.length) {
            this.itemSlots[slot].setText(`[${slot + 4}] ${itemName}`);
            this.itemSlots[slot].setColor('#00ff00');
        }
    }

    showGameOver(won) {
        const { width, height } = this.cameras.main;

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
            .setScrollFactor(0)
            .setDepth(200);

        const title = this.add.text(width / 2, height / 2 - 100, won ? '¡VICTORIA!' : 'GAME OVER', {
            fontSize: '64px',
            fill: won ? '#00ff00' : '#ff0000',
            stroke: '#000',
            strokeThickness: 8,
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        const gameScene = this.scene.get('GameSceneV2');
        const stats = this.add.text(width / 2, height / 2,
            `Enemigos eliminados: ${gameScene.kills}\nPuntuación: ${gameScene.score}`, {
            fontSize: '24px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

        const restartBtn = this.add.text(width / 2, height / 2 + 100, 'REINICIAR (R)', {
            fontSize: '28px',
            fill: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setInteractive();

        restartBtn.on('pointerover', () => restartBtn.setScale(1.1));
        restartBtn.on('pointerout', () => restartBtn.setScale(1));
        restartBtn.on('pointerdown', () => {
            this.scene.stop('UISceneV2');
            this.scene.stop('GameSceneV2');
            this.scene.start('MainMenu');
        });

        this.input.keyboard.on('keydown-R', () => {
            this.scene.stop('UISceneV2');
            this.scene.stop('GameSceneV2');
            this.scene.start('MainMenu');
        });

        this.tweens.add({
            targets: title,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }
}
