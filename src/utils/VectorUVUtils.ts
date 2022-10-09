import { VECTOR_UV } from "./types"

export const Vector_UV_Initialize = (u: number, v: number, w: number | null = null): VECTOR_UV => {
	return {u: u, v: v, w: w}
}