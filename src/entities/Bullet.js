export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
    }

    fire(x, y, weaponData, direction, spreadAngle = 0) {
        this.enableBody(true, x, y, true, true);
        
        // Apariencia según medicina
        this.setTint(weaponData.color);
        this.setScale(weaponData.bulletScale);
        
        this.damage = weaponData.damage;
        
        // Velocidad base
        const speed = weaponData.speed;
        const dirFactor = direction === 'left' ? -1 : 1;
        
        // Calculamos velocidad con ángulo (para escopeta)
        this.setVelocityX(speed * Math.cos(spreadAngle) * dirFactor);
        this.setVelocityY(speed * Math.sin(spreadAngle));

        // Rotación visual
        this.rotation = spreadAngle;
        if (direction === 'left') this.flipX = true;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        // Desactivar si sale de pantalla
        if (!this.scene.cameras.main.worldView.contains(this.x, this.y)) {
            this.disableBody(true, true);
        }
    }
}