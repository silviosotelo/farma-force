import { ENEMIES } from '../constants.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, typeKey) {
        const data = ENEMIES[typeKey];
        super(scene, x, y, data.texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.dataConfig = data;
        this.hp = data.hp;
        this.maxHp = data.hp;
        this.isBoss = typeKey.includes('REY') || typeKey.includes('TITAN') || typeKey.includes('NUBE');
        this.typeKey = typeKey;
        this.lastAttack = 0;
        this.attackCooldown = data.attackCooldown || 2000;

        // Escalar si es Jefe
        if (data.scale) this.setScale(data.scale);

        // Físicas
        if (data.fly) {
            this.setGravityY(0);
        } else {
            this.setGravityY(800);
            this.setCollideWorldBounds(true);
        }

        this.target = null;

        // Barra de vida para jefes
        if (this.isBoss) {
            this.createHealthBar();
        }

        // Patrón de movimiento especial para voladores
        if (data.fly) {
            this.hoverOffset = 0;
        }
    }

    setTarget(player) {
        this.target = player;
    }

    createHealthBar() {
        const barWidth = 100;
        const barHeight = 8;

        this.healthBarBg = this.scene.add.rectangle(this.x, this.y - 50, barWidth, barHeight, 0x000000, 0.7);
        this.healthBarFill = this.scene.add.rectangle(this.x, this.y - 50, barWidth, barHeight, 0xff0000);
        this.healthBarFill.setOrigin(0, 0.5);
        this.healthBarFill.x = this.x - barWidth / 2;

        this.bossNameText = this.scene.add.text(this.x, this.y - 65, this.dataConfig.bossName || 'JEFE', {
            fontSize: '14px',
            fill: '#ff0000',
            stroke: '#000',
            strokeThickness: 3,
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    updateHealthBar() {
        if (!this.isBoss) return;

        const percentage = this.hp / this.maxHp;
        this.healthBarFill.width = 100 * percentage;
        this.healthBarBg.setPosition(this.x, this.y - 50);
        this.healthBarFill.setPosition(this.x - 50, this.y - 50);
        this.bossNameText.setPosition(this.x, this.y - 65);
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.setTint(0xffaaaa);
        this.scene.time.delayedCall(50, () => this.clearTint());

        // Actualizar barra de vida
        if (this.isBoss) {
            this.updateHealthBar();
        }

        // Texto de daño flotante
        const damageText = this.scene.add.text(this.x, this.y - 20, `-${amount}`, {
            fontSize: '16px',
            fill: '#ffffff',
            stroke: '#ff0000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 30,
            alpha: 0,
            duration: 800,
            onComplete: () => damageText.destroy()
        });

        if (this.hp <= 0) {
            // Particulas masivas
            if(this.scene.particles) {
                this.scene.particles.emitParticleAt(this.x, this.y, this.isBoss ? 50 : 10);
            }

            // Limpiar barra de vida
            if (this.isBoss) {
                if (this.healthBarBg) this.healthBarBg.destroy();
                if (this.healthBarFill) this.healthBarFill.destroy();
                if (this.bossNameText) this.bossNameText.destroy();
                this.scene.levelComplete();
            } else {
                this.scene.events.emit('enemy-killed', this.dataConfig.score);
            }
            this.destroy();
        }
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        
        // Despawn si queda muy atrás de la cámara (Optimización)
        if (!this.isBoss && this.x < this.scene.cameras.main.scrollX - 100) {
            this.destroy();
            return;
        }

        if (!this.target || !this.scene) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);

        // Actualizar barra de vida si es jefe
        if (this.isBoss) {
            this.updateHealthBar();
        }

        // IA mejorada
        if (dist < 800) {
            if (this.dataConfig.fly) {
                // Volador: Patrón sinusoidal
                this.hoverOffset += 0.05;
                const targetY = this.target.y + Math.sin(this.hoverOffset) * 80;

                this.scene.physics.moveTo(this, this.target.x, targetY, this.dataConfig.speed);

                // Atacar desde lejos (JAQUECAS disparan)
                if (this.typeKey === 'JAQUECA' || this.typeKey === 'MIGRAÑA_NUBE') {
                    if (time > this.lastAttack && dist < 400) {
                        this.rangedAttack();
                        this.lastAttack = time + this.attackCooldown;
                    }
                }
            } else {
                // Caminante
                if (this.x < this.target.x) {
                    this.setVelocityX(this.dataConfig.speed);
                    this.setFlipX(true);
                } else {
                    this.setVelocityX(-this.dataConfig.speed);
                    this.setFlipX(false);
                }

                // Saltar obstáculos
                if(this.body.blocked.left || this.body.blocked.right) {
                    if(this.body.touching.down) this.setVelocityY(-400);
                }

                // Jefes tienen patrones especiales
                if (this.isBoss && time > this.lastAttack) {
                    if (dist < 300) {
                        this.bossAttack();
                        this.lastAttack = time + this.attackCooldown;
                    }
                }
            }
        }
    }

    rangedAttack() {
        if (!this.scene || !this.target) return;

        // Crear proyectil enemigo
        const bullet = this.scene.add.circle(this.x, this.y, 6, 0xff00ff);
        this.scene.physics.add.existing(bullet);

        // Dirección hacia el jugador
        this.scene.physics.moveTo(bullet, this.target.x, this.target.y, 300);

        // Destruir después de 3 segundos
        this.scene.time.delayedCall(3000, () => {
            if (bullet && bullet.active) bullet.destroy();
        });

        // Colisión con jugador
        this.scene.physics.add.overlap(bullet, this.target, () => {
            this.target.takeDamage(10);
            bullet.destroy();
        });
    }

    bossAttack() {
        // Ataque especial de jefes: shockwave
        const shockwave = this.scene.add.circle(this.x, this.y, 20, 0xff0000, 0.5);
        this.scene.physics.add.existing(shockwave);

        this.scene.tweens.add({
            targets: shockwave,
            scaleX: 5,
            scaleY: 5,
            alpha: 0,
            duration: 600,
            onComplete: () => shockwave.destroy()
        });

        // Chequear colisión durante la animación
        const checkCollision = this.scene.time.addEvent({
            delay: 50,
            callback: () => {
                const dist = Phaser.Math.Distance.Between(shockwave.x, shockwave.y, this.target.x, this.target.y);
                if (dist < shockwave.scaleX * 20) {
                    this.target.takeDamage(15);
                    checkCollision.remove();
                }
            },
            repeat: 10
        });
    }
}