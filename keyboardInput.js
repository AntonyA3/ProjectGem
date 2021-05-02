const KeyState = {
    Pressed: 0,
    Down: 1,
    Released: 2,
    UP: 3
}

function KeyboardInput(){
    this.up = {key: "w", state: KeyState.UP},
    this.left = {key: "a", state: KeyState.UP},
    this.down = {key: "s", state: KeyState.UP},
    this.right = {key: "d", state: KeyState.UP},
    this.ctrl = {key: "control", state: KeyState.UP}
    this.action0 = {key: "escape", state: KeyState.UP},
    this.action1 = {key: "j", state: KeyState.UP},
    this.action2 = {key: "k", state: KeyState.UP},
    this.action3 = {key: "l", state: KeyState.UP}
}

function addListenersKeyboardInput(keyboardInput){
    let keys = [
        keyboardInput.up, keyboardInput.left,
        keyboardInput.right, keyboardInput.down,
        keyboardInput.action0, keyboardInput.action1,
        keyboardInput.action2, keyboardInput.action3,
        keyboardInput.ctrl
    ];

    document.addEventListener("keydown", e =>{
        keys.forEach(k =>{
            if(e.key.toLowerCase() == k.key.toLowerCase()){
                
                let state = k.state;
                if(state === KeyState.Pressed || state === KeyState.Down){
                    k.state = KeyState.Down;
                }else{
                    k.state = KeyState.Pressed;
                }
            }
        })

    });

    document.addEventListener("keyup", e=>{
        keys.forEach(k =>{
            if(e.key.toLowerCase() == k.key.toLowerCase()){
                let state = k.state;
                if(state === KeyState.Released || state === KeyState.UP){
                    k.state = KeyState.UP;
                }else{
                    k.state = KeyState.Released;
                }
            }
        })
    });
}

function updateKeyboardInput(keyboardInput){
    let keys = [
        keyboardInput.up, keyboardInput.left,
        keyboardInput.right, keyboardInput.down,
        keyboardInput.action0, keyboardInput.action1,
        keyboardInput.action2, keyboardInput.action3,
        keyboardInput.ctrl
    ];

    keys.forEach(k =>{
        if(k.state === KeyState.Released){
            k.state = KeyState.UP;
        }else if(k.state === KeyState.Pressed){
            k.state = KeyState.Down;
        } 
    });
}
