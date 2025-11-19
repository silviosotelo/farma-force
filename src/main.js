import { Preloader } from './scenes/Preloader.js';
import { MainMenu } from './scenes/MainMenu.js';
import { LevelSelect } from './scenes/LevelSelect.js';
import { GameSceneV2 } from './scenes/GameSceneV2.js';
import { UISceneV2 } from './scenes/UISceneV2.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#0a0a0a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    pixelArt: false,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [Preloader, MainMenu, LevelSelect, GameSceneV2, UISceneV2]
};

const game = new Phaser.Game(config);