const canvas = document.getElementById("field");
const ctx = canvas.getContext("2d");

const leftSlider = document.getElementById("leftSpeed");
const rightSlider = document.getElementById("rightSpeed");
const leftValue = document.getElementById("leftValue");
const rightValue = document.getElementById("rightValue");
const movementText = document.getElementById("movement");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

let robot = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  angle: 0
};

let running = false;
let trail = [];

function getSpeeds() {
  return {
    left: Number(leftSlider.value),
    right: Number(rightSlider.value)
  };
}

function describeMovement(left, right) {
  if (left === 0 && right === 0) return "Stopped";
  if (left === right && left > 0) return "Forward";
  if (left === right && left < 0) return "Backward";
  if (left === -right && left !== 0) {
    return left > 0 ? "Spin Right" : "Spin Left";
  }
  if (left > right) return "Turning Right";
  if (right > left) return "Turning Left";
  return "Moving";
}

function updateLabels() {
  const { left, right } = getSpeeds();
  leftValue.textContent = left;
  rightValue.textContent = right;
  movementText.textContent = describeMovement(left, right);
}

function drawGrid() {
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawTrail() {
  if (trail.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(trail[0].x, trail[0].y);

  for (const point of trail) {
    ctx.lineTo(point.x, point.y);
  }

  ctx.strokeStyle = "#93c5fd";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawRobot() {
  ctx.save();
  ctx.translate(robot.x, robot.y);
  ctx.rotate(robot.angle);

  // Robot body
  ctx.fillStyle = "#2563eb";
  ctx.fillRect(-26, -20, 52, 40);

  // Wheels
  ctx.fillStyle = "#111827";
  ctx.fillRect(-22, -28, 16, 8);
  ctx.fillRect(6, -28, 16, 8);
  ctx.fillRect(-22, 20, 16, 8);
  ctx.fillRect(6, 20, 16, 8);

  // Front direction marker
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(18, 0);
  ctx.lineTo(4, -8);
  ctx.lineTo(4, 8);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawTrail();
  drawRobot();
}

function updateRobot() {
  if (!running) return;

  const { left, right } = getSpeeds();

  // Scale slider values into manageable motion values.
  const leftSpeed = left * 0.025;
  const rightSpeed = right * 0.025;

  // Differential drive approximation:
  // average wheel speed controls forward motion;
  // wheel-speed difference controls turning.
  const forwardSpeed = (leftSpeed + rightSpeed) / 2;
  const turnSpeed = (rightSpeed - leftSpeed) * 0.012;

  robot.angle += turnSpeed;
  robot.x += Math.cos(robot.angle) * forwardSpeed;
  robot.y += Math.sin(robot.angle) * forwardSpeed;

  // Keep robot inside the field.
  robot.x = Math.max(28, Math.min(canvas.width - 28, robot.x));
  robot.y = Math.max(28, Math.min(canvas.height - 28, robot.y));

  trail.push({ x: robot.x, y: robot.y });

  if (trail.length > 900) {
    trail.shift();
  }
}

function loop() {
  updateRobot();
  render();
  requestAnimationFrame(loop);
}

function resetRobot() {
  running = false;
  robot.x = canvas.width / 2;
  robot.y = canvas.height / 2;
  robot.angle = 0;
  trail = [];

  leftSlider.value = 50;
  rightSlider.value = 50;

  updateLabels();
  render();
}

leftSlider.addEventListener("input", updateLabels);
rightSlider.addEventListener("input", updateLabels);

startBtn.addEventListener("click", () => {
  running = true;
});

stopBtn.addEventListener("click", () => {
  running = false;
  updateLabels();
});

resetBtn.addEventListener("click", resetRobot);

updateLabels();
render();
loop();
