import { VECTOR_3D, VECTOR_UV, Matrix4x4, Mesh, Triangle} from "./types"
import fs from "fs"


/* MESH UTILS */
//#region
export const Populate_Mesh_With_Cube = (
	originX: number,
	originY: number, 
	originZ: number, 
	lengthX: number, 
	lengthY: number,
	lengthZ: number,
): Mesh => {
	const front: VECTOR_3D[] = [
		//0, 0, 0
		{x: originX, y: originY, z: originZ, w: 1.0}, 
		//0, 1, 0
		{x: originX, y: originY + lengthY, z: originZ, w: 1.0}, 
		//1, 1, 0
		{x: originX + lengthX, y: originY + lengthY, z: originZ, w: 1.0},
		//1, 0, 0
		{x: originX + lengthX, y: originY, z: originZ, w: 1.0}
	];

	const back: VECTOR_3D[] = [
		//0, 0, 1
		{x: originX, y: originY, z: originZ + lengthZ, w: 1.0},
		//0, 1, 1
		{x: originX, y: originY + lengthY, z: originZ + lengthZ , w: 1.0},
		//1, 1, 1
		{x: originX + lengthX, y: originY + lengthY, z: originZ + lengthZ, w: 1.0},
		//1, 0, 1
		{x: originX + lengthX, y: originY, z: originZ + lengthZ, w: 1.0}
	];

	const uv: VECTOR_UV[] = [
		{u: 0.0, v: 1.0, w: 1.0},
		{u: 0.0, v: 0.0, w: 1.0},
		{u: 1.0, v: 0.0, w: 1.0},
		{u: 1.0, v: 1.0, w: 1.0}
	];

	let newMesh: Mesh = {
		tris: []
	}
	newMesh.tris.push({
		p: [front[0], front[1], front[2]],
		uvCoords: [uv[0], uv[1], uv[2]],
	})

	newMesh.tris.push({
		p: [front[0], front[2], front[3]],
		uvCoords: [uv[0], uv[2], uv[3]],
	});
	//East Tris
	newMesh.tris.push({
		p: [front[3], front[2], back[2]],
		uvCoords: [uv[0], uv[1], uv[2]],
	});
	newMesh.tris.push({
		p: [front[3], back[2], back[3]],
		uvCoords:[uv[0], uv[2], uv[3]],
	});
	//North Tris
	newMesh.tris.push({
		p: [back[3], back[2], back[1]],
		uvCoords: [uv[0], uv[1], uv[2]],
	});
	newMesh.tris.push({
		p: [back[3], back[1], back[0]],
		uvCoords:[ uv[0], uv[2], uv[3]],
	});
	//West Tris
	newMesh.tris.push({
		p: [back[0], back[1], front[1]],
		uvCoords: [uv[0], uv[1], uv[2]],
	});
	newMesh.tris.push({
		p: [back[0], front[1], front[0]], 
		uvCoords: [uv[0], uv[2], uv[3]]
	});
	//Top Tris
	newMesh.tris.push({
		p: [front[1], back[1], back[2]],
		uvCoords:[uv[0], uv[1], uv[2]],
	});
	newMesh.tris.push({
		p: [front[1], back[2], front[2]], 
		uvCoords: [uv[0], uv[2], uv[3]],
	});
	//Bottom Tris
	newMesh.tris.push({
		p: [back[3], back[0], front[0]], 
		uvCoords: [uv[0], uv[1], uv[2]],
	});
	newMesh.tris.push({
		p: [back[3], front[0], front[3]], 
		uvCoords:[uv[0], uv[2], uv[3]],
	}) 
	return newMesh;

}

/* export const LoadModelFromObj = (fileName: string): Mesh => {
	let newMesh: Mesh = {
		tris: []
	};
	let nullUV: VECTOR_UV = {u: 0.0, v: 0.0,w: 0.0}
	const fileReader = new FileReader();
	const vertices: VECTOR_3D[] = [];
	fileReader.onload = (event: ProgressEvent<FileReader>) => {
		const fileData = event.target?.result;
		if (fileData === null || fileData === undefined) {
			return;
		}
		//Split the data on new Lines or the carriage return 
		//(new line that returns user to top of file) 
		const lines = (fileData as string).split(/\r\n|\n/);
		lines.forEach((line) => {
			if (line[0] === 'v' || line[0] === "V") {
				let wordArr: string[] = line.split(' ').slice(0, -3);
				vertices.push({
					x: parseFloat(wordArr[0]), 
					y: parseFloat(wordArr[1]), 
					z: parseFloat(wordArr[2]), 
					w: 1.0
				})
			} else if (line[0] === 'f' || line[0] === "F") {
				let wordArr: string[] = line.split(' ').slice(0, -3);
				const firstPoint: number = parseInt(wordArr[0].split('//')[0]);
				const secondPoint: number = parseInt(wordArr[1].split('//')[0]);
				const thirdPoint: number = parseInt(wordArr[2].split('//')[0]);
				//TODO: do something with the after //normal values later
			
				//const firstPoint = parseInt(line[1]);
				//const secondPoint = parseInt(line[2]);
				//const thirdPoint = parseInt(line[3]);
				console.log(firstPoint, secondPoint, thirdPoint);
				//TODO: Correctly assign texture points
				newMesh.tris.push({
					p: [
						vertices[firstPoint], 
						vertices[secondPoint], 
						vertices[thirdPoint]
					], 
					uvCoords: [nullUV, nullUV, nullUV]
				})
			}

		})
	}
	fileReader.onerror = (event: ProgressEvent<FileReader>) => {
		alert(event?.target?.error?.name);
	}
	fileReader.readAsText(fileName)


} */

