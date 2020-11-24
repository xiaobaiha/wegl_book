import vsSource from "./index.vs";
import fragSource from "./index.frag";
import { mat4, vec3 } from "gl-matrix";

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  gl.deleteShader(shader);
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} vShader
 * @param {string} fShader
 */
function createProgram(gl, vShader, fShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  gl.deleteProgram(program);
}

/**
 *
 * @param {WebGLRenderingContext} gl
 */
async function initShader(gl) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragSource);
  const program = createProgram(gl, vertexShader, fragmentShader);
  return program;
}

let eyeX = 0,
  canvasRatio = 0;

/**
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 * @param {*} data
 * @param {number} num
 * @param {number} type
 * @param {string} attribute
 */
const initArrayBuffer = (gl, program, data, num, type, attribute) => {
  const buffer = gl.createBuffer();
  if (!buffer) {
    console.log("Failed to create the buffer object");
    return false;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const a_Attribute = gl.getAttribLocation(program, attribute);
  if (a_Attribute < 0) {
    console.log("Failed to get the storage location of " + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_Attribute, num, type, false, 0, 0);
  gl.enableVertexAttribArray(a_Attribute);
  return true;
};

/**
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 */
const drawViewTriangle = (gl, program) => {
  const x0 = [1.0, 1.0, 1.0];
  const x1 = [-1.0, 1.0, 1.0];
  const x2 = [-1.0, -1.0, 1.0];
  const x3 = [1.0, -1.0, 1.0];
  const x4 = [1.0, -1.0, -1.0];
  const x5 = [1.0, 1.0, -1.0];
  const x6 = [-1.0, 1.0, -1.0];
  const x7 = [-1.0, -1.0, -1.0];
  const verteices = new Float32Array(
    [
      x0,
      x1,
      x2,
      x3,
      x0,
      x3,
      x4,
      x5,
      x0,
      x5,
      x6,
      x1,
      x1,
      x6,
      x7,
      x2,
      x7,
      x4,
      x3,
      x2,
      x4,
      x7,
      x6,
      x5,
    ].flat()
  );
  const c0 = [1.0, 1.0, 1.0];
  const c1 = [1.0, 1.0, 1.0];
  const c3 = [1.0, 1.0, 1.0];
  const c2 = [1.0, 1.0, 1.0];
  const c4 = [1.0, 1.0, 1.0];
  const c5 = [1.0, 1.0, 1.0];
  const colors = new Float32Array(
    [
      c0,
      c0,
      c0,
      c0,
      c1,
      c1,
      c1,
      c1,
      c2,
      c2,
      c2,
      c2,
      c3,
      c3,
      c3,
      c3,
      c4,
      c4,
      c4,
      c4,
      c5,
      c5,
      c5,
      c5,
    ].flat()
  );
  const indices = new Uint8Array([
    0, // 1
    1,
    2,
    0,
    2,
    3,
    4, // 2
    5,
    6,
    4,
    6,
    7,
    8, // 3
    9,
    10,
    8,
    10,
    11,
    12, // 4
    13,
    14,
    12,
    14,
    15,
    16, // 5
    17,
    18,
    16,
    18,
    19,
    20, // 6
    21,
    22,
    20,
    22,
    23,
  ]);
  const n1 = [0.0, 0.0, 1.0];
  const n2 = [1.0, 0.0, 0.0];
  const n3 = [0.0, 1.0, 0.0];
  const n4 = [-1.0, 0.0, 0.0];
  const n5 = [0.0, -1.0, 0.0];
  const n6 = [0.0, 0.0, -1.0];
  const normals = new Float32Array(
    [
      n1,
      n1,
      n1,
      n1,
      n2,
      n2,
      n2,
      n2,
      n3,
      n3,
      n3,
      n3,
      n4,
      n4,
      n4,
      n4,
      n5,
      n5,
      n5,
      n5,
      n6,
      n6,
      n6,
      n6,
    ].flat()
  );
  const indexBuffer = gl.createBuffer();
  if (
    !initArrayBuffer(gl, program, verteices, 3, gl.FLOAT, "a_Position") ||
    !initArrayBuffer(gl, program, colors, 3, gl.FLOAT, "a_Color") ||
    !initArrayBuffer(gl, program, normals, 3, gl.FLOAT, "a_Normal") ||
    !indexBuffer
  ) {
    console.log("Failed to create buffer");
    return -1;
  }
  const u_MvpMatrix = gl.getUniformLocation(program, "u_MvpMatrix");
  const u_LightColor = gl.getUniformLocation(program, "u_LightColor");
  const u_LightDirection = gl.getUniformLocation(program, "u_LightDirection");
  if (!u_MvpMatrix || !u_LightColor || !u_LightDirection) {
    console.log("invalid storage");
    return;
  }
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  const lightDirection = vec3.fromValues(0.5, 3.0, 4.0);
  vec3.normalize(lightDirection, lightDirection);
  gl.uniform3fv(u_LightDirection, lightDirection);
  const viewMatrix = mat4.create();
  const projMatrix = mat4.create();
  const mvpMatrix = mat4.create();
  mat4.lookAt(
    viewMatrix,
    vec3.fromValues(3, 3, 7),
    vec3.fromValues(0, 0, 0),
    vec3.fromValues(0, 1, 0)
  );
  mat4.perspective(projMatrix, (30 * Math.PI) / 180, canvasRatio, 1, 100);
  mat4.multiply(mvpMatrix, projMatrix, viewMatrix);
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE, 0);
  // window.requestAnimationFrame(() => drawViewTriangle(gl, program));
};

async function main() {
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector("#root");
  canvasRatio = canvas.width / canvas.height;
  const gl = canvas.getContext("webgl");
  const program = await initShader(gl);
  gl.useProgram(program);
  drawViewTriangle(gl, program);
}

main();
