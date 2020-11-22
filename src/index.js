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
 */
const drawViewTriangle = (gl, program) => {
  const verteicesColors = new Float32Array([
    1.0, // 1
    1.0,
    1.0,
    1.0,
    1.0,
    1.0,
    -1.0, // 2
    1.0,
    1.0,
    1.0,
    0.0,
    1.0,
    -1.0, // 3
    -1.0,
    1.0,
    1.0,
    0.0,
    0.0,
    1.0, // 4
    -1.0,
    1.0,
    1.0,
    1.0,
    0.0,
    1.0, // 5
    -1.0,
    -1.0,
    0.0,
    1.0,
    0.0,
    1.0, // 6
    1.0,
    -1.0,
    0.0,
    1.0,
    1.0,
    -1.0, // 7
    1.0,
    -1.0,
    0.0,
    0.0,
    1.0,
    -1.0, // 8
    -1.0,
    -1.0,
    0.0,
    0.0,
    0.0,
  ]);
  const indices = new Uint8Array([
    0, // 1
    1,
    2,
    0,
    2,
    3,
    0, // 2
    3,
    4,
    0,
    4,
    5,
    0, // 3
    5,
    6,
    0,
    6,
    1,
    1, // 4
    6,
    7,
    1,
    7,
    2,
    7, // 5
    4,
    3,
    7,
    3,
    2,
    4, // 6
    7,
    6,
    4,
    6,
    5,
  ]);
  const vertexColorBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();
  if (!vertexColorBuffer || !indexBuffer) {
    console.log("Failed to create buffer");
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verteicesColors, gl.STATIC_DRAW);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  const a_Position = gl.getAttribLocation(program, "a_Position");
  const a_Color = gl.getAttribLocation(program, "a_Color");
  const u_MvpMatrix = gl.getUniformLocation(program, "u_MvpMatrix");
  if (!u_MvpMatrix || a_Position < 0 || a_Color < 0) {
    console.log("invalid storage");
    return;
  }
  const F_SIZE = verteicesColors.BYTES_PER_ELEMENT;
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, F_SIZE * 6, 0);
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, F_SIZE * 6, F_SIZE * 3);
  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_Color);
  const viewMatrix = mat4.create();
  const projMatrix = mat4.create();
  const mvpMatrix = mat4.create();
  mat4.lookAt(
    viewMatrix,
    vec3.fromValues(3, 3, 7),
    vec3.fromValues(0, 0, 0),
    vec3.fromValues(0, -1, 0)
  );
  mat4.perspective(projMatrix, 30, 1, 1, 100);
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
