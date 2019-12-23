varying vec2 uvs;

uniform float uFixAspect;
uniform float uRatio;

void main(){
  uvs=uv;
  gl_Position=vec4(position,.5);
}