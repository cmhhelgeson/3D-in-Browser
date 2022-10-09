import { VECTOR_3D, Matrix4x4, VECTOR_UV} from "./types";
import { 
    Vector_Normalise, 
    Vector_CrossProduct,
    Vector_Sub,
    Vector_DotProduct,
    Vector_Initialize,
    Vector_Div,
    Vector_Mul
} from "./Vector3DUtils";

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