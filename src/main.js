import { Preloader } from './scenes/Preloader.js'; // IMPORTAR
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#2d2d2d',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    // EL ORDEN IMPORTA: Preloader primero
    scene: [Preloader, GameScene, UIScene]
};

const game = new Phaser.Game(config);