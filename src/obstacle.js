import {defs, tiny} from './examples/common.js';
import { Shape_From_File } from './examples/obj-file-demo.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong, Phong_Shader, Rounded_Closed_Cone} = defs;

const getRandomNumber = max => {
    return Math.floor(Math.random()*max)
}

// set the lane positions
const AMPLITUDE = 20;
const LANE_POSITIONS = [-AMPLITUDE, 0, AMPLITUDE];
const TYPES = ["jump", "dodge", "duck"];
const NUM_TYPES = TYPES.length;

const getSpeed = (type, multiplier) => {
    if (type === "jump")
    {
        return Mat4.translation(-0.225*multiplier, 0, 0);
    }
    if (type === "dodge")
    {
        return Mat4.translation(0, 0, 0.3*multiplier);
    }
    if (type === "duck")
    {
        return Mat4.translation(0, 0, 0.3*multiplier);
    }
}

const BASE_SPEEDS = {
    jump: Mat4.translation(-0.225, 0, 0),
    dodge: Mat4.translation(0, 0, 0.3),
    duck: Mat4.translation(0, 0, 0.3),
}
const OFFSETS = {
    jump: 200,
    dodge: 200,
    duck: 200
}
export class Obstacle
{
    constructor(lane, type, offset, speed_multiplier)
    {
        this.position = Mat4.identity();
        this.avoided = false;
        this.offset = offset;
        this.speed_multiplier = speed_multiplier;
        // get random lane position
        this.lane = lane;
        this.type_id = type;
        this.type = TYPES[this.type_id];
        this.shapes = {
            jump: new Shape_From_File("assets/Spikes.obj"),
            dodge: new Cube(),
            duck: new Shape_From_File("assets/bird.obj")
        };
        this.materials = {
            jump: new Material(new defs.Phong_Shader(), {ambient: 0.4, diffusivity: 0.6, color: hex_color("#b0b0b0")}),
            // dodge: new Material(new defs.Phong_Shader(), {ambient: 0.4, diffusivity: 0.6, color: hex_color("#34e07c")}),
            dodge: new Material(new Textured_Phong(), {
                color:  hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/images/brick.jpeg")
            }),
            duck: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/images/bird.jpeg")
            }),
            // duck: new Material(new defs.Phong_Shader(), {ambient: 0.4, diffusivity: 1, color: hex_color("#eb3d3d")}),
        }
        this.initialPositions = {
            jump: Mat4.identity().times(Mat4.translation(LANE_POSITIONS[this.lane], -2, -(offset+OFFSETS.jump)))
                                 .times(Mat4.rotation(Math.PI/2, 0, 1, 0,))
                                 .times(Mat4.rotation(-Math.PI/2, 1, 0, 0))
                                 .times(Mat4.scale(4, 4, 4)),
            dodge: Mat4.identity().times(Mat4.translation(LANE_POSITIONS[this.lane], 5, -(offset+OFFSETS.dodge)))
                                  .times(Mat4.scale(7, 10, 3)),
            duck: Mat4.identity().times(Mat4.translation(LANE_POSITIONS[this.lane], 6.5, -(offset+OFFSETS.duck)))
                                 .times(Mat4.scale(3, 3, 3))

        }
        this.shape = this.shapes[this.type];
        this.position = this.initialPositions[this.type];
        this.material = this.materials[this.type]
    }

    calculateNewPosition(type, lane)
    {
        if (type === "jump")
        {
            return Mat4.identity().times(Mat4.translation(LANE_POSITIONS[lane], -2, -(this.offset+OFFSETS.jump)))
                                  .times(Mat4.rotation(Math.PI/2, 0, 1, 0,))
                                  .times(Mat4.rotation(-Math.PI/2, 1, 0, 0))
                                  .times(Mat4.scale(4, 4, 4));
        }
        else if (type === "dodge")
        {
            return Mat4.identity().times(Mat4.translation(LANE_POSITIONS[lane], 5, -(this.offset+OFFSETS.dodge)))
                                  .times(Mat4.scale(7, 10, 3));
        }
        else if (type === "duck")
        {
            return Mat4.identity().times(Mat4.translation(LANE_POSITIONS[lane], 6.5, -(this.offset+OFFSETS.duck)))
                                  .times(Mat4.scale(3, 3, 3));
        }
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
        this.position = this.calculateNewPosition(this.type, this.lane);
    }

    getPosition()
    {
        return this.position;
    }

    render(context, program_state, multiplier)
    {
        // move objects toward scene
        this.position = this.position.times(getSpeed(this.type, multiplier));
        this.shape.draw(context, program_state, this.position, this.material);
    }
}

