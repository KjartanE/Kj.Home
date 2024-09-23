import * as THREE from "three";

class MatrixVertex {
  x: number;
  y: number;
  z: number;
  color: string | null;

  constructor(x: number, y: number, z: number, color: string | null = null) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.color = color;
  }
}

class DotMatrix {
  x_upper_bound: number;
  y_upper_bound: number;
  z_upper_bound: number;
  density: number;
  matrix_x_size: number;
  matrix_y_size: number;
  matrix_z_size: number;
  matrix: MatrixVertex[][][];
  prev_matrix: MatrixVertex[][][];

  constructor(x_upper_bound: number, y_upper_bound: number, z_upper_bound: number, density: number) {
    this.x_upper_bound = x_upper_bound;
    this.y_upper_bound = y_upper_bound;
    this.z_upper_bound = z_upper_bound;
    this.density = density;
    this.matrix_x_size = Math.floor(x_upper_bound / density);
    this.matrix_y_size = Math.floor(y_upper_bound / density);
    this.matrix_z_size = Math.floor(z_upper_bound / density);
    this.matrix = Array.from({ length: this.matrix_x_size }, () =>
      Array.from({ length: this.matrix_y_size }, () =>
        Array.from({ length: this.matrix_z_size }, () => new MatrixVertex(0, 0, 0))
      )
    );

    this.prev_matrix = Array.from({ length: this.matrix_x_size }, () =>
      Array.from({ length: this.matrix_y_size }, () =>
        Array.from({ length: this.matrix_z_size }, () => new MatrixVertex(0, 0, 0))
      )
    );
  }

  create_matrix() {
    for (let x = 0; x < this.matrix_x_size; x++) {
      for (let y = 0; y < this.matrix_y_size; y++) {
        for (let z = 0; z < this.matrix_z_size; z++) {
          //   const vertex_color = "rgb(0, 0, 0)"
          const new_vertex: MatrixVertex = new MatrixVertex(x * this.density, y * this.density, z * this.density);

          this.matrix[x][y][z] = new_vertex;
        }
      }
    }
  }

  update_matrix() {
    for (let x = 0; x < this.matrix_x_size; x += 1) {
      for (let y = 0; y < this.matrix_y_size; y += 1) {
        for (let z = 0; z < this.matrix_z_size; z += 1) {
          //check if the vertex exists in the previous matrix
          if (x < this.prev_matrix.length && y < this.prev_matrix[x].length && z < this.prev_matrix[x][y].length) {
            const current_vertex: MatrixVertex = this.prev_matrix[x][y][z];

            current_vertex.x = x * this.density;
            current_vertex.y = y * this.density;
            current_vertex.z = z * this.density;

            this.matrix[x][y][z] = current_vertex;
            continue;
          }

          // let vertex_color = color(int(random(255)),int(random(255)),int(random(255)));
          const new_vertex = new MatrixVertex(x * this.density, y * this.density, z * this.density);

          this.matrix[x][y][z] = new_vertex;
        }
      }
    }

    return this;
  }

  update_density(new_density: number) {
    this.density = new_density;
    this.matrix_x_size = this.x_upper_bound / this.density;
    this.matrix_y_size = this.y_upper_bound / this.density;
    this.matrix_z_size = this.z_upper_bound / this.density;

    this.prev_matrix = this.matrix;
    this.matrix = new MatrixVertex[this.matrix_x_size][this.matrix_y_size][this.matrix_z_size]();

    return this.update_matrix();
  }

  generate_points() {
    const points: any[] = [];

    for (let x = 0; x < this.matrix_x_size; x++) {
      for (let y = 0; y < this.matrix_y_size; y++) {
        for (let z = 0; z < this.matrix_z_size; z++) {
          const vertex = this.matrix[x][y][z];

          points.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));
        }
      }
    }

    return points;
  }
}

export default DotMatrix;
