import React, {useRef, useEffect, useState, useCallback, KeyboardEvent} from 'react';
import logo from './logo.svg';
import './App.css';
import {
  Matrix4x4_Cross_Matrix4x4,
  Matrix4x4_Cross_Vector,
  Matrix4x4_Initialize,
  Matrix4x4_MakeProjection,
  Matrix4x4_MakeIdentity,
  Matrix4x4_MakeRotationX,
  Matrix4x4_MakeRotationY,
  Matrix4x4_MakeRotationZ,
  Matrix4x4_MakeTranslation,
  Matrix4x4_PointAt,
  Vector_Add,
  Vector_CrossProduct,
  Vector_Div,
  Vector_DotProduct,
  Vector_Length,
  Vector_Mul,
  Vector_Normalise,
  Vector_Sub,
  Populate_Mesh_With_Cube
} from "./utils" 
import {VECTOR_3D, Matrix4x4, VECTOR_UV, Triangle, Mesh} from "./types"
import { resolve } from 'node:path/win32';


const colors = [
  "red", "orange", "yellow", "green", "blue", "purple",
  "aquamarine"
]

let start: number;
let then: number;
let elapsed: number;
let lastRun: number;
let fps: number;

const regExp = new RegExp('^[0-9a-zA-Z]+(,[0-9a-zA-Z]+)*$');
const projMat = Matrix4x4_MakeProjection(90, 480 / 512, 0.1, 1000);



const DrawTriangle = (
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

const App = () => {


  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [demo, setDemo] = useState<number>(1);
  const [frameTime, setFrameTime] = useState<number>(0);
  const [gameState, setGameState] = useState({
    meshCube: Populate_Mesh_With_Cube(0.0, 0.0, 0.0, 1.0, 1.0, 1.0),
    canvas: {
      width: 512,
      height: 480,
      pixelWidth: 1,
      pixelHeight: 1,
      ratio: 480/512
    },
    fov: 90,
  })
  const fTheta = useRef(0);

  const getCanvasWithContext = (canvas = canvasRef.current) => {
    return {canvas, context: canvas?.getContext("2d")};
  }

  const draw = () => {
    if (!lastRun) {
      lastRun = performance.now();
      fps = 0;
      requestAnimationFrame(() => draw())
      return;
    }
    let delta = (performance.now() - lastRun) / 1000;
    lastRun = performance.now();
    fps = 1 / delta;
    const {canvas, context} = getCanvasWithContext();
    if (!canvas || !context) {
      return;
    }

    fTheta.current += 1 * delta;

    //Drawing Code
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    //Create World Matrix
    const matRotZ: Matrix4x4 = Matrix4x4_MakeRotationZ(fTheta.current);
    const matRotX: Matrix4x4 = Matrix4x4_MakeRotationX(fTheta.current);
    const matTranslationZ = Matrix4x4_MakeTranslation(0, 0, 2);
    let worldMatrix: Matrix4x4 = Matrix4x4_MakeIdentity();
    
    worldMatrix = Matrix4x4_Cross_Matrix4x4(matRotZ, matRotX);
    worldMatrix = Matrix4x4_Cross_Matrix4x4(worldMatrix, matTranslationZ)
    
    
    
    let colorIndex = 0;
    gameState.meshCube.tris.forEach((tri, idx) => {
      let triTransformed = {
        p: [
          Matrix4x4_Cross_Vector(worldMatrix, tri.p[0]),
          Matrix4x4_Cross_Vector(worldMatrix, tri.p[1]),
          Matrix4x4_Cross_Vector(worldMatrix, tri.p[2]),
        ], 
        uvCoords: tri.uvCoords,
      }
      

      let triProjected = {
        p: [
          Matrix4x4_Cross_Vector(projMat, triTransformed.p[0]),
          Matrix4x4_Cross_Vector(projMat, triTransformed.p[1]),
          Matrix4x4_Cross_Vector(projMat, triTransformed.p[2]),
        ], 
        uvCoords: triTransformed.uvCoords,
      }

      triProjected.p[0] = Vector_Div(triProjected.p[0], triProjected.p[0].w);
      triProjected.p[1] = Vector_Div(triProjected.p[1], triProjected.p[1].w);
      triProjected.p[2] = Vector_Div(triProjected.p[2], triProjected.p[2].w);

      //Scale into screen view
      triProjected.p[0].x += 1.0; triProjected.p[0].y += 1.0;
			triProjected.p[1].x += 1.0; triProjected.p[1].y += 1.0;
			triProjected.p[2].x += 1.0; triProjected.p[2].y += 1.0;
			triProjected.p[0].x *= 0.5 * gameState.canvas.width;
			triProjected.p[0].y *= 0.5 * gameState.canvas.height;
			triProjected.p[1].x *= 0.5 * gameState.canvas.width
			triProjected.p[1].y *= 0.5 * gameState.canvas.height;
			triProjected.p[2].x *= 0.5 * gameState.canvas.width;
			triProjected.p[2].y *= 0.5 * gameState.canvas.height; 

      colorIndex += 1;

      DrawTriangle(triProjected.p[0].x, triProjected.p[0].y,
				triProjected.p[1].x, triProjected.p[1].y,
				triProjected.p[2].x, triProjected.p[2].y,
				colors[colorIndex % colors.length], context);

      
    })
    requestAnimationFrame(() => draw());
    
  }

  const handleKeyPress = useCallback((event: any) => {
    const {key} = event;
    switch (key) {
      case "w":
      case "ArrowUp":
        console.log("pressed up")
        break;
      case "s":
      case "ArrowDown":
        console.log("Pressed Down");
        break;
      case "e": 
      case "ArrowRight": 
        console.log("Pressed Right")
        break;
      case "a":
      case "ArrowLeft": 
        console.log("Pressed Left");
        break;
      default:
        console.log("default case");
        break;
    }
  }, []);

  //@componentDidMount()

  useEffect(() => {
    then = Date.now();
    start = then;
    elapsed = 0;
    requestAnimationFrame(() => draw());
  }, [handleKeyPress]);

  return (
    <div className="App">
      <canvas id="canvas" 
      width={gameState.canvas.width * gameState.canvas.ratio}
      height={gameState.canvas.height * gameState.canvas.ratio}
      ref={canvasRef}></canvas>
    </div>
  );
}

export default App;
