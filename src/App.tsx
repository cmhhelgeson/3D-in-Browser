import React, {useRef, useState, useEffect, useCallback} from 'react'
import './App.css';
import {
  Vector_Initialize,
  Vector_DotProduct,
  Vector_CrossProduct,
  Vector_Sub,
  Vector_Div,
  Vector_Normalise
} from "./utils/Vector3DUtils"
import { 
  Matrix4x4_MakeProjection, 
  Matrix4x4_Cross_Matrix4x4,
  Matrix4x4_MakeIdentity,
  Matrix4x4_Cross_Vector,
  Matrix4x4_MakeRotationX,
  Matrix4x4_MakeRotationZ,
  Matrix4x4_MakeTranslation
} from './utils/Matrix4x4Utils';
import { 
  DrawTriangle, 
} from './utils/drawUtils';

import { Populate_Mesh_With_Cube, SimpleMesh_Load_Model_OBJ } from './utils/MeshUtils';

import {VECTOR_3D, Matrix4x4, Triangle, SimpleMesh} from "./utils/types"
import * as Resources from "./resources"
import { GenericXPWindow } from './components/GenericXPWindow';
import axios from 'axios';
import { SliderDisplay } from './components/SliderDisplay';
import { getHashes } from 'crypto';

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



let lastRun: number;
let fps: number;



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



const App = () => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasProps = useRef({
    width: 512,
    height: 480,
    pixelWidth: 1,
    pixelHeight: 1,
    ratio: 480/512
  })
  const meshRef = useRef<SimpleMesh>(Populate_Mesh_With_Cube(0.0, 0.0, 0.0, 5.0, 1.0, 5.0));
  const [meshState, setMeshState] = useState(Populate_Mesh_With_Cube(0.0, 0.0, 0.0, 5.0, 1.0, 5.0));
  const [sliderState, setSliderState] = useState([0.0, 0.0, 0.0]);
  const light = useRef<VECTOR_3D>(Vector_Initialize(0.0, 0.0, -1.0));
  const [meshText, setMeshText] = useState<string>("");
  const fov = useRef<number>(90);
  const projMat = useRef<Matrix4x4>(Matrix4x4_MakeProjection(fov.current, canvasProps.current.ratio, 0.1, 1000))

  const setLightX = (_x: number) => {
    light.current.x = _x;
  }

  const setLightY = (_y: number) => {
    light.current.y = _y;
  }

  const setLightZ = (_z: number) => {
    light.current.z = _z;
  }

  const sliders = [
    {
      label: "Light X Direction:",
      lowVal: -5.0,
      highVal: 5.0,
    },
    {
      label: "Light Y Direction:",
      lowVal: -5.0,
      highVal: 5.0,
    },
    {
      label: "Light Z Direction:",
      lowVal: -5.0,
      highVal: 5.0,
    }
  
  ]

  const fTheta = useRef(0);

  const getCanvasWithContext = (canvas = canvasRef.current) => {
    return {canvas, context: canvas?.getContext("2d")};
  }

  //TODO: We should have learned this with paint, but drawing should be separate from React state
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

    fTheta.current += 0.5 * delta;


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
    meshRef.current.tris.forEach((tri, idx) => {
      let triTransformed = {
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
      //let triMiddle: VECTOR_3D = Triangle_Get_Centroid(triTransformed);
      

      triNormal = Vector_Normalise(triNormal);
      colorIndex = (colorIndex + 1) % colors.length;

      //Take the dot product of the triangleNormal and the camera eye vector
      //If the normal is perpendicular to or forms an obtuse angle with the
      //Camera eye vector, then the projection of the normal will be <=0
      if (Vector_DotProduct(triNormal, triTransformed.p[0]) < 0.0) {

        //Create Single Direction Light
        let usedLight: VECTOR_3D = light.current
        usedLight = Vector_Normalise(usedLight);

        const lightToNormal: number = Vector_DotProduct(triNormal, usedLight);
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
    requestAnimationFrame(() => draw());  
  }

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

    const getMeshData = async () => {
      const s = await axios.get("/models/cube.obj")
      const data: string = await s.data;
      setMeshText(data);
    }
    document.addEventListener("keydown", handleKeyPress);
    getMeshData();
    requestAnimationFrame(() => draw())
  }, [])

  useEffect(() => {
    const mesh = SimpleMesh_Load_Model_OBJ(meshText);
    meshRef.current = mesh

  }, [meshText])


  return (
    <div className="App">
      <GenericXPWindow text={"3D"}>
        <canvas id="canvas" 
        width={canvasProps.current.width * canvasProps.current.ratio}
        height={canvasProps.current.height * canvasProps.current.ratio}
        ref={canvasRef}></canvas>
      </GenericXPWindow>
      <SliderDisplay sliders={sliders} text="Gabagool"/>
      
    </div>
  );
}

export default App;