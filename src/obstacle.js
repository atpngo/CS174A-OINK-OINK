import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong, Phong_Shader, Rounded_Closed_Cone} = defs;

const getRandomNumber = max => {
    return Math.floor(Math.random()*max)
}

// set the lane positions
const DODGE_LANE_POSITIONS = [-2.6, 0, 2.6]
const TYPES = ["jump", "dodge", "duck"];
export class Obstacle
{
    constructor(offset)
    {
        this.position = Mat4.identity();
        // get random lane position
        this.lane = getRandomNumber(3);
        this.type = "dodge";
        this.shapes = {
            jump: new defs.Subdivision_Sphere(2),
            dodge: new Cube(),
            duck: new Cube()
        };
        this.materials = {
            jump: new Material(new defs.Phong_Shader(), {ambient: 0.4, diffusivity: 0.6, color: hex_color("#ff0000")}),
            dodge: new Material(new defs.Phong_Shader(), {ambient: 0.4, diffusivity: 0.6, color: hex_color("#0000ff")}),
        }
        this.initialPositions = {
            jump: Mat4.identity().times(Mat4.scale(3, 3, 3)),
            dodge: Mat4.identity().times(Mat4.scale(6, 10, 3))
                                  .times(Mat4.translation(DODGE_LANE_POSITIONS[this.lane], 0.6, -(offset+40))),

        }
        this.shape = this.shapes[this.type];
        this.position = this.initialPositions[this.type];
    }

    render(context, program_state, t, dt)
    {
        // move objects toward scene
        this.position = this.position.times(Mat4.translation(0, 0, 0.2))
        this.shape.draw(context, program_state, this.position, this.materials.dodge);
    }
}

