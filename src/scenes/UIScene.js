export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
    }

    init(data) {
        this.levelName = data.levelName || 'ZONA DESCONOCIDA';
    }

    create() {
        // Título de Nivel
        this.add.text(400, 30, this.levelName, {
            fontSize: '24px', fill: '#ffffff', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);

        // Panel de Armas
        this.weaponText = this.add.text(20, 20, 'Arma: Ibu-MachineGun', { 
            fontSize: '18px', fill: '#ffffff', fontFamily: 'monospace' 
        }).setStroke('#000', 2);

        // Barra de Toxicidad
        this.add.text(20, 60, 'TOXICIDAD:', { fontSize: '14px', fill: '#ffaa00' });
        this.add.rectangle(110, 68, 200, 16, 0x333333).setOrigin(0, 0.5);
        this.toxicBar = this.add.rectangle(110, 68, 0, 14, 0x00ff00).setOrigin(0, 0.5);
        
        this.toxicity = 0;

        // Listeners
        const game = this.scene.get('GameScene');
        if (game) {
            game.events.on('player-shoot', (cost) => this.addToxicity(cost));
            game.events.on('weapon-change', (name) => this.weaponText.setText(`Arma: ${name}`));
        }

        // Bajar toxicidad
        this.time.addEvent({ delay: 500, callback: () => this.addToxicity(-2), loop: true });
    }

    addToxicity(amount) {
        this.toxicity = Phaser.Math.Clamp(this.toxicity + amount, 0, 100);
        this.toxicBar.width = this.toxicity * 2;
        
        if (this.toxicity > 80) this.toxicBar.fillColor = 0xff0000;
        else if (this.toxicity > 50) this.toxicBar.fillColor = 0xffff00;
        else this.toxicBar.fillColor = 0x00ff00;
    }
}