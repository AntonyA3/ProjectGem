 const Tool ={
    SelectionTool: 0,
    PanTool: 1,
    MoveTool: 2,
    BoxScaleTool: 3
 }

 const SelectableEntity ={
     Nothing: 0,
     Player: 1,
     Wall: 2,
     Floor: 3,
     RectCollider: 4
 }
 const EngineMode ={
    EditMode: 0,
    PlayMode: 1
 }
 
 const PanToolState = {
    NotPanning: 0,
    Panning: 1
 }

 const MoveToolState = {
     NotDragging: 0,
     XDragging: 1,
     YDragging: 2
 }
 
 const BoxScaleState = {
    NotScaling: 0,
    ScalingTop: 1,
    ScalingBottom: 2,
    ScalingLeft: 3,
    ScalingRight: 4
}

const MoveToolMethod = {
    ByMultiple: 0,
    ByStep: 1

}

const BoxScaleToolMethod ={
    ByMultiple: 0,
    ByStep: 1
}

 function EngineView(){
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext('2d');
    this.toolButtons = {
        moveToolButton: document.getElementById("move-tool-button"),
        panToolButton:  document.getElementById("pan-tool-button"),
        selectionToolButton: document.getElementById("selection-tool-button"),
        boxScaleToolButton: document.getElementById("box-scale-tool-button")
    };
    this.addGameObjectButtons ={
        addFloorButton: document.getElementById("add-floor-button"),
        addWallButton: document.getElementById("add-wall-button"),
        addRectColliderButton: document.getElementById("add-rect-collider-button")

    },
    this.engineModeButtons ={
        playButton: document.getElementById("play-button"),
        editButton: document.getElementById("edit-button"),
    }
    this.explorer ={
        treeView: {
            parents: document.querySelectorAll("li.tree-view-parent"),
            player: document.getElementById("player-entity"),
            floorList: document.getElementById("floor-list"),
            wallList: document.getElementById("wall-list"),
            rectColliderList: document.getElementById("rect-collider-list"),
            game: document.getElementById("game-entity")
        }
    }
    
    this.toolProperties = {
        container: document.getElementById("tool-properties-container"),
        moveToolProperties: {
            panel: null,
            method: null,
            xStep: null,
            yStep: null
        },
        boxScaleToolProperties:{
            panel: null,
            method: null,
            leftStep: null,
            rightStep: null,
            bottomStep: null,
            topStep: null
        }
    }
    this.gridActiveCheckbox = document.getElementById("grid-active-checkbox")
    this.serializerButtons ={
        saveButton: document.getElementById("save-level-button"),
        loadButton: document.getElementById("load-level-button")
    }
    
    this.properties ={
        container: document.getElementById("properties-container"),
        gameProperties: {
            panel: null,
            stateProperty: null
        },
        playerProperties: {
            panel: null,
            positionProperty: [null, null]
        },
        wallProperties: {
            panel: null,
            areaProperty:[null, null, null, null]
        },
        floorProperties: {
            panel: null,
            areaProperty:[null, null, null, null]
        },
        rectColliderProperties:{
            panel: null,
            areaProperty: [null, null, null, null]
        }
    }
}

function EngineModel(){
    this.game = new Game();
    this.camera ={
        position:[0,0],
        origin:[640/2, 480/2],
        rectBound: new Rect(0,0, 640, 480),
        clearBounds: new Rect(-320, -240, 640 * 2, 480 * 2)

    },
    this.keyboardInput = new KeyboardInput(),
    this.playMode ={
        game: new Game()
    },
    this.guides ={
        grid:{
                active: true,
                stepX: 32,
                stepY: 32
            }    
    }
    ,
    this.flags ={
        selectedEntity:{
            entity: SelectableEntity.Nothing,
            index: 0
        },
        changedSelectedEntity: true,

        engineMode: EngineMode.EditMode,
        activeTool: Tool.SelectionTool

    }
    this.cursors ={
        mouseInput: new MouseInput(),
        worldCursor:{
            position:[0,0],
        },
        canvasCursor:{
            position:[0,0]
        }
    }
    this.tools = {
        moveTool:{
            position:[0,0],
            targetPosition:[0,0],
            xDragRect: new Rect(4, -4, 64,8),
            yDragRect: new Rect(-4, 4, 8, 64),
            xStep: 1,
            yStep: 1,
            method: MoveToolMethod.ByMultiple,
            state: MoveToolState.NotDragging,
            justActivated: false

        },
        panTool:{
            state: PanToolState.NotPanning
        },
        selectionTool: {
            rect: new Rect()
        },
        boxScaleTool:{
            targetRect: {x:-32, y: -32, w:64, h:64},
            rect: {x:-32, y: -32, w:64, h:64},
            leftPulley:{x: -32-16, y:-4, w: 8, h: 8},
            rightPulley:{x: 32+8, y:-4, w: 8, h: 8},
            topPulley:{x: -4, y:-(32 + 16), w: 8, h: 8},
            bottomPulley:{x: -4, y:32 + 8, w: 8, h: 8},
            leftStep: 1,
            rightStep: 1,
            bottomStep: 1,
            topStep: 1,
            justActivated: true,
            method: BoxScaleToolMethod.ByMultiple,
            state: BoxScaleState.NotScaling
        }
    }
}

function Engine(){
    this.view = new EngineView();
    this.model = new EngineModel();

}


function initializeExplorer(engineView){
    let explorer = engineView.explorer;
    let parents = explorer.treeView.parents;

    parents.forEach(parent => {
        let caret = parent.getElementsByTagName("span")[0];
        caret.onclick = e =>{
            if(e.target == e.currentTarget){
                let children = parent.getElementsByClassName("tree-list");
                for(var i = 0; i < children.length; i++){
                    let child = children[i]
                    if(child.style.visibility != "hidden"){
                        child.style.visibility = "hidden"
                        child.style.height = "0px"
                        caret.innerHTML = "&#9656;&#9;"
                    }else{
                        child.style.visibility = "visible"
                        child.style.height = "initial"
                        caret.innerHTML = "&#9662;&#9;"
                    }  
                }
                
                e.stopPropagation()
            }
        };
    });
}


