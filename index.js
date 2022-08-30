var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var sprite;
var lockText;
let stars;
var bombs;
var score = 0;
var gameOver = false;
var scoreText;
var game = new Phaser.Game(config);


function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ship', 'assets/ship.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
}

function create ()
{
    //  A simple background for our game
    this.add.image(400, 300, 'sky');

    sprite = this.physics.add.sprite(400, 300, 'ship');
    
    // Pointer lock will only work after an 'engagement gesture', e.g. mousedown, keypress, etc.
    this.input.on('pointerdown', function (pointer) {

        this.input.mouse.requestPointerLock();

    }, this);

    // When locked, you will have to use the movementX and movementY properties of the pointer
    // (since a locked cursor's xy position does not update)
    this.input.on('pointermove', function (pointer) {
        sprite.setCollideWorldBounds(true);
        sprite.body.setAllowGravity(false);
        if (this.input.mouse.locked)
        {    
            sprite.x += pointer.movementX;
            sprite.y += pointer.movementY;


            // Force the sprite to stay on screen
            sprite.x = Phaser.Math.Wrap(sprite.x, 0, game.renderer.width);
            sprite.y = Phaser.Math.Wrap(sprite.y, 0, game.renderer.height);

            if (pointer.movementX > 0) { sprite.setRotation(0.1); }
            else if (pointer.movementX < 0) { sprite.setRotation(-0.1); }
            else { sprite.setRotation(0); }

            updateLockText(true);
        }
    }, this);

    // Exit pointer lock when Q is pressed. Browsers will also exit pointer lock when escape is
    // pressed.
    this.input.keyboard.on('keydown-Q', function (event) {
        if (this.input.mouse.locked)
        {
            this.input.mouse.releasePointerLock();
        }
    }, this);

    // Optionally, you can subscribe to the game's pointer lock change event to know when the player
    // enters/exits pointer lock. This is useful if you need to update the UI, change to a custom
    // mouse cursor, etc.
    this.input.on('pointerlockchange', function (event) {

        console.log(event);

        updateLockText(event.isPointerLocked, sprite.x, sprite.y);

    }, this);

    lockText = this.add.text(16, 16, '', {
        fontSize: '20px',
        fill: '#ffffff'
    });

    updateLockText(false);
    
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 },

    });
    stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setCollideWorldBounds(true);
        child.setBounce(1);
        child.setVelocity(Phaser.Math.Between(-200, 200), 20);
    });
    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(500, 16, 'score: 0', { fontSize: '32px', fill: '#fff' });
    //  Collide the player and the stars with the platforms
    this.physics.add.collider(bombs, bombs);
    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(sprite, stars, collectStar, null, this);
    this.physics.add.collider(sprite, bombs, hitBomb, null, this);

    
}
function update(){
    if (gameOver)
    {
        return;
    }
}
function updateLockText (isLocked)
{
    lockText.setText([
        isLocked ? 'Presiona ESC para salir' : 'Click para iniciar'
    ]);
}
function collectStar (sprite, star)
{
    star.disableBody(true, true);
    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (sprite.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

function hitBomb (sprite, bomb)
{
    this.physics.pause();

    sprite.setTint(0xff0000);


    gameOver = true;
}