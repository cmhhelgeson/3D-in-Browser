/*
	License (OLC-3)
	~~~~~~~~~~~~~~~
	Copyright 2018-2019 OneLoneCoder.com
	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions
	are met:
	1. Redistributions or derivations of source code must retain the above
	copyright notice, this list of conditions and the following disclaimer.
	2. Redistributions or derivative works in binary form must reproduce
	the above copyright notice. This list of conditions and the following
	disclaimer must be reproduced in the documentation and/or other
	materials provided with the distribution.
	3. Neither the name of the copyright holder nor the names of its
	contributors may be used to endorse or promote products derived
	from this software without specific prior written permission.
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
	"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
	LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
	A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
	HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
	SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
	DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
	THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/



#define OLC_PGE_APPLICATION
#include "olcPixelGameEngine.h"
#include <fstream>
#include <strstream>
#include <algorithm>
#include <string>
using namespace std;

// Created a 2D structure to hold texture coordinates
struct vec2d
{
	float u = 0;
	float v = 0;
	float w = 1;
};

struct vec3d
{
	float x = 0;
	float y = 0;
	float z = 0;
	float w = 1; // Need a 4th term to perform sensible matrix vector multiplication
};

struct triangle
{
	vec3d p[3];
	//vec2d t[3]; // added a texture coord per vertex
	olc::Pixel col;
};

/* struct unTexturedTriangle {
	vec3d p[3];
}

struct unTexturedMesh {
	vector<unTexturedTriangle> tris;
} */

struct mesh
{
	vector<triangle> tris;
};

struct mat4x4
{
	float m[4][4] = { 0 };
};

class olcEngine3D : public olc::PixelGameEngine
{
public:
	olcEngine3D()
	{
		sAppName = "3D Demo";
	}


private:
	mesh meshCube;
	mat4x4 matProj;	// Matrix that converts from view space to screen space
	vec3d vCamera;	// Location of camera in world space
	vec3d vLookDir;	// Direction vector along the direction camera points
	float fYaw;		// FPS Camera rotation in XZ plane
	float fTheta;	// Spins World transform

	olc::Sprite* sprTex1;

	void Populate_Mesh_With_Cube(mesh& mesh, 
		float originX, float originY, float originZ, 
		float lengthX, float lengthY, float lengthZ
	) {
		const vec3d front[4] = { 
			//0, 0, 0
			{originX, originY, originZ, 1.0f}, 
			//0, 1, 0
			{originX, originY + lengthY, originZ, 1.0f}, 
			//1, 1, 0
			{originX + lengthX, originY + lengthY, originZ, 1.0f},
			//1, 0, 0
			{originX + lengthX, originY, originZ, 1.0f} 
		};

		const vec3d back[4] = {
			//0, 0, 1
			{originX, originY, originZ + lengthZ, 1.0f},
			//0, 1, 1
			{originX, originY + lengthY, originZ + lengthZ , 1.0f},
			//1, 1, 1
			{originX + lengthX, originY + lengthY, originZ + lengthZ, 1.0f},
			//1, 0, 1
			{originX + lengthX, originY, originZ + lengthZ, 1.0f}
		};

		const vec2d uv[4] = {
			{0.0f, 1.0f, 1.0f},
			{0.0f, 0.0f, 1.0f},
			{1.0f, 0.0f, 1.0f},
			{1.0f, 1.0f, 1.0f}
		};

		/* 
		* 
		* 
		* f1  b1          f2
		* | ///           | ///
		* |	  |           | b2|  
		* |	  |		 	  |   |
		* |	  |			  |   |
		* |	  |			  |   |
		* |	  |b0		  | b3|
		  ---------------------
		  f0              f3
		
		
		
		
		*/


		mesh.tris = {
			//South
			{front[0], front[1], front[2]},
			{front[0], front[2], front[3]},
			//East
			{front[3], front[2], back[2]},
			{front[3], back[2], back[3]},
			//North
			{back[3], back[2], back[1]},
			{back[3], back[1], back[0]},
			//West
			{back[0], back[1], front[1]},
			{back[0], front[1], front[0]},
			//Top
			{front[1], back[1], back[2]},
			{front[1], back[2], back[1]},
			//Bottom
			{back[3], back[0], front[0]},
			{back[3], front[0], front[3]}


		};


	}

