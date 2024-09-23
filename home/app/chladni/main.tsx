import * as THREE from "three"

export const metadata = {
  title: "chladni",
  description: "heres a chladni I made",
}

export class Particle {
  public x: number
  public y: number
  public speed: number

  constructor(x: number, y: number, speed: number) {
    this.x = x
    this.y = y
    this.speed = speed
  }

  update(n, m) {
    const vibrationmax = 0.003
    const vibrationX =
      Math.random() * (vibrationmax - -vibrationmax) + -vibrationmax
    const vibrationY =
      Math.random() * (vibrationmax - -vibrationmax) + -vibrationmax

    const amount = this.chladni(this.x, this.y, n, m)
    const randomNum = Math.random() * (0.5 - -0.2) + -0.2

    if (amount >= 0) {
      if (this.chladni(this.x + vibrationmax, this.y, n, m) >= amount) {
        this.x = this.constrain(
          this.x - randomNum * amount * this.speed + vibrationX,
          -1,
          1
        )
      } else {
        this.x = this.constrain(
          this.x + randomNum * amount * this.speed + vibrationX,
          -1,
          1
        )
      }
      if (this.chladni(this.x, this.y + vibrationmax, n, m) >= amount) {
        this.y = this.constrain(
          this.y - randomNum * amount * this.speed + vibrationY,
          -1,
          1
        )
      } else {
        this.y = this.constrain(
          this.y + randomNum * amount * this.speed + vibrationY,
          -1,
          1
        )
      }
    } else {
      if (this.chladni(this.x + vibrationmax, this.y, n, m) <= amount) {
        this.x = this.constrain(
          this.x + randomNum * amount * this.speed + vibrationX,
          -1,
          1
        )
      } else {
        this.x = this.constrain(
          this.x - randomNum * amount * this.speed + vibrationX,
          -1,
          1
        )
      }
      if (this.chladni(this.x, this.y + vibrationmax, n, m) <= amount) {
        this.y = this.constrain(
          this.y + randomNum * amount * this.speed + vibrationY,
          -1,
          1
        )
      } else {
        this.y = this.constrain(
          this.y - randomNum * amount * this.speed + vibrationY,
          -1,
          1
        )
      }
    }
  }

  constrain(n, low, high) {
    return Math.max(Math.min(n, high), low)
  }

  chladni(x, y, n, m) {
    let L = 2
    return (
      Math.cos((n * Math.PI * x) / L) * Math.cos((m * Math.PI * y) / L) -
      Math.cos((m * Math.PI * x) / L) * Math.cos((n * Math.PI * y) / L)
    )
  }

  display() {
    const dotGeometry = new THREE.BufferGeometry()
    dotGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array([this.x, this.y, 0]), 3)
    )

    const dotMaterial = new THREE.PointsMaterial({ size: 2, color: 0xffffff })
    const point = new THREE.Points(dotGeometry, dotMaterial)
    return point
  }
}

export class ParticleHandler {
  public xCount: number = 12
  public yCount: number = 12
  public particles: Particle[] = []
  public n = 5
  public m = 3
  public randNM = 20

  constructor(scene) {
    let i = 0
    for (let y = 0; y < this.yCount; y++) {
      for (let x = 0; x < this.xCount; x++) {
        this.particles[i] = new Particle(x * 100, y * 100, 0.035)
        scene.add(this.particles[i].display())
        i++
      }
    }
  }

  update(scene) {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update(this.n, this.m)
      // scene.remove(scene.children[0])
      scene.add(this.particles[i].display())
    }
  }

  shuffle() {
    this.n = Math.floor(Math.random() * this.randNM)
    this.m = Math.floor(Math.random() * this.randNM)
    while (this.m == this.n) {
      this.m = Math.floor(Math.random() * this.randNM)
    }
  }
}
