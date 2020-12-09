// Declare a "SerialPort" object
var serial;
var latestData = "waiting for data"; // you'll use this to write incoming data to the canvas
var sensorRight; // data for the right ultrasonic sensor
var sensorLeft; // data for the left ultrasonic sensor
let ypos = 0;

// Game Config - 2020 Amelia Clarke
const BOMB_COUNT = 0;
const BOMB_FLASH_DURATION = 5;
const BOMBS_PER_LEVEL = 0;
const INVULN_TIME = 20;
let   MAP_HEIGHT = 750;
const MODEL_LINE_ALPHA = 127;
const NUM_STARS = 300;
const PLAYER_FIRE_RATE = 20;
const PLAYER_HP = 0;
const PLAYER_RADIUS = 13;
const PLAYER_SPEED = 4;
const SCORE_UPDATE_SPEED = 4;
const SLOWDOWN_ALPHA = 95;
const SLOWDOWN_ALPHA_FULL = 127;
const SLOWDOWN_DT = 0.4;
const SLOWDOWN_DURATION = 120;
const SLOWDOWN_WAIT_NEXT = 600;
const SPAWN_GRACE_PERIOD = 60;
const STARFIELD_LERP = 0.2;
const STARFIELD_SPEED = 10;
const WORLD_CEILING = -50;
const WEAPON = {};
const LEVEL = [];

WEAPON.basic = function(pl) {
    emitBullets(pl.pos.x, pl.pos.y, -90, [0], 5, 5, 3, true);
};

LEVEL[0] = {
    // Background 2020 Amelia Clarke
    alpha: 127,
    bg: 0,
    color: 255,
    // Boss 2020 Amelia Clarke
    boss: null,
    // Enemies 2020 Amelia Clarke
    enemy: ['basic'],
    enemyWeight: [1],
    spawnCount: 80,
    spawnTimeMax: 100,
    spawnTimeMin: 50,
};


// Background 2020 Amelia Clarke
let starfield = false;

// Cooldowns 2020 Amelia Clarke
let flashTime;
let nextSlowdownTime;
let slowTime;
let spawnTime;

// Debug measurements 2020 Amelia Clarke
let avgFPS = 0;
let numFPS = 0;

// Debug mode 2020 Amelia Clarke
let blackStarfield = false;
let lowGraphics = false;
let showFPS = false;
let showHitboxes = true;
let showStars = false;

// Entities 2020 Amelia Clarke
let bullets;
let enemies;
let pl;
let ps;
let walls;

// Game state 2020 Amelia Clarke
let curLevel = false;
let level = false;
let levelScore = false;
let paused = false;
let score;
let scoreToAdd;
let toSpawn;

// Powerups 2020 Amelia Clarke
let bombs;


// Add a score 2020 Amelia Clarke
function addScore(points) {
    scoreToAdd += points;
    setScoreStyle('#F1C40F', 'bold');
}

// Calculate FPS and update sidebar 2020 Amelia Clarke
function calculateFPS() {
    let f = frameRate();
    avgFPS += (f - avgFPS) / ++numFPS;
    document.getElementById('fps').innerHTML = 'FPS: ' + round(f);
    document.getElementById('avgfps').innerHTML = 'Avg. FPS: ' + avgFPS.toFixed(1);
}

// Clear all entities (except player) 2020 Amelia Clarke
function clearEntities() {
    boss = null;
    bullets = [];
    enemies = [];
    ps = [];
    walls = [];
}

// Update all cooldowns 2020 Amelia Clarke
function cooldown() {
    if (flashTime > 0) flashTime--;

    if (!paused) {
        if (bossTime > 0) {
            bossTime -= dt();
            if (bossTime <= 0) spawnBoss();
        }

        if (nextSlowdownTime > 0 && slowTime === 0) nextSlowdownTime -= dt();
        if (nextSlowdownTime < 0) nextSlowdownTime = 0;

        if (slowTime > 0) slowTime -= dt();
        if (slowTime < 0) slowTime = 0;

        if (spawnTime > 0) spawnTime -= dt();
        if (spawnTime < 0) spawnTime = 0;

    }
}

