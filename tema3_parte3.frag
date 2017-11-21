#version 150 core

struct LightInfo {
		vec4 lightPos; // S.R. del mundo
		vec3 intensity;
	};

struct MaterialInfo {
		vec3 ambient;
		vec3 diffuse;
		vec3 specular;
		float shininess;
	};

uniform LightInfo uLight;
uniform MaterialInfo uMaterial;
uniform sampler2D uNormalMap;
uniform sampler2D uColorMap;
uniform sampler2D uGlossMap;
uniform sampler2D uHeightMap;

uniform vec3 uLightPosition;
uniform vec3 uLInten;
uniform vec3 uAmbM;
uniform vec3 uDiffM;
uniform vec3 uSpecM;
uniform float uSh = 128.0;
uniform bool use_normal;
uniform bool use_color;
uniform bool use_gloss;
uniform bool use_parallex_simple;
uniform bool use_parallex_interative;

in vec3 vEcPos;
in vec3 vEcNorm;

in vec3 vLightDir;
in vec3 vViewDir;
in vec2 vST;

vec2 Vst = vST;

out vec4 fFragColor;

// vec3 ads (vec3 _normal, vec3 _vViewDir, vec3 ldir) {
// 	vec3 r = reflect(-ldir,_normal);
// 	return uLight.intensity * (uMaterial.diffuse * max(dot(ldir,_normal), 0.0) + uMaterial.specular * pow(max(dot(r,_vViewDir),0), uMaterial.shininess));
// }

vec3 ads (vec3 _normal, vec3 _vViewDir, vec3 ldir) {
	vec3 r = reflect(-ldir,_normal);
	vec3 specular;
	if (use_gloss)
		specular = vec3(texture(uGlossMap, Vst));
	else
		specular = vec3(0.5);

	if (use_color)
		return uLight.intensity * (vec3(texture(uColorMap, Vst)) * 0.2 + vec3(texture(uColorMap, Vst)) * max(dot(ldir,_normal), 0.0) +  specular * pow(max(dot(r,_vViewDir),0), uMaterial.shininess));
	
	return uLight.intensity * (uMaterial.ambient + uMaterial.diffuse * max(dot(ldir,_normal), 0.0) +  specular * pow(max(dot(r,_vViewDir),0), uMaterial.shininess));
}




void main() {
	vec3 normal;
	float scale = 0.04;
	float bias = -0.02;

	if (use_parallex_simple) {
		float hsb = texture(uHeightMap, vST).r * scale + bias;
		Vst = vST + hsb * normalize(vViewDir.xy);
	}

	if (use_parallex_interative) {
		float hsb1 = scale + bias;
		float h;
		vec2 st1 = Vst + hsb1 * normalize(vViewDir.xy);
		float hsb2 = bias;
		vec2 st2 = Vst + hsb2 * normalize(vViewDir.xy);
		for (int i = 0; i < 50; i++) {
			Vst = (st1 + st2) / 2;
			float hsb = (hsb1 + hsb2) / 2;
			h = texture(uHeightMap, Vst).r * scale + bias;

			if (h > hsb) {
				hsb2 = hsb;
				st2 = Vst;
			} else {
				hsb1 = hsb;
				st1 = Vst;
			}
		}
	}


	if (use_normal)
		normal = normalize( 2.0 * vec3(texture(uNormalMap, Vst)) - vec3(1.0) );
	else
		normal = vec3(0,0,1);
	fFragColor = vec4(ads(normal, normalize(vViewDir), normalize(vLightDir)), 1.);
}