//#endregion

export const Matrix4x4_Cross_Vector = (
    m: Matrix4x4, 
    i: VECTOR_3D
): VECTOR_3D => {
    let v: VECTOR_3D = {x: 0, y: 0, z: 0, w: 0}
    v.x = i.x * m[0][0] + i.y * m[1][0] + i.z * m[2][0] + i.w * m[3][0];
	v.y = i.x * m[0][1] + i.y * m[1][1] + i.z * m[2][1] + i.w * m[3][1];
	v.z = i.x * m[0][2] + i.y * m[1][2] + i.z * m[2][2] + i.w * m[3][2];
	v.w = i.x * m[0][3] + i.y * m[1][3] + i.z * m[2][3] + i.w * m[3][3];
    return v;
}

export const Matrix4x4_MakeIdentity = (): Matrix4x4 => {
    let matrix: Matrix4x4 = [
        [1.0, 0.0, 0.0, 0.0], 
        [0.0, 1.0, 0.0, 0.0], 
        [0.0, 0.0, 1.0, 0.0], 
        [0.0, 0.0, 0.0, 1.0]
    ]
    return matrix;
}

export const Matrix4x4_Initialize = (): Matrix4x4 => {
    let matrix: Matrix4x4 = [
        [0.0, 0.0, 0.0, 0.0], 
        [0.0, 0.0, 0.0, 0.0], 
        [0.0, 0.0, 0.0, 0.0], 
        [0.0, 0.0, 0.0, 0.0]
    ]
    return matrix;
}

export const Matrix4x4_MakeRotationX = (
    fAngleRad: number
): Matrix4x4 => {
    //Make sure cos is the same
    const cosRad = Math.cos(fAngleRad);
    const sinRad = Math.sin(fAngleRad);
    let matrix: Matrix4x4 = Matrix4x4_Initialize()

    matrix[0][0] = 1.0;
	matrix[1][1] = cosRad;
	matrix[1][2] = sinRad;
	matrix[2][1] = -sinRad;
	matrix[2][2] = cosRad;
	matrix[3][3] = 1.0;
	return matrix;

}

export const Matrix4x4_MakeRotationY = (
    fAngleRad: number
): Matrix4x4 => {
    const cosRad = Math.cos(fAngleRad);
    const sinRad = Math.sin(fAngleRad);

    let matrix: Matrix4x4 = Matrix4x4_Initialize();
	matrix[0][0] = cosRad;
	matrix[0][2] = sinRad;
	matrix[2][0] = -sinRad;
	matrix[1][1] = 1.0;
	matrix[2][2] = cosRad;
	matrix[3][3] = 1.0;
	return matrix;
}

export const Matrix4x4_MakeRotationZ = (
    fAngleRad: number
): Matrix4x4 => {
    const cosRad = Math.cos(fAngleRad);
    const sinRad = Math.sin(fAngleRad);

    let matrix: Matrix4x4 = Matrix4x4_Initialize();
	matrix[0][0] = cosRad;
	matrix[0][1] = sinRad;
	matrix[1][0] = -sinRad;
	matrix[1][1] = cosRad;
	matrix[2][2] = 1.0;
	matrix[3][3] = 1.0;
	return matrix;
}

export const Matrix4x4_MakeTranslation = (
    x: number, 
    y: number, 
    z: number
): Matrix4x4 => {
    let matrix: Matrix4x4 = Matrix4x4_Initialize();
    matrix[0][0] = 1.0;
	matrix[1][1] = 1.0;
	matrix[2][2] = 1.0;
	matrix[3][3] = 1.0;
	matrix[3][0] = x;
	matrix[3][1] = y;
	matrix[3][2] = z;
    return matrix;
}

