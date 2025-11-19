export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.target = null; // A quién persigue
        this.speed = 100;   // Velocidad del dolor
        this.health = 30;   // Vida del enemigo
    }

    setTarget(player) {
        this.target = player;
    }

    takeDamage(amount) {
        this.health -= amount;
        
        // Feedback visual (parpadeo blanco)
        this.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => this.clearTint());

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        // Aquí podrías poner animación de explosión
        this.destroy();
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Lógica de persecución simple
        if (this.target && this.target.active) {
            this.scene.physics.moveToObject(this, this.target, this.speed);
        }
    }
}