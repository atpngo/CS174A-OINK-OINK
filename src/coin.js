import {defs, tiny} from './examples/common.js';
import { Shape_From_File } from './examples/obj-file-demo.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;
const {Cube, Axis_Arrows, Textured_Phong, Tetrahedron} = defs

const AMPLITUDE = 17;
const LANES = [-AMPLITUDE, 0, AMPLITUDE]

export class Coin 
{
    constructor(lane, offset)
    {
        this.lane = lane;
        this.offset = offset;
        this.collided = false;
        this.coin_shape = new Shape_From_File("assets/misc/coin.obj");
        this.material = new Material(new Textured_Phong(), {
            color: hex_color("#000000"),
            ambient: 1.0, diffusivity: 1.0, specularity: 0.1,
            texture: new Texture("assets/images/gold.jpeg", "NEAREST")
        });
        this.position = Mat4.identity().times(Mat4.translation(LANES[lane], 4, -(200+offset),))
                    .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
                    .times(Mat4.scale(2,2,2));
    }

    
    setLane(lane)
    {
        this.lane = lane;
    }

    calculateNewPos()
    {
        return Mat4.identity().times(Mat4.translation(LANES[this.lane], 4, -(200+this.offset)))
        .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
        .times(Mat4.scale(2,2,2));
    }

    resetPos()
    {
        this.position = this.calculateNewPos();
    }

    render(context, program_state, speed_multiplier)
    {
        // this.position = this.position.times(Mat4.rotation(0.03, 0, 0, 1));
        this.position = this.position.times(Mat4.translation(0, 0.45*speed_multiplier, 0));
        if (!this.collided) 
        {
            this.coin_shape.draw(context, program_state, this.position, this.material);
        }
    }
}