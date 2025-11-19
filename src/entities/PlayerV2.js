import { WEAPONS } from '../constants.js';
import { Bullet } from './Bullet.js';

export class PlayerV2 extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, characterData) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.characterData = characterData;

        this.setCollideWorldBounds(true);
        this.setGravityY(800);
        this.setScale(1.2);

        this.speed = characterData.speed;
        this.maxHealth = characterData.health;
        this.health = this.maxHealth;
        this.damageMultiplier = characterData.damage;
        this.isHit = false;

        this.isDashing = false;
        this.dashCooldown = 0;
        this.dashSpeed = 700;
        this.canDoubleSpace = true;
        this.lastSpacePress = 0;

        this.weapons = [WEAPONS.IBUPROFENO, WEAPONS.PARACETAMOL, WEAPONS.DICLOFENAC];
        this.weaponLevels = [1, 1, 1];
        this.currentWeaponIndex = 0;
        this.lastFired = 0;

        this.equippedItems = [null, null];
        this.itemCooldowns = [0, 0];

        this.critChance = 0.15;
        this.critMultiplier = 2.5;

        this.bullets = scene.physics.add.group({
            classType: Bullet,
            maxSize: 80,
            runChildUpdate: true
        });

        this.keys = {
            w: scene.input.keyboard.addKey('W'),
            a: scene.input.keyboard.addKey('A'),
            s: scene.input.keyboard.addKey('S'),
            d: scene.input.keyboard.addKey('D'),
            space: scene.input.keyboard.addKey('SPACE'),
            shift: scene.input.keyboard.addKey('SHIFT'),
            one: scene.input.keyboard.addKey('ONE'),
            two: scene.input.keyboard.addKey('TWO'),
            three: scene.input.keyboard.addKey('THREE'),
            four: scene.input.keyboard.addKey('FOUR'),
            five: scene.input.keyboard.addKey('FIVE')
        };

        this.cursors = scene.input.keyboard.createCursorKeys();

        scene.input.setDefaultCursor('crosshair');

        this.aimLine = scene.add.line(0, 0, 0, 0, 0, 0, characterData.color, 0.5);
        this.aimLine.setLineWidth(2);
        this.aimLine.setDepth(50);

        this.muzzleFlash = scene.add.circle(0, 0, 10, 0xffff00, 0);
        this.muzzleFlash.setDepth(100);

        this.regenTimer = 0;
    }

    getCurrentWeapon() {
        return this.weapons[this.currentWeaponIndex];
    }

    getWeaponDamage() {
        const weapon = this.getCurrentWeapon();
        const level = this.weaponLevels[this.currentWeaponIndex];
        return weapon.damage * level * this.damageMultiplier;
    }

    update(time) {
        if (this.health <= 0) return;

        const pointer = this.scene.input.activePointer;
        const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);

        const moveLeft = this.keys.a.isDown || this.cursors.left.isDown;
        const moveRight = this.keys.d.isDown || this.cursors.right.isDown;
        const jump = this.keys.w.isDown || this.cursors.up.isDown || Phaser.Input.Keyboard.JustDown(this.keys.space);

        if (!this.isDashing) {
            if (moveLeft) {
                this.setVelocityX(-this.speed);
            } else if (moveRight) {
                this.setVelocityX(this.speed);
            } else {
                this.setVelocityX(this.body.velocity.x * 0.85);
            }
        }

        if (jump && this.body.touching.down) {
            this.setVelocityY(-500);
            this.scene.cameras.main.shake(50, 0.002);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.space)) {
            const currentTime = time;
            if (currentTime - this.lastSpacePress < 300 && !this.body.touching.down) {
                this.startDash(time);
            }
            this.lastSpacePress = currentTime;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.shift) && time > this.dashCooldown) {
            this.startDash(time);
        }

        const angle = Phaser.Math.Angle.Between(this.x, this.y, worldPoint.x, worldPoint.y);
        this.facingRight = worldPoint.x > this.x;
        this.setFlipX(!this.facingRight);

        const lineLength = 60;
        const endX = this.x + Math.cos(angle) * lineLength;
        const endY = this.y + Math.sin(angle) * lineLength;
        this.aimLine.setTo(this.x, this.y, endX, endY);

        if (pointer.isDown && time > this.lastFired) {
            this.shoot(time, worldPoint);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.one)) this.switchWeapon(0);
        if (Phaser.Input.Keyboard.JustDown(this.keys.two)) this.switchWeapon(1);
        if (Phaser.Input.Keyboard.JustDown(this.keys.three)) this.switchWeapon(2);
        if (Phaser.Input.Keyboard.JustDown(this.keys.four)) this.useItem(0, time);
        if (Phaser.Input.Keyboard.JustDown(this.keys.five)) this.useItem(1, time);

        if (this.characterData.id === 'CLINICO') {
            this.regenTimer += 16;
            if (this.regenTimer >= 2000) {
                this.heal(2);
                this.regenTimer = 0;
            }
        }
    }

    switchWeapon(index) {
        if (index < this.weapons.length) {
            this.currentWeaponIndex = index;
            const weapon = this.getCurrentWeapon();
            this.scene.events.emit('weapon-change', weapon.name, this.weaponLevels[index]);
        }
    }

    shoot(time, targetPoint) {
        const weapon = this.getCurrentWeapon();
        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetPoint.x, targetPoint.y);

        const isCrit = Math.random() < this.critChance;
        const damage = this.getWeaponDamage() * (isCrit ? this.critMultiplier : 1);

        this.muzzleFlash.setPosition(
            this.x + Math.cos(angle) * 30,
            this.y + Math.sin(angle) * 30
        );
        this.muzzleFlash.setAlpha(1);
        this.scene.tweens.add({
            targets: this.muzzleFlash,
            alpha: 0,
            duration: 100
        });

        if (weapon.type === 'shotgun') {
            for (let i = -1; i <= 1; i++) {
                const bullet = this.bullets.get();
                if (bullet) {
                    bullet.fireAtAngle(this.x, this.y, weapon, angle + (i * 0.15), damage, isCrit);
                }
            }
        } else {
            const bullet = this.bullets.get();
            if (bullet) {
                bullet.fireAtAngle(this.x, this.y, weapon, angle, damage, isCrit);
            }
        }

        this.lastFired = time + weapon.fireRate;

        this.scene.cameras.main.shake(weapon.type === 'sniper' ? 150 : 50, 0.003);
        this.setVelocityX(this.body.velocity.x - Math.cos(angle) * 80);

        this.scene.events.emit('player-shoot', weapon.toxicityCost);

        if (isCrit) {
            this.scene.events.emit('critical-hit');
        }
    }

    startDash(time) {
        this.isDashing = true;
        this.dashCooldown = time + 1200;

        const dashDir = this.facingRight ? 1 : -1;
        this.setVelocityX(dashDir * this.dashSpeed);
        this.setAlpha(0.5);

        this.scene.cameras.main.shake(100, 0.004);

        const trail = this.scene.add.particles(this.x, this.y, 'bullet', {
            speed: 80,
            scale: { start: 0.8, end: 0 },
            blendMode: 'ADD',
            lifespan: 400,
            tint: this.characterData.color
        });

        this.scene.time.delayedCall(250, () => {
            this.isDashing = false;
            this.setAlpha(1);
            trail.destroy();
        });
    }

    takeDamage(amount) {
        if (this.isHit || this.isDashing) return;

        this.health -= amount;
        this.isHit = true;
        this.setTint(0xff0000);

        this.scene.cameras.main.shake(200, 0.012);
        this.scene.events.emit('player-health', this.health, this.maxHealth);

        let blinks = 0;
        const blinkTimer = this.scene.time.addEvent({
            delay: 80,
            callback: () => {
                this.setAlpha(this.alpha === 1 ? 0.3 : 1);
                blinks++;
                if (blinks >= 10) {
                    blinkTimer.remove();
                    this.setAlpha(1);
                    this.isHit = false;
                    this.clearTint();
                }
            },
            loop: true
        });

        if (this.health <= 0) {
            this.die();
        }
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
        this.scene.events.emit('player-health', this.health, this.maxHealth);

        const healText = this.scene.add.text(this.x, this.y - 40, `+${amount}`, {
            fontSize: '24px',
            fill: '#00ff00',
            stroke: '#000',
            strokeThickness: 4,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.scene.tweens.add({
            targets: healText,
            y: healText.y - 60,
            alpha: 0,
            duration: 1200,
            onComplete: () => healText.destroy()
        });
    }

    upgradeWeapon(weaponIndex) {
        if (weaponIndex < this.weaponLevels.length) {
            this.weaponLevels[weaponIndex]++;
            this.scene.events.emit('weapon-upgrade', this.weapons[weaponIndex].name, this.weaponLevels[weaponIndex]);
        }
    }

    equipItem(item, slot) {
        if (slot >= 0 && slot < 2) {
            this.equippedItems[slot] = item;
            this.scene.events.emit('item-equipped', item, slot);
        }
    }

    useItem(slot, time) {
        if (slot >= 0 && slot < 2 && this.equippedItems[slot] && time > this.itemCooldowns[slot]) {
            const item = this.equippedItems[slot];
            item.use(this, this.scene);
            this.itemCooldowns[slot] = time + (item.cooldown || 10000);
            this.scene.events.emit('item-used', item, slot);
        }
    }

    die() {
        this.setTint(0x000000);
        this.setVelocity(0);
        this.scene.cameras.main.shake(600, 0.025);
        this.scene.cameras.main.fade(1000, 0, 0, 0);

        this.scene.time.delayedCall(1500, () => {
            this.scene.scene.start('MainMenu');
        });
    }

    destroy() {
        if (this.aimLine) this.aimLine.destroy();
        if (this.muzzleFlash) this.muzzleFlash.destroy();
        super.destroy();
    }
}
