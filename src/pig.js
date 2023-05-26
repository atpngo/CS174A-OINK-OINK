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
            pig: new Shape_From_File("assets/pigbody.obj"),
            pig_leg: new Shape_From_File("assets/pigleg.obj"),
            pig_ear: new Shape_From_File("assets/pigear.obj"),
            pig_eye: new Shape_From_File("assets/pigeye.obj"),
            pig_tail: new Shape_From_File("assets/pigtail.obj"),
        }

        this.materials = {
            pig: new Material(new Phong_Shader(), {
                ambient: 0.8, diffusivity: 0,color:hex_color("#FFC0CB"),
            }),
            pigtail: new Material(new Phong_Shader(), {
                ambient: 0.5, diffusivity: 0,color:hex_color("#FFC0CB"),
            }),
            pigeye: new Material(new Phong_Shader(), {
                ambient: 0.5, diffusivity: 0,color:hex_color("#000000"),
            })
        }


        this.coordinates = {
            x: 0,
        }

        this.left_pos = false;
        this.center_pos = true;
        this.right_pos = false;

        this.left = 0;
        this.right = 0;
        this.jump = 0;



        this.temp = 1;
        this.jump_v = 0;
        this.downwards = false;


        this.duck_temp = 1;
        this.duck_v = 0;
        this.ducking = false;

        this.left_temp = 0;
        this.left_v = 0;

        this.right_temp = 0;
        this.right_v = 0;
    }

    jumpPig() {

        if (this.temp >= 1 && this.temp <= 3 && !this.downwards) {
            this.jump_v += 0.005;
            this.temp += this.jump_v;
            if (this.temp >= 3) {
                this.downwards = true;
            }
        }
        else {
            this.jump_v += 0.005;
            this.temp -= this.jump_v;
            if (this.temp <= 1) {
                this.jump = false;
                this.temp = 1;
                this.downwards = false;
                this.jump_v = 0;
            }
        }
        return {height: this.temp - 1};
    }


    pigDuck() {
        if (this.duck_temp <= 1 && this.duck_temp >= 0.2 && !this.ducking) {
            this.duck_v += 0.001;
            this.duck_temp -= this.duck_v;
            if (this.duck_temp <= 0.2) {
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





    movePig() {

        if (this.left) {
            if (this.left_pos) {
                return {x: this.coordinates.x};
            }
            else if (this.center_pos && this.left_temp <= 3 && this.left) {
                this.left_v += 0.025;
                this.left_temp += this.left_v;
                this.coordinates.x += this.left_v;
            }
            else if (this.right_pos && this.left_temp <= 3 && this.left) {
                this.left_v += 0.025;
                this.left_temp += this.left_v;
                this.coordinates.x += this.left_v;
            }
            else {
                if(this.center_pos) {
                    if (this.left_temp >= 3) {
                        this.left = false;
                        this.left_temp = 0;
                        this.left_v = 0;
                        this.center_pos = false;
                        this.left_pos = true;
                        console.log("this is the left position");
                        return {x: this.coordinates.x};
                    }
                }
                if (this.right_pos) {
                    if (this.left_temp >= 3) {
                        this.left = false;
                        this.left_temp = 0;
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
            else if (this.center_pos && this.right_temp <= 3 && this.right) {
                this.right_v += 0.025;
                this.right_temp += this.right_v;
                this.coordinates.x -= this.right_v;
            }

            else if (this.left_pos && this.right_temp <= 3) {
                this.right_v += 0.025;
                this.right_temp += this.right_v;
                this.coordinates.x -= this.right_v;
            }
            else {
                if(this.center_pos) {
                    if (this.right_temp >= 3) {
                        this.center_pos = false;
                        this.right_pos = true;
                        this.right = false;
                        this.right_temp = 0;
                        this.right_v = 0;
                        return {x: this.coordinates.x};
                    }
                }
                else if (this.left_pos) {
                    if (this.right_temp >= 3) {
                        this.center_pos = true;
                        this.left_pos = false;
                        this.right = false;
                        this.right_temp = 0;
                        this.right_v = 0;
                    }
                  
                }
            }
        }

        console.log(this.coordinates);
        return {x: this.coordinates.x};
    }

}