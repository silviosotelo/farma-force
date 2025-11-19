import { Preloader } from './scenes/Preloader.js';
import { GameScene } from './scenes/GameScene.js';
import { UIScene } from './scenes/UIScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#2a0000', // Fondo oscuro sangre
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 }, // Gravedad estilo Contra
            debug: false
        }
    },
    pixelArt: false,
    scene: [Preloader, GameScene, UIScene]
};

const game = new Phaser.Game(config);