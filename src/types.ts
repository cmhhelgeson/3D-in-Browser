export type VECTOR_3D = {
    x: number,
    y: number, 
    z: number,
    w: number
}

export type VECTOR_UV = {
    u: number, 
    v: number
    w: number | null
}


export type Triangle = {
    p: [VECTOR_3D, VECTOR_3D, VECTOR_3D],
    uvCoords: [VECTOR_UV, VECTOR_UV, VECTOR_UV]
}



export type SimpleMesh = {
    tris: Triangle[]
}

export type Mesh = {
    verts: VECTOR_3D[],
    vertexNormals: VECTOR_3D[],
    vertexUVs: VECTOR_UV[],
    faceVerts: number[],
    faceUVs: number[],
    faceNormals: number[]   
}

export type Matrix4x4 = [
    //We could pass this as an object, but arrays are also pass by reference
    //In javascritp
    [number, number, number, number], 
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number]
];


export const Identity: Matrix4x4 = [
    [1, 0, 0, 0], 
    [0, 1, 0, 0], 
    [0, 0, 1, 0], 
    [0, 0, 0, 1], 
]

export type Bitmap = {
    width: number,
    height: number,
    pixels: Uint32Array
}