export const Matrix4x4_MakeProjection = (
    fFovDegrees: number, 
    fAspectRatio: number, 
    fNear: number, 
    fFar: number
): Matrix4x4 => {
    const fFovRad: number = 1.0 / Math.tan(fFovDegrees * 0.5 / 180.0 * 3.14159);

	let matrix: Matrix4x4 = Matrix4x4_Initialize();
	matrix[0][0] = fAspectRatio * fFovRad;
	matrix[1][1] = fFovRad;
	matrix[2][2] = fFar / (fFar - fNear);
	matrix[3][2] = (-fFar * fNear) / (fFar - fNear);
	matrix[2][3] = 1.0
	matrix[3][3] = 0.0;
	return matrix;
}

export const Matrix4x4_Cross_Matrix4x4 = (
    m1: Matrix4x4, 
    m2: Matrix4x4
): Matrix4x4 => {
    let matrix: Matrix4x4 = Matrix4x4_Initialize();
    for (let c = 0; c < 4; c++) {
		for (let r = 0; r < 4; r++) {
			matrix[r][c] = m1[r][0] * m2[0][c] + m1[r][1] * m2[1][c] + m1[r][2] * m2[2][c] + m1[r][3] * m2[3][c];
        }
    }
	return matrix;
}

/* VECTOR UTILS */
export const Vector_Add = (v1: VECTOR_3D, v2: VECTOR_3D): VECTOR_3D => {
    return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z, w: 1.0};
}

export const Vector_Sub = (v1: VECTOR_3D, v2: VECTOR_3D): VECTOR_3D => {
	return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z, w: 1.0};
}

export const Vector_Mul = (v1: VECTOR_3D, k: number): VECTOR_3D => {
	return { x: v1.x * k, y: v1.y * k, z: v1.z * k, w: 1.0};
}

export const Vector_Div = (v1: VECTOR_3D, k: number): VECTOR_3D => {
	return { x: v1.x / k, y: v1.y / k, z: v1.z / k, w: 1.0};
}

export const Vector_DotProduct = (v1: VECTOR_3D, v2: VECTOR_3D): number => {
	return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

export const Vector_Length = (v: VECTOR_3D): number => {
	return Math.sqrt(Vector_DotProduct(v, v));
}

export const Vector_Normalise = (v: VECTOR_3D): VECTOR_3D => {
	const l: number = Vector_Length(v);
	return { x: v.x / l, y: v.y / l, z: v.z / l, w: 1.0};
}

export const Vector_CrossProduct = (v1: VECTOR_3D, v2: VECTOR_3D): VECTOR_3D => {
    let v: VECTOR_3D = {x: 0.0, y: 0.0, z: 0.0, w: 1.0}
	v.x = v1.y * v2.z - v1.z * v2.y;
	v.y = v1.z * v2.x - v1.x * v2.z;
	v.z = v1.x * v2.y - v1.y * v2.x;
	return v;
}

export const Matrix4x4_PointAt = (
    pos: VECTOR_3D, 
    target: VECTOR_3D, 
    up: VECTOR_3D
): Matrix4x4 => {
		// Calculate new forward direction
	let newForward: VECTOR_3D = Vector_Sub(target, pos);
	newForward = Vector_Normalise(newForward);

		// Calculate new Up direction
	let a: VECTOR_3D = Vector_Mul(newForward, Vector_DotProduct(up, newForward));
	let newUp: VECTOR_3D = Vector_Sub(up, a);
	newUp = Vector_Normalise(newUp);

		// New Right direction is easy, its just cross product
	let newRight: VECTOR_3D = Vector_CrossProduct(newUp, newForward);

		// Construct Dimensioning and Translation Matrix	
	let matrix: Matrix4x4 = Matrix4x4_Initialize();
	matrix[0][0] = newRight.x;	 matrix[0][1] = newRight.y;	  matrix[0][2] = newRight.z;	matrix[0][3] = 0.0;
	matrix[1][0] = newUp.x;		 matrix[1][1] = newUp.y;	  matrix[1][2] = newUp.z;		matrix[1][3] = 0.0;
	matrix[2][0] = newForward.x; matrix[2][1] = newForward.y; matrix[2][2] = newForward.z;	matrix[2][3] = 0.0;
	matrix[3][0] = pos.x;		 matrix[3][1] = pos.y;		  matrix[3][2] = pos.z;			matrix[3][3] = 1.0;
	return matrix;
}

export const Triangle_Get_Centroid = (tri: Triangle): VECTOR_3D => {
	const centroidVector: VECTOR_3D = {
		x: (tri.p[0].x + tri.p[1].x + tri.p[2].x) / 3,
		y: (tri.p[0].y + tri.p[1].y + tri.p[2].y) / 3,
		z: (tri.p[0].z + tri.p[1].z + tri.p[2].z) / 3,
		w: 1.0,
	}
	return centroidVector;
}