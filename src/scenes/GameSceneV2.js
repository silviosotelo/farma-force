import { PlayerV2 } from '../entities/PlayerV2.js';
import { Enemy } from '../entities/Enemy.js';
import { ItemDrop, DROP_ITEMS } from '../entities/ItemDrop.js';
import { LEVELS } from '../constants.js';

export class GameSceneV2 extends Phaser.Scene {
    constructor() {
        super({ key: 'GameSceneV2' });
    }

    init(data) {
        this.currentLevelKey = data.level || 'ESTOMAGO';
        this.levelData = LEVELS[this.currentLevelKey];
        this.characterData = data.character;
        this.score = data.score || 0;
        this.kills = 0;
    }

    create() {
        const levelWidth = this.levelData.length;
        this.physics.world.setBounds(0, 0, levelWidth, 600);
        this.cameras.main.setBounds(0, 0, levelWidth, 600);

        this.createEnhancedBackground();

        this.scene.launch('UISceneV2', {
            levelName: this.levelData.name,
            character: this.characterData
        });

        this.platforms = this.physics.add.staticGroup();
        this.generateEnhancedTerrain(levelWidth);

        this.player = new PlayerV2(this, 100, 400, this.characterData);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.physics.add.collider(this.player, this.platforms);

        this.itemDrops = this.physics.add.group();
        this.physics.add.collider(this.itemDrops, this.platforms);
        this.physics.add.overlap(this.player, this.itemDrops, this.handleItemCollect, null, this);

        this.enemies = this.add.group({ runChildUpdate: true });
        this.physics.add.collider(this.enemies, this.platforms);

        this.time.addEvent({
            delay: 2000,
            callback: this.dynamicSpawn,
            callbackScope: this,
            loop: true
        });

        this.physics.add.overlap(
            this.player.bullets,
            this.enemies,
            this.handleBulletEnemy,
            null,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.handlePlayerHit,
            null,
            this
        );

        this.bossSpawned = false;

        this.particles = this.add.particles(0, 0, 'bullet', {
            speed: { min: 50, max: 150 },
            scale: { start: 1.2, end: 0 },
            blendMode: 'ADD',
            lifespan: 600,
            emitting: false,
            tint: 0xff0000
        });

        this.createLightingEffects();
    }

    createEnhancedBackground() {
        const bg = this.add.graphics();
        bg.fillGradientStyle(
            this.levelData.bgColors[0], this.levelData.bgColors[0],
            this.levelData.bgColors[1], this.levelData.bgColors[1], 1
        );
        bg.fillRect(0, 0, this.levelData.length, 600);

        this.createOrganicVeins();
        this.createFloatingCells();
        this.createPulsingOrgans();
    }

    createOrganicVeins() {
        const graphics = this.add.graphics();
        graphics.setScrollFactor(0.6);

        for (let i = 0; i < 40; i++) {
            const startX = Phaser.Math.Between(0, this.levelData.length);
            const startY = Phaser.Math.Between(0, 600);

            const thickness = Phaser.Math.Between(2, 5);
            graphics.lineStyle(thickness, this.levelData.veinColor || 0x660000, 0.4);
            graphics.beginPath();
            graphics.moveTo(startX, startY);

            let currentX = startX;
            let currentY = startY;

            for (let j = 0; j < 15; j++) {
                currentX += Phaser.Math.Between(30, 120);
                currentY += Phaser.Math.Between(-80, 80);
                currentY = Phaser.Math.Clamp(currentY, 0, 600);

                const controlX = currentX - Phaser.Math.Between(20, 40);
                const controlY = currentY + Phaser.Math.Between(-30, 30);

                graphics.quadraticCurveTo(controlX, controlY, currentX, currentY);
            }

            graphics.strokePath();
        }
    }

