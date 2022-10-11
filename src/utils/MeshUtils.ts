import { VECTOR_3D, Triangle, VECTOR_UV, Mesh, SimpleMesh, Matrix4x4 } from "./types";

import { Vector_UV_Initialize } from "./VectorUVUtils";
import { Vector_Initialize } from "./Vector3DUtils";
import { 
	Matrix4x4_Cross_Vector, 
	Matrix4x4_MakeRotationX,
	Matrix4x4_MakeRotationZ
} from "./Matrix4x4Utils";


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
	const lines = response.split('\n');
	for (const l of lines) {
		const values = l.split(" ");
        if (values[values.length - 1].includes("\r")) {
            values[values.length - 1] = values[values.length - 1].slice(0, -1)

        }
		switch(values[0]) {
			//load new vertices
			case "v": {
				let x = parseFloat(values[1]);
				let y = parseFloat(values[2]);
				let z = parseFloat(values[3]);
				verts.push(Vector_Initialize(x, y, z));
			} break;
			//Load new texture coordinates
			case "vt": {
				let u = parseFloat(values[1]);
				let v = parseFloat(values[2]);
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
					pos.push( parseInt(values[i + 1].split("/")[0]) - 1);
					uv.push(parseInt(values[i + 1].split("/")[1]) - 1);
					normals.push(parseInt(values[i + 1].split("/")[2]) - 1);
				}
				faceVerts.push(pos);
				faceUVs.push(uv);
				faceNormals.push(normals);
			} break;
		}
	}	
}




const validateUVIndex = (index: any) => {
	return isNaN(index) || index === undefined || index === null
}

export const SimpleMesh_Load_Model_OBJ = (data: string) =>  {
	let _verts: VECTOR_3D[] = [];
	let _vertUVs: VECTOR_UV[] = [];
	let _vertNormals: VECTOR_3D[] = [];
	let _faceVerts: number[][] = [];
	let _faceUVs: number[][] = [];
	let _faceNormals: number[][] = [];
	parseOBJResponse(
		data, _verts, _vertUVs, _vertNormals, 
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
				uvCoords: [_vertUVs[uvi1] as VECTOR_UV, _vertUVs[uvi2] as VECTOR_UV, _vertUVs[uvi3] as VECTOR_UV]
			}
			mesh.tris.push(tri);
		} else {
			const dummy: VECTOR_UV = Vector_UV_Initialize(0.0, 0.0, 0.0)
			const tri: Triangle= {
				p: [_verts[vi1] as VECTOR_3D, _verts[vi2] as VECTOR_3D, _verts[vi3] as VECTOR_3D],
				uvCoords: [dummy, dummy, dummy]
			}
			mesh.tris.push(tri);
		}
	}
    return mesh;
}

export const Mesh_Load_Model_Obj = (data: string) => {
	let _verts: VECTOR_3D[] = [];
	let _vertUVs: VECTOR_UV[] = [];
	let _vertNormals: VECTOR_3D[] = [];
	let _faceVerts: number[][] = [];
	let _faceUVs: number[][] = [];
	let _faceNormals: number[][] = [];
	parseOBJResponse(
		data, _verts, _vertUVs, _vertNormals, 
		_faceVerts, _faceUVs, _faceNormals
	);

	let mesh: Mesh = {
		verts: _verts,
		vertexUVs: _vertUVs, 
		faceUVs: _faceUVs,
		faceNormals: _faceNormals,
		faceVerts: _faceVerts,
		vertexNormals: _vertNormals
	}

	return mesh;
}


//TODO: Make this actually work
//Note function will not work without refactoring mesh creation code to consider vertices, indices, normals, etc
export const Populate_Mesh_With_Sphere = (
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


	let sphere: Mesh = {
		verts: [],
		vertexUVs: [],
		vertexNormals: [],
		faceVerts: [],
		faceUVs: [],
		faceNormals:[]
	}
	//Go down each horizontal loop of the sphere (excluding the poles) and add vertices of the vertical loops along horizontal loop
	//For each horizontal loop
	for (let i = 1; i < horizontalLoops; i++) {
		//TODO: Might need to replace 4x4 matrix
		//Rotate base point at northpole by the angle to get base of horizontalLoop
		const hLoopBase = Matrix4x4_Cross_Vector(
			Matrix4x4_MakeRotationX(centerToHorizontalLoopAngle * i),
			sphereBase
		);
		for (let j = 0; j < verticalLoops; j++) {
			let vertex = 
			Matrix4x4_Cross_Vector(
				Matrix4x4_MakeRotationZ(centerToVerticalLoopAngle * j),
				hLoopBase
			)
			sphere.verts.push(vertex);				
		}
	}

	const calculateIndice = (h: number, v: number) => {
		return (h * verticalLoops) + v;
	}

	for (let h = 0; h < horizontalLoops - 2; h++) {
		for (let v = 0; v < verticalLoops - 1; v++) {
			//TODO: These indices might be in wrong order
			const lowerLeft = (h + 1) * verticalLoops + v;
			const upperLeft = h * verticalLoops + v;
			const upperRight = (h + 1) * verticalLoops
			let indiceOne: number = calculateIndice(h + 1, v);
			let indiceTwo: number = calculateIndice(h, v);
			let indiceThree: number = calculateIndice(h, v + 1);

			let arr: number[] = [indiceOne, indiceTwo, indiceThree];

			sphere.faceVerts.push(arr);

			indiceOne = calculateIndice(h, v + 1);
			indiceTwo = calculateIndice(h + 1, v);
			indiceThree = calculateIndice(h + 1, v + 1);

			arr = [indiceOne, indiceTwo, indiceThree];
			sphere.faceVerts.push(arr);
		}
	}
	return sphere;

}

export const Populate_SimpleMesh_With_Cube = (
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

export const Populate_Mesh_With_Null = () : Mesh => {
	let mesh: Mesh = {
		verts: [],
		vertexNormals: [],
		vertexUVs: [],
		faceVerts: [],
		faceNormals: [],
		faceUVs: []
	}
	return mesh
}