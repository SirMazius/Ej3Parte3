#version 150 core

struct LightInfo {
		vec4 lightPos; // S.R. del mundo
		vec3 intensity;
	};

in vec3 aPosition;
in vec3 aNormal;
in vec3 aTangent;
in vec2 aTexCoord;


uniform mat4 uModelViewProjMatrix;
uniform mat4 uModelViewMatrix;
uniform mat3 uNormalMatrix;
uniform LightInfo uLight;

flat out vec3 vColorF;
out vec3 vColor;
out vec3 vEcPos;
out vec3 vEcNorm;

out vec3 vLightDir;
out vec3 vViewDir;
out vec2 vST;	


void main() {
	vec3 ecNorm, ecPos;
	vec3 n = normalize(uNormalMatrix * aNormal);
	vec3 t = normalize(uNormalMatrix * aTangent);
	vec3 b = cross(n, t);
	mat3 TBN = transpose(mat3(t, b, n));

	vec3 eyeVertex = vec3(uModelViewMatrix * vec4(aPosition,1.0));
	vec3 eyeViewDir = vec3(0., 0., 0) - eyeVertex;
	vec3 eyeLightDir = vec3(uLight.lightPos) - eyeVertex;

	vLightDir = TBN * eyeLightDir;
	vViewDir = TBN * eyeViewDir;

	vST = aTexCoord;

	ecPos = vec3(uModelViewMatrix * vec4(aPosition, 1.0));
	ecNorm = normalize(uNormalMatrix * aNormal);

	vEcPos = ecPos;
	vEcNorm = ecNorm;
	
	gl_Position = uModelViewProjMatrix * vec4(aPosition, 1.0);
}