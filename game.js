const GameState ={
    Initial: 0,
    MainMenu: 1,
    Playing: 2
}
const PlayerState = {
    Walking: 0,
    Falling: 2,
    Jumping: 3
}
function Game(){
    this.canvas = null;
    this.ctx = null;
    this.mouseInput = null;
    this.keyboardInput = null;
    this.world = {
        images:[],
        sprites:[],
        camera:{
           position:[0,0],
           origin:[640/2, 480/2],
           rectBound: new Rect(0,0, 640, 480),
           clearBounds: new Rect(-320, -240, 640 * 2, 480 * 2)

        },
        player:{
            position:[0,0],
            floorRect: new Rect(-16,0,32,32),
            midRect: new Rect(-8, -32, 16, 64),
            fullRect: new Rect(-16,-32,32,64),
            topRect: new Rect(-16, -32,32,32),
            state: PlayerState.Falling,
            linear:{
                speedX: 0,
                speedY: 0,
                accelerationY: 110,
                velocity: [0,0],
                directionX: [1,0],
                directionY: [0,1],
                jumpTime: 0
            }
        },
        floors:[],
        walls: [],
        rectColliders:[],
    },
    this.initialScreen ={
        time: 0
    },
    this.mainMenu = {
        newGameButton: {

        },
        continueButton: {

        },

        settingButton:{

        }
    }
    this.state = GameState.Initial;
}

function Sprite(image, sourceRect, drawRect){
    this.image = image;
    this.sourceRect = sourceRect;
    this.drawRect = drawRect;
    this.layer = 0
}

function addVector2(v0, v1){
    return [v0[0] + v1[0], v0[1] + v1[1]]
}

function scaleVector2(v, s){
    return [v[0] * s, v[1] * s];
}
function centerOfRect(rect){
    return [rect.x + 0.5 * rect.w, rect.y + 0.5 * rect.h];

}
function rectIntersection(rect0, rect1){
    let centerRect0 = centerOfRect(rect0);
    let centerRect1 = centerOfRect(rect1);

    if(Math.abs(centerRect0[0] - centerRect1[0]) > 0.5*(rect0.w + rect1.w)) return false;
    if(Math.abs(centerRect0[1] - centerRect1[1]) > 0.5*(rect0.h + rect1.h)) return false;    
    return true;
}

function playerHorizontalMovement(game, elapsed){
    let player = game.world.player;
    let keyboardInput = game.keyboardInput;
    ///Update x
    if(keyboardInput.left.state === KeyState.Down || keyboardInput.left.state === KeyState.Pressed){
        player.linear.speedX = -100 
    }else if(keyboardInput.right.state === KeyState.Down || keyboardInput.right.state === KeyState.Pressed){  
        player.linear.speedX = 100;
    }
    else{
        player.linear.speedX = 0;
    }

}

function loadWorld(game, path){

}

function playerVerticalMovement(game, elapsed){
    let player = game.world.player;
    player.linear.speedY += player.linear.accelerationY * elapsed;

}

function playerFalling(game, elapsed){
    let player = game.world.player;
    playerHorizontalMovement(game, elapsed);
    playerVerticalMovement(game, elapsed)
    //update y
    
    player.linear.velocity = addVector2(
        scaleVector2(player.linear.directionX,player.linear.speedX),
        scaleVector2(player.linear.directionY,player.linear.speedY)
    );

    movePlayer(player,scaleVector2(player.linear.velocity, elapsed))
    
}

function dynamicRectvsStaticRect(rectD, rectS, v){
     
        let canCollideLeft = rectS.collidableSides.left;
        let canCollideRight = rectS.collidableSides.right;
        let canCollideTop = rectS.collidableSides.top;
        let canCollideBottom = rectS.collidableSides.bottom;
        let divVx = 1 / v[0];
        let divVy = 1 / v[1];
        let sides = {none: 0, top: 1, bottom: 2,  left: 3, right: 4}
        let dbest = 0; 
        let hitSide = sides.none;

        
        if(canCollideLeft && v[0] > 0){
            let d = (rectD.x + rectD.w) - rectS.rect.x;
            d *= divVx;
            if(hitSide === sides.none  || d < dbest){
                dbest = d;
                hitSide = sides.left
            }
        }
        if(canCollideRight && v[0] < 0){
            let d = (rectS.rect.x + rectS.rect.w) - rectD.x
            d *= -divVx;
            if(hitSide === sides.none  || d < dbest){
                dbest = d;
                hitSide = sides.right
            }
        }
        if(canCollideTop && v[1] > 0){
            let d = (rectD.y + rectD.h) - rectS.rect.y;
            d *= divVy;
            if(hitSide === sides.none  || d < dbest){
                dbest = d;
                hitSide = sides.top
            }
        }
        if(canCollideBottom && v[1] < 0){
            let d = (rectS.rect.y + rectS.rect.h) - rectD.y
            d *= -divVy;
            if(hitSide === sides.none || d < dbest){
                dbest = d;
                hitSide = sides.bottom
            }
        }
        switch(hitSide){
            case sides.none:
                return {normal:[0,0],distance: 0}
            case sides.left:
                return {normal:[-1,0],distance: (rectD.x + rectD.w) - rectS.rect.x}
            case sides.right:
                return {normal:[1,0],distance: (rectS.rect.x + rectS.rect.w) - rectD.x}
            case sides.top:
                return {normal:[0,-1],distance: (rectD.y + rectD.h) - rectS.rect.y}
            case sides.bottom:
                return {normal:[0,1],distance: (rectS.rect.y + rectS.rect.h) - rectD.y}
        }
    
}
function playerRectColliderCollision(player, rectColliders){
    player.state = PlayerState.Falling
    
    rectColliders.forEach(rectCollider =>{
        if(rectIntersection(player.fullRect,rectCollider.rect)){
            let dplus = 0;
            let manifold = dynamicRectvsStaticRect(player.fullRect, rectCollider, [player.linear.speedX, player.linear.speedY]);
            if(manifold.normal[0] != 0){
                dplus = 1
               player.linear.speedX = 0;
            }
            else if(manifold.normal[1] != 0){
                player.linear.speedY = 0;

                dplus = 0.01
                if(manifold.normal[1] = -1){
                   player.state = PlayerState.Walking;
                }
            }
            movePlayer(player, scaleVector2(manifold.normal, manifold.distance + dplus));
        }


    });

}
function playerWalking(game, elapsed){
    let player = game.world.player;
    playerHorizontalMovement(game, elapsed);
    player.linear.velocity = addVector2(
        scaleVector2(player.linear.directionX,player.linear.speedX),
        scaleVector2(player.linear.directionY,player.linear.speedY)
    );
    movePlayer(player,scaleVector2(player.linear.velocity, elapsed))



}

