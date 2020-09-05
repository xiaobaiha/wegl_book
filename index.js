function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.log(gl.getShaderInfoLog(shader));
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
  console.log(gl.getProgramInfoLog(program));
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

async function main() {
  const canvas = document.querySelector("#root");
  const gl = canvas.getContext("webgl");
  const program = await initShader(gl);
  gl.useProgram(program);
  gl.clearColor(1.0, 0.0, 0.0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  canvas.onclick = (e) => {
    handleClick(e, program, gl);
  };
  // drawPoint(program, gl);
  // const positionAttributrLocation = gl.getAttribLocation(program, "a_position");
  // const resolutionUniformLocation = gl.getUniformLocation(
  //   program,
  //   "u_resolution"
  // );
  // const colorUniformLocation = gl.getUniformLocation(program, "u_color");
  // const positionBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // const positions = [10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30];
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  // // webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // gl.clearColor(0, 0, 0, 0);
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // gl.useProgram(program);
  // gl.enableVertexAttribArray(positionAttributrLocation);
  // gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  // gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // const size = 2;
  // const type = gl.FLOAT;
  // const normalize = false;
  // const stride = 0;
  // const offset = 0;
  // gl.vertexAttribPointer(
  //   positionAttributrLocation,
  //   size,
  //   type,
  //   normalize,
  //   stride,
  //   offset
  // );
  // for (let i = 0; i < 50; i++) {
  //   setRect(gl, randomInt(300), randomInt(300));
  //   gl.uniform4f(
  //     colorUniformLocation,
  //     Math.random(),
  //     Math.random(),
  //     Math.random(),
  //     1
  //   );
  //   gl.drawArrays(gl.TRIANGLES, 0, 6);
  // }
}

main();
