import React, {useRef, useEffect, useState, useCallback, KeyboardEvent} from 'react'
import './App.css';
import axios from "axios"
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
  Populate_Mesh_With_Cube,
  Triangle_Get_Centroid,
  Vector_Initialize,
  Mesh_OBJ_Has_Texture_Coords,
  Mesh_Load_Model_OBJ,
  SimpleMesh_Load_Model_OBJ
} from "./utils" 
import {VECTOR_3D, Matrix4x4, VECTOR_UV, Triangle, Mesh, SimpleMesh} from "./types"
import { createReadStream } from 'fs';
import { create } from 'domain';
import * as Resources from "./resources"

const randomString = "We get the normal of each triangle by getting the cross product of the vector"

const colors = [
  //red, orange, yellow, green, blue, purple, cyan, teal, pink
  'rgb(255,0,0)',
  'rgb(255,165,0)',
  'rgb(255,255,0)',
  'rgb(0,128,0)',
  'rgb(0, 0, 255)',
  'rgb(128,0,128)',
  'rgb(0,255,255)',
  'rgb(0,128,128)',
  'rgb(255,192,203)'
]

let start: number;
let then: number;
let elapsed: number;
let lastRun: number;
let fps: number;
let currentFrameId: number;

const regExp = new RegExp('^[0-9a-zA-Z]+(,[0-9a-zA-Z]+)*$');




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

const DrawLine = (
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


const DrawPoint = (
  x0: number,
  y0: number, 
  color: string, 
  context: CanvasRenderingContext2D
) => {
  context.fillStyle = "white"
  context.fillRect(x0, y0, 10, 10);
}


type GameState = {
  meshCube: SimpleMesh,
  canvas: {
    width: number,
    height: number
    pixelWidth: number,
    pixelHeight: number,
    ratio:  number,
  }, 
  fov: number,
  projMat: Matrix4x4
}


const drawMesh = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  fTheta: number,
  projMat: Matrix4x4,
  meshCube: SimpleMesh,
) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    //Create World Matrix
    const matRotZ: Matrix4x4 = Matrix4x4_MakeRotationZ(fTheta);
    const matRotX: Matrix4x4 = Matrix4x4_MakeRotationX(fTheta);
    const matTranslationZ = Matrix4x4_MakeTranslation(0, 0, 10);
    let worldMatrix: Matrix4x4 = Matrix4x4_MakeIdentity();
    
    worldMatrix = Matrix4x4_Cross_Matrix4x4(matRotZ, matRotX);
    worldMatrix = Matrix4x4_Cross_Matrix4x4(worldMatrix, matTranslationZ)

    
    let colorIndex = 0;
    meshCube.tris.forEach((tri, idx) => {
      let triTransformed: Triangle = {
        p: [
          Matrix4x4_Cross_Vector(worldMatrix, tri.p[0]),
          Matrix4x4_Cross_Vector(worldMatrix, tri.p[1]),
          Matrix4x4_Cross_Vector(worldMatrix, tri.p[2]),
        ], 
        uvCoords: tri.uvCoords,
      }


      //Cross Product Calculations
      let triVecOne: VECTOR_3D = Vector_Sub(triTransformed.p[1], triTransformed.p[0]);
      let triVecTwo: VECTOR_3D = Vector_Sub(triTransformed.p[2], triTransformed.p[1]);


      //The normal of the vector is the cross product of the two vectors that make up the triangle
      //Or find using the determinant of the matrix produced when finding the area
      let triNormal: VECTOR_3D = Vector_CrossProduct(triVecOne, triVecTwo);
      let triMiddle: VECTOR_3D = Triangle_Get_Centroid(triTransformed);
      

      triNormal = Vector_Normalise(triNormal);
      colorIndex = (colorIndex + 1) % colors.length;

      //Take the dot product of the triangleNormal and the camera eye vector
      //If the normal is perpendicular to or forms an obtuse angle with the
      //Camera eye vector, then the projection of the normal will be <=0
      if (Vector_DotProduct(triNormal, triTransformed.p[0]) < 0.0) {

        //Create Single Direction Light
        let light: VECTOR_3D = Vector_Initialize(0.0, 0.0, -1.0);
        light = Vector_Normalise(light);

        const lightToNormal: number = Vector_DotProduct(triNormal, light);
        //get r g b values from string
        const initialColor = colors[colorIndex].match(/(\d+)/g);
        let r = 255;
        let g = 255;
        let b = 255;

        if (initialColor && initialColor.length >= 3) {
          r = parseInt(initialColor[0]);
          g = parseInt(initialColor[1]);
          b = parseInt(initialColor[2])
        }
        r = lightToNormal * r;
        g = lightToNormal * g;
        b = lightToNormal * b;
        
        const color = `rgba(${r} ${g} ${b})`;

        let triProjected: Triangle = {
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
			  triProjected.p[0].x *= 0.5 * canvas.width;
			  triProjected.p[0].y *= 0.5 * canvas.height;
			  triProjected.p[1].x *= 0.5 * canvas.width
			  triProjected.p[1].y *= 0.5 * canvas.height;
			  triProjected.p[2].x *= 0.5 * canvas.width;
			  triProjected.p[2].y *= 0.5 * canvas.height; 

        DrawTriangle(triProjected.p[0].x, triProjected.p[0].y,
				  triProjected.p[1].x, triProjected.p[1].y,
				  triProjected.p[2].x, triProjected.p[2].y,
				  color, context);
      }
    })

}

