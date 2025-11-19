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
        
        this.speed = 250;
        this.jumpPower = -500;
        this.health = 100;
        this.maxHealth = 100;
        this.isHit = false;

        // Mejoras de movimiento
        this.canDoubleJump = true;
        this.hasDoubleJumped = false;
        this.isDashing = false;
        this.dashCooldown = 0;
        this.dashSpeed = 600;
        this.dashDuration = 200;

        // Power-ups
        this.hasShield = false;
        this.speedMultiplier = 1;
        this.activeEffects = [];

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
        this.keyDash = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.keysWeapon = scene.input.keyboard.addKeys('ONE,TWO,THREE');

        this.facingRight = true;
    }

    update(time) {
        if (this.health <= 0) return;

        // Reset doble salto al tocar suelo
        if (this.body.touching.down) {
            this.hasDoubleJumped = false;
        }

        // Actualizar posición del escudo
        if (this.shieldGraphic) {
            this.shieldGraphic.setPosition(this.x, this.y);
        }

        // 1. Movimiento mejorado con aceleración y speed boost
        const effectiveSpeed = this.speed * this.speedMultiplier;

        if (!this.isDashing) {
            if (this.cursors.left.isDown) {
                this.setVelocityX(-effectiveSpeed);
                this.facingRight = false;
                this.setFlipX(true);
            } else if (this.cursors.right.isDown) {
                this.setVelocityX(effectiveSpeed);
                this.facingRight = true;
                this.setFlipX(false);
            } else {
                // Fricción suave
                this.setVelocityX(this.body.velocity.x * 0.85);
            }
        }

        // 2. Salto con doble salto
        if (Phaser.Input.Keyboard.JustDown(this.keyJump) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            if (this.body.touching.down) {
                this.setVelocityY(this.jumpPower);
                this.scene.cameras.main.shake(50, 0.002);
            } else if (this.canDoubleJump && !this.hasDoubleJumped) {
                this.setVelocityY(this.jumpPower * 0.8);
                this.hasDoubleJumped = true;
                this.scene.cameras.main.shake(50, 0.002);
                // Efecto de partículas
                if (this.scene.particles) {
                    this.scene.particles.emitParticleAt(this.x, this.y, 8);
                }
            }
        }

        // 3. Dash
        if (Phaser.Input.Keyboard.JustDown(this.keyDash) && time > this.dashCooldown && !this.isDashing) {
            this.startDash(time);
        }

        // 4. Cambio de Arma
        if (Phaser.Input.Keyboard.JustDown(this.keysWeapon.ONE)) this.changeWeapon(WEAPONS.IBUPROFENO);
        if (Phaser.Input.Keyboard.JustDown(this.keysWeapon.TWO)) this.changeWeapon(WEAPONS.PARACETAMOL);
        if (Phaser.Input.Keyboard.JustDown(this.keysWeapon.THREE)) this.changeWeapon(WEAPONS.DICLOFENAC);

        // 5. Disparo
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

    startDash(time) {
        this.isDashing = true;
        this.dashCooldown = time + 1000;

        const dashVelocity = this.facingRight ? this.dashSpeed : -this.dashSpeed;
        this.setVelocityX(dashVelocity);

        // Efecto visual
        this.setAlpha(0.6);
        this.scene.cameras.main.shake(100, 0.003);

        // Trail de partículas
        const trail = this.scene.add.particles(this.x, this.y, 'bullet', {
            speed: 50,
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 300,
            quantity: 2,
            tint: 0x00ffff
        });

        this.scene.time.delayedCall(this.dashDuration, () => {
            this.isDashing = false;
            this.setAlpha(1);
            trail.destroy();
        });
    }

    takeDamage(amount) {
        if(this.isHit || this.isDashing) return;

        // El escudo absorbe el daño
        if (this.hasShield) {
            this.hasShield = false;
            if (this.shieldGraphic) this.shieldGraphic.destroy();
            this.scene.cameras.main.flash(200, 255, 255, 0);
            this.scene.events.emit('effect-activated', '¡Escudo Bloqueó el Ataque!');
            return;
        }

        this.health -= amount;
        this.isHit = true;
        this.setTint(0xff0000);

        // Screen shake
        this.scene.cameras.main.shake(200, 0.01);

        // Emitir evento para actualizar UI
        this.scene.events.emit('player-health', this.health, this.maxHealth);

        // Invulnerabilidad temporal con parpadeo
        let blinks = 0;
        const blinkTimer = this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                this.setAlpha(this.alpha === 1 ? 0.3 : 1);
                blinks++;
                if (blinks >= 8) {
                    blinkTimer.remove();
                    this.setAlpha(1);
                    this.isHit = false;
                    this.clearTint();
                }
            },
            loop: true
        });

        if (this.health <= 0) {
            this.setTint(0x000000);
            this.setVelocity(0);
            this.scene.cameras.main.shake(500, 0.02);
            this.scene.events.emit('game-over');
        }
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
        this.scene.events.emit('player-health', this.health, this.maxHealth);

        // Efecto visual
        const healText = this.scene.add.text(this.x, this.y - 30, `+${amount}`, {
            fontSize: '20px',
            fill: '#00ff00',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: healText,
            y: healText.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => healText.destroy()
        });
    }

    activateShield(duration) {
        this.hasShield = true;

        // Efecto visual de escudo
        const shield = this.scene.add.circle(this.x, this.y, 40, 0xffff00, 0.3);
        shield.setStrokeStyle(3, 0xffff00);
        this.shieldGraphic = shield;

        this.scene.tweens.add({
            targets: shield,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.1,
            duration: 300,
            yoyo: true,
            repeat: -1
        });

        this.scene.time.delayedCall(duration, () => {
            this.hasShield = false;
            if (shield) shield.destroy();
        });

        this.scene.events.emit('effect-activated', 'Escudo Activo');
    }

    activateSpeedBoost(duration) {
        this.speedMultiplier = 1.8;
        this.setTint(0xffaa00);

        // Trail de velocidad
        const speedTrail = this.scene.add.particles(this.x, this.y, 'bullet', {
            speed: { min: 20, max: 50 },
            scale: { start: 0.4, end: 0 },
            blendMode: 'ADD',
            lifespan: 400,
            follow: this,
            tint: 0xffaa00
        });

        this.scene.time.delayedCall(duration, () => {
            this.speedMultiplier = 1;
            this.clearTint();
            speedTrail.destroy();
        });

        this.scene.events.emit('effect-activated', 'Velocidad Aumentada');
    }
}