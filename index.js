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

async function main() {
  const canvas = document.querySelector("#root");
  const gl = canvas.getContext("webgl");
  const program = await initShader(gl);
  gl.useProgram(program);
  gl.clearColor(1.0, 0.0, 0.0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawTriangle(gl, program);
}

main();
