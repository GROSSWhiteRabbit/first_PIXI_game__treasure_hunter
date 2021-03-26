import * as PIXI from "pixi.js";

const Sprite = PIXI.Sprite;

const app = new PIXI.Application({
    width: 512,
    height: 512,
    backgroundColor: 0x000000,
});
document.body.appendChild(app.view);



app.loader.add("../assets/img/textures.json").load(setup);

let // explorer,
    // blobs,
    door,
    endText,
    treasure,
    gameScene,
    gameOverScene,
    healthBar;

    const endTextStyle = new PIXI.TextStyle({
        fontSize: 64,
        fill: 'rgb(0,200,0)',
        stroke: 'black',
        strokeThickness: 4,
    });



let state = play;



function setup() {


    gameScene = new PIXI.Container();
    app.stage.addChild(gameScene);

    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    app.stage.addChild(gameOverScene);



    const textures =
        app.loader.resources["../assets/img/textures.json"].textures;

    const dungeon = new Sprite(textures["dungeon.png"]);
    gameScene.addChild(dungeon);

    door = new Sprite(textures["door.png"]);
    door.x = 30;
    gameScene.addChild(door);

    treasure = new Sprite(textures["treasure.png"]);
    treasure.x = 452;
    treasure.y = gameScene.height / 2;
    treasure.anchor.set(0, 1);
    treasure.rotation = Math.PI / 2;
    gameScene.addChild(treasure);

    explorer.creatExplorer(textures["explorer.png"]);
    explorer.setMoveKeyboards();

    blobs.createBlobs(textures["blob.png"]);


    healthBar = new PIXI.Container();
    healthBar.x = 350;
    gameScene.addChild(healthBar);

    const healthInner = new PIXI.Graphics();
    healthInner.beginFill();
    healthInner.drawRect(0,0,128,15);
    healthInner.endFill();
    healthBar.addChild(healthInner);

    const healthOuter = new PIXI.Graphics();
    healthOuter.beginFill(0xff0000);
    healthOuter.drawRect(0,0,128,15);
    healthOuter.endFill();
    healthBar.addChild(healthOuter);
    healthBar.outer = healthOuter;



    endText = new PIXI.Text('End text',endTextStyle );
    endText.anchor.set(0.5);
    endText.x = gameScene.width/2;
    endText.y = gameScene.height/2;
    gameOverScene.addChild(endText);
    


    app.ticker.add(gameLoop);
}
const explorer = {
    sprite: undefined,
    v: 1,
    creatExplorer(texture) {
        this.sprite = new Sprite(texture);

        // this.sprite.anchor.set(0.5, 1);
        this.sprite.y = gameScene.height / 2;
        this.sprite.x = 80;
        this.sprite.vx = 0;
        this.sprite.vy = 0;

        gameScene.addChild(this.sprite);
    },
    setMoveKeyboards() {
        const left = keyboard("ArrowLeft"),
            up = keyboard("ArrowUp"),
            right = keyboard("ArrowRight"),
            down = keyboard("ArrowDown");

        left.press = () => {
            this.sprite.vx = -this.v;
        };
        left.release = () => {
            if (!right.isDown) {
                this.sprite.vx = 0;
            }
        };
        right.press = () => {
            this.sprite.vx = this.v;
        };
        right.release = () => {
            if (!left.isDown) {
                this.sprite.vx = 0;
            }
        };
        up.press = () => {
            this.sprite.vy = -this.v;
        };
        up.release = () => {
            if (!down.isDown) {
                this.sprite.vy = 0;
            }
        };
        down.press = () => {
            this.sprite.vy = this.v;
        };
        down.release = () => {
            if (!up.isDown) {
                this.sprite.vy = 0;
            }
        };
    },
    play() {
        if (this.sprite.y > gameScene.height - 60) {
            this.sprite.y = gameScene.height - 61;
        } else if (this.sprite.y < 30) {
            this.sprite.y = 31;
        } else {
            this.sprite.y += this.sprite.vy;
        }

        if (this.sprite.x > gameScene.width - 60) {
            this.sprite.x = gameScene.width - 61;
        } else if (this.sprite.x < 30) {
            this.sprite.x = 31;
        } else {
            this.sprite.x += this.sprite.vx;
        }
    },
};

const blobs = {
    numberOfBlobs: 6,
    offset: 50,
    blobsArrSprite: [],
    minV: 0.3,
    maxV: 0.6,
    createBlobs(blobTexture) {
        for (let i = 0; i < this.numberOfBlobs; i++) {
            const blob = new Sprite(blobTexture);

            blob.x = 120 + this.offset * i;
            blob.y = randomInt(30, gameScene.height - 60);
            blob.vy = randomIntAndSign(this.minV, this.maxV);
            gameScene.addChild(blob);
            this.blobsArrSprite.push(blob);
        }
    },
    play() {
        this.blobsArrSprite.forEach((blob) => {
            // console.log(blob.vy);
            if (blob.y > gameScene.height - 60) {
                blob.y = gameScene.height - 61;
                blob.vy = -blob.vy;
            } else if (blob.y < 30) {
                blob.y = 31;
                blob.vy = -blob.vy;
            } else {
                blob.y += blob.vy;
            }
        });
    },
};

function gameLoop() {
    state();
}

function play() {
    blobs.play();
    explorer.play();

    blobs.blobsArrSprite.forEach(blob=>{
        if(hitTestRectangle(blob, explorer.sprite)){
            blob.alpha = 0.5;
            if(healthBar.outer.width<=0){
                state = gameLost;

            } else {
                healthBar.outer.width -= 1;
            }
        } else {
            blob.alpha = 1;

        }
    })
        
    
    if(hitTestRectangle(explorer.sprite, treasure )) {
        treasure.x = explorer.sprite.x +8;
        treasure.y = explorer.sprite.y ;

    }
    if(hitTestRectangle(door, treasure )) {
        state = gameWin;

    }


}

function gameLost(){
    endText.text = 'You lost!';
    endText.style = {...endTextStyle, fill:'red'};
    gameScene.visible = false;
    gameOverScene.visible = true;
}
function gameWin(){
    endText.text = 'You win!';
    endText.style = {...endTextStyle, fill:'rgb(0,200,0)'};
    gameScene.visible = false;
    gameOverScene.visible = true;
}



function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomIntAndSign(min, max) {
    const value = Math.random() * (max - min) + min;
    const randomValue = Math.random();
    if (randomValue >= 0.5) {
        return -value;
    } else {
        return value;
    }
}

function keyboard(value) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = (event) => {
        if (event.key === key.value) {
            if (key.isUp && key.press) key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    //The `upHandler`
    key.upHandler = (event) => {
        if (event.key === key.value) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);

    window.addEventListener("keydown", downListener, false);
    window.addEventListener("keyup", upListener, false);

    // Detach event listeners
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };

    return key;
}

function hitTestRectangle(r1, r2) {
    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
        //A collision might be occurring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {
            //There's definitely a collision happening
            hit = true;
        } else {
            //There's no collision on the y axis
            hit = false;
        }
    } else {
        //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
}
