WIP 3D Demonstrations in Browser showing competency in Linear Algebra, Vector Math, and Lighting: https://cmhhelgeson.github.io/3D-in-Browser/

(10/1/2022) : Basic Vertex and Triangle Rendering
(10/5/2022) : Triangle Culling and Finding Normals of Triangles (currently inside-out)

(10/6/2022): Fixing culling. TODO: Store normal of triangle into mesh info
(10/8/2022): Got OBJ loading to work, but I've stalled out when it comes to updating
state with React

(10/11/2022): Fixed bug casuing improper indexing of vertices. Implemented light movement. Encapsualted canvas and controls within separate windows. Moved utility functions to appropriate helper files. Fixed bug with zIndex and windows. Attempted to offload triangle drawing to worker threads but stopped due to experimental status and lack of Typescript support for offscreen canvas functions. Began work on per pixel triangle rasterization. Minor updates for Github Pages
