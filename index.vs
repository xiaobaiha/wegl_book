attribute vec4 a_position;
uniform mat4 u_ModelMatrix;

void main(){
  gl_Position=u_ModelMatrix*a_position;
}