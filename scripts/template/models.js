const MODEL = {};
MODEL.bullet = {};
MODEL.particle = {};
MODEL.ship = {};


// Bullet models

MODEL.bullet.basic = function() {
    fill(this.color);
    stroke(0, MODEL_LINE_ALPHA);
    ellipse(this.pos.x, this.pos.y, this.r, this.r);
};

// Particle models

MODEL.particle.square = function() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);

    fill(this.color.concat(this.lifespan));
    stroke(0, this.lifespan * MODEL_LINE_ALPHA/255);
    rectMode(RADIUS);
    rect(0, 0, this.r, this.r);

    pop();
};


// Ship models

MODEL.ship.basic = function(isPlayer) {
    push();
    translate(this.pos.x, this.pos.y);
    if (!isPlayer) rotate(180);
    if (!isPlayer) translate(sensorLeft);

    // Canopy
    fill(this.color);
    ellipse(0, 1, 25, 25);

    pop();
};
