export class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: 'Preloader' });
    }

    preload() {
        // --- BARRA DE CARGA VISUAL ---
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Cargando Remedios...', {
            font: '20px monospace',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5);

        // Eventos del loader de Phaser
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x00ff00, 1); // Verde farmacia
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            this.scene.start('GameScene'); // Arranca el juego al terminar
        });

        // --- GENERACIÓN DE TEXTURAS (ASSETS) ---
        // En un juego real, aquí usarías: this.load.image('player', 'assets/player.png');
        // Pero generaremos los gráficos aquí para que funcionen sin archivos externos.
        
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });

        // 1. Jugador (Nano-Bot Azul)
        graphics.fillStyle(0x4488ff, 1);
        graphics.fillRoundedRect(0, 0, 32, 32, 8); // Cuadrado redondeado
        graphics.generateTexture('player', 32, 32);

        // 2. Bala (Pildora)
        graphics.clear();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(6, 6, 6);
        graphics.generateTexture('bullet', 12, 12);

        // 3. Enemigo (Virus/Dolor Rojo)
        graphics.clear();
        graphics.fillStyle(0xff2222, 1); // Rojo dolor
        graphics.fillCircle(16, 16, 16);
        // Unos pinchos simples
        graphics.generateTexture('enemy', 32, 32);

        // Simular un tiempo de carga (para que veas la barra)
        for (let i = 0; i < 100; i++) {
            this.load.image('logo' + i, 'https://labs.phaser.io/assets/sprites/phaser3-logo.png');
        }
    }
}