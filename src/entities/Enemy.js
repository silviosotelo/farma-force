import { ENEMIES } from '../constants.js';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, typeKey) {
        const data = ENEMIES[typeKey];
        super(scene, x, y, data.texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.dataConfig = data;
        this.hp = data.hp;
        this.maxHp = data.hp; // Para barra de vida del jefe
        this.isBoss = typeKey.includes('REY') || typeKey.includes('TITAN') || typeKey.includes('NUBE');

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
    }

    setTarget(player) {
        this.target = player;
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.setTint(0xffaaaa);
        this.scene.time.delayedCall(50, () => this.clearTint());

        if (this.hp <= 0) {
            // Particulas masivas
            if(this.scene.particles) {
                this.scene.particles.emitParticleAt(this.x, this.y, this.isBoss ? 50 : 10);
            }
            
            if (this.isBoss) {
                this.scene.levelComplete(); // Trigger ganar nivel
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

        // IA
        if (dist < 800) { // Solo si está cerca
            if (this.dataConfig.fly) {
                // Volador: Movimiento directo
                this.scene.physics.moveToObject(this, this.target, this.dataConfig.speed);
            } else {
                // Caminante
                if (this.x < this.target.x) {
                    this.setVelocityX(this.dataConfig.speed);
                    this.setFlipX(true); // Asumiendo sprite mira izquierda
                } else {
                    this.setVelocityX(-this.dataConfig.speed);
                    this.setFlipX(false);
                }
                
                // Saltar obstáculos pequeños
                if(this.body.blocked.left || this.body.blocked.right) {
                    if(this.body.touching.down) this.setVelocityY(-400);
                }
            }
        }
    }
}