const list = [
  ["紅樓夢", 1],
  ["賈寶玉", 2],
  ["林黛玉", 6],
  ["薛寶釵", 3],
  ["王熙鳳", 3],
  ["李紈", 3],
  ["賈元春", 3],
  ["賈迎春", 3],
  ["賈探春", 3],
  ["賈惜春", 3],
  ["秦可卿", 3],
  ["賈巧姐", 3],
  ["史湘雲", 3],
  ["妙玉", 3],
  ["賈政", 2],
  ["賈赦", 2],
  ["賈璉", 2],
  ["賈珍", 2],
  ["賈環", 2],
  ["賈母", 2],
  ["王夫人", 2],
  ["薛姨媽", 2],
  ["尤氏", 2],
  ["平兒", 2],
  ["鴛鴦", 2],
  ["襲人", 2],
  ["晴雯", 2],
  ["香菱", 2],
  ["紫鵑", 2],
  ["麝月", 2],
  ["小紅", 2],
  ["金釧", 2],
  ["甄士隱", 2],
  ["賈雨村", 2],
];

WordCloud(document.getElementById("root"), {
  list: list,
  gridSize: 8,
  drawMask: true,
  weightFactor: 16,
  fontFamily: "Hiragino Mincho Pro, serif",
  color: "random-dark",
  backgroundColor: "#f0f0f0",
  rotateRatio: 0,
  wait: 0,
});