function initializePlayerProperties(properties){
    let playerProperties = properties.playerProperties;
    let container = properties.container;
    playerProperties.panel = document.createElement("div");
    playerProperties.panel.style.display = "grid"
    playerProperties.panel.innerHTML = `
    <div style="grid-row:1;">Player</div>
    <div style="grid-row:2 grid-column:1;">
        Position: 
        x
        <input id="player-position-x" type="text" pattern:"[0-9]" size="3"></input> 
        y
        <input id="player-position-y" type="text"  pattern:"[0-9]" size="3"></input>
    </div>
    `
    container.appendChild(playerProperties.panel);
    playerProperties.positionProperty[0] = document.getElementById("player-position-x");
    playerProperties.positionProperty[1] = document.getElementById("player-position-y");
    container.removeChild(playerProperties.panel);
}
function initializeMoveToolProperties(toolProperties){
    let moveToolProperties = toolProperties.moveToolProperties;
    container = toolProperties.container;
    moveToolProperties.panel = document.createElement("div");
    moveToolProperties.panel.style.display = "grid"
    moveToolProperties.panel.innerHTML = `
    <div style="grid-row:1;">Move Tool</div>
    <div style="grid-row:2 grid-column:1;">
        <select id="move-tool-method">
          <option value="byMultiple">By Multiple </option>
          <option value="byStep">By Step</option>
        
        </select>
        Step: 
        x
        <input id="move-tool-step-x" type="text" pattern:"[0-9]" size="3"></input> 
        y
        <input id="move-tool-step-y" type="text"  pattern:"[0-9]" size="3"></input>
    </div>
    `
    container.appendChild(moveToolProperties.panel);
    moveToolProperties.method = document.getElementById("move-tool-method");
    moveToolProperties.xStep = document.getElementById("move-tool-step-x");
    moveToolProperties.yStep = document.getElementById("move-tool-step-y");
    container.removeChild(moveToolProperties.panel);

}

function initializeBoxScaleToolProperties(toolProperties){
    let boxScaleToolProperties = toolProperties.boxScaleToolProperties;
    container = toolProperties.container;
    boxScaleToolProperties.panel = document.createElement("div");
    boxScaleToolProperties.panel.style.display = "grid"
    boxScaleToolProperties.panel.innerHTML = `
        <div style="grid-row:1">Box Scale Tool</div>
        <div style="grid-row:2 grid-column:1;">
        <select id="box-scale-tool-method">
            <option value="byMultiple">By Multiple </option>
            <option value="byStep">By Step</option>
        </select>
        Step: 
        left
        <input id="box-scale-tool-step-left" type="text" pattern:"[0-9]" size="3"></input> 
        right
        <input id="box-scale-tool-step-right" type="text"  pattern:"[0-9]" size="3"></input>
        bottom
        <input id="box-scale-tool-step-bottom" type="text"  pattern:"[0-9]" size="3"></input>
        top
        <input id="box-scale-tool-step-top" type="text"  pattern:"[0-9]" size="3"></input>
    `
    container.appendChild(boxScaleToolProperties.panel);

    boxScaleToolProperties.method = document.getElementById("box-scale-tool-method")
    boxScaleToolProperties.leftStep = document.getElementById("box-scale-tool-step-left");
    boxScaleToolProperties.rightStep = document.getElementById("box-scale-tool-step-right");
    boxScaleToolProperties.bottomStep = document.getElementById("box-scale-tool-step-bottom");
    boxScaleToolProperties.topStep = document.getElementById("box-scale-tool-step-top");
    container.removeChild(boxScaleToolProperties.panel);


}

function initializeSaveLevelEvent(engine){
    let saveLevelButton = engine.view.serializerButtons.saveButton;
    saveLevelButton.onclick = e =>{
        saveLevel(engine.model.game);
    }
}

function initializeLoadLevelEvent(engine){
    let loadLevelButton = engine.view.serializerButtons.loadButton;
    loadLevelButton.onclick = e =>{
        loadLevel(engine.model.game, engine);
    }
}

function initializeGameProperties(properties){
    let gameProperties = properties.gameProperties;
    let container = properties.container;
    gameProperties.panel = document.createElement("div");
    
    gameProperties.panel.style.display = "grid";
    gameProperties.panel.innerHTML = `
    <div style="grid-row:1;">Game</div>
    <div style="grid-row:2 grid-column:1;">
        State
        <select id="states">
            <option value="playing">Playing</option>
            <option value="initial">Initial</option>
            <option value="mainmenu">Main Menu</option>
        </select>
    </div>
    `
    container.appendChild(gameProperties.panel);
    gameProperties.stateProperty = document.getElementById("states");
    container.removeChild(gameProperties.panel);
    
}
function initializeSelectGameStateEvent(engine){
    let gameProperties = engine.view.properties.gameProperties;
    let stateProperty = gameProperties.stateProperty;
    let game = engine.model.game;
    stateProperty.onchange = e =>{
        switch(stateProperty.value){
            case "initial":
                game.state = GameState.Initial;
                break;
            case "mainmenu":
                game.state = GameState.MainMenu;
                break;
            case "playing":
                game.state = GameState.Playing;
                break;
        }
    } 
}

function initializeMoveToolButtonEvent(engine){
    let moveToolButton = engine.view.toolButtons.moveToolButton;
    let toolProperties = engine.view.toolProperties;
    let moveTool = engine.model.tools.moveTool;
    moveToolButton.onclick = e =>{
        if(moveToolButton.checked){
            setMoveToolProperties(toolProperties, moveTool)
            engine.model.flags.activeTool = Tool.MoveTool;
            engine.view.toolProperties.container.appendChild(engine.view.toolProperties.moveToolProperties.panel)
        }
    }
   
}



function initilizeSelectionToolButtonEvent(engine){
    let selectionToolButton = engine.view.toolButtons.selectionToolButton;
    selectionToolButton.checked = true;

    selectionToolButton.onclick = e =>{
        if(selectionToolButton.checked){
            engine.model.flags.activeTool = Tool.SelectionTool;
        }
    }
        
}

function initializePanToolButtonEvent(engine){
    let panToolButton = engine.view.toolButtons.panToolButton;
 
    panToolButton.onclick = e =>{
        if(panToolButton.checked){
            engine.model.flags.activeTool = Tool.PanTool;
        }
    }
}

