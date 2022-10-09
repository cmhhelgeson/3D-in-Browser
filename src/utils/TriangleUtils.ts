import { VECTOR_3D, Triangle} from "./types";

export const Triangle_Get_Centroid = (tri: Triangle): VECTOR_3D => {
	const centroidVector: VECTOR_3D = {
		x: (tri.p[0].x + tri.p[1].x + tri.p[2].x) / 3,
		y: (tri.p[0].y + tri.p[1].y + tri.p[2].y) / 3,
		z: (tri.p[0].z + tri.p[1].z + tri.p[2].z) / 3,
		w: 1.0,
	}
	return centroidVector;
}