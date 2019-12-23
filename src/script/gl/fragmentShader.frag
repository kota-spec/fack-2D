varying vec2 uvs;

uniform vec2 uResolution;
uniform vec2 uThreshold;
uniform vec2 uMouse;
uniform sampler2D uTex1;// 実際に描画するテクスチャー
uniform sampler2D uTex2;// 変形させるテクスチャー

vec2 mirrored(vec2 v){
  vec2 m=mod(v,2.);
  return mix(m,2.-m,step(1.,m));
}

void main(){
  vec2 vUv=(uvs-vec2(.5))*uResolution.xy+vec2(.5);// テクスチャーをcoverのようにする
  vec4 tex1=texture2D(uTex2,mirrored(vUv));// 変形させるテクスチャーを描画
  
  // マウスの位置に対してテクスチャーを変形させる
  vec2 fake3d=vec2(vUv.x+(tex1.r-.5)*uMouse.x/uThreshold.x,vUv.y+(tex1.r-.5)*uMouse.y/uThreshold.y);
  
  // 変形させたテクスチャーの座標を元に画像を表示
  gl_FragColor=texture2D(uTex1,mirrored(fake3d));
}