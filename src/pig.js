import {defs, tiny} from './examples/common.js';
import { Shape_From_File } from './examples/obj-file-demo.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong, Phong_Shader} = defs;

export class Pig{
    constructor() {

        this.THETA = Math.PI / 2;
        this.PHI = Math.PI / 2;


        this.shapes = {
            pig: new Shape_From_File("assets/workingpig.obj"),
            pig_leg: new Shape_From_File("assets/pigleg.obj"),
            pig_ears: new Shape_From_File("assets/pigear.obj"),
        }

        this.materials = {
            pig: new Material(new Phong_Shader(), {
                ambient: 0.5, diffusivity: 0,color:hex_color("#FCD7DE"),
            })
        }


        this.coordinates = {
            x: 0,
            y: 1,
            z: 0,
            r: 1.1,
            phi: Math.PI / 2,
            theta: Math.PI / 2,
        }

        this.left_pos = false;
        this.center_pos = true;
        this.right_pos = false;

        this.left = 0;
        this.right = 0;
        this.forward = 0;
        this.jump = 0;



        this.temp = 1;
        this.jump_v = 0;
        this.downwards = false;


        this.duck_temp = 1;
        this.duck_v = 0;
        this.ducking = false;

        this.left_temp = 0;
        this.left_v = 0;
        this.moving_left = false;

        this.right_temp = 0;
        this.right_v = 0;
        this.moving_right = false;

    }

    getCoords() {
        return this.coordinates;
    }

    jumpCharacter() {


        // if(this.forward) {
        //     this.THETA += 0.03;
        //     this.coordinates.theta -= 0.03;
        // }

        if (this.temp >= 1 && this.temp <= 3 && !this.downwards) {
            this.jump_v += 0.0025;
            this.temp += this.jump_v;
            if (this.temp >= 3) {
                this.downwards = true;
            }
        }
        else {
            this.jump_v += 0.0025;
            this.temp -= this.jump_v;
            if (this.temp <= 1) {
                this.jump = false;
                this.temp = 1;
                this.downwards = false;
                this.jump_v = 0;
            }
        }
        return (this.temp - 1);
    }


    pigDuck() {
        if (this.duck_temp <= 1 && this.duck_temp >= 0.6 && !this.ducking) {
            this.duck_v += 0.001;
            this.duck_temp -= this.duck_v;
            if (this.duck_temp <= 0.6) {
                this.ducking = true;
            }
        }
        else {
            this.duck_v += 0.001;
            this.duck_temp += this.duck_v;
            if (this.duck_temp >= 1) {
                this.duck = false;
                this.duck_temp = 1;
                this.ducking = false;
                this.duck_v = 0;
            }
        }
        return this.duck_temp;    
    }





    moveCharacter() {

        // if (this.right) {
        //     if (!this.right_pos) {
        //         // this.PHI += 0.03;
        //         this.coordinates.x -= 0.03;
        //     }
        //     if (this.left_pos) {
        //         this.left_pos = false;
        //         this.center_pos = true;
        //     }
        //     else if (this.center_pos) {
        //         this.right_pos = true;
        //         this.center_pos = false;
        //     }
        // }
        // if (this.left) {
        //     if (!this.left_pos) {
        //         // this.PHI -= 0.03;
        //         this.coordinates.x += 0.03;
        //     }
        //     if (this.right_pos) {
        //         this.right_pos = false;
        //         this.center_pos = true;
        //     }
        //     else if (this.center_pos) {
        //         this.left_pos = true;
        //         this.center_pos = false;
        //     }
        // }


        if (this.left) {
            if (this.left_pos) {
                return {x: this.coordinates.x};
            }
            else if (this.center_pos && this.left_temp >= -2 && this.left) {
                this.left_v += 0.025;
                this.left_temp -= this.left_v;
                this.coordinates.x -= this.left_v;
            }
            else if (this.right_pos && this.left_temp >= -4 && this.left) {
                this.left_v += 0.025;
                this.left_temp -= this.left_v;
                this.coordinates.x -= this.left_v;
            }
            else {
                if(this.center_pos) {
                    if (this.left_temp <= -2) {
                        this.left = false;
                        this.left_temp = -2;
                        this.moving_left = false;
                        this.left_v = 0;
                        this.center_pos = false;
                        this.left_pos = true;
                        console.log("this is the right position");
                        return {x: this.coordinates.x};
                    }
                }
                if (this.right_pos) {
                    if (this.left_temp <= -4) {
                        this.left = false;
                        this.left_temp = -4;
                        this.moving_left = false;
                        this.left_v = 0;
                        this.center_pos = true;
                        this.right_pos = false;
                        console.log("this is the center position");
                        return {x: this.coordinates.x};
                    }
                }
            }
        }

        if (this.right) {
            if (this.right_pos) {
                return {x: this.coordinates.x};
            }
            else if (this.center_pos && this.right_temp <= 2) {
                this.right_v += 0.025;
                this.right_temp += this.right_v;
                this.coordinates.x += this.right_v;
            }

            else if (this.left_pos && this.right_temp <= 0) {
                this.right_v += 0.025;
                this.right_temp += this.right_v;
                this.coordinates.x += this.right_v;
            }
            else {
                if(this.center_pos) {
                    if (this.right_temp >= 2) {
                        this.center_pos = false;
                        this.right_pos = true;
                        this.right = false;
                        this.right_temp = 2;
                        this.moving_right = false;
                        this.right_v = 0;
                    }
                }
                else if (this.left_pos) {
                    if (this.right_temp >= 0) {
                        this.center_pos = true;
                        this.left_pos = false;
                        this.right = false;
                        this.right_temp = 0;
                        this.moving_right = false;
                        this.right_v = 0;
                    }
                  
                }
            }
        }


        // this.coordinates.x = this.coordinates.r * Math.cos(this.coordinates.phi) * Math.sin(this.coordinates.theta);
        console.log(this.coordinates);
        return {x: this.coordinates.x};
    }

}