import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { LEVELS } from '../constants.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        // Sistema de niveles: Si no se pasa data, empieza en ESTOMAGO
        this.currentLevelKey = data.level || 'ESTOMAGO';
        this.levelData = LEVELS[this.currentLevelKey];
        this.score = data.score || 0;
    }

    create() {
        // 1. CONFIGURACIÓN DE MUNDO (METAL SLUG STYLE)
        // El nivel es 5 veces el ancho de la pantalla
        const levelWidth = this.levelData.length;
        this.physics.world.setBounds(0, 0, levelWidth, 600);
        this.cameras.main.setBounds(0, 0, levelWidth, 600);

        // 2. FONDO (Gradiente dinámico según nivel)
        this.createBackground();

        // 3. UI
        this.scene.launch('UIScene', { levelName: this.levelData.name });

        // 4. PLATAFORMAS (Generación Procedural Lineal)
        this.platforms = this.physics.add.staticGroup();
        this.generateTerrain(levelWidth);

        // 5. JUGADOR
        this.player = new Player(this, 100, 400);
        this.cameras.main.startFollow(this.player, true, 0.05, 0.05); // Suavizado
        this.physics.add.collider(this.player, this.platforms);

        // 6. ENEMIGOS
        this.enemies = this.add.group({ runChildUpdate: true });
        this.physics.add.collider(this.enemies, this.platforms);
        
        // Spawner Dinámico (Solo spawnea enemigos cerca de la cámara)
        this.time.addEvent({ delay: 1500, callback: this.dynamicSpawn, callbackScope: this, loop: true });

        // 7. COLISIONES
        this.physics.add.overlap(this.player.bullets, this.enemies, this.handleBulletEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerHit, null, this);

        // 8. JEFE FINAL
        this.bossSpawned = false;
        
        // Partículas
        this.particles = this.add.particles(0, 0, 'bullet', {
            speed: 100, scale: { start: 1, end: 0 }, blendMode: 'ADD', lifespan: 200, emitting: false
        });
    }

    createBackground() {
        // Gradiente simple usando Graphics
        const bg = this.add.graphics();
        bg.fillGradientStyle(
            this.levelData.bgColors[0], this.levelData.bgColors[0], 
            this.levelData.bgColors[1], this.levelData.bgColors[1], 1
        );
        bg.fillRect(0, 0, this.levelData.length, 600);
        bg.setScrollFactor(1); // Se mueve con la cámara pero es base

        // Elementos flotantes (Células) parallax
        this.bgElements = this.add.group();
        for(let i=0; i<50; i++) {
            const x = Phaser.Math.Between(0, this.levelData.length);
            const y = Phaser.Math.Between(0, 600);
            const cell = this.add.image(x, y, 'bg_particle');
            cell.setAlpha(0.3);
            cell.setScrollFactor(0.5); // Parallax: se mueve más lento
            cell.setScale(0.5 + Math.random());
        }
    }

    generateTerrain(width) {
        // Suelo continuo con algunos huecos
        for (let x = 0; x < width; x += 200) {
            if (Math.random() > 0.1) { // 90% de suelo
                this.platforms.create(x + 100, 584, 'platform').refreshBody();
            }
        }

        // Plataformas elevadas aleatorias
        for (let x = 400; x < width - 800; x += 300) {
            const y = Phaser.Math.Between(200, 450);
            this.platforms.create(x, y, 'platform').refreshBody();
        }

        // Muro del Jefe
        this.platforms.create(width - 50, 300, 'platform').setScale(1, 20).refreshBody();
    }

    dynamicSpawn() {
        if (this.bossSpawned) return;

        // Spawnear enemigos 100px delante de la cámara (fuera de visión derecha)
        const camX = this.cameras.main.scrollX;
        const spawnX = camX + 900; 

        // Limite de enemigos
        if (this.enemies.countActive(true) < 8 && spawnX < this.levelData.length - 500) {
            const typeKey = this.levelData.enemyType;
            // Aleatoriedad en Y para voladores
            const y = (typeKey === 'JAQUECA') ? Phaser.Math.Between(50, 300) : 0;
            
            const enemy = new Enemy(this, spawnX, y, typeKey);
            this.enemies.add(enemy);
            enemy.setTarget(this.player);
        }
    }

    update() {
        this.player.update(this.time.now);
        
        // Chequear Jefe Final
        if (!this.bossSpawned && this.player.x > this.levelData.length - 800) {
            this.spawnBoss();
        }
        
        // Condición de Caída
        if (this.player.y > 650) {
            this.player.takeDamage(100); // Muerte instantánea
        }
    }

    spawnBoss() {
        this.bossSpawned = true;
        
        // Mostrar advertencia
        const warning = this.add.text(this.cameras.main.scrollX + 400, 300, '¡ALERTA DE INFECCIÓN!', {
            fontSize: '40px', fill: '#ff0000', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0); // Pegado a pantalla
        
        this.tweens.add({ targets: warning, alpha: 0, duration: 500, yoyo: true, repeat: 3, onComplete: () => warning.destroy() });

        // Crear Jefe
        const bossX = this.levelData.length - 300;
        const boss = new Enemy(this, bossX, 200, this.levelData.boss);
        this.enemies.add(boss);
        boss.setTarget(this.player);
        this.boss = boss;
    }

    handleBulletEnemy(bullet, enemy) {
        if (enemy.takeDamage) {
            bullet.disableBody(true, true);
            this.particles.emitParticleAt(enemy.x, enemy.y, 5);
            enemy.takeDamage(bullet.damage);
        }
    }

    handlePlayerHit(player, enemy) {
        player.takeDamage(5);
        // Empuje
        player.setVelocityX(-300);
        player.setVelocityY(-200);
    }

    levelComplete() {
        this.physics.pause();
        const txt = this.add.text(this.cameras.main.scrollX + 400, 300, '¡INFECCIÓN PURGADA!', {
            fontSize: '50px', fill: '#00ff00', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5);

        this.time.delayedCall(3000, () => {
            // Siguiente Nivel Lógica
            let nextLevel = null;
            if (this.currentLevelKey === 'ESTOMAGO') nextLevel = 'COLUMNA';
            else if (this.currentLevelKey === 'COLUMNA') nextLevel = 'CEREBRO';

            if (nextLevel) {
                this.scene.restart({ level: nextLevel, score: this.score });
            } else {
                txt.setText("¡PACIENTE CURADO!");
            }
        });
    }
}