import { VECTOR_3D, Triangle, Matrix4x4} from "../src/utils/types";
import { 
    Vector_Sub, 
    Vector_CrossProduct, 
    Vector_Normalise,
    Vector_DotProduct,
    Vector_Initialize,
    Vector_Div
 } from "../src/utils/Vector3DUtils";
import { 
    Matrix4x4_Cross_Vector 
} from "../src/utils/Matrix4x4Utils";
import { 
    DrawTriangle 
} from "../src/utils/drawUtils";

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


const drawTriangleToCanvas = (
    tri: Triangle,
    projMat: Matrix4x4, 
    worldMatrix: Matrix4x4, 
    colorIndex: number,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D) => {
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
    //colorIndex = (colorIndex + 1) % colors.length;
  
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
  
}