
import {SimpleMesh} from "./utils/types"
import { Populate_SimpleMesh_With_Cube } from "./utils/MeshUtils"

type ModelResourceType = {
    cube: {
        url: string,
        model: SimpleMesh
    }
}

let models: ModelResourceType = {
    cube: {
        url: "./models/cube.txt",
        model: Populate_SimpleMesh_With_Cube(0.0, 0.0, 0.0, 5.0, 5.0, 1.0),
    }
}

export {models}