function playerJumping(game, elapsed){
    let player = game.world.player;
    playerHorizontalMovement(game, elapsed);
    playerVerticalMovement(game, elapsed);
    player.linear.velocity = addVector2(
        scaleVector2(player.linear.directionX,player.linear.speedX),
        scaleVector2(player.linear.directionY,player.linear.speedY)
    );

    movePlayer(player,scaleVector2(player.linear.velocity, elapsed))
    
    player.linear.jumpTime += elapsed;

}

function playerFloorRectsCollision(player, floors){
    let bottomRect = player.floorRect;
    floors.forEach(floor =>{
        let rect= floor.rect;
        if(rectIntersection(player.floorRect, rect)){
            player.state = PlayerState.Walking;
            player.linear.speedY = 0;
            movePlayer(player, [0, rect.y - (bottomRect.y + bottomRect.h)])
        }
    });
}


function playerWallCollision(player, walls){
    let playerRect = player.midRect;
    walls.forEach( wall =>{
        let rect = wall.rect;
        if(rectIntersection(playerRect,rect)){
            player.linear.speedX = 0;
            if(player.linear.velocity[0] > 0){
                movePlayer(player,[rect.x - (playerRect.x + playerRect.w),0])

            }else if(player.linear.velocity[0] < 0){
                movePlayer(player,[ (rect.x + rect.w)-playerRect.x,0])


            }
        }
    })
}


function updateWorld(game, elapsed){
    let world = game.world;
    let camera = world.camera;
    let ctx = game.ctx;
    let player = world.player;
    let keyboardInput = game.keyboardInput;
    let mouseInput = game.mouseInput

    switch(player.state){
        case PlayerState.Falling:
            playerFalling(game, elapsed);
            
            break;
        case PlayerState.Walking:
            
            if(keyboardInput.action1.state === KeyState.Pressed){
                player.linear.speedY = -200
                player.state = PlayerState.Jumping;
            }
            playerFalling(game, elapsed);
            playerWalking(game, elapsed);
    
            
            break;
        case PlayerState.Jumping:
            playerJumping(game, elapsed);
        
            break;
    }
    playerFloorRectsCollision(player, world.floors)
    playerWallCollision(player, world.walls);
    playerRectColliderCollision(player, world.rectColliders)

    
    


    
    ctx.clearRect(camera.clearBounds.x, camera.clearBounds.y, camera.clearBounds.w, camera.clearBounds.h)
    updateCtx(camera, ctx);
    ctx.fillStyle = "grey"
    ctx.fillRect(camera.position[0],camera.position[1], 640, 480)
    drawFloors(ctx, world.floors);
    drawWalls(ctx, world.walls);
    drawRectColliders(ctx, world.rectColliders)
    debugPlayer(ctx, player);
}

function updateInitialState(game, elapsed){
    let ctx = game.ctx;
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = "white";
    game.initialScreen.time += elapsed;
    for(var i = 0; i < 100; i++){
       
        let x = Math.floor((Math.random() * 640) + 0); 
        let y = Math.floor((Math.random() * 480  * Math.sin(game.initialScreen.time)) + 240); 

        ctx.fillRect(x, y, 1, 1)


    }

}

function updateMainMenuState(game, elapsed){
    let ctx = game.ctx;
    ctx.fillStyle = "orange"
    ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = "white";
    game.initialScreen.time += elapsed;
    for(var i = 0; i < 100; i++){
       
        let x = Math.floor((Math.random() * 640) + 0); 
        let y = Math.floor((Math.random() * 480  * Math.sin(game.initialScreen.time)) + 240); 

        ctx.fillRect(x, y, 1, 1)


    }
}

function playStateToInitialState(game, elapsed){
    
}

function updateGame(game, elapsed){
     
    
    switch(game.state){
        case GameState.Initial:
            updateInitialState(game, elapsed);
            break;
        case GameState.MainMenu:
            updateMainMenuState(game, elapsed);
            break;
        case GameState.Playing:
            updateWorld(game, elapsed);
            break;
    }
}