	vec3d Matrix_MultiplyVector(mat4x4& m, vec3d& i)
	{
		vec3d v;
		v.x = i.x * m.m[0][0] + i.y * m.m[1][0] + i.z * m.m[2][0] + i.w * m.m[3][0];
		v.y = i.x * m.m[0][1] + i.y * m.m[1][1] + i.z * m.m[2][1] + i.w * m.m[3][1];
		v.z = i.x * m.m[0][2] + i.y * m.m[1][2] + i.z * m.m[2][2] + i.w * m.m[3][2];
		v.w = i.x * m.m[0][3] + i.y * m.m[1][3] + i.z * m.m[2][3] + i.w * m.m[3][3];
		return v;
	}

	mat4x4 Matrix_MakeIdentity()
	{
		mat4x4 matrix;
		matrix.m[0][0] = 1.0f;
		matrix.m[1][1] = 1.0f;
		matrix.m[2][2] = 1.0f;
		matrix.m[3][3] = 1.0f;
		return matrix;
	}

	mat4x4 Matrix_MakeRotationX(float fAngleRad)
	{
		mat4x4 matrix;
		matrix.m[0][0] = 1.0f;
		matrix.m[1][1] = cosf(fAngleRad);
		matrix.m[1][2] = sinf(fAngleRad);
		matrix.m[2][1] = -sinf(fAngleRad);
		matrix.m[2][2] = cosf(fAngleRad);
		matrix.m[3][3] = 1.0f;
		return matrix;
	}

	mat4x4 Matrix_MakeRotationY(float fAngleRad)
	{
		mat4x4 matrix;
		matrix.m[0][0] = cosf(fAngleRad);
		matrix.m[0][2] = sinf(fAngleRad);
		matrix.m[2][0] = -sinf(fAngleRad);
		matrix.m[1][1] = 1.0f;
		matrix.m[2][2] = cosf(fAngleRad);
		matrix.m[3][3] = 1.0f;
		return matrix;
	}

	mat4x4 Matrix_MakeRotationZ(float fAngleRad)
	{
		mat4x4 matrix;
		matrix.m[0][0] = cosf(fAngleRad);
		matrix.m[0][1] = sinf(fAngleRad);
		matrix.m[1][0] = -sinf(fAngleRad);
		matrix.m[1][1] = cosf(fAngleRad);
		matrix.m[2][2] = 1.0f;
		matrix.m[3][3] = 1.0f;
		return matrix;
	}

	mat4x4 Matrix_MakeTranslation(float x, float y, float z)
	{
		mat4x4 matrix;
		matrix.m[0][0] = 1.0f;
		matrix.m[1][1] = 1.0f;
		matrix.m[2][2] = 1.0f;
		matrix.m[3][3] = 1.0f;
		matrix.m[3][0] = x;
		matrix.m[3][1] = y;
		matrix.m[3][2] = z;
		return matrix;
	}

	mat4x4 Matrix_MakeProjection(float fFovDegrees, float fAspectRatio, float fNear, float fFar)
	{
		float fFovRad = 1.0f / tanf(fFovDegrees * 0.5f / 180.0f * 3.14159f);
		mat4x4 matrix;
		matrix.m[0][0] = fAspectRatio * fFovRad;
		matrix.m[1][1] = fFovRad;
		matrix.m[2][2] = fFar / (fFar - fNear);
		matrix.m[3][2] = (-fFar * fNear) / (fFar - fNear);
		matrix.m[2][3] = 1.0f;
		matrix.m[3][3] = 0.0f;
		return matrix;
	}

