import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong, Phong_Shader, Rounded_Closed_Cone} = defs;

const getRandomNumber = max => {
    return Math.floor(Math.random()*max)
}

// set the lane positions
const DODGE_AMPLITUDE = 2.6;
const JUMP_AMPLITUDE = 5;
const DODGE_LANE_POSITIONS = [-DODGE_AMPLITUDE, 0, DODGE_AMPLITUDE];
const JUMP_LANE_POSITIONS = [-JUMP_AMPLITUDE, 0, JUMP_AMPLITUDE];
const TYPES = ["jump", "dodge", "duck"];
const NUM_TYPES = TYPES.length;
const BASE_SPEEDS = {
    jump: 0.45,
    dodge: 0.3,
    duck: 0.4,
}
const OFFSETS = {
    jump: 40,
    dodge: 26.675,
    duck: 40
}
export class Obstacle
{
    constructor(lane, type, offset)
    {
        this.position = Mat4.identity();
        // get random lane position
        this.lane = lane;
        this.type_id = type;
        this.type = TYPES[this.type_id];
        this.shapes = {
            jump: new defs.Tetrahedron(0),
            dodge: new Cube(),
            duck: new Cube()
        };
        this.materials = {
            jump: new Material(new defs.Phong_Shader(), {ambient: 0.4, diffusivity: 0.6, color: hex_color("#b0b0b0")}),
            // dodge: new Material(new defs.Phong_Shader(), {ambient: 0.4, diffusivity: 0.6, color: hex_color("#34e07c")}),
            dodge: new Material(new Textured_Phong(), {
                color:  hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/images/brick.jpeg")
            }),
            duck: new Material(new defs.Phong_Shader(), {ambient: 0.4, diffusivity: 0.6, color: hex_color("#e28ee8")}),
        }
        this.initialPositions = {
            jump: Mat4.identity().times(Mat4.scale(4, 5, 2))
                                 .times(Mat4.translation(JUMP_LANE_POSITIONS[this.lane], -0.8, -(offset+OFFSETS.jump))),
            dodge: Mat4.identity().times(Mat4.scale(6, 10, 3))
                                  .times(Mat4.translation(DODGE_LANE_POSITIONS[this.lane], 0.6, -(offset+OFFSETS.dodge))),
            duck: Mat4.identity().times(Mat4.scale(6, 2, 2))
                                  .times(Mat4.translation(DODGE_LANE_POSITIONS[this.lane], 4, -(offset+OFFSETS.duck))),

        }
        this.shape = this.shapes[this.type];
        this.position = this.initialPositions[this.type];
        this.material = this.materials[this.type]
    }

    setLane(lane)
    {
        this.lane = lane;
    }

    getLane()
    {
        return this.lane;
    }

    setTypeID(type_id)
    {
        this.type_id = type_id;
        this.type = TYPES[this.type_id];
        this.shape = this.shapes[this.type];
        this.material = this.materials[this.type];
    }

    getTypeID()
    {
        return this.type_id;
    }
    
    getType()
    {
        return this.type;
    }

    resetPosition()
    {
        this.position = this.initialPositions[this.type];
    }

    getPosition()
    {
        return this.position;
    }

    render(context, program_state, t, dt)
    {
        // move objects toward scene
        this.position = this.position.times(Mat4.translation(0, 0, BASE_SPEEDS[this.type]))
        this.shape.draw(context, program_state, this.position, this.material);
    }
}

