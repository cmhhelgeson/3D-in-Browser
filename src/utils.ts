import { VECTOR_3D, VECTOR_UV, Matrix4x4, Mesh, Triangle, Bitmap, SimpleMesh} from "./types"
import { createReadStream, fstat, ReadStream,} from "fs"
import {ReadLine, createInterface} from "node:readline"
import { create } from "domain"
import axios from "axios"
/* VECTOR UTILS */
//#region


export const Vector_Initialize = (x: number, y: number, z: number): VECTOR_3D=> {
	return {x: x, y: y, z: z, w: 1.0}
}

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

//#endregion

/* VECTOR UV UTILS */
//#region 

export const Vector_UV_Initialize = (u: number, v: number, w: number | null = null): VECTOR_UV => {
	return {u: u, v: v, w: w}
}


//#endregion

/* MESH UTILS */
//#region

//https://github.com/mrdoob/three.js/blob/eadd35e44c49eee5b3910cd2b761fbdfd05d6c67/examples/jsm/loaders/STLLoader.js
//http://www.jgxsoft.com/examples/STL%20Reader/STL%20Reader.html
//https://regexr.com/
/*export const Mesh_Load_Model_FTL_ASCII = (data: string) => {
	//REGEXP #1: 
	//   /g    = global search
	//   (     = groups tokens together
	//   [     = start defining character set
	//   \s    = match any character that is whitespace
	//   \S    = match any character that is not whitespace
	//   quantifiers:
	//       + = match 1 or more of character (ie. index 1 but not 0)
	//       * = match 0 or more of character (ie. index 0 - infinity)
	//  {1, 3} = match 1 to 3 of character    (i.e 1st through 3rd instances of match set)
	//  {3, }  = match 3 or more of character 
	//       ? = lazy, will match as few as possible
	//  Essentially find any pattern with solid, random chars, then endsolid
	const patternSolid = /solid([\s\S]*?)endsolid/g
	//Same method as previous variable
	const patternFace = /facet([\s\S]*?)endfacet/g;
	//Will match the 1.0733423E2 format of floats
	const patternFloat = /[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source;
	const patternVertex = new RegExp( 'vertex' + patternFloat + patternFloat + patternFloat, 'g' );
	const patternNormal = new RegExp( 'normal' + patternFloat + patternFloat + patternFloat, 'g' );

	const vertices = [];
	const normals = [];

	const normal = Vector_Initialize(0.0, 0.0, 0.0);

	let result = null;

	let groupCount = 0;
	let startVertex = 0;
	let endVertex = 0;
	let faceCounter = 0;

	//If the ascii file begins with solid and ends with endsolid
	while ( ( result = patternSolid.exec( data ) ) !== null ) {

		startVertex = endVertex;

		const solid = result[ 0 ];

		while ( ( result = patternFace.exec( solid ) ) !== null ) {

			let vertexCountPerFace = 0;
			let normalCountPerFace = 0;

			const text = result[ 0 ];

			while ( ( result = patternNormal.exec( text ) ) !== null ) {

				normal.x = parseFloat( result[ 1 ] );
				normal.y = parseFloat( result[ 2 ] );
				normal.z = parseFloat( result[ 3 ] );
				normalCountPerFace ++;

			}

			while ( ( result = patternVertex.exec( text ) ) !== null ) {

				vertices.push( parseFloat( result[ 1 ] ), parseFloat( result[ 2 ] ), parseFloat( result[ 3 ] ) );
				normals.push( normal.x, normal.y, normal.z );
				vertexCountPerFace ++;
				endVertex ++;

			}

			// every face have to own ONE valid normal

			if ( normalCountPerFace !== 1 ) {

				console.error( 'THREE.STLLoader: Something isn\'t right with the normal of face number ' + faceCounter );

			}

			// each face have to own THREE valid vertices

			if ( vertexCountPerFace !== 3 ) {

				console.error( 'THREE.STLLoader: Something isn\'t right with the vertices of face number ' + faceCounter );

			}

			faceCounter ++;

		}

		const start = startVertex;
		const count = endVertex - startVertex;


		//TODO: Make it work with current setup
		//geometry.addGroup( start, count, groupCount );
		groupCount ++;

	}

	return;


} */

