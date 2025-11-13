const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");
const nextCanvas = document.getElementById("next-piece");
const nextCtx = nextCanvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const row = 20;
const col = 10;
const blockSize = 20;
canvas.width = col * blockSize;
canvas.height = row * blockSize;
nextCanvas.width = 4 * blockSize;
nextCanvas.height = 4 * blockSize;
const vacant = "BLACK";
let board = [];
let score = 0;
let level = 1;
let gameLoopInterval;
let isGameOver = false;
let linesToLevelUp = 10;
let colors = ["CYAN", "BLUE", "ORANGE", "YELLOW", "GREEN", "PURPLE", "RED"];
function initBoard() {
  for (let r = 0; r < row; r++) {
    board[r] = [];
    for (let c = 0; c < col; c++) {
      board[r][c] = vacant;
    }
  }
}
function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
  ctx.strokeStyle = "BLACK";
  ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
}
function drawBoard() {
  for (let r = 0; r < row; r++) {
    for (let c = 0; c < col; c++) {
      drawBlock(c, r, board[r][c]);
    }
  }
}
initBoard();
drawBoard();
const shapes = [
  [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  [
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],
  [
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
  [
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
  ],
  [
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  [
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  ],
];
class Piece {
  constructor(tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;
    this.r = 0;
    this.c = Math.floor((col - this.tetromino[0].length) / 2);
    this.rotation = 0;
  }
  getActiveTetromino() {
    return this.tetromino[this.rotation];
  }
  draw() {
    this.fill(this.color);
  }
  undraw() {
    this.fill(vacant);
  }
  fill(color) {
    let activeTetro = this.getActiveTetromino();
    for (let r = 0; r < activeTetro.length; r++) {
      for (let c = 0; c < activeTetro.length; c++) {
        if (activeTetro[r][c]) {
          drawBlock(this.c + c, this.r + r, color);
        }
      }
    }
  }
  moveDown() {
    if (!this.collision(0, 1, this.getActiveTetromino())) {
      this.undraw();
      this.r++;
      this.draw();
    } else {
      this.lock();
    }
  }
}
function randomPiece() {
  let r = Math.floor(Math.random() * shapes.length);
  return new Piece(shapes[r], colors[r]);
}
let nextPiece;
let piece;
Piece.prototype.collision = function (dx, dy, pieceTetro) {
  for (let r = 0; r < pieceTetro.length; r++) {
    for (let c = 0; c < pieceTetro.length; c++) {
      if (!pieceTetro[r][c]) {
        continue;
      }
      let newC = this.c + c + dx;
      let newR = this.r + r + dy;
      if (newC < 0 || newC >= col || newR >= row) {
        return true;
      }
      if (newR < 0) {
        continue;
      }
      if (board[newR][newC] != vacant) {
        return true;
      }
    }
  }
  return false;
};
Piece.prototype.lock = function () {
  let activeTetro = this.getActiveTetromino();
  for (let r = 0; r < activeTetro.length; r++) {
    for (let c = 0; c < activeTetro.length; c++) {
      if (!activeTetro[r][c]) {
        continue;
      }
      if (this.r + r <= 1) {
        isGameOver = true;
        clearInterval(gameLoopInterval);
        ctx.fillStyle = "WHITE";
        ctx.font = "25px Arial";
        ctx.fillText("GAME OVER", 25, 210);
        return;
      }
      board[this.r + r][this.c + c] = this.color;
    }
  }
  this.clearLines();
  drawBoard();
  piece = nextPiece;
  nextPiece = randomPiece();
  drawNextPiece();
};
Piece.prototype.clearLines = function () {
  let linesCleared = 0;
  for (r = row - 1; r >= 0; r--) {
    let isRowFull = true;
    for (c = 0; c < col; c++) {
      if (board[r][c] == vacant) {
        isRowFull = false;
        break;
      }
    }
    if (isRowFull) {
      linesCleared++;
      for (rr = r; rr > 0; rr--) {
        for (cc = 0; cc < col; cc++) {
          board[rr][cc] = board[rr - 1][cc];
        }
      }
      for (cc = 0; cc < col; cc++) {
        board[0][cc] = vacant;
      }
      r++;
    }
  }
  if (linesCleared > 0) {
    score += linesCleared * 10 * linesCleared;
    scoreDisplay.textContent = score;
  }
  if (score >= level * linesToLevelUp * 10) {
    level++;
    levelDisplay.textContent = level;
    dropInterval *= 0.9;
  }
};
Piece.prototype.moveLeft = function () {
  if (!this.collision(-1, 0, this.getActiveTetromino())) {
    this.undraw();
    this.c--;
    this.draw();
  }
};
Piece.prototype.moveRight = function () {
  if (!this.collision(1, 0, this.getActiveTetromino())) {
    this.undraw();
    this.c++;
    this.draw();
  }
};
Piece.prototype.rotate = function () {
  let nextRotation = (this.rotation + 1) % this.tetromino.length;
  let nextTetro = this.tetromino[nextRotation];
  let kick = 0;
  if (this.collision(0, 0, nextTetro)) {
    kick = 1;
    if (this.collision(kick, 0, nextTetro)) {
      kick = -1;
      if (this.collision(kick, 0, nextTetro)) {
        return;
      }
    }
  }
  this.undraw();
  this.c += kick;
  this.rotation = nextRotation;
  this.draw();
};
Piece.prototype.hardDrop = function () {
  while (!this.collision(0, 1, this.getActiveTetromino())) {
    this.undraw();
    this.r++;
    this.draw();
  }
  this.lock();
};
document.addEventListener("keydown", function (e) {
  if (isGameOver) return;
  if (e.keyCode === 37) {
    piece.moveLeft();
  } else if (e.keyCode === 39) {
    piece.moveRight();
  } else if (e.keyCode === 40) {
    piece.moveDown();
  } else if (e.keyCode === 38) {
    piece.rotate();
  } else if (e.keyCode === 32) {
    piece.hardDrop();
  }
});
function rotateMatrix(matrix) {
  const N = matrix.length;
  const result = Array.from({ length: N }, () => Array(N).fill(0));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      result[c][N - 1 - r] = matrix[r][c];
    }
  }
  return result;
}
let dropStart = Date.now();
const dropInterval = 1000;
function gameLoop() {
  let now = Date.now();
  let delta = now - dropStart;
  if (delta > dropInterval) {
    piece.moveDown();
    dropStart = Date.now();
  }
  if (!isGameOver) {
    requestAnimationFrame(gameLoop);
  }
}
function startGame() {
  initBoard();
  drawBoard();
  score = 0;
  scoreDisplay.textContent = score;
  isGameOver = false;
  piece = randomPiece();
  nextPiece = randomPiece();
  piece.draw();
  drawNextPiece();
  requestAnimationFrame(gameLoop);
}
function drawNextPiece() {
  nextCtx.fillStyle = "BLACK";
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  let activeTetro = nextPiece.getActiveTetromino();
  let pieceColor = nextPiece.color;
  for (let r = 0; r < activeTetro.length; r++) {
    for (let c = 0; c < activeTetro.length; c++) {
      if (activeTetro[r][c]) {
        nextCtx.fillStyle = pieceColor;
        nextCtx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize);
        nextCtx.strokeStyle = "BLACK";
        nextCtx.strokeRect(c * blockSize, r * blockSize, blockSize, blockSize);
      }
    }
  }
}
startGame();
