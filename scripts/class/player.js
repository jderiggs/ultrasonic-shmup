class Player extends Ship {
    constructor(x, y) {
        super(x, y+150);

        // Cooldowns
        this.invulnTime = 0;

        // Display
        this.color = '#999';

        // Misc
        this.type = 'player';

        // Physics
        this.r = PLAYER_RADIUS;

        // Stats
        this.fireRate = PLAYER_FIRE_RATE;
        this.hp = PLAYER_HP;
        this.speed = PLAYER_SPEED;
        this.weapon = 'basic';
    }

    // All operations to do per tick
    act() {
        if (!paused) this.controls();
        super.act();
    }

    // The attack being used when firing
    attack() {
        WEAPON[this.weapon](this);
    }

    // Ultrasonic controls
    controls() {
        // Fire weapon automatically
        this.fire();
        this.vel = createVector(-sensorLeft/1.5+sensorRight/1.5, 0)
  }

    // Update all cooldowns
    cooldown() {
        super.cooldown();
        if (this.invulnTime > 0) this.invulnTime -= dt();
        if (this.invulnTime < 0) this.invulnTime = 0;
    }

    // Deal damage
    damage() {
        if (this.invulnTime > 0) return;
        this.invulnTime = INVULN_TIME;
        super.damage();
    }

    // Display on the canvas
    display() {
        this.model(true);

        // Display hitbox
        if (showHitboxes) {
            fill(255, 63);
            stroke(255);
            ellipse(this.pos.x, this.pos.y, this.r, this.r);
        }
    }

    // Heal HP up to max
    heal(amt) {
        if (typeof amt === 'undefined') amt = 1;
        if (this.hp < this.maxHp) this.hp += amt;
        if (this.hp > this.maxHp) this.hp = this.maxHp;
    }

    // Events
    onDeath() {
        reloadLevel();
    }
    onHitBottom() {
        this.pos.y = this.mapBottom - this.r * this.edgeRadius;
    }
    onHitTop() {
        this.pos.y = this.mapTop + this.r * this.edgeRadius;
    }
}
