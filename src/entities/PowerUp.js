export const POWERUP_TYPES = {
    VITAMINA_C: {
        name: 'Vitamina C',
        color: 0xffff00,
        duration: 5000,
        effect: 'shield'
    },
    TE_MIEL: {
        name: 'Té con Miel',
        color: 0xffa500,
        duration: 0,
        effect: 'heal'
    },
    CAFEINA: {
        name: 'Cafeína',
        color: 0x8b4513,
        duration: 8000,
        effect: 'speed'
    }
};

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, typeKey) {
        super(scene, x, y, 'powerup');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.typeData = POWERUP_TYPES[typeKey];
        this.typeKey = typeKey;

        this.setTint(this.typeData.color);
        this.setScale(0.8);
        this.setGravityY(400);
        this.setBounce(0.5);
        this.setCollideWorldBounds(true);

        // Animación flotante
        scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Rotación
        scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });

        // Brillo
        scene.tweens.add({
            targets: this,
            alpha: 0.6,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }

    collect(player) {
        switch(this.typeData.effect) {
            case 'shield':
                player.activateShield(this.typeData.duration);
                break;
            case 'heal':
                player.heal(50);
                break;
            case 'speed':
                player.activateSpeedBoost(this.typeData.duration);
                break;
        }

        // Efecto visual
        if (this.scene.particles) {
            this.scene.particles.emitParticleAt(this.x, this.y, 20);
        }

        this.scene.events.emit('powerup-collected', this.typeData.name);
        this.destroy();
    }
}
