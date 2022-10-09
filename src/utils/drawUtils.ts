export const DrawTriangle = (
    x0: number,
    y0: number,
    x1: number, 
    y1: number,
    x2: number, 
    y2: number,
    color: string,
    context: CanvasRenderingContext2D,
  ): void => {
    context.strokeStyle = "white";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2)
    context.closePath();
    context.fillStyle = color;
    context.fill();
    //context.stroke();
  }
  
  export const DrawLine = (
    x0: number, 
    y0: number,
    x1: number, 
    y1: number,
    color: string,
    context: CanvasRenderingContext2D
  ) => {
    context.strokeStyle = "white";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.closePath()
    context.stroke();
  }
  
  
  export const DrawPoint = (
    x0: number,
    y0: number, 
    color: string, 
    context: CanvasRenderingContext2D
  ) => {
    context.fillStyle = "white"
    context.fillRect(x0, y0, 10, 10);
  }