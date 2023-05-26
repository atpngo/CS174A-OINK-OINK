import {defs, tiny} from './examples/common.js';

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
        this.shapes = { 
            box_1: new Cube(),
            box_2: new Cube(),
            axis: new Axis_Arrows(),
            ground: new Cube(),
            sphere_3: new defs.Subdivision_Sphere(3)
        }
        this.materials = {
            obstacle: new Material(new defs.Phong_Shader(), {ambient: 0.4, diffusivity: 0.6, color: hex_color("#ff0000")}),
            ground: new Material(new defs.Phong_Shader(), {ambient: 0.4, diffusivity: 0.4, color: hex_color("#a17664")}),
            sky: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/night_sky.jpg", "NEAREST")
            }),
        }
        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
        this.ground_transform = Mat4.identity()
        .times(Mat4.translation(0, -5, -5))
        .times(Mat4.scale(30, 1, 70))
        .times(Mat4.translation(0, 0, -0.5))
    }

    make_control_panel() {
        this.key_triggered_button("Console Log", ["c"], () => {console.log(this)})
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(
                Mat4.identity()
                .times(Mat4.translation(0, -2, -50.7))
                .times(Mat4.rotation(Math.PI/12, 1, 0, 0))

            
            );
            // program_state.set_camera(Mat4.rotation(0,0,0));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 200);
        
        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
        // if (program_state.animation_time > 50 && program_state.animation_time < 100)
        // {
        //     console.log(program_state);
        // }
        // if (program_state.animation_time > 10000 && program_state.animation_time < 10100)
        // {
        //     console.log(program_state);
        // }
        // draw sky

        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.scale(1, 1, 1))
                                         .times(Mat4.translation(0, 0, -1));
        this.shapes.box_1.draw(context, program_state, model_transform, this.materials.obstacle);
        this.shapes.ground.draw(context, program_state, this.ground_transform, this.materials.ground)
        this.shapes.sphere_3.draw(context, program_state, Mat4.scale(100, 100, 100), this.materials.sky);

    }
}

