const canvas = document.getElementById("game-area");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const startButton = document.getElementById("start-button");
const tileSize = 20;
const gameSpeed = 150;
let gameLoopInterval;
let score = 0;
let isGameOver = false;
let snake = [];
let food = {};
let dx = tileSize;
let dy = 0;
const cols = canvas.width / tileSize;
const rows = canvas.height / tileSize;
function initGame() {
  score = 0;
  scoreDisplay.textContent = score;
  isGameOver = false;
  snake = [
    { x: Math.floor(cols / 2) * tileSize, y: Math.floor(rows / 2) * tileSize },
    {
      x: (Math.floor(cols / 2) - 1) * tileSize,
      y: Math.floor(rows / 2) * tileSize,
    },
    {
      x: (Math.floor(cols / 2) - 1) * tileSize,
      y: Math.floor(rows / 2) * tileSize,
    },
  ];
  dx = tileSize;
  dy = 0;
  spawnFood();
}
function drawTile(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, tileSize, tileSize);
  ctx.strokeStyle = "#333333";
  ctx.strokeRect(x, y, tileSize, tileSize);
}
function drawSnake() {
  snake.forEach((segment, index) => {
    const color = index === 0 ? "#009499" : "#00c4cc";
    drawTile(segment.x, segment.y, color);
  });
}
function drawFood() {
  drawTile(food.x, food.y, "#cc5200");
}
function clearCanvas() {
  ctx.fillStyle = "#c6c6c6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function spawnFood() {
  function randomCoord(max) {
    return Math.floor((Math.random() * max) / tileSize) * tileSize;
  }
  food.x = randomCoord(canvas.width);
  food.y = randomCoord(canvas.height);
  snake.forEach((segment) => {
    if (segment.x === food.x && segment.y === food.y) {
      spawnFood();
    }
  });
}
function moveSnake() {
  const newHead = {
    x: snake[0].x + dx,
    y: snake[0].y + dy,
  };
  snake.unshift(newHead);
  if (newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    scoreDisplay.textContent = score;
    spawnFood();
  } else {
    snake.pop();
  }
}
function checkCollision() {
  head = snake[0];
  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height
  ) {
    return true;
  }
  for (let i = 3; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }
  return false;
}
function gameLoop() {
  if (isGameOver) {
    clearInterval(gameLoopInterval);
    ctx.fillStyle = "#1c1c1c";
    ctx.font = "30px Courier New";
    ctx.fillText("Game Over!", canvas.width / 2 - 80, canvas.height / 2);
    return;
  }
  clearCanvas();
  moveSnake();
  if (checkCollision()) {
    isGameOver = true;
    return;
  }
  drawFood();
  drawSnake();
}
let changingDirection = false;
function handleKeydown(event) {
  if (changingDirection) return;
  changingDirection = true;
  const keyPressed = event.keyCode;
  const goingUp = dy === -tileSize;
  const goingDown = dy === tileSize;
  const goingRight = dx === tileSize;
  const goingLeft = dx === -tileSize;
  if (keyPressed === 37 && !goingRight) {
    dx = -tileSize;
    dy = 0;
  }
  if (keyPressed === 38 && !goingDown) {
    dx = 0;
    dy = -tileSize;
  }
  if (keyPressed === 39 && !goingLeft) {
    dx = tileSize;
    dy = 0;
  }
  if (keyPressed === 40 && !goingUp) {
    dx = 0;
    dy = tileSize;
  }
}
document.addEventListener("keydown", handleKeydown);
function startGame() {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
  }
  initGame();
  gameLoopInterval = setInterval(() => {
    changingDirection = false;
    gameLoop();
  }, gameSpeed);
}
startButton.addEventListener("click", startGame);
clearCanvas();
ctx.fillStyle = "#1c1c1c";
ctx.font = "20px Courier New";
ctx.fillText(
  "Tekan Start untuk Mulai",
  canvas.width / 2 - 130,
  canvas.height / 2
);