function initialsizeBoxScaleToolButtonEvent(engine){
    let boxScaleToolButton = engine.view.toolButtons.boxScaleToolButton;
    let toolProperties = engine.view.toolProperties;
    let boxScaleTool = engine.model.tools.boxScaleTool;

    boxScaleToolButton.onclick = e =>{
        if(boxScaleToolButton.checked){
            setBoxScaleToolProperties(toolProperties, boxScaleTool)
            engine.model.flags.activeTool = Tool.BoxScaleTool;
            boxScaleTool.justActivated = true;
        
            engine.view.toolProperties.container.appendChild(engine.view.toolProperties.boxScaleToolProperties.panel)

        }

    }
}

function initializeWallProperties(properties){
    let wallProperties = properties.wallProperties;
    let container = properties.container;
    wallProperties.panel = document.createElement("div");
    wallProperties.panel.style.display = "grid"
    wallProperties.panel.innerHTML = `
    <div style="grid-row:1;">Wall</div>
    <div style="grid-row:2 grid-column:1;">
    Area: x
    <input id="wall-area-x" size="3"></input> 
    y
    <input id="wall-area-y" size="3"></input>
    w
    <input id="wall-area-w" size="3"></input>
    h
    <input id="wall-area-h" size="3"></input>
    `
    container.appendChild(wallProperties.panel);
    wallProperties.areaProperty[0] = document.getElementById("wall-area-x");
    wallProperties.areaProperty[1] = document.getElementById("wall-area-y");
    wallProperties.areaProperty[2] = document.getElementById("wall-area-w");
    wallProperties.areaProperty[3] = document.getElementById("wall-area-h");
    container.removeChild(wallProperties.panel);
}

function initializeFloorProperties(properties){
    let floorProperties = properties.floorProperties;
    let container = properties.container;
    floorProperties.panel = document.createElement("div");
    floorProperties.panel.style.display = "grid";
    floorProperties.panel.innerHTML = `
    <div style="grid-row:1;">Floor</div>
    <div style="grid-row:2 grid-column:1;">
    Area: x
    <input id="floor-area-x" size="3"></input> 
    y
    <input id="floor-area-y" size="3"></input>
    w
    <input id="floor-area-w" size="3"></input>
    h
    <input id="floor-area-h" size="3"></input>
    `
    container.appendChild(floorProperties.panel);
    floorProperties.areaProperty[0] = document.getElementById("floor-area-x");
    floorProperties.areaProperty[1] = document.getElementById("floor-area-y");
    floorProperties.areaProperty[2] = document.getElementById("floor-area-w");
    floorProperties.areaProperty[3] = document.getElementById("floor-area-h");
    container.removeChild(floorProperties.panel);

    
}

function initializeRectColliderProperties(properties){
    let rectColliderProperties = properties.rectColliderProperties;
    let container = properties.container;
    rectColliderProperties.panel = document.createElement("div");
    rectColliderProperties.panel.style.display = "grid"
    rectColliderProperties.panel.innerHTML = `
    <div style="grid-row:1;">Rect Collider</div>
    <div style="grid-row:2 grid-column:1;">
    Area: x
    <input id="rect-collider-area-x" size="3"></input> 
    y
    <input id="rect-collider-area-y" size="3"></input>
    w
    <input id="rect-collider-area-w" size="3"></input>
    h
    <input id="rect-collider-area-h" size="3"></input>
    `
    container.appendChild(rectColliderProperties.panel);
    rectColliderProperties.areaProperty[0] = document.getElementById("rect-collider-area-x");
    rectColliderProperties.areaProperty[1] = document.getElementById("rect-collider-area-y");
    rectColliderProperties.areaProperty[2] = document.getElementById("rect-collider-area-w");
    rectColliderProperties.areaProperty[3] = document.getElementById("rect-collider-area-h");
    container.removeChild(rectColliderProperties.panel);
}
function clearProperties(properties){
    while(properties.container.children.length != 0){
        properties.container.removeChild(properties.container.childNodes[0])
    }
}

function clearToolProperties(toolProperties){
    while(toolProperties.container.children.length != 0){
        toolProperties.container.removeChild(toolProperties.container.childNodes[0])
    }
}

function setPropertiesToPlayerProperties(properties, player){
    clearProperties(properties);
    let playerProperties = properties.playerProperties;
    let positionProperty = playerProperties.positionProperty;
    positionProperty[0].value = player.position[0];
    positionProperty[1].value = player.position[1];
    
    properties.container.appendChild(playerProperties.panel);

}

function setMoveToolProperties(toolProperties, moveTool){
    clearToolProperties(toolProperties)
    let moveToolProperties = toolProperties.moveToolProperties;
    let xStep = moveToolProperties.xStep;
    let yStep = moveToolProperties.yStep;
    xStep.value = moveTool.xStep;
    yStep.value = moveTool.yStep;

    switch(moveTool.method){
        case MoveToolMethod.ByMultiple:
            moveToolProperties.method.value = "byMultiple"
            break;
        case MoveToolMethod.ByStep:
            moveToolProperties.method.value = "byStep"

            break;
    }


}

function setBoxScaleToolProperties(toolProperties, boxScaleTool){
    clearToolProperties(toolProperties);
    let boxScaleToolProperties = toolProperties.boxScaleToolProperties;
    let leftStep = boxScaleToolProperties.leftStep;
    let rightStep = boxScaleToolProperties.rightStep;
    let bottomStep  = boxScaleToolProperties.bottomStep;
    let topStep = boxScaleToolProperties.topStep;

    leftStep.value = boxScaleTool.leftStep;
    rightStep.value = boxScaleTool.rightStep;
    bottomStep.value = boxScaleTool.bottomStep;
    topStep.value = boxScaleTool.topStep;

    switch(boxScaleTool.method){
        case BoxScaleToolMethod.ByMultiple:
            boxScaleToolProperties.method.value = "byMultiple"
            break;
        case BoxScaleToolMethod.ByStep:
            boxScaleToolProperties.method.value = "byStep"
            break;
    }


}

