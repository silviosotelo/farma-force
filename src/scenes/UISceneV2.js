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
        hudBg.fillStyle(0x000000, 0.7);
        hudBg.fillRect(0, 0, width, 140);
        hudBg.setScrollFactor(0).setDepth(100);

        this.add.line(0, 140, 0, 0, width, 0, this.character.color, 1)
            .setOrigin(0, 0)
            .setLineWidth(3)
            .setScrollFactor(0)
            .setDepth(101);

        const titleBg = this.add.rectangle(width / 2, 30, 500, 50, 0x000000, 0.8)
            .setScrollFactor(0)
            .setDepth(100);

        const levelTitle = this.add.text(width / 2, 30, this.levelName, {
            fontSize: '26px',
            fill: Phaser.Display.Color.IntegerToColor(this.character.color).rgba,
            stroke: '#000',
            strokeThickness: 5,
            fontStyle: 'bold',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        this.tweens.add({
            targets: [titleBg, levelTitle],
            alpha: 0.8,
            duration: 1200,
            yoyo: true,
            repeat: -1
        });

        const healthLabel = this.add.text(20, 70, 'HP', {
            fontSize: '18px',
            fill: '#ff0000',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(101);

        this.add.rectangle(20, 95, 254, 28, 0x220000).setOrigin(0, 0).setScrollFactor(0).setDepth(101);
        this.add.rectangle(22, 97, 250, 24, 0x440000).setOrigin(0, 0).setScrollFactor(0).setDepth(101);
        this.healthBar = this.add.rectangle(22, 97, 250, 24, 0x00ff00).setOrigin(0, 0).setScrollFactor(0).setDepth(102);

        this.healthText = this.add.text(147, 109, '100/100', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(103);

        const toxicLabel = this.add.text(300, 70, 'TOXICIDAD', {
            fontSize: '18px',
            fill: '#ffaa00',
            fontStyle: 'bold'
        }).setScrollFactor(0).setDepth(101);

        this.add.rectangle(300, 95, 204, 28, 0x332200).setOrigin(0, 0).setScrollFactor(0).setDepth(101);
        this.add.rectangle(302, 97, 200, 24, 0x664400).setOrigin(0, 0).setScrollFactor(0).setDepth(101);
        this.toxicBar = this.add.rectangle(302, 97, 0, 24, 0x00ff00).setOrigin(0, 0).setScrollFactor(0).setDepth(102);

        this.toxicText = this.add.text(402, 109, '0%', {
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(103);

        this.toxicity = 0;

        this.weaponPanel = this.add.container(width - 280, 20).setScrollFactor(0).setDepth(101);

        const wpnBg = this.add.rectangle(0, 0, 260, 110, 0x000000, 0.6);
        wpnBg.setStrokeStyle(2, this.character.color);
        this.weaponPanel.add(wpnBg);

        this.weaponTitle = this.add.text(0, -40, 'ARMA ACTUAL', {
            fontSize: '14px',
            fill: '#aaaaaa',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.weaponPanel.add(this.weaponTitle);

        this.weaponText = this.add.text(0, -10, 'Ibu-MachineGun', {
            fontSize: '20px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.weaponPanel.add(this.weaponText);

        this.weaponLevel = this.add.text(0, 15, 'Nivel: 1', {
            fontSize: '16px',
            fill: '#ffaa00'
        }).setOrigin(0.5);
        this.weaponPanel.add(this.weaponLevel);

        this.weaponSlots = [];
        for (let i = 0; i < 3; i++) {
            const slot = this.add.rectangle(-80 + (i * 80), 45, 60, 20, 0x444444, 0.5);
            slot.setStrokeStyle(1, 0xffffff);
            this.weaponPanel.add(slot);

            const slotText = this.add.text(-80 + (i * 80), 45, `${i + 1}`, {
                fontSize: '14px',
                fill: '#ffffff'
            }).setOrigin(0.5);
            this.weaponPanel.add(slotText);

            this.weaponSlots.push({ bg: slot, text: slotText });
        }

        this.itemPanel = this.add.container(width - 280, 160).setScrollFactor(0).setDepth(101);

        const itemBg = this.add.rectangle(0, 0, 260, 90, 0x000000, 0.6);
        itemBg.setStrokeStyle(2, 0x00ffff);
        this.itemPanel.add(itemBg);

        this.itemPanel.add(this.add.text(0, -30, 'ITEMS EQUIPADOS', {
            fontSize: '14px',
            fill: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5));

        this.itemSlots = [];
        for (let i = 0; i < 2; i++) {
            const slot = this.add.rectangle(-60 + (i * 120), 10, 100, 50, 0x003333, 0.8);
            slot.setStrokeStyle(2, 0x00ffff);
            this.itemPanel.add(slot);

            const slotNum = this.add.text(-60 + (i * 120), -10, `[${i + 4}]`, {
                fontSize: '12px',
                fill: '#888888'
            }).setOrigin(0.5);
            this.itemPanel.add(slotNum);

            const itemText = this.add.text(-60 + (i * 120), 10, 'Vacío', {
                fontSize: '11px',
                fill: '#666666'
            }).setOrigin(0.5);
            this.itemPanel.add(itemText);

            this.itemSlots.push({ bg: slot, text: itemText, num: slotNum });
        }

        this.notificationText = this.add.text(width / 2, 180, '', {
            fontSize: '28px',
            fill: '#ffff00',
            stroke: '#000',
            strokeThickness: 5,
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(104).setAlpha(0);

        this.critIndicator = this.add.text(width / 2, height / 2 - 100, '', {
            fontSize: '48px',
            fill: '#ff0000',
            stroke: '#000',
            strokeThickness: 6,
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(105).setAlpha(0);

        const game = this.scene.get('GameSceneV2');
        if (game) {
            game.events.on('player-shoot', (cost) => this.addToxicity(cost));
            game.events.on('weapon-change', (name, level) => this.updateWeapon(name, level));
            game.events.on('player-health', (health, maxHealth) => this.updateHealth(health, maxHealth));
            game.events.on('effect-activated', (msg) => this.showNotification(msg));
            game.events.on('item-collected', (name) => this.showNotification(`✓ ${name}`));
            game.events.on('item-equipped', (item, slot) => this.updateItemSlot(item, slot));
            game.events.on('item-used', (item, slot) => this.showItemUsed(slot));
            game.events.on('weapon-upgrade', (name, level) => {
                this.showNotification(`⬆ ${name} - Nivel ${level}`);
            });
            game.events.on('critical-hit', () => this.showCritical());
            game.events.on('enemy-killed', (score) => {
                this.addScore(score);
            });
        }

        this.time.addEvent({
            delay: 400,
            callback: () => this.addToxicity(-3),
            loop: true
        });
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

        if (this.toxicity > 95) {
            this.cameras.main.flash(120, 255, 0, 0, false, 0.25);
        }
    }

    updateHealth(health, maxHealth) {
        const percentage = Math.max(0, health) / maxHealth;
        this.healthBar.width = 250 * percentage;
        this.healthText.setText(`${Math.max(0, Math.floor(health))}/${maxHealth}`);

        if (percentage > 0.6) {
            this.healthBar.fillColor = 0x00ff00;
        } else if (percentage > 0.3) {
            this.healthBar.fillColor = 0xffaa00;
        } else {
            this.healthBar.fillColor = 0xff0000;
        }
    }

    updateWeapon(name, level) {
        this.weaponText.setText(name);
        this.weaponLevel.setText(`Nivel: ${level}`);

        this.tweens.add({
            targets: this.weaponPanel,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 200,
            yoyo: true
        });
    }

    updateItemSlot(item, slot) {
        if (slot >= 0 && slot < 2) {
            this.itemSlots[slot].text.setText(item.name);
            this.itemSlots[slot].text.setFill(
                Phaser.Display.Color.IntegerToColor(item.color).rgba
            );
        }
    }

    showItemUsed(slot) {
        if (slot >= 0 && slot < 2) {
            this.tweens.add({
                targets: this.itemSlots[slot].bg,
                alpha: 0.3,
                duration: 200,
                yoyo: true,
                repeat: 2
            });
        }
    }

    showNotification(message) {
        this.notificationText.setText(message);
        this.notificationText.setAlpha(1);

        this.tweens.add({
            targets: this.notificationText,
            alpha: 0,
            y: 160,
            duration: 2500,
            ease: 'Power2',
            onComplete: () => {
                this.notificationText.y = 180;
            }
        });
    }

    showCritical() {
        this.critIndicator.setText('★ CRÍTICO ★');
        this.critIndicator.setAlpha(1);
        this.critIndicator.setScale(0.5);

        this.tweens.add({
            targets: this.critIndicator,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 800,
            ease: 'Power2'
        });
    }

    addScore(points) {
        // Implementar sistema de puntos si se desea
    }
}