// Return current dt 2020 Amelia Clarke
function dt() {
    if (paused) {
        return 0;
    } else if (slowTime > 0) {
        return SLOWDOWN_DT;
    }
    return 1;
}

// Draw bomb 2020 Amelia Clarke
function drawBomb(x, y) {
    fill('#007C21');
    stroke(0, MODEL_LINE_ALPHA);
    rectMode(CORNER);
    rect(x, y, 20, 20);
}

// Draw heart 2020 Amelia Clarke
function drawHeart(x, y, empty) {
    fill(empty ? 0 : '#D73C2C');
    stroke(0, MODEL_LINE_ALPHA);
    rectMode(CORNER);
    rect(x, y, 20, 20);
}

// Respawn everything for current level 2020 Amelia Clarke
function reloadLevel() {
    curLevel = LEVEL[0];
    toSpawn = curLevel.spawnCount;

    // Clear all entities 2020 Amelia Clarke
    clearEntities();
    spawnPlayer();

    // Reset cooldowns 2020 Amelia Clarke
    bossTime = 0;
    flashTime = 0;
    nextSlowdownTime = 0;
    slowTime = 0;
    spawnTime = SPAWN_GRACE_PERIOD;

    // Reset powerups 2020 Amelia Clarke
    bombs = BOMB_COUNT;
    slowdownReady = true;

    // Reset score 2020 Amelia Clarke
    score = levelScore;
    scoreToAdd = 0;
}

// Reset game to first level 2020 Amelia Clarke
function resetGame() {
    // Game state
    level = 0;
    levelScore = 0;
    score = 0;
    scoreToAdd = 0;
    reloadLevel();
}

// Set score text style 2020 Amelia Clarke
function setScoreStyle(color, weight) {
    let s = document.getElementById('score').style;
    s.color = color;
    s.fontWeight = weight;
}

// Spawn an enemy 2020 Amelia Clarke
function spawnEnemy() {
    spawnTime = randInt(curLevel.spawnTimeMin, curLevel.spawnTimeMax);
    let type = randWeight(curLevel.enemy, curLevel.enemyWeight);
    let e = new Enemy(random(width), WORLD_CEILING);
    applyTemplate(e, ENEMY.basic);
    e.init();
    // Determine spawn location 2020 Amelia Clarke
    if (!e.spawnAboveMap) {
        e.pos.y = MAP_HEIGHT - WORLD_CEILING;
    }

    enemies.push(e);
}

// Spawn the player at the correct coords 2020 Amelia Clarke
function spawnPlayer() {
    pl = new Player(width/2, MAP_HEIGHT * 3/4);
    pl.init();
}

// Update game status on displays 2020 Amelia Clarke
function status() {
    document.getElementById('score').innerHTML = 'Score: ' + score;

    // Debugging
    if (showFPS) calculateFPS();
}

// Draw player bombs 2020 Amelia Clarke
function uiBombs() {
    for (let i = 0; i < bombs; i++) {
        drawBomb(20 + 30*i, height - UI_PANEL_HEIGHT + 60);
    }
}

// Draw player health 2020 Amelia Clarke
function uiHealth() {
    let empty = pl.maxHp - (pl.hp - 1);
    for (let i = pl.maxHp; i >= 0; i--) {
        drawHeart(20 + 30*i, height - UI_PANEL_HEIGHT + 20, --empty > 0);
    }
}

// Draw the UI panel 2020 Amelia Clarke
function uiPanel() {
    // Draw grey rectangle 2020 Amelia Clarke
    fill(48);
    stroke(241, 196, 15);
    rectMode(CORNER);
    rect(0, height - UI_PANEL_HEIGHT, width, UI_PANEL_HEIGHT);

    // Draw all UI panel elements 2020 Amelia Clarke
    strokeWeight(2);
    uiBombs();
    uiHealth();
    uiSlowdown();
    strokeWeight(1);
}