function setPropertiesToWallProperties(properties, wall){
    clearProperties(properties);
    let wallProperties = properties.wallProperties;
    let areaProperty = wallProperties.areaProperty;
    areaProperty[0].value = wall.rect.x;
    areaProperty[1].value = wall.rect.y;
    areaProperty[2].value = wall.rect.w;
    areaProperty[3].value = wall.rect.h;
    properties.container.appendChild(wallProperties.panel);
}

function setPropertiesToRectColliderProperties(properties, rectCollider){
    clearProperties(properties);
    let rectColliderProperties = properties.rectColliderProperties;
    let areaProperty = rectColliderProperties.areaProperty;
    areaProperty[0].value = rectCollider.rect.x;
    areaProperty[1].value = rectCollider.rect.y;
    areaProperty[2].value = rectCollider.rect.w;
    areaProperty[3].value = rectCollider.rect.h;
    properties.container.appendChild(rectColliderProperties.panel);

    
}
function setPropertiesToFloorProperties(properties, floor){
    clearProperties(properties);
    let floorProperties = properties.floorProperties;
    let areaProperty = floorProperties.areaProperty;
    areaProperty[0].value = floor.rect.x;
    areaProperty[1].value = floor.rect.y;
    areaProperty[2].value = floor.rect.w;
    areaProperty[3].value = floor.rect.h;
    properties.container.appendChild(floorProperties.panel);
}

function setPropertiesToGameProperties(properties, game){
    clearProperties(properties);
    let gameProperties = properties.gameProperties;        
    properties.container.appendChild(gameProperties.panel);
}


function initializeSelectPlayerExplorerEvent(engine){
    let properties = engine.view.properties;
    let player = engine.model.game.world.player;
    let playerExplorer =engine.view.explorer.treeView.player
    
    playerExplorer.onclick = e =>{
        engine.model.flags.selectedEntity.entity = SelectableEntity.Player;
        setPropertiesToPlayerProperties(properties, player)
    }
}

function initializeSelectGameExplorerEvent(engine){
    let properties = engine.view.properties;
    let game = engine.model.game;
    let gameExplorer = engine.view.explorer.treeView.game;

    gameExplorer.onclick = e =>{
        if(e.target == e.currentTarget){
            setPropertiesToGameProperties(properties, game);
        }
        
    }
}

function initializeAddFloorEvent(engine){
    
    let addFloorButton = engine.view.addGameObjectButtons.addFloorButton;
    let floorList = engine.view.explorer.treeView.floorList;
    let properties = engine.view.properties;

    addFloorButton.onclick = e =>{
        let world = engine.model.game.world;
        let floors = world.floors;
        let floor = {
            rect: new Rect(0,0,32,32)
        }
        world.floors.push(floor);
        setPropertiesToFloorProperties(properties, floor)
        while(floorList.children.length != 0){
            floorList.removeChild(floorList.childNodes[0]);
        }
        for(var i = 0; i < floors.length; i++){
        let item = document.createElement("li");
           item.innerHTML =  `#` + i
           item.attributes.name = i.toString();
           item.onclick =  e => {
                engine.model.flags.selectedEntity.entity = SelectableEntity.Floor;
                engine.model.flags.selectedEntity.index = parseInt(item.attributes.name);
                setPropertiesToFloorProperties(properties,floor)};

           floorList.appendChild(item);
        }
    }
}



function initializeMoveToolPropertiesEvents(engine){
    let moveToolProperties = engine.view.toolProperties.moveToolProperties;
    let moveTool =  engine.model.tools.moveTool;

    moveToolProperties.xStep.onchange = e =>{
        let value = moveToolProperties.xStep.value;
        if (!isNaN(parseFloat(value)) && !isNaN(value - 0) ) {
            moveTool.xStep = value;

        }else{
            moveTool.xStep = 1;
        }
    }

    moveToolProperties.yStep.onchange = e =>{
        let value = moveToolProperties.yStep.value;
        if (!isNaN(parseFloat(value)) && !isNaN(value - 0) ) {
            moveTool.yStep = value;

        }else{
            moveTool.yStep = 1;
        }
    }

    moveToolProperties.method.onchange = e =>{
        switch(moveToolProperties.method.value){
            case "byMultiple":
                moveTool.method = MoveToolMethod.ByMultiple;
                break;
            case "byStep":
                moveTool.method = MoveToolMethod.ByStep;
                break;
        }
    }

}

function initializeDeleteEntityEvent(engine){
    document.onkeydown = e =>{
        if(e.key.toLowerCase() == "delete"){
            let selectedEntity = engine.model.flags.selectedEntity.entity;
            let index = engine.model.flags.selectedEntity.index;
        let game = engine.model.game;
            if(selectedEntity !== SelectableEntity.Nothing){
                switch(selectedEntity){
                    case SelectableEntity.RectCollider:
                        game.world.rectColliders.splice(index,1);
                        updateExplorer(engine);
                        break;
                    case SelectableEntity.Wall:
                        game.world.walls.splice(index,1);
                        updateExplorer(engine);
                        break;
                    case SelectableEntity.Floor:
                        game.world.floors.splice(index,1);
                        updateExplorer(engine);
                        break;
                }
                engine.model.flags.selectedEntity.entity = SelectableEntity.Nothing;
                engine.model.flags.selectedEntity.index = 0;

            }
        }

    }
    
}

