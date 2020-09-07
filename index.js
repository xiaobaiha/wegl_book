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

function randomInt(a) {
  return Math.floor(Math.random() * a);
}

function setRect(gl, x, y) {
  const x2 = x + 20;
  const y2 = y + 10;
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x, y, x, y2, x2, y, x2, y, x, y2, x2, y2]),
    gl.STATIC_DRAW
  );
}

function loadSource(file) {
  return fetch(file).then((res) => res.text());
}

/**
 *
 * @param {WebGLRenderingContext} gl
 */
async function initShader(gl) {
  const [vertextShaderSource, fragmentShaderSource] = await Promise.all([
    loadSource("index.vs"),
    loadSource("index.frag"),
  ]);
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertextShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  const program = createProgram(gl, vertexShader, fragmentShader);
  return program;
}

const g_points = [];

const handleClick = (e, program, gl) => {
  const canvas = document.querySelector("#root");
  const [x, y] = [e.clientX, e.clientY];
  const glX = (2 * x - canvas.width) / canvas.width;
  const glY = -(2 * y - canvas.height) / canvas.height;
  g_points.push({ x: glX, y: glY });
  for (const point of g_points) {
    drawPoint(program, gl, point.x, point.y);
  }
};

const drawPoint = (program, gl, x, y) => {
  const a_position = gl.getAttribLocation(program, "a_position");
  const u_color = gl.getUniformLocation(program, "u_color");
  if (a_position < 0) {
    console.log("invalid storage");
    return;
  }
  gl.vertexAttrib3f(a_position, x, y, 0.0);
  gl.uniform4f(u_color, x, y, 0.0, 1.0);
  gl.drawArrays(gl.POINTS, 0, 1);
};

let last = Date.now();

const drawTriangle = (gl, program) => {
  const verteices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
  const vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create buffer");
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verteices, gl.STATIC_DRAW);
  const a_position = gl.getAttribLocation(program, "a_position");
  const u_ModelMatrix = gl.getUniformLocation(program, "u_ModelMatrix");
  if (a_position < 0) {
    console.log("invalid storage");
    return;
  }
  const rotate = ((Date.now() - last) / 1000) % 360;
  gl.uniformMatrix4fv(u_ModelMatrix, false, [
    Math.cos(rotate),
    Math.sin(rotate),
    0,
    0,
    -Math.sin(rotate),
    Math.cos(rotate),
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
  ]);
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_position);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  window.requestAnimationFrame(() => drawTriangle(gl, program));
};

function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLTexture} texture
 * @param {WebGLUniformLocation} u_Sampler
 * @param {HTMLImageElement} image
 */
const loadTexture = (gl, texture, u_Sampler, image) => {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    // 是 2 的幂，一般用贴图
    gl.generateMipmap(gl.TEXTURE_2D);
  } else {
    // 不是 2 的幂，关闭贴图并设置包裹模式（不需要重复）为到边缘
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 */
const initTexture = (gl, program) => {
  const texture = gl.createTexture();
  const u_Sampler = gl.getUniformLocation(program, "u_Sampler");
  const image = new Image();
  image.crossOrigin = "Anonymous";
  image.src = "assets/webpack.png";
  image.onload = () => {
    loadTexture(gl, texture, u_Sampler, image);
  };
};

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 */
const drawTexture = (gl, program) => {
  const verteices = new Float32Array([
    -0.5,
    0.5,
    0.0,
    1.0,
    -0.5,
    -0.5,
    0.0,
    0.0,
    0.5,
    0.5,
    1.0,
    1.0,
    0.5,
    -0.5,
    1.0,
    0.0,
  ]);
  const vertexTexCoordBuffer = gl.createBuffer();
  if (!vertexTexCoordBuffer) {
    console.log("Failed to create buffer");
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verteices, gl.STATIC_DRAW);
  const a_position = gl.getAttribLocation(program, "a_position");
  const a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
  const FSIZE = verteices.BYTES_PER_ELEMENT;
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, FSIZE * 4, 0);
  gl.enableVertexAttribArray(a_position);
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
  gl.enableVertexAttribArray(a_TexCoord);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  initTexture(gl, program);
};

async function main() {
  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector("#root");
  const gl = canvas.getContext("webgl");
  const program = await initShader(gl);
  gl.useProgram(program);
  drawTexture(gl, program);
}

main();