	mat4x4 Matrix_MultiplyMatrix(mat4x4& m1, mat4x4& m2)
	{
		mat4x4 matrix;
		for (int c = 0; c < 4; c++)
			for (int r = 0; r < 4; r++)
				matrix.m[r][c] = m1.m[r][0] * m2.m[0][c] + m1.m[r][1] * m2.m[1][c] + m1.m[r][2] * m2.m[2][c] + m1.m[r][3] * m2.m[3][c];
		return matrix;
	}

	mat4x4 Matrix_PointAt(vec3d& pos, vec3d& target, vec3d& up)
	{
		// Calculate new forward direction
		vec3d newForward = Vector_Sub(target, pos);
		newForward = Vector_Normalise(newForward);

		// Calculate new Up direction
		vec3d a = Vector_Mul(newForward, Vector_DotProduct(up, newForward));
		vec3d newUp = Vector_Sub(up, a);
		newUp = Vector_Normalise(newUp);

		// New Right direction is easy, its just cross product
		vec3d newRight = Vector_CrossProduct(newUp, newForward);

		// Construct Dimensioning and Translation Matrix	
		mat4x4 matrix;
		matrix.m[0][0] = newRight.x;	matrix.m[0][1] = newRight.y;	matrix.m[0][2] = newRight.z;	matrix.m[0][3] = 0.0f;
		matrix.m[1][0] = newUp.x;		matrix.m[1][1] = newUp.y;		matrix.m[1][2] = newUp.z;		matrix.m[1][3] = 0.0f;
		matrix.m[2][0] = newForward.x;	matrix.m[2][1] = newForward.y;	matrix.m[2][2] = newForward.z;	matrix.m[2][3] = 0.0f;
		matrix.m[3][0] = pos.x;			matrix.m[3][1] = pos.y;			matrix.m[3][2] = pos.z;			matrix.m[3][3] = 1.0f;
		return matrix;

	}

	mat4x4 Matrix_QuickInverse(mat4x4& m) // Only for Rotation/Translation Matrices
	{
		mat4x4 matrix;
		matrix.m[0][0] = m.m[0][0]; matrix.m[0][1] = m.m[1][0]; matrix.m[0][2] = m.m[2][0]; matrix.m[0][3] = 0.0f;
		matrix.m[1][0] = m.m[0][1]; matrix.m[1][1] = m.m[1][1]; matrix.m[1][2] = m.m[2][1]; matrix.m[1][3] = 0.0f;
		matrix.m[2][0] = m.m[0][2]; matrix.m[2][1] = m.m[1][2]; matrix.m[2][2] = m.m[2][2]; matrix.m[2][3] = 0.0f;
		matrix.m[3][0] = -(m.m[3][0] * matrix.m[0][0] + m.m[3][1] * matrix.m[1][0] + m.m[3][2] * matrix.m[2][0]);
		matrix.m[3][1] = -(m.m[3][0] * matrix.m[0][1] + m.m[3][1] * matrix.m[1][1] + m.m[3][2] * matrix.m[2][1]);
		matrix.m[3][2] = -(m.m[3][0] * matrix.m[0][2] + m.m[3][1] * matrix.m[1][2] + m.m[3][2] * matrix.m[2][2]);
		matrix.m[3][3] = 1.0f;
		return matrix;
	}

	vec3d Vector_Add(vec3d& v1, vec3d& v2)
	{
		return { v1.x + v2.x, v1.y + v2.y, v1.z + v2.z };
	}

	vec3d Vector_Sub(vec3d& v1, vec3d& v2)
	{
		return { v1.x - v2.x, v1.y - v2.y, v1.z - v2.z };
	}

	vec3d Vector_Mul(vec3d& v1, float k)
	{
		return { v1.x * k, v1.y * k, v1.z * k };
	}

	vec3d Vector_Div(vec3d& v1, float k)
	{
		return { v1.x / k, v1.y / k, v1.z / k };
	}

	float Vector_DotProduct(vec3d& v1, vec3d& v2)
	{
		return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
	}

