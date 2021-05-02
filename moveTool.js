function usingMoveToolWithPlayer(engine, elapsed){
    let player = engine.model.game.world.player;
 
    let properties = engine.view.properties;
    useMoveTool(engine,() =>{
        return [player.position[0], player.position[1]]
    }, 
    (position) =>{
        setPlayerPosition(player,position)
    })

    setPropertiesToPlayerProperties(properties, player)    
}

function usingMoveToolWithFloor(engine, elapsed){
    let index = engine.model.flags.selectedEntity.index;
    let floor = engine.model.game.world.floors[index]

    let properties = engine.view.properties;

    useMoveTool(engine,() =>{
        return [floor.rect.x, floor.rect.y]
    }, 
    (position) =>{
        setFloorPosition(floor, position)
    })

    setPropertiesToFloorProperties(properties, floor)
}

function useMoveTool(engine, getPosition, setPosition){
    let moveTool = engine.model.tools.moveTool;
    let mouseInput = engine.model.cursors.mouseInput;
    let worldCursor = engine.model.cursors.worldCursor;

    let entityPosition = getPosition();
    setMoveToolPosition(moveTool, [entityPosition[0], entityPosition[1]])

    let usingSnappingMethod = () =>{
        switch(moveTool.method){
            case MoveToolMethod.ByMultiple:
                
                setPosition([
                    moveTool.targetPosition[0] - (moveTool.targetPosition[0] % moveTool.xStep),
                    moveTool.targetPosition[1] - (moveTool.targetPosition[1] % moveTool.yStep)]
                );
            case MoveToolMethod.ByStep:
                break;

        }
    }
    switch(moveTool.state){
        case MoveToolState.NotDragging:
            moveTool.targetPosition[0] = entityPosition[0];
            moveTool.targetPosition[1] = entityPosition[1];
            if(mouseInput.leftButton.state === MouseButtonState.Pressed && rectContainsPoint(moveTool.xDragRect, worldCursor.position)){
                moveTool.state = MoveToolState.XDragging;
            }else if(mouseInput.leftButton.state === MouseButtonState.Pressed && rectContainsPoint(moveTool.yDragRect, worldCursor.position)){
                moveTool.state = MoveToolState.YDragging;
            }
            break;
        case MoveToolState.XDragging:
            moveTool.targetPosition[0] += mouseInput.deltaPosition[0]
            usingSnappingMethod();

            if(mouseInput.leftButton.state === MouseButtonState.UP){
                moveTool.state = MoveToolState.NotDragging;
            }
            break;
        case MoveToolState.YDragging:
            moveTool.targetPosition[1] += mouseInput.deltaPosition[1]
            usingSnappingMethod();

            if(mouseInput.leftButton.state === MouseButtonState.UP){
                moveTool.state = MoveToolState.NotDragging;
            }
            break;
    }

}

function usingMoveToolWithWall(engine, elapsed){
    let index = engine.model.flags.selectedEntity.index;
    let wall = engine.model.game.world.walls[index]
    
    let properties = engine.view.properties;

    useMoveTool(engine,() =>{
        return [wall.rect.x, wall.rect.y]
    }, 
    (position) =>{
        setWallPosition(wall, position);
    })
    setPropertiesToWallProperties(properties, wall)

}

function usingMoveToolWithRectCollider(engine, elapsed){
    let index = engine.model.flags.selectedEntity.index;
    let rectCollider = engine.model.game.world.rectColliders[index]
    let properties = engine.view.properties;
    
    useMoveTool(engine,() =>{
        return [rectCollider.rect.x, rectCollider.rect.y]
    }, 
    (position) =>{
        setRectColliderPosition(rectCollider, position)
    });
    setPropertiesToRectColliderProperties(properties, rectCollider);
}


function usingMoveTool(engine, elapsed){
    let selected = engine.model.flags.selectedEntity.entity;
    
    switch(selected){
        case SelectableEntity.Nothing:
            usingSelectionTool(engine);
            break;
        case SelectableEntity.Player:
            usingMoveToolWithPlayer(engine, elapsed);
            break;
        case SelectableEntity.Floor:
            usingMoveToolWithFloor(engine, elapsed);
            break;
        case SelectableEntity.Wall:
            usingMoveToolWithWall(engine, elapsed);
            break;
        case SelectableEntity.RectCollider:
            usingMoveToolWithRectCollider(engine, elapsed);
            break
    }
}