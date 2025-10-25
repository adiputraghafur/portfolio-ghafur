const dino = document.getElementById("dino");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("final-score");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const restartButton = document.getElementById("restart-button");
const leaderboardEndpoint =
  "https://script.google.com/macros/s/AKfycby56gOeWKG6V5_hxwLRWQItebqTQAV5URekYah_NVo2jkiegOQRvVADIyPWOIU7JXUemA/exec";
const obstacleVariation = [
  [{ type: "small", width: 15 }],
  [{ type: "large", width: 20 }],
  [
    { type: "small", width: 15, gap: 0 },
    { type: "small", width: 15, gap: 15 },
  ],
  [
    { type: "small", width: 15, gap: 0 },
    { type: "small", width: 15, gap: 5 },
    { type: "small", width: 15, gap: 5 },
  ],
  [
    { type: "small", width: 15, gap: 0 },
    { type: "large", width: 20, gap: 15 },
  ],
  [
    { type: "large", width: 20, gap: 0 },
    { type: "large", width: 20, gap: 10 },
  ],
  [
    { type: "large", width: 20, gap: 0 },
    { type: "small", width: 15, gap: 15 },
  ],
];
const jumpPower = 16;
const gravity = 1;
let score = 0;
let verticalSpeed = 0;
let isGameOver = false;
let isHoldingJump = false;
let gameLoopInterval;
let obstacleSpawnInterval;
let gameSpeed = 3;
let maxObstacleIndex = 1;
function applyPhysics() {
  if (isGameOver) return;
  let dinoBottom = parseInt(
    window.getComputedStyle(dino).getPropertyValue("bottom")
  );
  if (dinoBottom > 0 || verticalSpeed > 0) {
    verticalSpeed -= gravity;
    dinoBottom += verticalSpeed;
    if (dinoBottom <= 0) {
      dinoBottom = 0;
      verticalSpeed = 0;
    }
  }
  dino.style.bottom = dinoBottom + "px";
}
function spawnObstacle() {
  const configIndex = Math.floor(Math.random() * maxObstacleIndex);
  const selectedGroup = obstacleVariation[configIndex];
  let currentXPosition = gameContainer.clientWidth;
  selectedGroup.forEach((config) => {
    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle", config.type);
    currentXPosition += config.gap || 0;
    obstacle.style.left = currentXPosition + "px";
    gameContainer.appendChild(obstacle);
    currentXPosition += config.width;
    let moveObstacleInterval = setInterval(() => {
      if (isGameOver) {
        clearInterval(moveObstacleInterval);
        return;
      }
      let currentLeft = parseFloat(obstacle.style.left);
      currentLeft -= gameSpeed;
      obstacle.style.left = currentLeft + "px";
      if (currentLeft < -50) {
        clearInterval(moveObstacleInterval);
        obstacle.remove();
      }
    }, 20);
  });
}
function gameLoop() {
  score++;
  scoreDisplay.textContent = "Score: " + Math.floor(score / 10);
  applyPhysics();
  const dinoRect = dino.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();
  const obstacles = document.querySelectorAll(".obstacle");
  obstacles.forEach((obstacle) => {
    const obstacleRect = obstacle.getBoundingClientRect();
    if (
      obstacleRect.left < dinoRect.right &&
      obstacleRect.right > dinoRect.left &&
      obstacleRect.top < dinoRect.bottom &&
      obstacleRect.bottom > dinoRect.top
    ) {
      isGameOver = true;
      gameOver();
    }
  });
  if (score % 500 === 0 && gameSpeed < 10) {
    gameSpeed += 0.5;
    clearInterval(obstacleSpawnInterval);
    obstacleSpawnInterval = setInterval(spawnObstacle, 2000 - gameSpeed * 100);
  }
  currentScore = Math.floor(score / 10);
  if (currentScore >= 50 && maxObstacleIndex === 1) {
    maxObstacleIndex = 2;
    console.log("Meningkatkan rintangan");
  } else if (currentScore >= 100 && maxObstacleIndex === 2) {
    maxObstacleIndex = 4;
    console.log("Meningkatkan rintangan");
  } else if (currentScore >= 300 && maxObstacleIndex === 4) {
    maxObstacleIndex = obstacleVariation.length;
    console.log("Meningkatkan rintangan");
  }
}
function gameOver() {
  clearInterval(gameLoopInterval);
  clearInterval(obstacleSpawnInterval);
  const finalScore = Math.floor(score / 10);
  finalScoreDisplay.textContent = "Final Score: " + finalScore;
  document.querySelectorAll(".obstacle").forEach((c) => c.remove());
  const playerName = prompt("Game Over! Masukkan Nama Anda untuk Leaderboard:");
  if (playerName && playerName.trim() !== "") {
    submitScore(playerName.trim(), score);
  }
  fetchLeaderboard();
  gameOverScreen.style.display = "block";
}
function submitScore(name, rawScore) {
  fetch(leaderboardEndpoint, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      action: "submitScore",
      name: name,
      score: rawScore,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Score submission status:", data.status);
    })
    .catch((error) => console.error("Error submission score:", error));
}
function fetchLeaderboard() {
  fetch(leaderboardEndpoint + "?action=getLeaderboard")
    .then((respone) => respone.json())
    .then((scores) => {
      const leaderboardDiv = document.getElementById("leaderboard");
      let html = "<h3>Top 10 Players</h3><ol>";
      scores.forEach((item, index) => {
        html += `<li>${item.name}: ${item.score}</li>`;
      });
      html += "</ol>";
      leaderboardDiv.innerHTML = html;
    })
    .catch((error) => {
      const leaderboardDiv = document.getElementById("leaderboard");
      leaderboardDiv.innerHTML = "<p>Gagal memuat Leaderboard.</p>";
      console.error("Error fetching leaderboard:", error);
    });
}
function startGame() {
  isGameOver = false;
  score = 0;
  gameSpeed = 3;
  verticalSpeed = 0;
  maxObstacleIndex = 1;
  gameOverScreen.style.display = "none";
  startScreen.style.display = "none";
  startScreen.classList.remove("active");
  dino.style.bottom = "0px";
  gameLoopInterval = setInterval(gameLoop, 20);
  obstacleSpawnInterval = setInterval(spawnObstacle, 2000);
}
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (startScreen.classList.contains("active")) {
      startGame();
    } else {
      let dinoBottom = parseInt(
        window.getComputedStyle(dino).getPropertyValue("bottom")
      );
      if (dinoBottom === 0) {
        verticalSpeed = jumpPower;
        isHoldingJump = true;
      }
    }
  }
});
document.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    isHoldingJump = false;
    if (verticalSpeed > 0) {
      verticalSpeed = 0;
    }
  }
});
document.addEventListener("touchstart", () => {
  if (startScreen.classList.contains("active")) {
    startGame();
  } else {
    let dinoBottom = parseInt(
      window.getComputedStyle(dino).getPropertyValue("bottom")
    );
    if (dinoBottom === 0) {
      verticalSpeed = jumpPower;
    }
  }
});
restartButton.addEventListener("click", startGame);
document.addEventListener("DOMContentLoaded", () => {
  startScreen.classList.add("active");
  gameOverScreen.style.display = "none";
});