const App = () => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  //const meshCube = useRef<SimpleMesh>(Populate_Mesh_With_Cube(0.0, 0.0, 0.0, 5.0, 5.0, 1.0));
  const canvasProps = useRef({
    width: 512,
    height: 480,
    pixelWidth: 1,
    pixelHeight: 1,
    ratio: 480/512
  })
  /*const fov = useRef<number>(90);
  const projMat = useRef<Matrix4x4>(Matrix4x4_MakeProjection(fov.current, canvasProps.current.ratio, 0.1, 1000))

  const fTheta = useRef(0);

  const getCanvasWithContext = (canvas = canvasRef.current) => {
    return {canvas, context: canvas?.getContext("2d")};
  }

  //TODO: We should have learned this with paint, but drawing should be separate from React state
  const draw = useCallback(() => {
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

    fTheta.current += 0.5 * delta;

    drawMesh(canvas, context, fTheta.current, projMat.current, meshCube.current);

    //Drawing Code
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    //Create World Matrix
    const matRotZ: Matrix4x4 = Matrix4x4_MakeRotationZ(fTheta.current);
    const matRotX: Matrix4x4 = Matrix4x4_MakeRotationX(fTheta.current);
    const matTranslationZ = Matrix4x4_MakeTranslation(0, 0, 10);
    let worldMatrix: Matrix4x4 = Matrix4x4_MakeIdentity();
    
    worldMatrix = Matrix4x4_Cross_Matrix4x4(matRotZ, matRotX);
    worldMatrix = Matrix4x4_Cross_Matrix4x4(worldMatrix, matTranslationZ)

    
    let colorIndex = 0;
    meshCube.tris.forEach((tri, idx) => {
      let triTransformed: Triangle = {
        p: [
          Matrix4x4_Cross_Vector(worldMatrix, tri.p[0]),
          Matrix4x4_Cross_Vector(worldMatrix, tri.p[1]),
          Matrix4x4_Cross_Vector(worldMatrix, tri.p[2]),
        ], 
        uvCoords: tri.uvCoords,
      }


      //Cross Product Calculations
      let triVecOne: VECTOR_3D = Vector_Sub(triTransformed.p[1], triTransformed.p[0]);
      let triVecTwo: VECTOR_3D = Vector_Sub(triTransformed.p[2], triTransformed.p[1]);


      //The normal of the vector is the cross product of the two vectors that make up the triangle
      //Or find using the determinant of the matrix produced when finding the area
      let triNormal: VECTOR_3D = Vector_CrossProduct(triVecOne, triVecTwo);
      let triMiddle: VECTOR_3D = Triangle_Get_Centroid(triTransformed);
      

      triNormal = Vector_Normalise(triNormal);
      colorIndex = (colorIndex + 1) % colors.length;

      //Take the dot product of the triangleNormal and the camera eye vector
      //If the normal is perpendicular to or forms an obtuse angle with the
      //Camera eye vector, then the projection of the normal will be <=0
      if (Vector_DotProduct(triNormal, triTransformed.p[0]) < 0.0) {

        //Create Single Direction Light
        let light: VECTOR_3D = Vector_Initialize(0.0, 0.0, -1.0);
        light = Vector_Normalise(light);

        const lightToNormal: number = Vector_DotProduct(triNormal, light);
        //get r g b values from string
        const initialColor = colors[colorIndex].match(/(\d+)/g);
        let r = 255;
        let g = 255;
        let b = 255;

        if (initialColor && initialColor.length >= 3) {
          r = parseInt(initialColor[0]);
          g = parseInt(initialColor[1]);
          b = parseInt(initialColor[2])
        }
        r = lightToNormal * r;
        g = lightToNormal * g;
        b = lightToNormal * b;
        
        const color = `rgba(${r} ${g} ${b})`;

        let triProjected: Triangle = {
          p: [
            Matrix4x4_Cross_Vector(projMat.current, triTransformed.p[0]),
            Matrix4x4_Cross_Vector(projMat.current, triTransformed.p[1]),
            Matrix4x4_Cross_Vector(projMat.current, triTransformed.p[2]),
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
			  triProjected.p[0].x *= 0.5 * canvasProps.current.width;
			  triProjected.p[0].y *= 0.5 * canvasProps.current.height;
			  triProjected.p[1].x *= 0.5 * canvasProps.current.width
			  triProjected.p[1].y *= 0.5 * canvasProps.current.height;
			  triProjected.p[2].x *= 0.5 * canvasProps.current.width;
			  triProjected.p[2].y *= 0.5 * canvasProps.current.height; 

        DrawTriangle(triProjected.p[0].x, triProjected.p[0].y,
				  triProjected.p[1].x, triProjected.p[1].y,
				  triProjected.p[2].x, triProjected.p[2].y,
				  color, context);
      }

      
    })
    currentFrameId = requestAnimationFrame(() => draw());  
  }, [meshCube])

  //TODO: Prime example of why we shouldn't be using react do this
  const handleKeyPress = useCallback((event: any) => {
    const {key} = event;
    switch (key) {
      case "w":
      case "ArrowUp": 
        console.log("pressed up");
        break;
      case "s":
      case "ArrowDown":
        console.log("Pressed Down");
        console.log(projMat);
        break;
      case "e": 
      case "ArrowRight": 
        console.log("Pressed Right")
        console.log(fov)
        fov.current = fov.current + 10;
        projMat.current = Matrix4x4_MakeProjection(fov.current, canvasProps.current.ratio, 0.1, 1000);
        break;
      case "a":
      case "ArrowLeft": 
        console.log("Pressed Left");
        console.log(fov);
        fov.current = fov.current - 10;
        projMat.current = Matrix4x4_MakeProjection(fov.current, canvasProps.current.ratio, 0.1, 1000);
        break;
      default:
        console.log("default case");
        break;
    }
  }, []);

  //@componentDidMount()
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    SimpleMesh_Load_Model_OBJ("/models/cube.obj").then((mesh) => {
      console.log(mesh);
      cancelAnimationFrame(currentFrameId);
      meshCube.current = mesh;
      setTimeout(() => {
        console.log("bleh")
      }, 1000)
    })
  }, [])

  useEffect(() => {
    then = Date.now();
    start = then;
    elapsed = 0;
    currentFrameId = requestAnimationFrame(() => draw());
  }, [handleKeyPress]); */
  

 
  return (
    <div className="App">
      <canvas id="canvas" 
      width={canvasProps.current.width * canvasProps.current.ratio}
      height={canvasProps.current.height * canvasProps.current.ratio}
      ref={canvasRef}></canvas>
    </div>
  );
}

export default App;