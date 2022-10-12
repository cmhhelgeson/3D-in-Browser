import { VECTOR_3D, Triangle, Mesh, Matrix4x4, SimpleMesh } from "./types";
import { 
  Vector_CrossProduct, 
  Vector_DotProduct,
  Vector_Div,
  Vector_Normalise,
  Vector_Sub
} from "./Vector3DUtils";
import {
  Matrix4x4_Cross_Vector,
} from "./Matrix4x4Utils"
import { Vector_UV_Initialize } from "./VectorUVUtils";

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


type XY = {
  x: number,
  y: number
}

const yCompare = (a: XY, b: XY) => {
  return a.y - b.y;
}

const xCompare = (a: XY, b: XY) => {
  return a.x - b.x;
}


export const DrawTrianglePixelByPixel = (
  p1: XY,
  p2: XY,
  p3: XY
) => {
  [p1, p2, p3] = [p1, p2, p3].sort(yCompare)
  /* if (p2.y < p1.y) {
    [p1, p2] = [p2, p1];
  }

  if (p3.y < p1.y) {
    [p1, p3] = [p3, p1];
  }

  if (p3.y < p2.y) {
    [p2, p3] = [p3, p2];
  } */

  const deltaYTop = yCompare(p2, p1);
  const deltaXTop = xCompare(p2, p1);

  const deltaYBottom = yCompare(p3, p1);
  const delatXBottom = xCompare(p3, p1);





  
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

export const DrawSimpleMesh = (
  mesh: SimpleMesh, 
  worldMatrix: Matrix4x4, 
  projMat: Matrix4x4, 
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  light: VECTOR_3D
) => {
  let colorIndex = 0;
  let dummyUV = Vector_UV_Initialize(0.0, 0.0);
  mesh.tris.forEach((tri, idx) => {
    let triTransformed: Triangle = {
      p: [
        Matrix4x4_Cross_Vector(worldMatrix, tri.p[0]),
        Matrix4x4_Cross_Vector(worldMatrix, tri.p[1]),
        Matrix4x4_Cross_Vector(worldMatrix, tri.p[2]),
      ], 
      uvCoords: [dummyUV, dummyUV, dummyUV] 
    }

    //TODO: Use face normals for goraud shading
    //const fni1 = mesh.faceNormals[idx][0];
    //const fni2 = mesh.faceNormals[idx][1];
    //const fni3 = mesh.faceNormals[idx][2];
    
    //Cross Product Calculations
    let triVecOne: VECTOR_3D = Vector_Sub(triTransformed.p[1], triTransformed.p[0]);
    let triVecTwo: VECTOR_3D = Vector_Sub(triTransformed.p[2], triTransformed.p[1]);


    //The normal of the vector is the cross product of the two vectors that make up the triangle
    //Or find using the determinant of the matrix produced when finding the area
    let triNormal: VECTOR_3D = Vector_CrossProduct(triVecOne, triVecTwo);
    //let triMiddle: VECTOR_3D = Triangle_Get_Centroid(triTransformed);
    
    //Ned to nromalize the triangle to get a 
    triNormal = Vector_Normalise(triNormal);
    colorIndex = (colorIndex + 1) % colors.length;

    //Take the dot product of the triangleNormal and the camera eye vector
    //If the normal is perpendicular to or forms an obtuse angle with the
    //Camera eye vector, then the projection of the normal will be <=0
    if (Vector_DotProduct(triNormal, triTransformed.p[0]) < 0.0) {

      //Create Single Direction Light
      let usedLight: VECTOR_3D = light
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
        color, context
      );
    }

  })

}

export const DrawMesh = (
  mesh: Mesh,
  worldMatrix: Matrix4x4,
  projMat: Matrix4x4,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  light: VECTOR_3D
) => {
  let colorIndex = 0;
  let dummyUV = Vector_UV_Initialize(0.0, 0.0);
  mesh.faceVerts.forEach((face, idx) => {
    const vi1 = face[0];
    const vi2 = face[1];
    const vi3 = face[2];
    
    

    let tri: Triangle = {
      p: [mesh.verts[vi1], mesh.verts[vi2], mesh.verts[vi3]],
      uvCoords: [dummyUV, dummyUV, dummyUV]
    }

    let triTransformed: Triangle = {
      p: [
        Matrix4x4_Cross_Vector(worldMatrix, tri.p[0]),
        Matrix4x4_Cross_Vector(worldMatrix, tri.p[1]),
        Matrix4x4_Cross_Vector(worldMatrix, tri.p[2]),
      ], 
      uvCoords: [dummyUV, dummyUV, dummyUV] 
    }

    //TODO: Use face normals for goraud shading
    //const fni1 = mesh.faceNormals[idx][0];
    //const fni2 = mesh.faceNormals[idx][1];
    //const fni3 = mesh.faceNormals[idx][2];
    
    //Cross Product Calculations
    let triVecOne: VECTOR_3D = Vector_Sub(triTransformed.p[1], triTransformed.p[0]);
    let triVecTwo: VECTOR_3D = Vector_Sub(triTransformed.p[2], triTransformed.p[1]);


    //The normal of the vector is the cross product of the two vectors that make up the triangle
    //Or find using the determinant of the matrix produced when finding the area
    let triNormal: VECTOR_3D = Vector_CrossProduct(triVecOne, triVecTwo);
    //let triMiddle: VECTOR_3D = Triangle_Get_Centroid(triTransformed);
    
    //Ned to nromalize the triangle to get a 
    triNormal = Vector_Normalise(triNormal);
    colorIndex = (colorIndex + 1) % colors.length;

    //Take the dot product of the triangleNormal and the camera eye vector
    //If the normal is perpendicular to or forms an obtuse angle with the
    //Camera eye vector, then the projection of the normal will be <=0
    if (Vector_DotProduct(triNormal, triTransformed.p[0]) < 0.0) {

      //Create Single Direction Light
      let usedLight: VECTOR_3D = light
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
        color, context
      );
    }
     
  })

}