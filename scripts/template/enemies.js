const ENEMY = {};

ENEMY.basic = {
    // Display
    color: '#E74C3C',
    // Misc
    type: 'basicEnemy',
    // Stats
    maxSpeed: 3,
    minSpeed: 1,
    // Methods
    ai() {
        if (random() < 0.02) this.fire();
    },
    attack() {
        emitBullets(this.pos.x, this.pos.y, 90, [0], 4, 4, 5);
    }
};