function initializeBoxScaleToolPropertiesEvents(engine){
    let boxScaleToolProperties = engine.view.toolProperties.boxScaleToolProperties;
    let boxScaleTool = engine.model.tools.boxScaleTool;

    boxScaleToolProperties.leftStep.onchange = e =>{
        let value =  boxScaleToolProperties.leftStep.value;
        if (!isNaN(parseFloat(value)) && !isNaN(value - 0) ) {
            boxScaleTool.leftStep = value;

        }else{
            boxScaleTool.leftStep = 1;
        }
    }

    boxScaleToolProperties.rightStep.onchange = e =>{
        let value =  boxScaleToolProperties.rightStep.value;
        if (!isNaN(parseFloat(value)) && !isNaN(value - 0) ) {
            boxScaleTool.rightStep = value;

        }else{
            boxScaleTool.rightStep = 1;
        }

    }

    boxScaleToolProperties.bottomStep.onchange = e =>{
        let value =  boxScaleToolProperties.bottomStep.value;
        if (!isNaN(parseFloat(value)) && !isNaN(value - 0) ) {
            boxScaleTool.bottomStep = value;

        }else{
            boxScaleTool.bottomStep = 1;
        }

    }
    
    boxScaleToolProperties.topStep.onchange = e =>{
        let value =  boxScaleToolProperties.topStep.value;
        if (!isNaN(parseFloat(value)) && !isNaN(value - 0) ) {
            boxScaleTool.topStep = value;

        }else{
            boxScaleTool.topStep = 1;
        }

    }

    boxScaleToolProperties.method.onchange = e =>{
        switch(boxScaleToolProperties.method.value){
            case "byMultiple":
                boxScaleTool.method = BoxScaleToolMethod.ByMultiple;
                break;
            case "byStep":
                boxScaleTool.method = BoxScaleToolMethod.ByStep;
                break;
        }
    }

}
function initializeAddWallEvent(engine){
    
    let addWallButton = engine.view.addGameObjectButtons.addWallButton;
    let wallList = engine.view.explorer.treeView.wallList;
    let properties = engine.view.properties;

    addWallButton.onclick = e =>{
        let world = engine.model.game.world;
        let walls = world.walls;
        let wall = {
            rect: new Rect(0,0,32,32)
        }
        walls.push(wall);
        setPropertiesToWallProperties(properties,wall);

        while(wallList.children.length != 0){
            wallList.removeChild(wallList.childNodes[0]);
        }
        for(var i = 0; i < walls.length; i++){
           let item = document.createElement("li");
           item.innerHTML =  `#` + i
           item.attributes.name =  i.toString();
           item.onclick =  e => {
               engine.model.flags.selectedEntity.entity = SelectableEntity.Wall;
               engine.model.flags.selectedEntity.index = parseInt(item.attributes.name);
               setPropertiesToWallProperties(properties,wall)};
           wallList.appendChild(item);
        }
    }
    
}

function initializeAddRectColliderEvent(engine){
    
    let addRectColliderButton = engine.view.addGameObjectButtons.addRectColliderButton;
    let rectColliderList =engine.view.explorer.treeView.rectColliderList;
    let properties = engine.view.properties;
    addRectColliderButton.onclick = e =>{
        let world = engine.model.game.world;
        let rectColliders = world.rectColliders;
        let rectCollider = {
            rect: new Rect(0,0,32,32),
            collidableSides:{
                left: true,
                right: true,
                bottom: true,
                top: true
            }
        }
        world.rectColliders.push(rectCollider);
        setPropertiesToRectColliderProperties(properties,rectCollider);
        while(rectColliderList.children.length != 0){
            rectColliderList.removeChild(rectColliderList.childNodes[0]);
        }
        for(var i = 0; i < rectColliders.length; i++){
           let item = document.createElement("li");
           item.innerHTML =  `#` + i
           item.attributes.name = i.toString();
           item.onclick = e => {
                engine.model.flags.selectedEntity.entity = SelectableEntity.RectCollider;
                engine.model.flags.selectedEntity.index = parseInt(item.attributes.name);
                setPropertiesToRectColliderProperties(properties,rectCollider)
            };
           rectColliderList.appendChild(item);
        }
    }
}


function copyRect(rect){
    return new Rect(rect.x, rect.y, rect.w, rect.h);
}


