import * as THREE from "three";

const config = {
  playerColor: 0xffff00,
  enemyColor: 0xffffff,
  collectibleColor: 0xff0000,
  screenColor: 0x9999ff,
  screenWidth: 14,
  screenHeight: 6,
  playerSpeed: 0.1,
  projectileSpeed: 0.2,
  submarineWidth: 1,
  submarineHeight: 0.5,
  collectibleSize: 0.5,
  enemyAccount: 5,
  collectibleAccount: 4,
  enemyPoints: 10,
  collectiblePoints: 20,
};

export class SubmarineGame {
  private timer: number = 0;
  private delta: number = 0;
  private score: number = 0;
  private gameOver: boolean = false;
  private scene: THREE.Group;
  private background: THREE.Mesh;
  private player: THREE.Mesh;
  private enemies: THREE.Mesh[] = [];
  private collectibles: THREE.Mesh[] = [];
  private shotCollection: { mesh: THREE.Mesh; direction: "left" | "right" }[] =
    [];

  constructor() {
    this.scene = new THREE.Group();
    this.background = this.createBackground();
    this.player = this.createSubmarine(config.playerColor);
    this.enemies = this.generateEnemies(config.enemyAccount);
    this.collectibles = this.generateCollectibles(config.collectibleAccount);

    this.scene.add(
      this.background,
      this.player,
      ...this.enemies,
      ...this.collectibles,
    );
  }

