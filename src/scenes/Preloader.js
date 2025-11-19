export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: 'Preloader' });
    }

    create() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // --- 1. JUGADOR (Estilo Soldado Futuro) ---
        graphics.clear();
        // Cuerpo
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRoundedRect(0, 0, 30, 50, 5);
        // Chaleco Antibalas (Azul Farmacia)
        graphics.fillStyle(0x0055ff, 1); 
        graphics.fillRect(2, 10, 26, 25);
        // Visor Táctico
        graphics.fillStyle(0x00ffff, 1);
        graphics.fillRect(5, 5, 20, 8);
        // Arma Grande
        graphics.fillStyle(0x555555, 1);
        graphics.fillRect(15, 30, 30, 10); // Cañón largo
        graphics.fillStyle(0x222222, 1);
        graphics.fillRect(10, 35, 10, 15); // Mango
        graphics.generateTexture('player', 45, 50);

        // --- 2. ENEMIGO: SLIME DE ACIDEZ (Estómago) ---
        graphics.clear();
        graphics.fillStyle(0x00ff00, 0.8); // Verde moco
        graphics.beginPath();
        graphics.arc(20, 20, 20, Math.PI, 0); // Semicirculo arriba
        graphics.lineTo(40, 40);
        graphics.lineTo(0, 40);
        graphics.closePath();
        graphics.fillPath();
        // Burbujas internas
        graphics.fillStyle(0xccffcc, 0.9);
        graphics.fillCircle(10, 30, 5);
        graphics.fillCircle(30, 25, 3);
        graphics.generateTexture('enemy_slime', 40, 40);

        // --- 3. ENEMIGO: GOLEM CONTRACTURA (Columna) ---
        graphics.clear();
        graphics.fillStyle(0x8b0000, 1); // Rojo sangre seca
        graphics.fillRoundedRect(0, 0, 50, 50, 10);
        // Fibras musculares tensas
        graphics.lineStyle(3, 0xff0000, 1);
        graphics.beginPath();
        graphics.moveTo(10, 10); graphics.lineTo(40, 10);
        graphics.moveTo(10, 25); graphics.lineTo(40, 25);
        graphics.moveTo(10, 40); graphics.lineTo(40, 40);
        graphics.strokePath();
        // Ojos furiosos
        graphics.fillStyle(0xffff00, 1);
        graphics.fillRect(10, 15, 10, 5);
        graphics.fillRect(30, 15, 10, 5);
        graphics.generateTexture('enemy_golem', 50, 50);

        // --- 4. ENEMIGO: JAQUECA ELECTRICA (Cerebro) ---
        graphics.clear();
        graphics.fillStyle(0xffff00, 1); // Amarillo
        graphics.fillCircle(15, 15, 15);
        // Pinchos
        graphics.fillStyle(0xffaa00, 1);
        graphics.beginPath();
        graphics.moveTo(15, 0); graphics.lineTo(20, -10); graphics.lineTo(25, 0);
        graphics.moveTo(15, 30); graphics.lineTo(10, 40); graphics.lineTo(5, 30);
        graphics.fillPath();
        graphics.generateTexture('enemy_spark', 30, 40);

        // --- 5. JEFE: BACTERIA REY ---
        graphics.clear();
        graphics.fillStyle(0x440088, 1); // Purpura oscuro
        graphics.fillCircle(60, 60, 60);
        // Manchas toxicas
        graphics.fillStyle(0x00ff00, 0.8);
        graphics.fillCircle(40, 40, 15);
        graphics.fillCircle(80, 70, 20);
        // Ojo gigante
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(60, 50, 25);
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(60, 50, 10);
        graphics.generateTexture('boss_bacteria', 120, 120);
        
        // --- 6. JEFE: NUBE DE MIGRAÑA ---
        graphics.clear();
        graphics.fillStyle(0x333333, 0.9); // Gris oscuro
        graphics.fillCircle(40, 40, 40);
        graphics.fillCircle(70, 50, 30);
        graphics.fillCircle(30, 70, 35);
        // Rayos
        graphics.lineStyle(4, 0x00ffff, 1);
        graphics.beginPath();
        graphics.moveTo(20, 40); graphics.lineTo(50, 80); graphics.lineTo(80, 20);
        graphics.strokePath();
        graphics.generateTexture('boss_migraine', 120, 120);

        // --- 7. ASSETS GENERALES ---
        // Plataforma Orgánica
        graphics.clear();
        graphics.fillStyle(0xaa5555, 1);
        graphics.fillRoundedRect(0, 0, 200, 32, 8);
        graphics.lineStyle(2, 0x550000, 0.5);
        graphics.strokeRoundedRect(0, 0, 200, 32, 8);
        graphics.generateTexture('platform', 200, 32);

        // Bala
        graphics.clear();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRoundedRect(0, 0, 20, 10, 5);
        graphics.generateTexture('bullet', 20, 10);

        // Fondo de Particulas (Sangre/Celulas)
        graphics.clear();
        graphics.fillStyle(0xff0000, 0.2);
        graphics.fillCircle(20, 20, 20);
        graphics.generateTexture('bg_particle', 40, 40);

        // Power-Up
        graphics.clear();
        graphics.fillStyle(0xffff00, 1);
        //graphics.fillStar(25, 25, 5, 20, 10);
        graphics.lineStyle(3, 0xffffff, 1);
        graphics.strokeCircle(25, 25, 18);
        graphics.generateTexture('powerup', 50, 50);

        // Pantalla de carga
        const loadingBg = this.add.rectangle(400, 300, 800, 600, 0x000000);
        const loadingText = this.add.text(400, 280, 'INICIANDO SISTEMA NANO-FARMACÉUTICO...', {
            fontSize: '24px',
            fill: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const loadBar = this.add.rectangle(400, 330, 400, 30, 0x333333);
        const loadFill = this.add.rectangle(400, 330, 0, 26, 0x00ffff);

        this.tweens.add({
            targets: loadFill,
            width: 396,
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                this.cameras.main.fade(500);
                this.time.delayedCall(500, () => {
                    this.scene.start('MainMenu');
                });
            }
        });

        this.tweens.add({
            targets: loadingText,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }
}