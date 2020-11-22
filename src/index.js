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

let eyeX = 0.2;

/**
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 */
const drawViewTriangle = (gl, program) => {
  const verteicesColors = new Float32Array([
    // vertex and color
    0.0,
    0.5,
    -0.4,
    0.4,
    1.0,
    0.4, // green
    -0.5,
    -0.5,
    -0.4,
    0.4,
    1.0,
    0.4,
    0.5,
    -0.5,
    -0.4,
    1.0,
    0.4,
    0.4,
    0.5,
    0.4,
    -0.2,
    1.0,
    0.4,
    0.4, // yellow
    -0.5,
    0.4,
    -0.2,
    1.0,
    1.0,
    0.4,
    0.0,
    -0.6,
    -0.2,
    1.0,
    1.0,
    0.4,
    0.0,
    0.5,
    0.0,
    0.4,
    0.4,
    1.0, // blue
    -0.5,
    -0.5,
    0.0,
    0.4,
    0.4,
    1.0,
    0.5,
    -0.5,
    0.0,
    1.0,
    0.4,
    0.4,
  ]);
  const vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log("Failed to create buffer");
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verteicesColors, gl.STATIC_DRAW);
  const a_Position = gl.getAttribLocation(program, "a_Position");
  const a_Color = gl.getAttribLocation(program, "a_Color");
  const u_ViewMatrix = gl.getUniformLocation(program, "u_ViewMatrix");
  if (!u_ViewMatrix || a_Position < 0 || a_Color < 0) {
    console.log("invalid storage");
    return;
  }
  const viewMatrix = mat4.create();
  mat4.lookAt(
    viewMatrix,
    vec3.fromValues(eyeX, 0.25, 0.25),
    vec3.fromValues(0, 0, 0),
    vec3.fromValues(0, 1, 0)
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);
  const F_SIZE = verteicesColors.BYTES_PER_ELEMENT;
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, F_SIZE * 6, 0);
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, F_SIZE * 6, F_SIZE * 3);
  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_Color);
  gl.drawArrays(gl.TRIANGLES, 0, 9);
  window.requestAnimationFrame(() => drawViewTriangle(gl, program));
};

async function main() {
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector("#root");
  const gl = canvas.getContext("webgl");
  const program = await initShader(gl);
  gl.useProgram(program);
  drawViewTriangle(gl, program);
  document.onkeydown = (ev) => {
    console.log("ev.key: ", ev.key);
    if (ev.key === "ArrowRight") {
      eyeX += 0.01;
    } else if (ev.key === "ArrowLeft") {
      eyeX -= 0.01;
    }
  };
}

main();