// Draw indicator of slowdown recharge status 2020 Amelia Clarke
function uiSlowdown() {
    push();
    translate(width - 50, height - 50);
    rotate(180);
    stroke(0, MODEL_LINE_ALPHA);

    let loadPercent = (SLOWDOWN_WAIT_NEXT - nextSlowdownTime) / SLOWDOWN_WAIT_NEXT;
    let angle = 360 * loadPercent;

    // Draw blue/green portion 2020 Amelia Clarke
    if (angle > 0) {
        if (angle === 360) {
            fill(55, 219, 208, SLOWDOWN_ALPHA_FULL);
        } else {
            fill(55, 219, 208, SLOWDOWN_ALPHA);
        }
        arc(0, 0, 40, 40, 90, 90 + angle);
    }

    // Draw red portion 2020 Amelia Clarke
    if (angle < 360) {
        fill(231, 76, 60, SLOWDOWN_ALPHA);
        arc(0, 0, 40, 40, 90 + angle, 90);
    }

    pop();
}

// Update the score by slowly adding 2020 Amelia Clarke
function updateScore() {
    if (scoreToAdd >= SCORE_UPDATE_SPEED) {
        scoreToAdd -= SCORE_UPDATE_SPEED;
        score += SCORE_UPDATE_SPEED;
        if (scoreToAdd === 0) setScoreStyle('#ECF0F1', 'normal');
    } else {
        score += scoreToAdd;
        scoreToAdd = 0;
        setScoreStyle('#ECF0F1', 'normal');
    }
}

// Use a bomb powerup 2020 Amelia Clarke
function useBomb() {
    if (bombs > 0 && !paused) {
        bombs--;
        bullets = [];
        pl.invulnTime = INVULN_TIME;
        flashTime = BOMB_FLASH_DURATION;
    }
}

// Use a slowdown powerup 2020 Amelia Clarke
function useSlowdown() {
    if (nextSlowdownTime === 0 && !paused) {
        slowdownReady = false;
        slowTime = SLOWDOWN_DURATION;
        nextSlowdownTime = SLOWDOWN_WAIT_NEXT;
    }
}


/* Main p5.js functions */

function setup() {
    // Ensure game can fit vertically inside screen 
    let maxSize = MAP_HEIGHT;
    let h = windowHeight > maxSize ? maxSize : windowHeight;
    MAP_HEIGHT = h;
    let c = createCanvas(600, h);
    c.parent('game');

    serial = new p5.SerialPort();

    // select the port to open and the baudRate
    serial.open("COM3", {baudRate: 115200});
    serial.on('data', gotData);

    // Configure p5.js
    angleMode(DEGREES);
    ellipseMode(RADIUS);

    // Start background starfield
    starfield = new Starfield(NUM_STARS, STARFIELD_SPEED);

    // Begin level
    resetGame();
}

function draw() {
    // Draw the background and starfield
    flashTime > 0 ? background(255) : background(starfield.bg);
    starfield.display();

    // Update game status display
    if (!paused) updateScore();
    status();

    // Spawn enemies
    if (!paused && spawnTime === 0 && toSpawn > 0) {
        toSpawn--;
        spawnEnemy();
    }

    // Update and draw all entities
    loopOver(bullets);
    loopOver(enemies);
    pl.act();
    loopOver(walls);
    loopOver(ps);

    // Update all cooldowns
    cooldown();

    // Check for player death
    if (pl.dead) pl.onDeath();
}

function keyPressed() {

    // Toggle hitbox display
    if (key === 'H') showHitboxes = !showHitboxes;

    // Pause
    if (key === 'P') paused = !paused;

}