export const Mesh_Load_Model_FTL_BINARY = (location: string) => {
	return;
}

export const Mesh_OBJ_Has_Texture_Coords = (location: string) : boolean => {
	//Pattern that selects indice lines of an obj
	const patternUV = /f([\s\S]+?)\n/g

	let fileExplorer: XMLHttpRequest = new XMLHttpRequest();
	//Asynchronously 'get' the model
	fileExplorer.open("get", location, true)
	//Send request with null body
	fileExplorer.send(null)

	//When the file has been opened
	fileExplorer.onreadystatechange = () => {
		const {responseText, readyState, status} = fileExplorer;
		if (readyState === 4 && status === 200) {
			const indiceLines = patternUV.exec(responseText);
			if (indiceLines !== null) {
				return indiceLines[0].includes("//");
			} else {
				return false;
			}
		}
	}
	return false;
}


const parseOBJResponse = (
	response: string, 
	verts: VECTOR_3D[],
	vertUVs: VECTOR_UV[],
	vertNormals: VECTOR_3D[],
	faceVerts: number[][],
	faceUVs: number[][],
	faceNormals: number[][]
) : void => {
	console.log(response);
	const lines = response.split('\n');
	for (const l of lines) {
		const values = l.split(" ");
		switch(values[0]) {
			//load new vertices
			case "v": {
				const x = parseFloat(values[1]);
				const y = parseFloat(values[2]);
				const z = parseFloat(values[3]);
				verts.push(Vector_Initialize(x, y, z));
			} break;
			//Load new texture coordinates
			case "vt": {
				const u = parseFloat(values[1]);
				const v = parseFloat(values[2]);
				let w = null;
				if (values.length > 3) {
					w = parseFloat(values[3]);
				}
				vertUVs.push(Vector_UV_Initialize(u, v, w));
			} break;
			//Load new vertexNormals
			case "vn": {
                const x = parseFloat(values[1]);
				const y = parseFloat(values[2]);
				const z = parseFloat(values[3]);
                vertNormals.push(Vector_Initialize(x, y, z));
			} break;
			//Load new indices
        	case "f": {
				//Note that the format for a f command is 
				//f position_id/uv coords_id/normal_id
				//obj without textures will be
				//f position_id//normal_id
                let pos = [];
				let uv = [];
				let normals = [];
				//Index into each pos/uv/normal triplet
                for (let i = 0; i < 3; i++) {
					pos.push(parseInt(values[i + 1].split("/")[0]));
					uv.push(parseInt(values[i + 1].split("/")[1]));
					normals.push(parseInt(values[i + 1].split("/")[2]));
				}
				faceVerts.push(pos);
				faceUVs.push(uv);
				faceNormals.push(normals);
			} break;
		}
	}	
	console.log("Succesfully parsed obj")
}


type MeshLoadType = "SIMPLE_MESH" | "MESH"


const validateUVIndex = (index: any) => {
	return isNaN(index) || index === undefined || index === null
}

export const SimpleMesh_Load_Model_OBJ = async (location: string): Promise<SimpleMesh> =>  {
	let _verts: VECTOR_3D[] = [];
	let _vertUVs: VECTOR_UV[] = [];
	let _vertNormals: VECTOR_3D[] = [];
	let _faceVerts: number[][] = [];
	let _faceUVs: number[][] = [];
	let _faceNormals: number[][] = [];

	const response: Promise<SimpleMesh> = axios.get(location).then((res) => {
		console.log(res.data);
		parseOBJResponse(
			res.data, _verts, _vertUVs, _vertNormals, 
			_faceVerts, _faceUVs, _faceNormals
		);
		let mesh: SimpleMesh = {
			tris: []
		}
			//For each triangle face
		for (let i = 0; i < _faceVerts.length; i++) {
			const vi1 = _faceVerts[i][0];
			const vi2 = _faceVerts[i][1];
			const vi3 = _faceVerts[i][2];
	
			let uvi1 = 0;
			let uvi2 = 0;
			let uvi3 = 0;
			//TODO: Currently, if no uvs are present, these values will be NaN, but perhaps we don't want to store
			//large arrays of NaN values
			uvi1 = _faceUVs[i][0];
			uvi2 = _faceUVs[i][1];
			uvi3 = _faceUVs[i][2];
			if (validateUVIndex(uvi1)) {
				const tri: Triangle = {
					p: [_verts[vi1], _verts[vi2], _verts[vi3]],
					uvCoords: [_vertUVs[uvi1], _vertUVs[uvi2], _vertUVs[uvi3]]
				}
				mesh.tris.push(tri);
			} else {
				const dummy: VECTOR_UV = Vector_UV_Initialize(0.0, 0.0, 0.0)
				const tri: Triangle= {
					p: [_verts[vi1], _verts[vi2], _verts[vi3]],
					uvCoords: [dummy, dummy, dummy]
				}
				mesh.tris.push(tri);
			}
		}
		return mesh;
	})
	return response;
}

