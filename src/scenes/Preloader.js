export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: 'Preloader' });
    }

    create() {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // --- 1. JUGADOR MEJORADO (Nano-Soldado Futurista) ---
        graphics.clear();

        // Resplandor exterior
        graphics.fillStyle(0x00ffff, 0.3);
        graphics.fillRoundedRect(-2, -2, 34, 54, 6);

        // Cuerpo principal con gradiente
        graphics.fillStyle(0xe0e0e0, 1);
        graphics.fillRoundedRect(0, 0, 30, 50, 5);

        // Armadura pectoral (Cyan futurista)
        graphics.fillStyle(0x00aacc, 1);
        graphics.fillRoundedRect(3, 10, 24, 22, 3);

        // Detalles de armadura
        graphics.fillStyle(0x008899, 1);
        graphics.fillRect(5, 12, 6, 18);
        graphics.fillRect(19, 12, 6, 18);

        // Visor holográfico
        graphics.fillStyle(0x00ffff, 0.9);
        graphics.fillRoundedRect(4, 3, 22, 10, 2);
        graphics.fillStyle(0x00ff00, 0.6);
        graphics.fillRect(8, 6, 4, 4);
        graphics.fillRect(18, 6, 4, 4);

        // Arma de plasma mejorada
        graphics.fillStyle(0x666666, 1);
        graphics.fillRoundedRect(16, 28, 32, 8, 2);
        graphics.fillStyle(0x00ffff, 0.8);
        graphics.fillRect(40, 30, 8, 4);

        // Cañón de energía
        graphics.fillStyle(0x444444, 1);
        graphics.fillRoundedRect(10, 33, 12, 16, 3);

        // Luz de energía en el arma
        graphics.fillStyle(0x00ff00, 1);
        graphics.fillCircle(15, 37, 2);

        graphics.generateTexture('player', 50, 55);

        // --- 2. ENEMIGO: SLIME DE ACIDEZ MEJORADO ---
        graphics.clear();

        // Resplandor ácido
        graphics.fillStyle(0x00ff00, 0.4);
        graphics.fillCircle(25, 25, 28);

        // Cuerpo gelatinoso
        graphics.fillStyle(0x22ff00, 0.9);
        graphics.beginPath();
        graphics.arc(25, 25, 22, Math.PI, 0);
        graphics.lineTo(47, 45);
        graphics.quadraticCurveTo(25, 50, 3, 45);
        graphics.closePath();
        graphics.fillPath();

        // Sombra interna
        graphics.fillStyle(0x00aa00, 0.6);
        graphics.fillEllipse(25, 35, 15, 8);

        // Burbujas tóxicas
        graphics.fillStyle(0xccffcc, 0.9);
        graphics.fillCircle(12, 32, 6);
        graphics.fillCircle(32, 28, 4);
        graphics.fillCircle(20, 25, 3);

        // Núcleo tóxico
        graphics.fillStyle(0xffff00, 0.7);
        graphics.fillCircle(25, 30, 5);

        // Ojos malvados
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(18, 20, 3);
        graphics.fillCircle(32, 20, 3);

        graphics.generateTexture('enemy_slime', 50, 50);

        // --- 3. ENEMIGO: GOLEM CONTRACTURA MEJORADO ---
        graphics.clear();

        // Sombra oscura
        graphics.fillStyle(0x000000, 0.4);
        graphics.fillRoundedRect(2, 52, 56, 8, 4);

        // Cuerpo muscular
        graphics.fillStyle(0x660000, 1);
        graphics.fillRoundedRect(0, 0, 60, 60, 12);

        // Músculos tensos (efecto 3D)
        graphics.fillStyle(0x8b0000, 1);
        graphics.fillRoundedRect(5, 5, 50, 50, 8);

        // Fibras musculares detalladas
        graphics.lineStyle(4, 0xaa0000, 1);
        for (let i = 0; i < 5; i++) {
            const y = 12 + (i * 10);
            graphics.beginPath();
            graphics.moveTo(10, y);
            graphics.quadraticCurveTo(30, y - 2, 50, y);
            graphics.strokePath();
        }

        // Venas pulsantes
        graphics.lineStyle(2, 0xff0000, 0.8);
        graphics.beginPath();
        graphics.moveTo(15, 10);
        graphics.lineTo(20, 25);
        graphics.lineTo(15, 40);
        graphics.strokePath();

        // Ojos furiosos brillantes
        graphics.fillStyle(0xffff00, 1);
        graphics.fillRoundedRect(12, 18, 12, 8, 2);
        graphics.fillRoundedRect(36, 18, 12, 8, 2);

        // Pupila roja
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(18, 22, 3);
        graphics.fillCircle(42, 22, 3);

        graphics.generateTexture('enemy_golem', 60, 60);

        // --- 4. ENEMIGO: JAQUECA ELÉCTRICA MEJORADA ---
        graphics.clear();

        // Aura eléctrica
        graphics.fillStyle(0xffff00, 0.3);
        graphics.fillCircle(25, 25, 28);

        // Núcleo brillante
        graphics.fillStyle(0xffff00, 1);
        graphics.fillCircle(25, 25, 20);

        // Resplandor interno
        graphics.fillStyle(0xffffff, 0.8);
        graphics.fillCircle(25, 25, 12);

        // Rayos eléctricos
        graphics.lineStyle(3, 0x00ffff, 1);
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const x1 = 25 + Math.cos(angle) * 20;
            const y1 = 25 + Math.sin(angle) * 20;
            const x2 = 25 + Math.cos(angle) * 30;
            const y2 = 25 + Math.sin(angle) * 30;

            graphics.beginPath();
            graphics.moveTo(x1, y1);
            graphics.lineTo(x2, y2);
            graphics.strokePath();
        }

        // Pinchos energéticos
        graphics.fillStyle(0xff00ff, 0.9);
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6;
            const x = 25 + Math.cos(angle) * 20;
            const y = 25 + Math.sin(angle) * 20;

            graphics.beginPath();
            graphics.moveTo(x, y);
            graphics.lineTo(25 + Math.cos(angle) * 32, 25 + Math.sin(angle) * 32);
            graphics.lineTo(25 + Math.cos(angle + 0.3) * 20, 25 + Math.sin(angle + 0.3) * 20);
            graphics.closePath();
            graphics.fillPath();
        }

        graphics.generateTexture('enemy_spark', 50, 50);

        // --- 5. JEFE: BACTERIA REY MEJORADO ---
        graphics.clear();

        // Aura tóxica masiva
        graphics.fillStyle(0x660088, 0.4);
        graphics.fillCircle(70, 70, 75);

        // Cuerpo principal
        graphics.fillStyle(0x440088, 1);
        graphics.fillCircle(70, 70, 65);

        // Membranas celulares
        graphics.lineStyle(3, 0x660099, 0.8);
        graphics.strokeCircle(70, 70, 55);
        graphics.strokeCircle(70, 70, 45);

        // Manchas tóxicas detalladas
        graphics.fillStyle(0x00ff00, 0.7);
        graphics.fillCircle(45, 50, 18);
        graphics.fillCircle(90, 75, 22);
        graphics.fillCircle(60, 90, 15);

        // Borde de manchas
        graphics.lineStyle(2, 0x00aa00, 0.9);
        graphics.strokeCircle(45, 50, 18);
        graphics.strokeCircle(90, 75, 22);

        // Ojo gigante terrorífico
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(70, 60, 30);

        // Iris
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(70, 60, 18);

        // Pupila
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(70, 60, 12);

        // Brillo del ojo
        graphics.fillStyle(0xffffff, 0.8);
        graphics.fillCircle(75, 55, 5);

        // Tentáculos o flagelos
        graphics.lineStyle(5, 0x330066, 1);
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6;
            graphics.beginPath();
            graphics.moveTo(
                70 + Math.cos(angle) * 65,
                70 + Math.sin(angle) * 65
            );
            graphics.quadraticCurveTo(
                70 + Math.cos(angle) * 80,
                70 + Math.sin(angle) * 90,
                70 + Math.cos(angle) * 85,
                70 + Math.sin(angle) * 95
            );
            graphics.strokePath();
        }

        graphics.generateTexture('boss_bacteria', 140, 140);
        
        // --- 6. JEFE: MIGRAÑA SUPREMA MEJORADO ---
        graphics.clear();

        // Tormenta eléctrica masiva
        graphics.fillStyle(0x000000, 0.5);
        graphics.fillCircle(70, 70, 80);

        // Nubes tormentosas
        graphics.fillStyle(0x222222, 0.95);
        graphics.fillCircle(50, 50, 45);
        graphics.fillCircle(85, 60, 38);
        graphics.fillCircle(40, 80, 42);
        graphics.fillCircle(75, 85, 35);

        // Núcleo oscuro
        graphics.fillStyle(0x111111, 1);
        graphics.fillCircle(65, 65, 30);

        // Energía caótica
        graphics.fillStyle(0xff00ff, 0.6);
        graphics.fillCircle(65, 65, 22);

        // Rayos eléctricos poderosos
        graphics.lineStyle(6, 0x00ffff, 1);
        graphics.beginPath();
        graphics.moveTo(30, 45);
        graphics.lineTo(40, 65);
        graphics.lineTo(35, 75);
        graphics.lineTo(45, 95);
        graphics.strokePath();

        graphics.lineStyle(5, 0xffff00, 1);
        graphics.beginPath();
        graphics.moveTo(90, 50);
        graphics.lineTo(80, 70);
        graphics.lineTo(85, 80);
        graphics.lineTo(75, 100);
        graphics.strokePath();

        graphics.lineStyle(4, 0xff00ff, 1);
        graphics.beginPath();
        graphics.moveTo(60, 35);
        graphics.lineTo(65, 50);
        graphics.lineTo(55, 60);
        graphics.lineTo(60, 75);
        graphics.strokePath();

        // Chispas eléctricas
        graphics.fillStyle(0xffffff, 1);
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const dist = 50 + Math.random() * 20;
            graphics.fillCircle(
                65 + Math.cos(angle) * dist,
                65 + Math.sin(angle) * dist,
                2
            );
        }

        graphics.generateTexture('boss_migraine', 140, 140);

        // --- 7. PLATAFORMA ORGÁNICA MEJORADA ---
        graphics.clear();

        // Sombra de la plataforma
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillRoundedRect(2, 34, 200, 6, 4);

        // Base de la plataforma
        graphics.fillStyle(0x663333, 1);
        graphics.fillRoundedRect(0, 0, 200, 32, 10);

        // Textura orgánica superior
        graphics.fillStyle(0x884444, 1);
        graphics.fillRoundedRect(2, 2, 196, 28, 8);

        // Venas o texturas
        graphics.lineStyle(2, 0x552222, 0.7);
        for (let i = 0; i < 5; i++) {
            const x = 20 + (i * 40);
            graphics.beginPath();
            graphics.moveTo(x, 8);
            graphics.quadraticCurveTo(x + 15, 16, x + 30, 24);
            graphics.strokePath();
        }

        // Borde brillante superior
        graphics.lineStyle(2, 0xaa6666, 0.8);
        graphics.strokeRoundedRect(1, 1, 198, 2, 1);

        // Contorno
        graphics.lineStyle(3, 0x441111, 1);
        graphics.strokeRoundedRect(0, 0, 200, 32, 10);

        graphics.generateTexture('platform', 200, 40);

        // --- 8. BALA DE ENERGÍA MEJORADA ---
        graphics.clear();

        // Estela de energía
        graphics.fillStyle(0x00ffff, 0.4);
        graphics.fillRoundedRect(-2, -2, 24, 14, 6);

        // Núcleo de la bala
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRoundedRect(0, 0, 20, 10, 5);

        // Resplandor central
        graphics.fillStyle(0x00ffff, 0.8);
        graphics.fillRoundedRect(2, 2, 16, 6, 4);

        // Punta brillante
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(18, 5, 3);

        // Borde energético
        graphics.lineStyle(1, 0x00aaaa, 1);
        graphics.strokeRoundedRect(0, 0, 20, 10, 5);

        graphics.generateTexture('bullet', 24, 14);

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