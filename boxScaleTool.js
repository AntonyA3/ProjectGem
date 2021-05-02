
function useBoxScaleTool(engine, rect){
    let mouseInput = engine.model.cursors.mouseInput;
    let worldCursor = engine.model.cursors.worldCursor;
    let boxScaleTool = engine.model.tools.boxScaleTool;
    let entityRect = rect;
    let targetRect = boxScaleTool.targetRect;

    let snapLeft = () =>{
        let targetRect = boxScaleTool.targetRect;
        switch(boxScaleTool.method){
            case BoxScaleToolMethod.ByMultiple:
                let right = entityRect.x + entityRect.w;
                entityRect.x = targetRect.x - (targetRect.x % boxScaleTool.leftStep);
                let delta = right - entityRect.x;
                entityRect.w = delta
                updateBoxScaleTool(boxScaleTool, rect);
                break;

            
            case BoxScaleToolMethod.ByStep:
                break;
        }
    }
    let snapTop = () =>{
        let targetRect = boxScaleTool.targetRect;
        switch(boxScaleTool.method){
            case BoxScaleToolMethod.ByMultiple:
                let bottom = entityRect.y + entityRect.h;
                entityRect.y = targetRect.y - (targetRect.y % boxScaleTool.topStep);
                let delta = bottom - entityRect.y;
                entityRect.h = delta
                updateBoxScaleTool(boxScaleTool, rect);
                break;

            
            case BoxScaleToolMethod.ByStep:
                break;
        }
    }

    let snapRight = () =>{
        let targetRect = boxScaleTool.targetRect;
        switch(boxScaleTool.method){
            case BoxScaleToolMethod.ByMultiple:
                entityRect.w = targetRect.w - (targetRect.w % boxScaleTool.rightStep);
                updateBoxScaleTool(boxScaleTool, rect);
                break;

            
            case BoxScaleToolMethod.ByStep:
                break;
        }
    }

    

    let snapBottom = () =>{
        let targetRect = boxScaleTool.targetRect;
        switch(boxScaleTool.method){
            case BoxScaleToolMethod.ByMultiple:
                entityRect.h = targetRect.h - (targetRect.h % boxScaleTool.bottomStep);
                updateBoxScaleTool(boxScaleTool, rect);
                break;
            case BoxScaleToolMethod.ByStep:
                break;
        }
    }

    switch(boxScaleTool.state){
        case BoxScaleState.NotScaling:
            boxScaleTool.targetRect = copyRect(rect);
            if(rectContainsPoint(boxScaleTool.leftPulley, worldCursor.position) && mouseInput.leftButton.state === MouseButtonState.Down){
                boxScaleTool.state = BoxScaleState.ScalingLeft
            }else if(rectContainsPoint(boxScaleTool.rightPulley, worldCursor.position) && mouseInput.leftButton.state === MouseButtonState.Down){
                boxScaleTool.state = BoxScaleState.ScalingRight

            }else if(rectContainsPoint(boxScaleTool.bottomPulley, worldCursor.position) && mouseInput.leftButton.state === MouseButtonState.Down){
                boxScaleTool.state = BoxScaleState.ScalingBottom

            }else if(rectContainsPoint(boxScaleTool.topPulley, worldCursor.position) && mouseInput.leftButton.state === MouseButtonState.Down){
                boxScaleTool.state = BoxScaleState.ScalingTop
            }
            break;
        case BoxScaleState.ScalingLeft:

            targetRect.x += mouseInput.deltaPosition[0];
            targetRect.w -= mouseInput.deltaPosition[0];
            updateBoxScaleTool(boxScaleTool, rect);
            if(mouseInput.leftButton.state === MouseButtonState.UP){
                boxScaleTool.state = BoxScaleState.NotScaling
            }   
            snapLeft();
            break;
        case BoxScaleState.ScalingRight:
            targetRect.w += mouseInput.deltaPosition[0];

            updateBoxScaleTool(boxScaleTool, rect);
            if(mouseInput.leftButton.state === MouseButtonState.UP){
                boxScaleTool.state = BoxScaleState.NotScaling
            }   
            snapRight();
            break;
        case BoxScaleState.ScalingBottom:
            targetRect.h += mouseInput.deltaPosition[1];

            updateBoxScaleTool(boxScaleTool, rect);
            if(mouseInput.leftButton.state === MouseButtonState.UP){
                boxScaleTool.state = BoxScaleState.NotScaling
            }   
            snapBottom();
            break;
        case BoxScaleState.ScalingTop:
            targetRect.y += mouseInput.deltaPosition[1];
            targetRect.h -= mouseInput.deltaPosition[1];
            updateBoxScaleTool(boxScaleTool, rect);
            if(mouseInput.leftButton.state === MouseButtonState.UP){
                boxScaleTool.state = BoxScaleState.NotScaling
            } 
            snapTop();  
            break;
    }
}

function usingBoxScaleWithRectCollider(engine, elapsed){
    let index = engine.model.flags.selectedEntity.index;
    let wall = engine.model.game.world.rectColliders[index];
    let boxScaleTool = engine.model.tools.boxScaleTool;
    let rect = wall.rect;
    
    updateBoxScaleTool(boxScaleTool, rect);
    useBoxScaleTool(engine, rect)
    

}

function usingBoxScaleWithWall(engine, elapsed){
    let index = engine.model.flags.selectedEntity.index;
    let wall = engine.model.game.world.walls[index];
    let boxScaleTool = engine.model.tools.boxScaleTool;
    let rect = wall.rect;
    updateBoxScaleTool(boxScaleTool, rect);
    useBoxScaleTool(engine, rect)
}
function usingBoxScaleToolWithFloor(engine, elapsed){   
    let index = engine.model.flags.selectedEntity.index;
    let floor = engine.model.game.world.floors[index];
    let boxScaleTool = engine.model.tools.boxScaleTool;
    let rect = floor.rect;
    updateBoxScaleTool(boxScaleTool, floor.rect);
    useBoxScaleTool(engine, rect)
}
function usingBoxScaleTool(engine, elapsed){
    
    switch(engine.model.flags.selectedEntity.entity){
        case SelectableEntity.Floor:
            usingBoxScaleToolWithFloor(engine, elapsed);
            break;
        case SelectableEntity.Wall:
            usingBoxScaleWithWall(engine, elapsed);
            break;
        case SelectableEntity.RectCollider:
            usingBoxScaleWithRectCollider(engine, elapsed)
            break;
    }
}


function updateBoxScaleTool(boxScaleTool, rect){

    boxScaleTool.rect = copyRect(rect);

    let center = centerOfRect(rect);
    boxScaleTool.leftPulley.x = center[0] - 0.5 * rect.w - 16;
    boxScaleTool.leftPulley.y = center[1] - 4;

    boxScaleTool.rightPulley.x = center[0] + 0.5 * rect.w + 8;
    boxScaleTool.rightPulley.y = center[1] - 4;

    boxScaleTool.bottomPulley.x = center[0] - 4;
    boxScaleTool.bottomPulley.y = center[1] + 0.5 * rect.h + 8;

    boxScaleTool.topPulley.x = center[0] - 4;
    boxScaleTool.topPulley.y = center[1] - 0.5 * rect.h - 16;
}