export const Mesh_Load_Model_OBJ = (location: string) : Mesh => {
	let fileExplorer: XMLHttpRequest = new XMLHttpRequest();
	//Asynchronously 'get' the model
	fileExplorer.open("get", location, true)
	//Send request with null body
	fileExplorer.send(null);


	let _verts: VECTOR_3D[] = [];
	let _vertUVs: VECTOR_UV[] = [];
	let _vertNormals: VECTOR_3D[] = [];
	let _faceVerts: number[][] = [];
	let _faceUVs: number[][] = [];
	let _faceNormals: number[][] = [];

	//When the file has been opened
	fileExplorer.onreadystatechange = (event) => {
		const {response, readyState, status} = fileExplorer;
		if (readyState === 4 && status === 200) {
			parseOBJResponse(response, _verts, _vertUVs, _vertNormals, _faceVerts, _faceUVs, _faceNormals)
		}
	}

	let mesh: Mesh = {
		verts: _verts,
		vertexUVs: _vertUVs,
		vertexNormals: _vertNormals,
		faceVerts: _faceVerts,
		faceUVs: _faceUVs,
		faceNormals: _faceNormals
	}

	return mesh;

}


//Note function will not work without refactoring mesh creation code to consider vertices, indices, normals, etc
/* export const Populate_Mesh_With_Sphere = (
	radius: number,
	latPoints: number,
	longPoints: number,
) : Mesh => {

	//Notes:
	//LATITUDE: North -> South Positions
	//LONGITUDE: West -> East Positions
	//There are x longitudinal loops and y latitudinal loops
	const sphereBase: VECTOR_3D = Vector_Initialize(0.0, 0.0, radius)
	//How many horizontal loops are there around the sphere, determined by how many latitude points there are
	const horizontalLoops: number = Math.floor(latPoints); 
	//How many vertical loops around the sphere, determined by how many longitude points there are
	const verticalLoops: number = Math.floor(longPoints);

	//Angle for each horizontal loop. Only need to acknowledge half of the circle
	const centerToHorizontalLoopAngle = Math.PI / horizontalLoops;
	//Angle for each vertical loop. Vertical loops wrap around entire sphere so we need to acknowledge full circumference of the sphere
	const centerToVerticalLoopAngle = 2.0 * Math.PI / verticalLoops;


	//Go down each horizontal loop of the sphere (excluding the poles) and add vertices of the vertical loops along horizontal loop
	//For each horizontal loop
	for (let i = 1; i < horizontalLoops; i++) {
		//TODO: Might need to replace 4x4 matrix
		//Rotate base point at northpole by the angle to get base of horizontalLoop
		const loopBase = Matrix4x4_Cross_Vector(
			Matrix4x4_MakeRotationX(centerToHorizontalLoopAngle * i),
			sphereBase
		);
		for (let j = 0; j < verticalLoops; j++) {

		}


	}


	

} */



export const Populate_Mesh_With_Cube = (
	originX: number,
	originY: number, 
	originZ: number, 
	lengthX: number, 
	lengthY: number,
	lengthZ: number,
): SimpleMesh => {
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

	let newMesh: SimpleMesh = {
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


//#endregion

/* MATRIX4X4 UTILS */
//#region
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

//#endregion



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


/*BITMAP UTILS */
//#region

export const Bitmap_Initialize = (width: number, height: number): Bitmap => {
	return {
		width: width,
		height: height,
		pixels: new Uint32Array(width * height)
	} as Bitmap

}