import { WEAPONS } from '../constants.js';
import { Bullet } from './Bullet.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Físicas Contra
        this.setCollideWorldBounds(true);
        this.setGravityY(800); 
        
        this.speed = 200;
        this.jumpPower = -500;
        this.health = 100;
        this.isHit = false;

        // Arsenal
        this.currentWeapon = WEAPONS.IBUPROFENO;
        this.lastFired = 0;
        
        // Pool de balas (aumentado para escopeta)
        this.bullets = scene.physics.add.group({
            classType: Bullet,
            maxSize: 60,
            runChildUpdate: true
        });

        // Inputs
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keyJump = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.keyShoot = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.keysWeapon = scene.input.keyboard.addKeys('ONE,TWO,THREE');

        this.facingRight = true;
    }

    update(time) {
        if (this.health <= 0) return;

        // 1. Movimiento
        if (this.cursors.left.isDown) {
            this.setVelocityX(-this.speed);
            this.facingRight = false;
            this.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.setVelocityX(this.speed);
            this.facingRight = true;
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }

        // 2. Salto
        if ((this.cursors.up.isDown || this.keyJump.isDown) && this.body.touching.down) {
            this.setVelocityY(this.jumpPower);
        }

        // 3. Cambio de Arma
        if (Phaser.Input.Keyboard.JustDown(this.keysWeapon.ONE)) this.changeWeapon(WEAPONS.IBUPROFENO);
        if (Phaser.Input.Keyboard.JustDown(this.keysWeapon.TWO)) this.changeWeapon(WEAPONS.PARACETAMOL);
        if (Phaser.Input.Keyboard.JustDown(this.keysWeapon.THREE)) this.changeWeapon(WEAPONS.DICLOFENAC);

        // 4. Disparo
        if ((this.keyShoot.isDown || this.cursors.space.isDown) && time > this.lastFired) {
            this.shoot(time);
        }
    }

    changeWeapon(weapon) {
        this.currentWeapon = weapon;
        this.scene.events.emit('weapon-change', weapon.name);
    }

    shoot(time) {
        const direction = this.facingRight ? 'right' : 'left';
        const startX = this.facingRight ? this.x + 20 : this.x - 20;

        // Lógica según tipo de arma
        if (this.currentWeapon.type === 'shotgun') {
            // Escopeta: 3 balas con ángulo
            [-0.2, 0, 0.2].forEach(angle => {
                const bullet = this.bullets.get();
                if(bullet) bullet.fire(startX, this.y, this.currentWeapon, direction, angle);
            });
        } else {
            // Normal / Sniper
            const bullet = this.bullets.get();
            if(bullet) bullet.fire(startX, this.y, this.currentWeapon, direction);
        }

        this.lastFired = time + this.currentWeapon.fireRate;
        
        // Retroceso
        this.setVelocityX(this.facingRight ? -50 : 50);
        
        // Emitir evento de Toxicidad
        this.scene.events.emit('player-shoot', this.currentWeapon.toxicityCost);
    }

    takeDamage(amount) {
        if(this.isHit) return;
        
        this.health -= amount;
        this.isHit = true;
        this.setTint(0xff0000);
        
        // Invulnerabilidad temporal
        this.scene.time.delayedCall(500, () => {
            this.isHit = false;
            this.clearTint();
        });

        if (this.health <= 0) {
            this.setTint(0x000000);
            this.setVelocity(0);
            this.scene.events.emit('game-over');
        }
    }
}