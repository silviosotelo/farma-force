export const DROP_ITEMS = {
    WEAPON_UPGRADE: {
        name: 'Mejora de Arma',
        color: 0xffaa00,
        icon: 'upgrade',
        rarity: 'rare',
        effect: 'weapon_upgrade'
    },
    HEALTH_PACK: {
        name: 'Paquete Médico',
        color: 0x00ff00,
        icon: 'health',
        rarity: 'common',
        effect: 'heal_50'
    },
    MAX_HEALTH_UP: {
        name: 'Aumento HP Máximo',
        color: 0xff00ff,
        icon: 'maxhp',
        rarity: 'epic',
        effect: 'max_health_up'
    },
    CRIT_BOOST: {
        name: 'Potenciador Crítico',
        color: 0xff0000,
        icon: 'crit',
        rarity: 'rare',
        effect: 'crit_boost'
    },
    SPEED_BOOST: {
        name: 'Inyección de Adrenalina',
        color: 0xffff00,
        icon: 'speed',
        rarity: 'uncommon',
        effect: 'speed_boost'
    },
    NANO_SHIELD: {
        name: 'Nano-Escudo',
        color: 0x00ffff,
        icon: 'shield',
        rarity: 'epic',
        effect: 'equip_shield',
        equipable: true,
        cooldown: 15000,
        use: (player, scene) => {
            player.hasShield = true;
            const shield = scene.add.circle(player.x, player.y, 50, 0x00ffff, 0.3);
            shield.setStrokeStyle(4, 0x00ffff);
            player.shieldGraphic = shield;

            scene.tweens.add({
                targets: shield,
                scaleX: 1.2,
                scaleY: 1.2,
                alpha: 0.1,
                duration: 400,
                yoyo: true,
                repeat: -1
            });

            scene.time.delayedCall(8000, () => {
                player.hasShield = false;
                if (shield) shield.destroy();
            });

            scene.events.emit('effect-activated', '¡Nano-Escudo Activado!');
        }
    },
    TURBO_BOOST: {
        name: 'Turbo Molecular',
        color: 0xff6600,
        icon: 'turbo',
        rarity: 'rare',
        effect: 'equip_turbo',
        equipable: true,
        cooldown: 20000,
        use: (player, scene) => {
            player.speedMultiplier = 2.5;
            player.setTint(0xff6600);

            const trail = scene.add.particles(player.x, player.y, 'bullet', {
                speed: { min: 40, max: 80 },
                scale: { start: 0.6, end: 0 },
                blendMode: 'ADD',
                lifespan: 500,
                follow: player,
                tint: 0xff6600,
                quantity: 3
            });

            scene.time.delayedCall(10000, () => {
                player.speedMultiplier = 1;
                player.clearTint();
                trail.destroy();
            });

            scene.events.emit('effect-activated', '¡Turbo Activado!');
        }
    }
};

export class ItemDrop extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, itemType) {
        super(scene, x, y, 'powerup');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.itemData = DROP_ITEMS[itemType];
        this.itemType = itemType;

        this.setTint(this.itemData.color);
        this.setScale(0.6);
        this.setGravityY(300);
        this.setBounce(0.6);
        this.setVelocity(
            Phaser.Math.Between(-100, 100),
            Phaser.Math.Between(-200, -100)
        );

        const rarityColors = {
            common: 0xaaaaaa,
            uncommon: 0x00ff00,
            rare: 0x0088ff,
            epic: 0xff00ff
        };

        const glow = scene.add.circle(x, y, 25, rarityColors[this.itemData.rarity], 0.2);
        this.glowCircle = glow;

        scene.tweens.add({
            targets: glow,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 1000,
            repeat: -1
        });

        scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 2000,
            repeat: -1
        });

        scene.tweens.add({
            targets: this,
            scaleX: 0.7,
            scaleY: 0.7,
            duration: 600,
            yoyo: true,
            repeat: -1
        });

        const text = scene.add.text(x, y - 40, this.itemData.name, {
            fontSize: '12px',
            fill: Phaser.Display.Color.IntegerToColor(this.itemData.color).rgba,
            stroke: '#000',
            strokeThickness: 3,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.nameText = text;

        scene.time.delayedCall(20000, () => {
            scene.tweens.add({
                targets: [this, glow, text],
                alpha: 0,
                duration: 1000,
                onComplete: () => this.destroy()
            });
        });
    }

    collect(player) {
        const effect = this.itemData.effect;

        if (this.itemData.equipable) {
            const emptySlot = player.equippedItems.findIndex(item => item === null);
            if (emptySlot !== -1) {
                player.equipItem(this.itemData, emptySlot);
            } else {
                this.scene.events.emit('notification', 'Slots de items llenos!');
                return;
            }
        } else {
            switch(effect) {
                case 'weapon_upgrade':
                    player.upgradeWeapon(player.currentWeaponIndex);
                    break;
                case 'heal_50':
                    player.heal(50);
                    break;
                case 'max_health_up':
                    player.maxHealth += 20;
                    player.health += 20;
                    this.scene.events.emit('player-health', player.health, player.maxHealth);
                    break;
                case 'crit_boost':
                    player.critChance = Math.min(player.critChance + 0.05, 0.5);
                    this.scene.events.emit('notification', `Crítico: ${Math.floor(player.critChance * 100)}%`);
                    break;
                case 'speed_boost':
                    player.speed += 20;
                    this.scene.events.emit('notification', `Velocidad: ${player.speed}`);
                    break;
            }
        }

        if (this.scene.particles) {
            this.scene.particles.emitParticleAt(this.x, this.y, 25);
        }

        this.scene.events.emit('item-collected', this.itemData.name);

        if (this.glowCircle) this.glowCircle.destroy();
        if (this.nameText) this.nameText.destroy();
        this.destroy();
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.glowCircle) {
            this.glowCircle.setPosition(this.x, this.y);
        }
        if (this.nameText) {
            this.nameText.setPosition(this.x, this.y - 40);
        }
    }

    destroy() {
        if (this.glowCircle) this.glowCircle.destroy();
        if (this.nameText) this.nameText.destroy();
        super.destroy();
    }
}
