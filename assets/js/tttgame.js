const statusDisplay = document.getElementById("status-display");
const gameBoard = document.getElementById("game-board");
const restartButton = document.getElementById("restart-button");
const gameModeSelect = document.getElementById("game-mode");
const symbolSelect = document.getElementById("player-symbol");
const symbolLabel = document.getElementById("player-symbol-label");
const difficultySelect = document.getElementById("difficulty");
const difficultyLabel = document.getElementById("difficulty-label");
let gameActive = true;
let currentPlayer = "X";
let boardState = ["", "", "", "", "", "", "", "", ""];
let gameMode = "pvp";
let humanPlayer = "X";
let aiPlayer = "O";
let difficultyLevel = "easy";
const winConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
const winMessage = () => `Pemain ${currentPlayer} Menang`;
const drawMessage = () => `Seri`;
const currentTurn = () => `Giliran Pemain ${currentPlayer}`;
function createBoard() {
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.setAttribute("data-index", i);
    cell.addEventListener("click", handleCellClick);
    gameBoard.appendChild(cell);
  }
  statusDisplay.innerHTML = currentTurn();
}
function handleCellClick(event) {
  const clickedCell = event.target;
  const clickedCellIndex = parseInt(clickedCell.getAttribute("data-index"));
  if (boardState[clickedCellIndex] !== "" || !gameActive) {
    return;
  }
  boardState[clickedCellIndex] = currentPlayer;
  clickedCell.innerHTML = currentPlayer;
  clickedCell.classList.add(currentPlayer === "X" ? "x-color" : "o-color");
  handleResultValidation();
}
function changePlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusDisplay.innerHTML = currentTurn();
}
function handleResultValidation() {
  let roundWon = false;
  for (let i = 0; i < winConditions.length; i++) {
    const winCondition = winConditions[i];
    let a = boardState[winCondition[0]];
    let b = boardState[winCondition[1]];
    let c = boardState[winCondition[2]];
    if (a === "" || b === "" || c === "") {
      continue;
    }
    if (a === b && b === c) {
      roundWon = true;
      break;
    }
  }
  if (roundWon) {
    statusDisplay.innerHTML = winMessage();
    gameActive = false;
    return;
  }
  let roundDraw = !boardState.includes("");
  if (roundDraw) {
    statusDisplay.innerHTML = drawMessage();
    gameActive = false;
    return;
  }
  changePlayer();
  if (gameMode === "pvc" && currentPlayer === aiPlayer) {
    setTimeout(makeAiMove, 500);
  }
}
function updateGameSetting() {
  gameMode = gameModeSelect.value;
  humanPlayer = symbolSelect.value;
  aiPlayer = humanPlayer === "X" ? "O" : "X";
  difficultyLevel = difficultySelect.value;
  if (gameMode === "pvc") {
    symbolLabel.style.display = "inline-block";
    symbolSelect.style.display = "inline-block";
    difficultyLabel.style.display = "inline-block";
    difficultySelect.style.display = "inline-block";
  } else {
    symbolLabel.style.display = "none";
    symbolSelect.style.display = "none";
    difficultyLabel.style.display = "none";
    difficultySelect.style.display = "none";
  }
  handleRestartGame();
}
function handleRestartGame() {
  gameActive = true;
  currentPlayer = "X";
  boardState = ["", "", "", "", "", "", "", "", ""];
  statusDisplay.innerHTML = currentTurn();
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.innerHTML = "";
    cell.classList.remove("x-color", "o-color");
  });
  if (gameMode === "pvc" && currentPlayer === aiPlayer) {
    setTimeout(makeAiMove, 500);
  }
}
function makeAiMove() {
  if (!gameActive) return;
  let moveIndex;
  if (difficultyLevel === "easy") {
    moveIndex = aiEasyMove();
  } else if (difficultyLevel === "medium") {
    moveIndex = aiMediumMove();
  } else if (difficultyLevel === "hard") {
    moveIndex = aiHardMove();
  }
  if (moveIndex !== undefined) {
    const cellElement = document.querySelector(`[data-index="${moveIndex}"]`);
    if (cellElement) {
      handleCellClick({ target: cellElement });
    }
  }
}
function getEmptyIndices() {
  return boardState
    .map((val, index) => (val === "" ? index : null))
    .filter((index) => index !== null);
}
function aiEasyMove() {
  const emptyCells = getEmptyIndices();
  if (emptyCells.length > 0) {
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }
  return undefined;
}
function checkPossibleWin(player) {
  for (const condition of winConditions) {
    let count = 0;
    let emptyIndex = -1;
    for (const index of condition) {
      if (boardState[index] === player) {
        count++;
      } else if (boardState[index] === "") {
        emptyIndex = index;
      }
    }
    if (count === 2 && emptyIndex !== -1) {
      return emptyIndex;
    }
  }
  return -1;
}
function aiMediumMove() {
  let winMove = checkPossibleWin(aiPlayer);
  if (winMove !== -1) {
    return winMove;
  }
  let blockMove = checkPossibleWin(humanPlayer);
  if (blockMove !== -1) {
    return blockMove;
  }
  if (boardState[4] === "") {
    return 4;
  }
  return aiEasyMove();
}
function aiHardMove() {
  let winMove = checkPossibleWin(aiPlayer);
  if (winMove !== -1) {
    return winMove;
  }
  let blockMove = checkPossibleWin(humanPlayer);
  if (blockMove !== -1) {
    return blockMove;
  }
  if (boardState[4] === "") {
    return 4;
  }
  const corners = [0, 2, 6, 8].filter((i) => boardState[i] === "");
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }
  const sides = [1, 3, 5, 7].filter((i) => boardState[i] === "");
  if (sides.length > 0) {
    return sides[Math.floor(Math.random() * sides.length)];
  }
  return aiEasyMove();
}
gameModeSelect.addEventListener("change", updateGameSetting);
symbolSelect.addEventListener("change", updateGameSetting);
difficultySelect.addEventListener("change", updateGameSetting);
restartButton.addEventListener("click", handleRestartGame);
document.addEventListener("DOMContentLoaded", createBoard);