    createFloatingCells() {
        for (let i = 0; i < 120; i++) {
            const x = Phaser.Math.Between(0, this.levelData.length);
            const y = Phaser.Math.Between(0, 600);

            const cell = this.add.circle(x, y, Phaser.Math.Between(3, 12), this.levelData.particleTint, 0.4);
            cell.setScrollFactor(Phaser.Math.FloatBetween(0.2, 0.8));

            this.tweens.add({
                targets: cell,
                x: x + Phaser.Math.Between(-50, 50),
                y: y + Phaser.Math.Between(-60, 60),
                alpha: Phaser.Math.FloatBetween(0.2, 0.6),
                duration: Phaser.Math.Between(4000, 8000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createPulsingOrgans() {
        for (let i = 0; i < 8; i++) {
            const x = Phaser.Math.Between(200, this.levelData.length - 200);
            const y = Phaser.Math.Between(100, 500);

            const organ = this.add.ellipse(x, y, 80, 60, this.levelData.veinColor, 0.2);
            organ.setScrollFactor(0.9);

            this.tweens.add({
                targets: organ,
                scaleX: 1.15,
                scaleY: 1.15,
                alpha: 0.4,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createLightingEffects() {
        this.lights.enable();
        this.lights.setAmbientColor(0x404040);

        const light1 = this.lights.addLight(400, 300, 300, 0xffffff, 1);
        light1.setScrollFactor(0);

        this.playerLight = this.lights.addLight(
            this.player.x,
            this.player.y,
            200,
            this.characterData.color,
            0.8
        );
    }

    generateEnhancedTerrain(width) {
        let currentHeight = 570;

        for (let x = 0; x < width; x += 180) {
            if (Math.random() > 0.2) {
                currentHeight += Phaser.Math.Between(-30, 30);
                currentHeight = Phaser.Math.Clamp(currentHeight, 490, 580);
            }

            if (Math.random() > 0.06) {
                const platform = this.platforms.create(x + 90, currentHeight, 'platform');
                platform.setTint(this.levelData.platformTint || 0x886644);
                platform.setAlpha(0.9);
                platform.refreshBody();
            }
        }

        for (let x = 400; x < width - 1000; x += Phaser.Math.Between(280, 450)) {
            const y = Phaser.Math.Between(180, 420);
            const platformCount = Phaser.Math.Between(1, 4);

            for (let i = 0; i < platformCount; i++) {
                const platform = this.platforms.create(
                    x + (i * 160),
                    y - (i * 90),
                    'platform'
                );
                platform.setTint(this.levelData.platformTint || 0x886644);
                platform.setAlpha(0.8);
                platform.refreshBody();
            }
        }

        const bossAreaStart = width - 700;
        for (let i = 0; i < 4; i++) {
            const platform = this.platforms.create(
                bossAreaStart + (i * 200),
                340 - ((i % 2) * 120),
                'platform'
            );
            platform.setTint(0xff0000);
            platform.setAlpha(0.7);
            platform.refreshBody();
        }

        this.platforms.create(width - 50, 300, 'platform').setScale(1, 20).setTint(0x330000).refreshBody();
    }

    dynamicSpawn() {
        if (this.bossSpawned) return;

        const camX = this.cameras.main.scrollX;
        const spawnX = camX + 900;

        if (this.enemies.countActive(true) < 10 && spawnX < this.levelData.length - 600) {
            const typeKey = this.levelData.enemyType;
            const y = (typeKey === 'JAQUECA') ? Phaser.Math.Between(80, 350) : 0;

            const enemy = new Enemy(this, spawnX, y, typeKey);
            this.enemies.add(enemy);
            enemy.setTarget(this.player);
        }
    }

    update(time, delta) {
        if (!this.player || this.player.health <= 0) return;

        this.player.update(time);

        if (this.playerLight) {
            this.playerLight.setPosition(this.player.x, this.player.y);
        }

        if (!this.bossSpawned && this.player.x > this.levelData.length - 900) {
            this.spawnBoss();
        }

        if (this.player.y > 700) {
            this.player.takeDamage(1000);
        }
    }

    spawnBoss() {
        this.bossSpawned = true;

        this.cameras.main.flash(300, 255, 0, 0);

        const warning = this.add.text(
            this.cameras.main.scrollX + 400,
            300,
            '⚠ INFECCIÓN CRÍTICA DETECTADA ⚠',
            {
                fontSize: '42px',
                fill: '#ff0000',
                stroke: '#000',
                strokeThickness: 6,
                fontStyle: 'bold'
            }
        ).setOrigin(0.5).setScrollFactor(0);

        this.tweens.add({
            targets: warning,
            alpha: 0,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 600,
            yoyo: true,
            repeat: 4,
            onComplete: () => warning.destroy()
        });

        const bossX = this.levelData.length - 350;
        const boss = new Enemy(this, bossX, 200, this.levelData.boss);
        this.enemies.add(boss);
        boss.setTarget(this.player);
        this.boss = boss;
    }

    handleBulletEnemy(bullet, enemy) {
        if (enemy.takeDamage) {
            bullet.disableBody(true, true);

            if (bullet.critTrail) {
                bullet.critTrail.destroy();
                bullet.critTrail = null;
            }

            this.particles.emitParticleAt(enemy.x, enemy.y, bullet.isCrit ? 20 : 8);

            this.cameras.main.shake(bullet.isCrit ? 120 : 60, 0.004);

            enemy.takeDamage(bullet.damage);

            if (bullet.isCrit) {
                const critText = this.add.text(enemy.x, enemy.y - 50, '¡CRÍTICO!', {
                    fontSize: '20px',
                    fill: '#ff0000',
                    stroke: '#000',
                    strokeThickness: 4,
                    fontStyle: 'bold'
                }).setOrigin(0.5);

                this.tweens.add({
                    targets: critText,
                    y: critText.y - 40,
                    alpha: 0,
                    scale: 1.5,
                    duration: 800,
                    onComplete: () => critText.destroy()
                });
            }
        }
    }

    handlePlayerHit(player, enemy) {
        player.takeDamage(enemy.isBoss ? 12 : 6);

        const pushDir = player.x < enemy.x ? -1 : 1;
        player.setVelocityX(pushDir * 350);
        player.setVelocityY(-220);
    }

    handleItemCollect(player, item) {
        item.collect(player);
    }

    dropRandomItem(x, y, isBoss = false) {
        const dropChance = isBoss ? 1.0 : 0.3;

        if (Math.random() > dropChance) return;

        const dropTypes = Object.keys(DROP_ITEMS);
        let selectedType;

        if (isBoss) {
            const rareTypes = dropTypes.filter(
                type => DROP_ITEMS[type].equipable || DROP_ITEMS[type].rarity === 'epic'
            );
            selectedType = rareTypes[Phaser.Math.Between(0, rareTypes.length - 1)];
        } else {
            selectedType = dropTypes[Phaser.Math.Between(0, dropTypes.length - 1)];
        }

        const drop = new ItemDrop(this, x, y, selectedType);
        this.itemDrops.add(drop);
    }

    levelComplete() {
        this.physics.pause();

        this.cameras.main.flash(500, 0, 255, 0);

        const txt = this.add.text(
            this.cameras.main.scrollX + 400,
            300,
            '✓ INFECCIÓN ELIMINADA ✓',
            {
                fontSize: '56px',
                fill: '#00ff00',
                stroke: '#000',
                strokeThickness: 8,
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: txt,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: 2
        });

        this.time.delayedCall(3500, () => {
            let nextLevel = null;
            if (this.currentLevelKey === 'ESTOMAGO') nextLevel = 'COLUMNA';
            else if (this.currentLevelKey === 'COLUMNA') nextLevel = 'CEREBRO';

            if (nextLevel) {
                this.cameras.main.fade(1000);
                this.time.delayedCall(1000, () => {
                    this.scene.stop('UISceneV2');
                    this.scene.start('LevelSelect', {
                        character: this.characterData
                    });
                });
            } else {
                txt.setText('✓ ¡PACIENTE COMPLETAMENTE CURADO! ✓');
                this.time.delayedCall(3000, () => {
                    this.scene.stop('UISceneV2');
                    this.scene.start('MainMenu');
                });
            }
        });
    }
}
