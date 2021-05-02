const MouseButtonState = {
    Pressed: 0,
    Down: 1,
    Released: 2,
    UP: 3
}

function MouseInput(){
    this.leftButton = {id: 0, state: MouseButtonState.UP},
    this.rightButton = {id: 2, state: MouseButtonState.UP},
    this.position = [NaN, NaN],
    this.deltaPosition = [0,0]
    this.overCanvas = false
}

function addListenersMouseInput(mouseInput, canvas){
    let mouseButtons = [
        mouseInput.leftButton, mouseInput.rightButton
    ];
    document.addEventListener("mousedown", e=>{
        mouseButtons.forEach(b =>{
            if (e.button === b.id){
                if(b.state === MouseButtonState.Pressed || b.state == MouseButtonState.Down){
                    b.state = MouseButtonState.Down;
                }else{
                    b.state = MouseButtonState.Pressed;
                }
            }
        })

    });
    document.addEventListener("mouseup", e=>{
        mouseButtons.forEach(b =>{
            if (e.button === b.id){
                if(b.state === MouseButtonState.Released || b.state == MouseButtonState.UP){
                    b.state = MouseButtonState.UP;
                }else{
                    b.state = MouseButtonState.Released;
                }
            }
        })

    });
    document.addEventListener("mousemove", e=>{
        mouseInput.position = [e.clientX, e.clientY];
        mouseInput.deltaPosition = [e.movementX, e.movementY]
    });

    canvas.addEventListener("mouseleave", e=>{
        mouseInput.overCanvas = false;

    });
    canvas.addEventListener("mouseenter", e=>{
        mouseInput.overCanvas = true;

    });

}


function updateMouseInput(mouseInput){
    let mouseButtons = [
        mouseInput.leftButton, mouseInput.rightButton
    ];

    mouseButtons.forEach(b =>{
        if(b.state === MouseButtonState.Released){
            b.state = MouseButtonState.UP;
        }else if(b.state === MouseButtonState.Pressed){
            b.state = MouseButtonState.Down;
        } 
    });

    mouseInput.deltaPosition = [0,0];
}
