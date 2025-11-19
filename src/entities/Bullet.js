export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
        this.isCrit = false;
        this.critTrail = null;
    }

    fire(x, y, weaponData, direction, spreadAngle = 0) {
        this.enableBody(true, x, y, true, true);

        this.setTint(weaponData.color);
        this.setScale(weaponData.bulletScale);

        this.damage = weaponData.damage;

        const speed = weaponData.speed;
        const dirFactor = direction === 'left' ? -1 : 1;

        this.setVelocityX(speed * Math.cos(spreadAngle) * dirFactor);
        this.setVelocityY(speed * Math.sin(spreadAngle));

        this.rotation = spreadAngle;
        if (direction === 'left') this.flipX = true;
    }

    fireAtAngle(x, y, weapon, angle, damage, isCrit = false) {
        this.enableBody(true, x, y, true, true);

        this.damage = damage;
        this.isCrit = isCrit;

        this.setTint(isCrit ? 0xff0000 : weapon.color);
        this.setScale(weapon.bulletScale * (isCrit ? 1.4 : 1));

        const velocityX = Math.cos(angle) * weapon.speed;
        const velocityY = Math.sin(angle) * weapon.speed;

        this.setVelocity(velocityX, velocityY);
        this.setRotation(angle);

        if (isCrit) {
            const trail = this.scene.add.particles(this.x, this.y, 'bullet', {
                speed: 30,
                scale: { start: 0.6, end: 0 },
                blendMode: 'ADD',
                lifespan: 400,
                follow: this,
                tint: 0xff0000,
                quantity: 2
            });

            this.critTrail = trail;
        }
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.x < -100 || this.x > this.scene.physics.world.bounds.width + 100 ||
            this.y < -100 || this.y > 700) {
            if (this.critTrail) {
                this.critTrail.destroy();
                this.critTrail = null;
            }
            this.disableBody(true, true);
        }
    }
}
