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
  DrawMesh,
  DrawTriangle, 
  DrawSimpleMesh
} from './utils/drawUtils';

import {
  Populate_Mesh_With_Null, 
  Mesh_Load_Model_Obj,
  Populate_SimpleMesh_With_Cube
} from './utils/MeshUtils';

import {VECTOR_3D, Matrix4x4, Triangle, SimpleMesh, Mesh} from "./utils/types"
import { GenericXPWindow } from './components/GenericXPWindow';
import axios from 'axios';
import { SliderDisplay } from './components/SliderDisplay';
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

const sliderText = [
  "Press Left and Right to change the FOV!"
]



const App = () => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasProps = useRef({
    width: 512,
    height: 480,
    pixelWidth: 1,
    pixelHeight: 1,
    ratio: 480/512
  })
  const cube = useRef<Mesh>(Populate_Mesh_With_Null());
  const simpleCube = useRef<SimpleMesh>(Populate_SimpleMesh_With_Cube(0.0, 0.0, 0.0, 1.0, 1.0, 1.0))
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
    const matTranslationZ = Matrix4x4_MakeTranslation(0, 0, 3);
    let worldMatrix: Matrix4x4 = Matrix4x4_MakeIdentity();
    
    worldMatrix = Matrix4x4_Cross_Matrix4x4(matRotZ, matRotX);
    worldMatrix = Matrix4x4_Cross_Matrix4x4(worldMatrix, matTranslationZ)

    let colorIndex = 0;
    DrawMesh(cube.current, worldMatrix, projMat.current, canvas, context, light.current)
    DrawSimpleMesh(simpleCube.current, worldMatrix, projMat.current, canvas, context, light.current);
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
    let mesh = Mesh_Load_Model_Obj(meshText)
    cube.current = mesh;
  }, [meshText])


  return (
    <div className="App">
      <GenericXPWindow text={"3D"}>
        <canvas id="canvas" 
        width={canvasProps.current.width * canvasProps.current.ratio}
        height={canvasProps.current.height * canvasProps.current.ratio}
        ref={canvasRef}></canvas>
      </GenericXPWindow>
      <SliderDisplay 
        sliders={sliders} 
        windowText="Sliders"
        additionalText={sliderText}
      />
      
    </div>
  );
}

export default App;