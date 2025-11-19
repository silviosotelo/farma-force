export const WEAPONS = {
    IBUPROFENO: {
        name: 'Ibu-MachineGun',
        type: 'auto',
        color: 0xffa500,
        speed: 700,
        fireRate: 120,
        damage: 10,
        toxicityCost: 1,
        bulletScale: 1
    },
    PARACETAMOL: {
        name: 'Escopeta Para-Z',
        type: 'shotgun',
        color: 0xffffff,
        speed: 600,
        fireRate: 900,
        damage: 15,
        toxicityCost: 5,
        bulletScale: 0.8
    },
    DICLOFENAC: {
        name: 'Diclo-Bazooka',
        type: 'sniper',
        color: 0x00ff00,
        speed: 1000,
        fireRate: 1200,
        damage: 80,
        toxicityCost: 15,
        bulletScale: 2.5
    }
};

export const LEVELS = {
    ESTOMAGO: {
        key: 'ESTOMAGO',
        name: 'NIVEL 1: EL ESTÓMAGO ACIDO',
        bgColors: [0x2e003e, 0x1a0024], // Purpuras/Acidos
        enemyType: 'ACIDEZ', // Slimes
        boss: 'BACTERIA_REY',
        length: 3000
    },
    COLUMNA: {
        key: 'COLUMNA',
        name: 'NIVEL 2: LA COLUMNA VERTEBRAL',
        bgColors: [0x330000, 0x110000], // Rojos oscuros
        enemyType: 'CONTRACTURA', // Golems
        boss: 'HERNIA_TITAN',
        length: 3000
    },
    CEREBRO: {
        key: 'CEREBRO',
        name: 'NIVEL 3: TORMENTA CEREBRAL',
        bgColors: [0x001133, 0x000510], // Azules eléctricos
        enemyType: 'JAQUECA', // Voladores
        boss: 'MIGRAÑA_NUBE',
        length: 3000
    }
};

export const ENEMIES = {
    ACIDEZ: { hp: 30, speed: 80, score: 50, fly: false, texture: 'enemy_slime' },
    CONTRACTURA: { hp: 100, speed: 40, score: 100, fly: false, texture: 'enemy_golem' },
    JAQUECA: { hp: 20, speed: 150, score: 60, fly: true, texture: 'enemy_spark' },
    // Jefes
    BACTERIA_REY: { hp: 500, speed: 30, score: 1000, fly: false, scale: 3, texture: 'boss_bacteria' },
    HERNIA_TITAN: { hp: 800, speed: 20, score: 2000, fly: false, scale: 2.5, texture: 'enemy_golem' },
    MIGRAÑA_NUBE: { hp: 600, speed: 60, score: 1500, fly: true, scale: 3, texture: 'boss_migraine' }
};