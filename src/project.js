import {defs, tiny} from './examples/common.js';
import { Shape_From_File } from './examples/obj-file-demo.js';
import { Text_Line } from './examples/text-demo.js';
import { Pig } from './pig.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong} = defs

export class Project extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        
        this.pig = new Pig();

        this.shapes = {
            box_1: new Cube(),
            box_2: new Cube(),
            axis: new Axis_Arrows(),
            // pig: new Shape_From_File("assets/testpig.obj"),
            text: new Text_Line(35),

        }
        console.log(this.shapes.box_1.arrays.texture_coord)


        // TODO:  Create the materials required to texture both cubes with the correct images and settings.
        //        Make each Material from the correct shader.  Phong_Shader will work initially, but when
        //        you get to requirements 6 and 7 you will need different ones.
        this.materials = {
            phong: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
            }),
            texture: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 0.5, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/stars.png")
            }),
            pig: new Material(new Textured_Phong(), {
                color: hex_color("#FCD7DE"),
                ambient: 0.4, 
                diffusivity: 0.6,
            }),
        }

        this.currentPosition = "center";
        this.prevMove = 0;
        this.prevAngle = 0;
        this.prevPhi = 0;
        this.currentAngle = 0;


        this.pig_pos = Mat4.identity();



        this.pig_horizontal_position = 0;
        this.pig_vertical_position = 0;
        this.pig_jumping = false;
        this.current_time = 0;


        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }




    getPrev() {
        if (this.pig.left || this.pig.right) {
            if (this.pig.left) {
                this.prevMove = 'left';
            }
            else if (this.pig.right) {
                this.prevMove = 'right';
            }
        }
        else {
            this.prevMove = null;
        }
    }

    getHorizontalPosition() {
        
    }


    make_control_panel() {
        this.key_triggered_button("Left", ['ArrowLeft'], () => {
            // this.moveLeft;
            this.getPrev();
            this.prevAngle - this.pig.THETA;
            this.prevPhi = this.pig.PHI;
            this.pig.left = !this.pig.left;
            // this.stopMovement('left');
        })
        this.key_triggered_button("Right", ['ArrowRight'], () => {
            this.getPrev();
            this.prevAngle - this.pig.THETA;
            this.prevPhi = this.pig.PHI;
            this.pig.right = !this.pig.right;
        })
        this.key_triggered_button("Jump", ['ArrowUp'], () => {
            this.getPrev();
            this.prevAngle = this.pig.THETA;
            this.prevPhi = this.pig.PHI;
            this.pig.jump = !this.pig.jump;
        })
        this.key_triggered_button("Duck", ['ArrowDown'], () => {
            this.getPrev();
            this.prevAngle = this.pig.THETA;
            this.prevPhi = this.pig.PHI;
            this.pig.duck = !this.pig.duck;
        })
    }

    draw_pig(context,program_state, model_transform) {


        let pig_transform = model_transform;

      

        let x = this.pig.moveCharacter().x;

        pig_transform = pig_transform.times(Mat4.inverse(Mat4.translation(x - Math.PI / 2, 0, 0)));

        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;


        const max_pig_angle = Math.PI/4;

        let pig_bounce = ((max_pig_angle/2) + (max_pig_angle/2)* (Math.sin(Math.PI*(t))));


        if (this.pig.jump) {
            let jump_angle = this.pig.jumpCharacter();
            pig_transform = pig_transform.times(Mat4.translation(0,jump_angle,0));
            // pig_left_leg = pig_transform.times(Mat4.translation(0, -0.8,0.75))
            // .times(Mat4.inverse(Mat4.scale(-4, -4,-4)));
        }


        if(this.pig.duck) {
            let duck = this.pig.pigDuck();
            pig_transform = pig_transform.times(Mat4.scale(1, duck,1));
        }


        // if (t % 2 == 0) {
        //     pig_transform = pig_transform.times(Mat4.rotation(-pig_bounce,1,0,0));
        // }
        // else {
        //     pig_transform = pig_transform.times(Mat4.rotation(pig_bounce,1,0,0));
        // }


        let pig_front_right_leg = pig_transform.times(Mat4.translation(0, -0.8,0.75))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)));

        let pig_front_left_leg = pig_transform.times(Mat4.translation(0, -0.8,-0.75))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)))
        .times(Mat4.rotation(Math.PI/3,1,0,0));

        let pig_back_right_leg = pig_transform.times(Mat4.translation(-1.75, -0.8,-0.75))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)));

        
        let pig_back_left_leg = pig_transform.times(Mat4.translation(-1.75, -0.8,0.75))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)))
        .times(Mat4.rotation(Math.PI/3,1,0,0));


        this.pig.shapes.pig.draw(context, program_state, pig_transform, this.pig.materials.pig);

        this.pig.shapes.pig_leg.draw(context, program_state, pig_front_right_leg, this.pig.materials.pig);
        this.pig.shapes.pig_leg.draw(context, program_state, pig_front_left_leg, this.pig.materials.pig);

        this.pig.shapes.pig_leg.draw(context, program_state, pig_back_right_leg, this.pig.materials.pig);
        this.pig.shapes.pig_leg.draw(context, program_state, pig_back_left_leg, this.pig.materials.pig);

    }


    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(0, 0, -8));
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();


       


        // let position = this.pig_horizontal_position;

        // let pig_bounce = ((max_pig_angle/2) + (max_pig_angle/2)* (Math.sin(Math.PI*(t))));


        // let pig_transform = model_transform;

        // const max_jump_height = 2;

        // let pig_jump = ((max_jump_height/2) * (Math.sin(Math.PI*(t))));

        // let pig_rotate = ((180) + (4) * (Math.sin(Math.PI *(t))));


        // if (this.pig_jumping == true) {
        //     pig_transform = model_transform.times(Mat4.translation(position,-pig_jump,1,0))
        //                     // .times(Mat4.rotation(pig_bounce,1,0,0))
        //                     // .times(Mat4.rotation(pig_rotate,0,0,1));
        //     // this.pig_jumping = false;
        // }
        // else {
 
        
        this.draw_pig(context,program_state,model_transform);
        // TODO:  Draw the required boxes. Also update their stored matrices.
        // You can remove the folloeing line.
        // this.shapes.pig.draw(context, program_state, model_transform, this.materials.phong.override({color: hex_color("#ffff00")}));
    }
}

// moveLeft()
// {
//     let speed_factor = 2;
//     this.pig_pos = this.pig_pos.times(Mat4.translation(0,0,speed_factor*-1));
// }

// jump() {
//     let speed_factor = this.pig_bounce;
// }

// moveRight() {
//     let speed_factor;
// }



class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        varying vec4 vertex_color;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                vertex_color = vec4(shape_color.xyz * ambient, shape_color.w);
                vertex_color.xyz += phong_model_lights(N, vertex_worldspace);
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           
                gl_FragColor = vertex_color;
                return;
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}


class Texture_Scroll_X extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                // Sample the texture image in the correct place:
                vec4 tex_color = texture2D( texture, f_tex_coord);
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}


class Texture_Rotate extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #7.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            void main(){
                // Sample the texture image in the correct place:
                vec4 tex_color = texture2D( texture, f_tex_coord );
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}

