import { VECTOR_3D } from "./types";

export const Vector_Initialize = (x: number, y: number, z: number): VECTOR_3D => {
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