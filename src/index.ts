import GUI from "lil-gui";
import * as THREE from "three";
import { Renderer } from "./lib/renderer";
import { SubmarineGame } from "./lib/submarine-game";

const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
if (!canvas) {
  throw new Error("Canvas element not found");
}

const gui = new GUI();
const renderer = new Renderer(canvas);

const config = {
  wireframe: true,
  uSpeed: 1,
  moveAmount: 0.1,
};

const seaquest = new SubmarineGame();

renderer.scene.add(seaquest.renderGame());

let lastTime = Date.now() * 0.001;

// Animation loop
renderer.animate(() => {
  const currentTime = Date.now() * 0.001;
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  // update shooting projectiles
  seaquest.updateTimer(deltaTime);
});

let lastDirection: string = "right";
document.addEventListener("keydown", (event) => {
  const { moveAmount } = config;

  switch (event.key) {
    case "ArrowLeft":
    case "a":
      lastDirection = "left";
      seaquest.movePlayer(-moveAmount, 0);
      break;
    case "ArrowRight":
    case "d":
      lastDirection = "right";
      seaquest.movePlayer(moveAmount, 0);
      break;
    case "ArrowUp":
    case "w":
      seaquest.movePlayer(0, moveAmount);
      break;
    case "ArrowDown":
    case "s":
      seaquest.movePlayer(0, -moveAmount);
      break;
    case " ":
      seaquest.shot(lastDirection as "left" | "right");
      break;
  }
});