	float Vector_Length(vec3d& v)
	{
		return sqrtf(Vector_DotProduct(v, v));
	}

	vec3d Vector_Normalise(vec3d& v)
	{
		float l = Vector_Length(v);
		return { v.x / l, v.y / l, v.z / l };
	}

	vec3d Vector_CrossProduct(vec3d& v1, vec3d& v2)
	{
		vec3d v;
		v.x = v1.y * v2.z - v1.z * v2.y;
		v.y = v1.z * v2.x - v1.x * v2.z;
		v.z = v1.x * v2.y - v1.y * v2.x;
		return v;
	}

	

public:
	bool OnUserCreate() override
	{

		std::cout << ScreenWidth() << std::endl;
		std::cout << ScreenHeight() << std::endl;
		Populate_Mesh_With_Cube(meshCube, 0.0f, 0.0f, 0.0f, 1.0f, 1.0f, 1.0f);


		//sprTex1 = new olc::Sprite("zombie.png");

		// Projection Matrix
		matProj = Matrix_MakeProjection(90.0f, (float)ScreenHeight() / (float)ScreenWidth(), 0.1f, 1000.0f);
		return true;
	}

	bool OnUserUpdate(float fElapsedTime) override {


		//Clear the screen to Black
		Clear(olc::BLACK);
		//Create rotation matrixes for z-axis and x-axis
		std::cout << fElapsedTime << std::endl;

		if (GetKey(olc::Key::A).bHeld) {
			fTheta += 1.0f * fElapsedTime;
		}


		mat4x4 matRotZ = Matrix_MakeRotationZ(fTheta);
		mat4x4 matRotX = Matrix_MakeRotationX(fTheta);
		mat4x4 translateZ = Matrix_MakeTranslation(0.0f, 0.0f, 10.0f);

		mat4x4 worldMatrix = Matrix_MakeIdentity();
		worldMatrix = Matrix_MultiplyMatrix(matRotZ, matRotX);
		worldMatrix = Matrix_MultiplyMatrix(worldMatrix, translateZ);

		for (auto tri : meshCube.tris) {
			triangle triProjected, triTranslated, triRotatedZ, triRotatedZX;
			
			triTranslated.p[0] = Matrix_MultiplyVector(worldMatrix, tri.p[0]);
			triTranslated.p[1] = Matrix_MultiplyVector(worldMatrix, tri.p[1]);
			triTranslated.p[2] = Matrix_MultiplyVector(worldMatrix, tri.p[2]);


			triProjected.p[0] = Matrix_MultiplyVector(matProj, triTranslated.p[0]);
			triProjected.p[1] = Matrix_MultiplyVector(matProj, triTranslated.p[1]);
			triProjected.p[2] = Matrix_MultiplyVector(matProj, triTranslated.p[2]);

			triProjected.p[0].x += 1.0f; triProjected.p[0].y += 1.0f;
			triProjected.p[1].x += 1.0f; triProjected.p[1].y += 1.0f;
			triProjected.p[2].x += 1.0f; triProjected.p[2].y += 1.0f;
			triProjected.p[0].x *= 0.5f * (float)ScreenWidth();
			triProjected.p[0].y *= 0.5f * (float)ScreenHeight();
			triProjected.p[1].x *= 0.5f * (float)ScreenWidth();
			triProjected.p[1].y *= 0.5f * (float)ScreenHeight();
			triProjected.p[2].x *= 0.5f * (float)ScreenWidth();
			triProjected.p[2].y *= 0.5f * (float)ScreenHeight();

			DrawTriangle(triProjected.p[0].x, triProjected.p[0].y,
				triProjected.p[1].x, triProjected.p[1].y,
				triProjected.p[2].x, triProjected.p[2].y,
				olc::WHITE);


		}
		return true;

	}

}; 




int main()
{
	olcEngine3D demo;
	if (demo.Construct(512, 480, 1, 1))
		demo.Start();
	return 0;
}