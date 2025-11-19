export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // Texto de Arma
        this.weaponText = this.add.text(20, 20, 'Arma: Ibuprofeno', { fontSize: '20px', fill: '#fff' });
        
        // Barra de Toxicidad (Fondo)
        this.add.rectangle(20, 60, 200, 20, 0x000000).setOrigin(0, 0).setStrokeStyle(2, 0xffffff);
        // Barra de Toxicidad (Relleno)
        this.toxicBar = this.add.rectangle(20, 60, 0, 20, 0x00ff00).setOrigin(0, 0);
        
        this.toxicity = 0;

        // Escuchar eventos de la escena del juego
        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('player-shoot', (cost) => this.increaseToxicity(cost));
        gameScene.events.on('weapon-change', (name) => this.weaponText.setText(`Arma: ${name}`));
    }

    increaseToxicity(amount) {
        this.toxicity = Phaser.Math.Clamp(this.toxicity + amount, 0, 100);
        this.updateBar();
    }

    updateBar() {
        // Actualizar ancho visual
        this.toxicBar.width = 2 * this.toxicity; 
        
        // Cambiar color si es peligroso
        if(this.toxicity > 80) this.toxicBar.fillColor = 0xff0000; // Rojo
        else if(this.toxicity > 50) this.toxicBar.fillColor = 0xffff00; // Amarillo
        else this.toxicBar.fillColor = 0x00ff00; // Verde
    }
}