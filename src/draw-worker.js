let canvas = null
let context = null;

onmessage = (event) => {
    canvas = event.data.canvas;
    context = canvas.getContext("2d");

    switch(event.data.mode) {
    case 0: 
        drawZero()
        break;
    default: 
        context.fillStyle = "black"
        context.fillRect(0, 0, canvas.width, canvas.height)
        break;
    }
}

