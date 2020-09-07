attribute vec4 a_position;
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;
void main(){
  gl_Position=a_position;
  v_TexCoord=a_TexCoord;
}