  private createBackground(): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(
      config.screenWidth,
      config.screenHeight,
    );
    const material = new THREE.MeshBasicMaterial({ color: config.screenColor });
    const background = new THREE.Mesh(geometry, material);
    return background;
  }

  private generateEnemies(count: number): THREE.Mesh[] {
    const enemies: THREE.Mesh[] = [];
    for (let i = 0; i < count; i++) {
      const xRandom = Math.random() - 0.5;
      const yRandom = Math.random() - 0.5;

      const xPadding = config.submarineWidth;
      const yPadding = config.submarineHeight;

      const xPosition = xRandom * (config.screenWidth - xPadding);
      const yPosition = yRandom * (config.screenHeight - yPadding);

      const tempEnemy = this.createSubmarine(config.enemyColor);
      tempEnemy.position.set(xPosition, yPosition, 0);

      if (this.validateAllCollisions(tempEnemy)) {
        i--;
        continue;
      }

      const enemy = this.createSubmarine(config.enemyColor);
      enemy.position.set(xPosition, yPosition, 0);

      enemies.push(enemy);
    }
    return enemies;
  }

  private generateCollectibles(count: number): THREE.Mesh[] {
    const collectibles: THREE.Mesh[] = [];
    for (let i = 0; i < count; i++) {
      const xRandom = Math.random() - 0.5;
      const yRandom = Math.random() - 0.5;

      const xPadding = config.collectibleSize;
      const yPadding = config.collectibleSize;

      const xPosition = xRandom * (config.screenWidth - xPadding);
      const yPosition = yRandom * (config.screenHeight - yPadding);

      const tempCollectible = this.createCollectible();
      tempCollectible.position.set(xPosition, yPosition, 0);

      if (this.validateAllCollisions(tempCollectible)) {
        i--;
        continue;
      }

      const collectible = this.createCollectible();
      collectible.position.set(xPosition, yPosition, 0);
      collectibles.push(collectible);
    }
    return collectibles;
  }

  private createCollectible(): THREE.Mesh {
    const shape = new THREE.Shape();
    const size = 0.15;

    shape.moveTo(0, size);
    shape.lineTo(size, -size);
    shape.lineTo(-size, -size);
    shape.lineTo(0, size);

    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
      color: config.collectibleColor,
    });
    const collectibleMesh = new THREE.Mesh(geometry, material);
    return collectibleMesh;
  }

  private createSubmarine(color: number): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(
      config.submarineWidth,
      config.submarineHeight,
    );
    const material = new THREE.MeshBasicMaterial({ color });
    const submarine = new THREE.Mesh(geometry, material);

    return submarine;
  }

  private validateAllCollisions(object: THREE.Mesh): boolean {
    if (this.checkCollisions(object, this.player)) {
      return true;
    }

    for (const enemy of this.enemies) {
      if (this.checkCollisions(object, enemy)) {
        return true;
      }
    }

    for (const collectible of this.collectibles) {
      if (this.checkCollisions(object, collectible)) {
        return true;
      }
    }

    return false;
  }

  private checkCollisions(mesh1: THREE.Mesh, mesh2: THREE.Mesh): boolean {
    const box1 = new THREE.Box3().setFromObject(mesh1);
    const box2 = new THREE.Box3().setFromObject(mesh2);
    return box1.intersectsBox(box2);
  }

  private createProjectile(color: number): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(0.2, 0.1);
    const material = new THREE.MeshBasicMaterial({ color });
    const projectile = new THREE.Mesh(geometry, material);
    return projectile;
  }

  shot(direction: "left" | "right") {
    const randomColor = new THREE.Color(
      Math.random(),
      Math.random(),
      Math.random(),
    ).getHex();
    const projectile = this.createProjectile(randomColor);
    const factor = direction === "left" ? -1 : 1;

    projectile.position.set(
      this.player.position.x + factor * (config.submarineWidth / 2 + 0.1),
      this.player.position.y,
      0,
    );

    this.shotCollection.push({ mesh: projectile, direction });
  }

  movePlayer(deltaX: number, deltaY: number) {
    const newX = this.player.position.x + deltaX;
    const newY = this.player.position.y + deltaY;

    const halfWidth = config.screenWidth / 2;
    const halfHeight = config.screenHeight / 2;

    if (newX < -halfWidth + config.submarineWidth / 2) {
      this.player.position.x = -halfWidth + config.submarineWidth / 2;
    } else if (newX > halfWidth - config.submarineWidth / 2) {
      this.player.position.x = halfWidth - config.submarineWidth / 2;
    } else {
      this.player.position.x = newX;
    }

    if (newY < -halfHeight + config.submarineHeight / 2) {
      this.player.position.y = -halfHeight + config.submarineHeight / 2;
    } else if (newY > halfHeight - config.submarineHeight / 2) {
      this.player.position.y = halfHeight - config.submarineHeight / 2;
    } else {
      this.player.position.y = newY;
    }

    for (const collectible of this.collectibles) {
      if (this.checkCollisions(this.player, collectible)) {
        this.scene.remove(collectible);
        this.collectibles = this.collectibles.filter((c) => c !== collectible);
        this.score += config.collectiblePoints;
      }
    }
  }

  updateProjectiles() {
    for (const { mesh: projectile, direction } of this.shotCollection) {
      const factor = direction === "left" ? -1 : 1;
      projectile.position.x += factor * config.projectileSpeed;

      this.scene.add(projectile);

      for (const enemy of this.enemies) {
        if (this.checkCollisions(projectile, enemy)) {
          this.scene.remove(enemy);
          this.scene.remove(projectile);
          this.shotCollection = this.shotCollection.filter(
            (p) => p.mesh !== projectile,
          );
          this.enemies = this.enemies.filter((e) => e !== enemy);
          this.score += config.enemyPoints;
          break;
        }
      }
    }
  }

  updateTimer(delta: number) {
    this.timer += delta;
    this.delta = delta;

    if (this.timer >= 0.016) {
      this.updateProjectiles();
      this.timer = 0;
    }

    if (
      this.enemies.length === 0 &&
      this.collectibles.length === 0 &&
      !this.gameOver
    ) {
      this.gameOver = true;
      alert(`Game Over! Final Score: ${this.score}`);
    }
  }

  renderGame() {
    return this.scene;
  }
}
