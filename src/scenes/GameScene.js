import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // 1. Interfaz
        this.scene.launch('UIScene');

        // 2. Jugador
        this.player = new Player(this, 400, 300);

        // 3. Grupo de Enemigos
        this.enemies = this.add.group({
            classType: Enemy,
            runChildUpdate: true 
        });

        // 4. Generador de Enemigos (Cada 2 segundos)
        this.time.addEvent({
            delay: 2000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // 5. Colisiones
        
        // Bala vs Enemigo
        this.physics.add.overlap(this.player.bullets, this.enemies, (bullet, enemy) => {
            if (bullet.active && enemy.active) {
                bullet.setActive(false);
                bullet.setVisible(false);
                enemy.takeDamage(bullet.damage);
            }
        });

        // Jugador vs Enemigo (Game Over o Daño)
        this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
            this.handlePlayerHit();
        });
    }

    spawnEnemy() {
        // Crear enemigo en posición aleatoria en los bordes
        const x = Phaser.Math.Between(0, 800);
        const y = Phaser.Math.Between(0, 600);
        
        const enemy = new Enemy(this, x, y);
        this.enemies.add(enemy);
        enemy.setTarget(this.player);
    }

    handlePlayerHit() {
        // Por ahora, reiniciamos la escena si te tocan
        this.physics.pause();
        this.player.setTint(0xff0000);
        
        this.time.delayedCall(1000, () => {
            this.scene.restart();
            // Reiniciar toxicidad en UI
            this.scene.get('UIScene').toxicity = 0;
            this.scene.get('UIScene').updateBar();
        });
    }

    update(time, delta) {
        this.player.update(time);
    }
}