export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'bullet'); // 'bullet' es la key de la textura
    }

    fire(x, y, weaponData, direction) {
        this.body.reset(x, y);
        this.setActive(true);
        this.setVisible(true);
        
        // Aplicar propiedades del arma actual
        this.setTint(weaponData.color);
        this.damage = weaponData.damage;
        
        // Velocidad
        this.setVelocityX(direction === 'left' ? -weaponData.speed : weaponData.speed);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        // Si la bala sale de la pantalla, la desactivamos para reusarla
        if (this.x > this.scene.sys.canvas.width || this.x < 0) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}