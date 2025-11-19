import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { PowerUp, POWERUP_TYPES } from '../entities/PowerUp.js';
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

        // 6. POWER-UPS
        this.powerups = this.physics.add.group();
        this.physics.add.collider(this.powerups, this.platforms);
        this.physics.add.overlap(this.player, this.powerups, this.handlePowerUpCollect, null, this);

        // Spawner de power-ups
        this.time.addEvent({
            delay: 10000,
            callback: this.spawnPowerUp,
            callbackScope: this,
            loop: true
        });

        // 7. ENEMIGOS
        this.enemies = this.add.group({ runChildUpdate: true });
        this.physics.add.collider(this.enemies, this.platforms);
        
        // Spawner Dinámico (Solo spawnea enemigos cerca de la cámara)
        this.time.addEvent({ delay: 1500, callback: this.dynamicSpawn, callbackScope: this, loop: true });

        // 8. COLISIONES
        this.physics.add.overlap(this.player.bullets, this.enemies, this.handleBulletEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerHit, null, this);

        // 9. JEFE FINAL
        this.bossSpawned = false;

        // 10. EFECTO DE TOXICIDAD
        this.toxicityOverlay = this.add.graphics();
        this.toxicityLevel = 0;
        
        // Partículas
        this.particles = this.add.particles(0, 0, 'bullet', {
            speed: 100, scale: { start: 1, end: 0 }, blendMode: 'ADD', lifespan: 200, emitting: false
        });
    }

    createBackground() {
        // Gradiente mejorado con múltiples capas
        const bg = this.add.graphics();
        bg.fillGradientStyle(
            this.levelData.bgColors[0], this.levelData.bgColors[0],
            this.levelData.bgColors[1], this.levelData.bgColors[1], 1
        );
        bg.fillRect(0, 0, this.levelData.length, 600);
        bg.setScrollFactor(1);

        // Capa de texturas orgánicas (venas, tejidos)
        this.createOrganicTextures();

        // Elementos flotantes (Células) parallax con animación
        this.bgElements = this.add.group();
        for(let i=0; i<80; i++) {
            const x = Phaser.Math.Between(0, this.levelData.length);
            const y = Phaser.Math.Between(0, 600);
            const cell = this.add.image(x, y, 'bg_particle');
            cell.setAlpha(Phaser.Math.FloatBetween(0.1, 0.4));
            cell.setScrollFactor(Phaser.Math.FloatBetween(0.3, 0.7));
            cell.setScale(Phaser.Math.FloatBetween(0.3, 1.2));
            cell.setTint(this.levelData.particleTint || 0xffffff);

            // Animación flotante
            this.tweens.add({
                targets: cell,
                y: cell.y + Phaser.Math.Between(-30, 30),
                duration: Phaser.Math.Between(3000, 6000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Rotación sutil
            this.tweens.add({
                targets: cell,
                angle: 360,
                duration: Phaser.Math.Between(10000, 20000),
                repeat: -1
            });
        }
    }

    createOrganicTextures() {
        // Crear "venas" o "fibras" según el nivel
        const graphics = this.add.graphics();
        graphics.setScrollFactor(0.8);

        for (let i = 0; i < 20; i++) {
            const startX = Phaser.Math.Between(0, this.levelData.length);
            const startY = Phaser.Math.Between(0, 600);

            graphics.lineStyle(Phaser.Math.Between(1, 3), this.levelData.veinColor || 0x440000, 0.3);
            graphics.beginPath();
            graphics.moveTo(startX, startY);

            // Crear líneas orgánicas (venas)
            let currentX = startX;
            let currentY = startY;

            for (let j = 0; j < 10; j++) {
                currentX += Phaser.Math.Between(20, 100);
                currentY += Phaser.Math.Between(-50, 50);
                graphics.lineTo(currentX, currentY);
            }

            graphics.strokePath();
        }
    }

    generateTerrain(width) {
        // Suelo continuo con variación de altura
        let currentHeight = 584;
        for (let x = 0; x < width; x += 200) {
            // Variación gradual de altura
            if (Math.random() > 0.3) {
                currentHeight += Phaser.Math.Between(-20, 20);
                currentHeight = Phaser.Math.Clamp(currentHeight, 500, 590);
            }

            if (Math.random() > 0.08) { // 92% de suelo (menos huecos)
                const platform = this.platforms.create(x + 100, currentHeight, 'platform');
                platform.setTint(this.levelData.platformTint || 0x666666);
                platform.refreshBody();
            }
        }

        // Plataformas elevadas con patrón más dinámico
        for (let x = 400; x < width - 800; x += Phaser.Math.Between(250, 400)) {
            const y = Phaser.Math.Between(200, 450);
            const platformCount = Phaser.Math.Between(1, 3);

            for (let i = 0; i < platformCount; i++) {
                const platform = this.platforms.create(x + (i * 150), y - (i * 80), 'platform');
                platform.setTint(this.levelData.platformTint || 0x666666);
                platform.refreshBody();
            }
        }

        // Zona de jefe: plataformas especiales
        const bossAreaStart = width - 600;
        for (let i = 0; i < 3; i++) {
            const platform = this.platforms.create(
                bossAreaStart + (i * 180),
                350 - (i % 2) * 100,
                'platform'
            );
            platform.setTint(0xff0000);
            platform.refreshBody();
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

        // Actualizar efecto de toxicidad
        this.updateToxicityEffect();

        // Chequear Jefe Final
        if (!this.bossSpawned && this.player.x > this.levelData.length - 800) {
            this.spawnBoss();
        }

        // Condición de Caída
        if (this.player.y > 650) {
            this.player.takeDamage(100);
        }
    }

    updateToxicityEffect() {
        // Obtener nivel de toxicidad de UIScene
        const uiScene = this.scene.get('UIScene');
        if (!uiScene) return;

        this.toxicityLevel = uiScene.toxicity;

        this.toxicityOverlay.clear();

        if (this.toxicityLevel > 70) {
            // Efecto de vignette rojo
            const alpha = (this.toxicityLevel - 70) / 30 * 0.4;
            this.toxicityOverlay.fillStyle(0xff0000, alpha);
            this.toxicityOverlay.fillRect(0, 0, 800, 600);

            // Screen shake si está muy alto
            if (this.toxicityLevel > 90) {
                this.cameras.main.shake(50, 0.002);
            }
        }

        // Distorsión de controles (inversión momentánea)
        if (this.toxicityLevel >= 100 && !this.toxicityPenalty) {
            this.applyToxicityPenalty();
        }
    }

    applyToxicityPenalty() {
        this.toxicityPenalty = true;
        this.cameras.main.flash(500, 255, 0, 0);
        this.player.takeDamage(20);

        // Advertencia visual
        const warning = this.add.text(this.cameras.main.scrollX + 400, 300, '¡SOBREDOSIS!', {
            fontSize: '48px',
            fill: '#ff0000',
            stroke: '#000',
            strokeThickness: 6,
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0);

        this.tweens.add({
            targets: warning,
            alpha: 0,
            scale: 2,
            duration: 1500,
            onComplete: () => {
                warning.destroy();
                this.toxicityPenalty = false;
            }
        });
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
        player.takeDamage(enemy.isBoss ? 10 : 5);
        // Empuje
        const pushDirection = player.x < enemy.x ? -1 : 1;
        player.setVelocityX(pushDirection * 300);
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

    spawnPowerUp() {
        if (this.bossSpawned) return;

        const camX = this.cameras.main.scrollX;
        const spawnX = camX + Phaser.Math.Between(200, 600);
        const spawnY = 100;

        const types = Object.keys(POWERUP_TYPES);
        const randomType = types[Phaser.Math.Between(0, types.length - 1)];

        const powerup = new PowerUp(this, spawnX, spawnY, randomType);
        this.powerups.add(powerup);
    }

    handlePowerUpCollect(player, powerup) {
        powerup.collect(player);
    }
}