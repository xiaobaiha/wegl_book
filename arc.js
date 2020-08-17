const canvas = document.querySelector("#root");
const context = canvas.getContext("2d");
const p0 = [50, 150];
const p1 = [100, 100];
const p2 = [150, 170];
context.beginPath();
// context.moveTo(0, 0);
// context.lineTo(100, 100);
// context.stroke();

context.moveTo(p0[0], p0[1]);
context.arcTo(0, 100, p1[0], p1[1], 100);
// context.stroke();
// context.moveTo(150, 20);
// context.arcTo(150, 100, 50, 20, 30);
context.stroke();