function debugPlayer(ctx, player){
    ctx.fillStyle = "lime";
    ctx.beginPath();
    ctx.arc(player.position[0], player.position[1], 3,0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "blue";
    ctx.strokeRect(player.fullRect.x, player.fullRect.y, player.fullRect.w, player.fullRect.h);

    ctx.strokeStyle = "pink";
    ctx.strokeRect(player.floorRect.x, player.floorRect.y, player.floorRect.w, player.floorRect.h);

    ctx.strokeStyle = "orange";
    ctx.strokeRect(player.midRect.x, player.midRect.y, player.midRect.w, player.midRect.h);

    

}

function drawFloors(ctx,floors){
    ctx.fillStyle = "green"
    for(var i = 0; i < floors.length; i++){
        let floor = floors[i];
        let rect = floor.rect;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
}

function drawWalls(ctx, walls){
    ctx.fillStyle = "purple";
    for(var i = 0; i < walls.length; i++){
        let wall = walls[i];
        let rect = wall.rect;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
    }
}

function drawRectColliders(ctx, rectColliders){
    ctx.fillStyle = "orange";
    for(var i = 0; i < rectColliders.length; i++){
        let rectCollider = rectColliders[i];
        let rect = rectCollider.rect;
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
}

function updateCursors(engine){
    let cursors = engine.model.cursors;
    let canvas = engine.view.canvas;
    let bounds = canvas.getBoundingClientRect();
    let camera = engine.model.camera;
    let mouseCursor = cursors.mouseInput;
    let worldCursor = cursors.worldCursor;
    let canvasCursor = cursors.canvasCursor

    canvasCursor.position = [
        mouseCursor.position[0] - bounds.x, 
        mouseCursor.position[1] - bounds.y
    ];
    
    worldCursor.position = [
        canvasCursor.position[0] + camera.position[0],
        canvasCursor.position[1] + camera.position[1]
    ];
}

function moveCamera(camera, movement){
    camera.position[0] += movement[0];
    camera.position[1] += movement[1];
    camera.rectBound.x += movement[0];
    camera.rectBound.y += movement[1];
    camera.clearBounds.x += movement[0];
    camera.clearBounds.y += movement[1];
}

function usingPanTool(engine, elapsed){
    let panTool = engine.model.tools.panTool;
    let mouseInput = engine.model.cursors.mouseInput;
    let camera = engine.model.camera;
    switch(panTool.state){
        case PanToolState.NotPanning:
            if(mouseInput.overCanvas && mouseInput.leftButton.state === MouseButtonState.Pressed){
                panTool.state = PanToolState.Panning;
            }
            break;
        case PanToolState.Panning:
            moveCamera(camera, mouseInput.deltaPosition);
            
            if(mouseInput.leftButton.state === MouseButtonState.UP){
                panTool.state = PanToolState.NotPanning;  
            }
            break;
    }
    
}


function getPlayerSelectionRect(player){
    let center = player.position;
    let position = [
        center[0] - 16,
        center[1] - 32
    ];
    return new Rect(position[0], position[1], 32, 64);
} 

function updateSelectionToolRect(engine, elapsed){
    let world = engine.model.game.world;
    let index = engine.model.flags.selectedEntity.index;
    let selectionTool = engine.model.tools.selectionTool;
    switch(engine.model.flags.selectedEntity.entity){
        case SelectableEntity.Player:
            let playerRect = getPlayerSelectionRect(world.player);
            selectionTool.rect = copyRect(playerRect);
            break;
        case SelectableEntity.Floor:
            selectionTool.rect = copyRect(world.floors[index].rect)
            
            break;
        case SelectableEntity.RectCollider:
            selectionTool.rect = copyRect(world.rectColliders[index].rect)

            break;
        case SelectableEntity.Wall:
            selectionTool.rect = copyRect(world.walls[index].rect)
            break;
    }
}

function initializeSelectEditModeEvent(engine){
    let editModeButton = engine.view.engineModeButtons.editButton;
    editModeButton.checked = true;
    editModeButton.onclick = e =>{
        if (editModeButton.checked){
            engine.model.flags.engineMode = EngineMode.EditMode;
        }
    }

}
function saveLevel(game){
    let world = game.world;
    let fileOutput = document.createElement("a");
    fileOutput.setAttribute('href',"data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(world)));
    fileOutput.setAttribute('download', "ddc.json");
    fileOutput.style.display = 'none';
    
    document.body.appendChild(fileOutput);
    fileOutput.click();
    document.body.removeChild(fileOutput);


}
function updateExplorer(engine){
    let wallList = engine.view.explorer.treeView.wallList;
    let floorList = engine.view.explorer.treeView.floorList;
    let rectColliderList = engine.view.explorer.treeView.rectColliderList;

    let world = engine.model.game.world;
    while(wallList.children.length != 0){
        wallList.removeChild(wallList.childNodes[0]);
    }
    for(var i = 0; i < world.walls.length; i++){
       let item = document.createElement("li");
       item.innerHTML =  `#` + i
       item.attributes.name =  i.toString();
       
       item.onclick =  e => {
           engine.model.flags.selectedEntity.entity = SelectableEntity.Wall;
           engine.model.flags.selectedEntity.index = parseInt(item.attributes.name);
       }
       wallList.appendChild(item);
    }

    while(floorList.children.length != 0){
        floorList.removeChild(floorList.childNodes[0]);
    }
    for(var i = 0; i < world.floors.length; i++){
    let item = document.createElement("li");
       item.innerHTML =  `#` + i
       item.attributes.name = i.toString();
       
       item.onclick =  e => {
            engine.model.flags.selectedEntity.entity = SelectableEntity.Floor;
            engine.model.flags.selectedEntity.index = parseInt(item.attributes.name);
       }
       floorList.appendChild(item);
    }

    while(rectColliderList.children.length != 0){
        rectColliderList.removeChild(rectColliderList.childNodes[0]);
    }
    for(var i = 0; i < world.rectColliders.length; i++){
       let item = document.createElement("li");
       item.innerHTML =  `#` + i
       item.attributes.name = i.toString();
       
       item.onclick = e => {
            engine.model.flags.selectedEntity.entity = SelectableEntity.RectCollider;
            engine.model.flags.selectedEntity.index = parseInt(item.attributes.name);
            
        };
       rectColliderList.appendChild(item);
    }

}

function loadLevel(game, engine){
    let fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);
    fileInput.onchange = e =>{
      let input = e.target;
      let reader = new FileReader();
      let file = input.files[0];
      reader.readAsText(file)
      reader.onload = e =>{
          Object.assign(game.world, JSON.parse(reader.result))
          if(engine){
              updateExplorer(engine)
          }
      }
    }
    fileInput.click();
    
    document.body.removeChild(fileInput);


}

function initializeSelectPlayModeEvent(engine){
    let playButton = engine.view.engineModeButtons.playButton;
    playButton.onclick = e =>{
        if (playButton.checked){
            engine.model.flags.engineMode = EngineMode.PlayMode;
            let engineGameWorld = engine.model.game.world;
            engine.model.playMode.game.world = JSON.parse(JSON.stringify(engineGameWorld));
        
            //engine.model.playMode.game = copyGame(engine.model.game);
        }
    }
}

function initializeShowGridCheckboxEvent(engine){
    let checkbox = engine.view.gridActiveCheckbox;
    checkbox.checked = true;
    checkbox.onclick = e =>{
        engine.model.guides.grid.active = checkbox.checked;
    }
}

function usingSelectionTool(engine, elapsed){
    let world = engine.model.game.world;
    let mouseInput = engine.model.cursors.mouseInput;
    let worldCursor = engine.model.cursors.worldCursor;
    let selected = false;
    let properties = engine.view.properties;
    let selectionTool = engine.model.tools.selectionTool;

    let lastSelectedEntity =  engine.model.flags.selectedEntity.entity;
    let lastEntityIndex = engine.model.flags.selectedEntity.index;
    
    {
        let playerRect = getPlayerSelectionRect(world.player);
        if(mouseInput.leftButton.state === MouseButtonState.Pressed && rectContainsPoint(playerRect, worldCursor.position)){
            engine.model.flags.selectedEntity.entity = SelectableEntity.Player;
            selected = true;
            setPropertiesToPlayerProperties(properties, world.player)
            selectionTool.rect = copyRect(playerRect);
            
        }
    }
    for(var i = 0; i < world.floors.length && !selected; i++){
        let floor = world.floors[i];
        let rect = floor.rect;
        if(mouseInput.leftButton.state === MouseButtonState.Pressed && rectContainsPoint(rect, worldCursor.position)){
            engine.model.flags.selectedEntity.entity = SelectableEntity.Floor;
            engine.model.flags.selectedEntity.index = i;
            setPropertiesToFloorProperties(properties, floor)
            selectionTool.rect = copyRect(rect);
            selected = true;
        }
    }

    for(var i = 0; i < world.walls.length && !selected; i++){
        let wall = world.walls[i];
        let rect = wall.rect;
        if(mouseInput.leftButton.state === MouseButtonState.Pressed && rectContainsPoint(rect, worldCursor.position)){
            engine.model.flags.selectedEntity.entity = SelectableEntity.Wall;
            engine.model.flags.selectedEntity.index = i;
            setPropertiesToWallProperties(properties, wall)
            selectionTool.rect = copyRect(rect);

            selected = true;
            
        }
    }

    for (var i = 0; i < world.rectColliders.length && !selected; i++){
        let rectCollider = world.rectColliders[i]
        let rect = rectCollider.rect;
        if(mouseInput.leftButton.state === MouseButtonState.Pressed && rectContainsPoint(rect, worldCursor.position)){
            engine.model.flags.selectedEntity.entity = SelectableEntity.RectCollider;
            engine.model.flags.selectedEntity.index = i; 
            setPropertiesToRectColliderProperties(properties, rectCollider);
            selectionTool.rect = copyRect(rect);

            selected = true;  
        }
    }

    if(!selected && mouseInput.leftButton.state === MouseButtonState.Pressed && mouseInput.overCanvas){
        engine.model.flags.selectedEntity.entity = SelectableEntity.Nothing;
    }

    if(engine.model.flags.selectedEntity.entity !== lastSelectedEntity ||
        engine.model.flags.selectedEntity.index !== lastEntityIndex){
            engine.model.flags.changedSelectedEntity = true;
        }
}

function setMoveToolPosition(moveTool, position){
    let delta  = [
        position[0] - moveTool.position[0],
        position[1] - moveTool.position[1]
    ]
    moveTool.position[0] += delta[0];
    moveTool.position[1] += delta[1];
    moveTool.xDragRect.x += delta[0];
    moveTool.xDragRect.y += delta[1];
    moveTool.yDragRect.x += delta[0];
    moveTool.yDragRect.y += delta[1];
}
function moveRect(rect, movement){
    rect.x += movement[0];
    rect.y += movement[1];
}
function moveFloor(floor, movement){
    moveRect(floor.rect, movement);
}

function moveWall(wall, movement){
    moveRect(wall.rect, movement);

}
function setFloorPosition(floor, position){
    floor.rect.x = position[0];
    floor.rect.y = position[1];
}

function setWallPosition(wall, position){
    wall.rect.x = position[0];
    wall.rect.y = position[1];
}

function setRectColliderPosition(rectCollider, position){
    rectCollider.rect.x = position[0];
    rectCollider.rect.y = position[1];
}
function moveRectCollider(rectCollider, movement){
    moveRect(rectCollider.rect, movement);

}


function movePlayer(player, movement){
    player.position[0] += movement[0];
    player.position[1] += movement[1];
    moveRect(player.floorRect,movement);
    moveRect(player.midRect, movement);
    moveRect(player.fullRect, movement);
    moveRect(player.topRect, movement)
}

function setPlayerPosition(player, position){
    let movement = [
        position[0] - player.position[0],
        position[1] - player.position[1],
    ];
    movePlayer(player, movement);
}

function drawBoxScaleTool(ctx, boxScaleTool){
    let rect = boxScaleTool.rect;
    let leftPulley = boxScaleTool.leftPulley;
    let rightPulley = boxScaleTool.rightPulley;
    let bottomPulley = boxScaleTool.bottomPulley;
    let topPulley = boxScaleTool.topPulley;
    ctx.strokeStyle = "blue";
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)
    ctx.fillStyle = "blue";
    ctx.fillRect(leftPulley.x, leftPulley.y, leftPulley.w, leftPulley.h);
    ctx.fillRect(rightPulley.x, rightPulley.y, rightPulley.w, rightPulley.h);
    ctx.fillRect(bottomPulley.x, bottomPulley.y, bottomPulley.w, bottomPulley.h);
    ctx.fillRect(topPulley.x, topPulley.y, topPulley.w, topPulley.h);   
}

function rectContainsPoint(rect, point){
    if (point[0] < rect.x || point[0] > (rect.x + rect.w)) return false;
    if (point[1] < rect.y || point[1] > (rect.y + rect.h)) return false;
    return true;
}



function editLevel(engine, elapsed){
    switch(engine.model.flags.activeTool){
        case Tool.SelectionTool:
            usingSelectionTool(engine, elapsed);
            break;
        case Tool.MoveTool:
            usingMoveTool(engine, elapsed)
            break;
        case Tool.PanTool:
            usingPanTool(engine, elapsed);
            break;
        case Tool.BoxScaleTool:
            usingBoxScaleTool(engine, elapsed)
            break;
    }
    let ctx = engine.view.ctx;
    let camera = engine.model.camera;
    let game = engine.model.game;
    let world = game.world;

    ctx.clearRect(camera.clearBounds.x, camera.clearBounds.y, camera.clearBounds.w, camera.clearBounds.h)
    updateCtx(engine.model.camera, ctx);
    ctx.fillStyle = "gray"
    ctx.fillRect(0,0,640,480);
    drawFloors(ctx, world.floors);
    drawWalls(ctx, world.walls);
    drawRectColliders(ctx, world.rectColliders)
    debugPlayer(ctx, world.player);

    if(engine.model.flags.selectedEntity.entity != SelectableEntity.Nothing && engine.model.flags.activeTool === Tool.MoveTool){
        drawMoveTool(ctx, engine.model.tools.moveTool)
    }
    if(engine.model.flags.selectedEntity.entity != SelectableEntity.Nothing && engine.model.flags.activeTool !== Tool.BoxScaleTool){
        drawSelectionTool(ctx, engine.model.tools.selectionTool);
    }

    if(engine.model.flags.selectedEntity.entity != SelectableEntity.Nothing && engine.model.flags.activeTool === Tool.BoxScaleTool){
        drawBoxScaleTool(ctx, engine.model.tools.boxScaleTool);
    }

    {
    let grid = engine.model.guides.grid;

    if(grid.active){
        let frame = engine.model.camera.rectBound;
        let startX = frame.x - (frame.x % grid.stepX);
        let startY = frame.y - (frame.y % grid.stepY);
        ctx.strokeStyle = "lime"
        ctx.beginPath();

        for(var i = startX; i <= (frame.x + frame.w); i+= grid.stepX){
            ctx.moveTo(i,frame.y)
            ctx.lineTo(i, frame.y + frame.h);
        }

        for(var i = startY; i<= (frame.y + frame.h); i+= grid.stepY){
           ctx.moveTo(frame.x, i);
           ctx.lineTo(frame.x + frame.w, i);
        }
        ctx.stroke();
    }
    
    }

    drawCamera(ctx, world.camera);
}

function editMainMenu(engine, elapsed){
    let ctx = engine.view.ctx;
    let camera = engine.model.camera;
    let game = engine.model.game;
    let world = game.world;

    ctx.clearRect(camera.clearBounds.x, camera.clearBounds.y, camera.clearBounds.w, camera.clearBounds.h)
    //updateCtx(engine.model.camera, ctx);
    ctx.fillStyle = "orange"
    ctx.fillRect(0,0,640,480);
    /*
    drawFloors(ctx, world.floors);
    drawWalls(ctx, world.walls);
    drawRectColliders(ctx, world.rectColliders)
    drawPlayer(ctx, world.player);
    */
    /*
    if(engine.model.flags.selectedEntity.entity != SelectableEntity.Nothing && engine.model.flags.activeTool === Tool.MoveTool){
        drawMoveTool(ctx, engine.model.tools.moveTool)
    }
    if(engine.model.flags.selectedEntity.entity != SelectableEntity.Nothing){
        drawSelectionTool(ctx, engine.model.tools.selectionTool);
    }*/
    //drawCamera(ctx, world.camera);

}

function editInitialMenu(engine, elapsed){
    let ctx = engine.view.ctx;
    let camera = engine.model.camera;

    ctx.clearRect(camera.clearBounds.x, camera.clearBounds.y, camera.clearBounds.w, camera.clearBounds.h)
    ctx.fillStyle = "pink"
    ctx.fillRect(0,0,640,480);
    
}

function engineEditMode(engine, elapsed){
    switch(engine.model.game.state){
        case GameState.Initial:
            editInitialMenu(engine, elapsed);
            break;
        case GameState.MainMenu:
            editMainMenu(engine,elapsed)
            break;
        case GameState.Playing:
            editLevel(engine, elapsed);
            break;
    }
    engine.model.flags.changedSelectedEntity = false;

    
    updateSelectionToolRect(engine, elapsed)


}

function enginePlayMode(engine, elapsed){
    updateGame(engine.model.playMode.game, elapsed);
}

function updateCtx(camera, ctx){
    ctx.setTransform(
        1,0,
        0,1,
        0,0
    );
    ctx.translate(-camera.position[0], -camera.position[1]);

}
function drawSelectionTool(ctx, selectionTool){
    let rect = selectionTool.rect;
    ctx.strokeStyle = "red";
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}
function drawCamera(ctx, camera){
    ctx.strokeStyle = "black";
    let rect = camera.rectBound;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}

function drawMoveTool(ctx,moveTool){
    let xDragRect = moveTool.xDragRect;
    let yDragRect = moveTool.yDragRect;
    ctx.fillStyle = "red"
    ctx.fillRect(xDragRect.x, xDragRect.y, xDragRect.w, xDragRect.h);
    ctx.fillStyle = "green";
    ctx.fillRect(yDragRect.x, yDragRect.y, yDragRect.w, yDragRect.h);
}
function updateEngine(engine, elapsed){
    let ctx = engine.view.ctx;
    let game = engine.model.game;
    let world = game.world;
    let camera = engine.model.camera;
    updateCursors(engine)

    switch(engine.model.flags.engineMode){
        case EngineMode.EditMode:
            engineEditMode(engine, elapsed);
            break;
        case EngineMode.PlayMode:
            enginePlayMode(engine, elapsed);
            break;
    }
    
    updateKeyboardInput(engine.model.keyboardInput)
    updateMouseInput(engine.model.cursors.mouseInput)
}

function engine_main(){
    let engine = new Engine();
    let games = [engine.model.game, engine.model.playMode.game];
    games.forEach( game =>{
        game.state = GameState.Playing;
        game.canvas = engine.view.canvas;
        game.ctx = engine.view.ctx;
        game.mouseInput = engine.model.cursors.mouseInput;
        game.keyboardInput = engine.model.keyboardInput;
    })
    
    initializeExplorer(engine.view);
    initializePlayerProperties(engine.view.properties);
    initializeWallProperties(engine.view.properties);
    initializeFloorProperties(engine.view.properties);
    initializeGameProperties(engine.view.properties)
    initializeRectColliderProperties(engine.view.properties);

    initializeMoveToolProperties(engine.view.toolProperties)
    initializeBoxScaleToolProperties(engine.view.toolProperties)

    initializeAddFloorEvent(engine);
    initializeAddWallEvent(engine);
    initializeAddRectColliderEvent(engine);
    initializeSelectGameStateEvent(engine);

    initializePanToolButtonEvent(engine)
    initilizeSelectionToolButtonEvent(engine)
    initializeMoveToolButtonEvent(engine)
    initialsizeBoxScaleToolButtonEvent(engine)

    initializeSelectEditModeEvent(engine)
    initializeSelectPlayModeEvent(engine)

    initializeSelectGameExplorerEvent(engine)
    initializeSelectPlayerExplorerEvent(engine);

    initializeMoveToolPropertiesEvents(engine)
    initializeBoxScaleToolPropertiesEvents(engine)

    initializeSaveLevelEvent(engine);
    initializeLoadLevelEvent(engine);

    initializeShowGridCheckboxEvent(engine);

    initializeDeleteEntityEvent(engine)

    addListenersMouseInput(engine.model.cursors.mouseInput, engine.view.canvas);
    addListenersKeyboardInput(engine.model.game.keyboardInput);
    let time = 0;
    let elapsed = 1 / 60.0;
    let update = timestamp =>{

        updateEngine(engine, elapsed);
        elapsed = (timestamp - time) * 0.001;
        time = timestamp;
        requestAnimationFrame(update)
    }
    requestAnimationFrame(update);
}

document.body.onload = engine_main();
