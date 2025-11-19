import { WEAPONS } from '../constants.js';
import { Bullet } from './Bullet.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player'); // Usamos un cuadrado simple por ahora
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.speed = 300;
        
        // Sistema de Armas
        this.currentWeapon = WEAPONS.IBUPROFENO;
        this.lastFired = 0;
        
        // Grupo de balas (Object Pool)
        this.bullets = scene.physics.add.group({
            classType: Bullet,
            maxSize: 30,
            runChildUpdate: true
        });

        // Controles
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.key1 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
        this.key2 = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    }

    update(time) {
        // Movimiento
        this.setVelocity(0);
        if (this.cursors.left.isDown) this.setVelocityX(-this.speed);
        else if (this.cursors.right.isDown) this.setVelocityX(this.speed);
        if (this.cursors.up.isDown) this.setVelocityY(-this.speed);
        else if (this.cursors.down.isDown) this.setVelocityY(this.speed);

        // Cambio de Arma
        if (Phaser.Input.Keyboard.JustDown(this.key1)) this.currentWeapon = WEAPONS.IBUPROFENO;
        if (Phaser.Input.Keyboard.JustDown(this.key2)) this.currentWeapon = WEAPONS.PARACETAMOL;

        // Disparo (Espacio)
        if (this.cursors.space.isDown && time > this.lastFired) {
            this.shoot(time);
        }
    }

    shoot(time) {
        const bullet = this.bullets.get();
        
        if (bullet) {
            bullet.fire(this.x, this.y, this.currentWeapon, 'right');
            this.lastFired = time + this.currentWeapon.fireRate;
            
            // Emitir evento para que la UI actualice la toxicidad
            this.scene.events.emit('player-shoot', this.currentWeapon.toxicityCost);
        }
    }
}