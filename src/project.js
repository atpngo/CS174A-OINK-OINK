import {defs, tiny} from './examples/common.js';
import { Shape_From_File } from './examples/obj-file-demo.js';
import { Text_Line } from './examples/text-demo.js';
import { Pig } from './pig.js';
import { Obstacle } from './obstacle.js';
import { Coin } from './coin.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong, Tetrahedron} = defs

const getRandomNumber = max => {
    return Math.floor(Math.random()*max)
}

const getNewPositions = number => {
    // return an array of random numbers between 0 and 3 
    const first = getRandomNumber(3);
    let second = getRandomNumber(3);
    while (second === first)
    {
        second = getRandomNumber(3);
    }
    let ans = [];
    ans.push(first);
    ans.push(second);
    return ans;
}

export class Project extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.END_OF_SCREEN = 40;
        this.PIG_FRONT = 12;
        this.PIG_BACK = 26;
        this.speed_multiplier = 1;
        this.coins_collected = 0;
        this.pig = new Pig();
        this.obstacles = [];
        this.OBSTACLE_OFFSET = 40;
        this.NUM_WAVES = 4;
        this.NUM_OBSTACLES = this.NUM_WAVES*2;
        this.score_count = 0;
        this.total_score = 0;
        this.game_over = false;
        this.resetFlag = false;
        this.game_start = false;
        this.background_sound_flag = false;
        this.blinking_flag = false;
        this.blinking_count = 0;
        // to make the ground increase in speed we might have to ditch the texture scrolling and add ground objects that spawn/despawn
        this.SPEED_INCREMENT = 0.05;
        this.SPEED_INCREMENT = 0.05;
        this.game_loading = false;
        this.loading_count = 0;
        this.coins = [];
        this.background_sound = new Audio("assets/audio/background.mp3");
        this.pig_sound = new Audio("assets/audio/pig-grunt.mp3");

        for (let i=0; i<this.NUM_WAVES; i++)
        {
            this.coins.push(new Coin(getRandomNumber(3), i*this.OBSTACLE_OFFSET));
        }
        for (let i=0; i<this.NUM_WAVES; i++)
        {
            // calculate offset
            this.obstacles.push(new Obstacle(getRandomNumber(3), getRandomNumber(3), i*this.OBSTACLE_OFFSET));
            this.obstacles.push(new Obstacle(getRandomNumber(3), getRandomNumber(3), i*this.OBSTACLE_OFFSET));
        }

        this.shapes = { 
            box_1: new Cube(),
            box_2: new Cube(),
            sphere_3: new defs.Subdivision_Sphere(3),
            axis: new Axis_Arrows(),
            ground: new Cube(),
            cone: new defs.Subdivision_Sphere(2),
            spike: new defs.Tetrahedron(0),
            text: new Text_Line(35),
        }

        this.materials = {
            obstacle: new Material(new defs.Phong_Shader(), {ambient: 0.4, diffusivity: 0.6, color: hex_color("#ff0000")}),
            sky: new Material(new Texture_Scroll_Y(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/images/sky.jpg", "NEAREST")
            }),
            ground: new Material(new Texture_Scroll_X(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/images/grass.jpeg", "NEAREST")
            }),
            ground_loading: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/images/grass.jpeg", "NEAREST")
            }),
            text_image: new Material(new Textured_Phong(), 
                {ambient: 1, diffusivity: 0, specularity: 0, texture: new Texture("assets/text.png")}),
            

        }

        this.currentPosition = "center";

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
        this.ground_transform = Mat4.identity()
        .times(Mat4.translation(0, -5, -5))
        // width, thickness, length
        .times(Mat4.scale(60, 1, 125))
        .times(Mat4.translation(0, 0, -0.5));

    }

    make_control_panel() {
        // this.key_triggered_button("Console Log", ["c"], () => {
        //         console.log(this.pig.duck);
        //         console.log(this.pig.ducking);
        // })
        this.key_triggered_button("Start", ['Enter'], () => {
            if (!this.game_start && !this.game_over) {
            this.game_loading = true;

            // loop background audio
            // if (typeof this.background_sound.loop == 'boolean')
            // {
            //     this.background_sound.loop = true;
            // }
            // else
            // {
            //     this.background_sound.addEventListener('ended', function() {
            //         this.currentTime = 0;
            //         this.play();
            //     }, false);
            // }
            }
        });
        this.key_triggered_button("Left", ['ArrowLeft'], () => {

            if (!this.pig.right && !this.pig.left && this.game_start) {
                this.pig.left = !this.pig.left;
                this.pig_sound.play();
            }
        })
        this.key_triggered_button("Right", ['ArrowRight'], () => {
            if (!this.pig.left && !this.pig.right && this.game_start) {
                this.pig.right = !this.pig.right;
                this.pig_sound.play();
            }
        })
        this.key_triggered_button("Jump", ['ArrowUp'], () => {
            if (!this.pig.duck && !this.pig.jump && this.game_start) {
                this.pig.jump = !this.pig.jump;
                this.pig_sound.play();

            }
        })
        this.key_triggered_button("Duck", ['ArrowDown'], () => {
            if (!this.pig.duck && !this.pig.jump  && this.game_start) {
                this.pig.duck = !this.pig.duck;
                this.pig_sound.play();
            }
        })
        this.key_triggered_button("Toggle Background Music", ['m'], () => {
            // loop background audio
            if (this.game_start) {
                if (this.background_sound_flag) {
                    this.background_sound.pause(); 
                }
                else {
                    this.background_sound.play(); 
                }
                this.background_sound_flag = !this.background_sound_flag;
            }
        });
        this.key_triggered_button("Restart Game", ["Escape"], () => {
            this.reset();
            this.resetFlag = true;
            console.log(this.resetFlag);
            this.background_sound_flag = false;
            this.background_sound.pause();
        });
    }

    reset() {
        this.score_count = 0;
        this.total_score = 0;
        this.game_over = false;
        this.pig = new Pig();
        this.game_start = false;
        
    }

    draw_score(context, program_state, model_transform) {

          let t = program_state.animation_time / 1000;

          if (!this.game_over) {
            this.score_count = this.score_count + 1;
          }
          if (this.score_count == 5) {
              this.total_score = this.total_score + 5;
              this.score_count = 0;
          }
          this.shapes.text.set_string(this.total_score.toString(), context.context);
  

          if (this.game_over) {
            this.blinking_count = this.blinking_count + 1;
          }
          if (this.blinking_count == 15) {
            this.blinking_flag = !this.blinking_flag;
            this.blinking_count = 0;
          }

          let score_transform = model_transform;

          score_transform = score_transform.times(Mat4.translation(30,20,0));
          
          if (this.game_over) {
            this.shapes.text.draw(context, program_state, score_transform, this.blinking_flag ?
                this.materials.text_image.override({color: hex_color("#FF0000")}) : this.materials.text_image) ;
          }
          else {
            this.shapes.text.draw(context, program_state, score_transform, this.materials.text_image);
          }
          // this.shapes.text.draw(context, program_state, score_transform.times(Mat4.scale(0.7, 0.7, .50)), this.materials.text_image);
  
    }

    draw_game_over(context, program_state, model_transform) {
        this.shapes.text.set_string("GAME OVER", context.context);

        

        let message_transform = model_transform.times(Mat4.translation(-20,10,-20))
                                    .times(Mat4.scale(3,3,3));

        this.shapes.text.draw(context, program_state, message_transform, this.materials.text_image);
        // this.shapes.text.draw(context, program_state, score_transform.times(Mat4.scale(0.7, 0.7, .50)), this.materials.text_image);

  }

    draw_start(context, program_state, model_transform) {
        // this.shapes.text.set_string("loading", context.context);
        this.shapes.text.set_string("Press Enter to Start", context.context);


        let message_transform = model_transform.times(Mat4.translation(-30,8,-15))
                                    .times(Mat4.scale(2,2,2));

        this.shapes.text.draw(context, program_state, message_transform, this.materials.text_image);
        this.shapes.text.set_string("Oink Oink", context.context);
        let title_transform = model_transform.times(Mat4.translation(-25,18,-15))
                                    .times(Mat4.scale(4,4,4));
        this.shapes.text.draw(context, program_state, title_transform, this.materials.text_image);


    }

    draw_loading_pig(context,program_state,model_transform) {
        let pig_transform = model_transform;


        pig_transform = pig_transform.times(Mat4.translation(0,3,20))
                        .times(Mat4.scale(5,5,5))
                        .times(Mat4.rotation(-Math.PI/2,0,1,0));


        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;


        const max_pig_angle = Math.PI/4;

        let pig_bounce = ((max_pig_angle/2)* (Math.sin(Math.PI*(t))));

        let pig_bounce_vertical = ((max_pig_angle/8)* (Math.sin(Math.PI*(t*2))));

        let pig_bounce_horizontal = ((max_pig_angle/2)* (Math.sin(Math.PI*(t))));


        if (!this.game_loading) {
            pig_transform = pig_transform.times(Mat4.rotation(pig_bounce,1,0,0))
                            .times(Mat4.translation(0,pig_bounce_vertical,pig_bounce_horizontal));
        }

        if (this.game_loading) {
            this.loading_count += 0.025;
            }
    
            let pig_rotate = ((Math.PI)*this.loading_count);
    
            if (this.loading_count >= 1) {
                this.loading_count = 0;
                this.game_start = true;
                this.game_loading = false;
                this.background_sound.loop = true;
                this.background_sound_flag = true;
                this.background_sound.play();
            }

            let loading_jump = Math.sin(Math.PI*(this.loading_count));
    
            if (this.game_loading) {
                pig_transform = pig_transform.times(Mat4.rotation(pig_rotate,0,1,0))
                .times(Mat4.translation(0,loading_jump,0));
            }


        let pig_tail = pig_transform.times(Mat4.translation(-1.25, 0, 0))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)))
        .times(Mat4.rotation(Math.PI/2,0,1,0));


        let pig_right_ear = pig_transform.times(Mat4.translation(0.75, 0.5, 0.75))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)))
        .times(Mat4.rotation(Math.PI,0,1,0))
        .times(Mat4.rotation(Math.PI,1,0,0));

        let pig_left_ear = pig_transform.times(Mat4.translation(0.75, 0.5, -0.75))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)))
        // .times(Mat4.rotation(Math.PI,0,1,0))
        .times(Mat4.rotation(Math.PI,1,0,0));


        let pig_front_right_leg = pig_transform.times(Mat4.translation(0.75, -0.5,0.75))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)))
        // .times(Mat4.rotation(Math.PI/3,1,0,0));


        let pig_front_left_leg = pig_transform.times(Mat4.translation(0.75, -0.5,-0.75))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)))
        .times(Mat4.rotation(Math.PI/3,1,0,0));


        let pig_back_right_leg = pig_transform.times(Mat4.translation(-0.75, -0.5,0.75))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)))

        


        let pig_left_eye = pig_transform.times(Mat4.translation(1.25, 0.25,-0.25))
        .times(Mat4.inverse(Mat4.scale(12, 12,12)));

        let pig_right_eye = pig_transform.times(Mat4.translation(1.25, 0.25,0.25))
        .times(Mat4.inverse(Mat4.scale(12, 12,12)));

        
        let pig_back_left_leg = pig_transform.times(Mat4.translation(-0.75, -0.5,-0.75))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)))
        .times(Mat4.rotation(Math.PI/3,1,0,0))

        let pig_nose = pig_transform.times(Mat4.translation(1.25, -0.1,0))
        .times(Mat4.inverse(Mat4.scale(6,6,6)));


        this.pig.shapes.pig.draw(context, program_state, pig_transform, this.pig.materials.pig);

        this.pig.shapes.pig_leg.draw(context, program_state, pig_front_right_leg, this.pig.materials.pig);
        this.pig.shapes.pig_leg.draw(context, program_state, pig_front_left_leg, this.pig.materials.pig);

        this.pig.shapes.pig_leg.draw(context, program_state, pig_back_right_leg, this.pig.materials.pig);
        this.pig.shapes.pig_leg.draw(context, program_state, pig_back_left_leg, this.pig.materials.pig);

        this.pig.shapes.pig_ear.draw(context, program_state, pig_left_ear, this.pig.materials.pigtail);
        this.pig.shapes.pig_ear.draw(context, program_state, pig_right_ear, this.pig.materials.pigtail);


        this.pig.shapes.pig_eye.draw(context,program_state, pig_left_eye, this.pig.materials.pigeye);
        this.pig.shapes.pig_eye.draw(context,program_state, pig_right_eye, this.pig.materials.pigeye);

        this.pig.shapes.pig_nose.draw(context,program_state, pig_nose, this.pig.materials.pignose);

        this.pig.shapes.pig_tail.draw(context,program_state, pig_tail, this.pig.materials.pigtail);

    }

    draw_pig(context,program_state, model_transform) {

        let pig_transform = model_transform;

        let x = this.pig.movePig().x;

        pig_transform = pig_transform.times(Mat4.translation(0,3,20))
                        .times(Mat4.scale(5,5,5))
                        .times(Mat4.rotation(Math.PI/2,0,1,0));

        pig_transform = pig_transform.times(Mat4.inverse(Mat4.translation(0, 0, x)));

        let t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;


        const max_pig_angle = Math.PI/4;

        let pig_bounce = ((max_pig_angle/2)* (Math.sin(Math.PI*(t))));

        let pig_bounce_vertical = ((max_pig_angle/8)* (Math.sin(Math.PI*(t*2))));

        let pig_bounce_horizontal = ((max_pig_angle/2)* (Math.sin(Math.PI*(t))));

        if (this.pig.jump) {
            let height = this.pig.jumpPig().height;


            pig_transform = pig_transform.times(Mat4.translation(0,height,0))
                               

        }

        if(this.pig.duck) {
            let duck = this.pig.pigDuck();
            pig_transform = pig_transform.times(Mat4.translation(0,(duck-1.25),0))
            .times(Mat4.scale(1, duck,1));
        }

        if (!this.pig.duck) {
            pig_transform = pig_transform.times(Mat4.rotation(pig_bounce,1,0,0))
                            .times(Mat4.translation(0,pig_bounce_vertical,pig_bounce_horizontal));
        }

        let pig_tail_rotate =  ((Math.PI/2)* (Math.sin(Math.PI*(t))));

        let pig_tail = pig_transform.times(Mat4.translation(-1.25, 0, 0))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)))
        .times(Mat4.rotation(Math.PI/2,0,1,0))
        .times(Mat4.rotation(pig_tail_rotate,0,0,1));


        let pig_right_ear = pig_transform.times(Mat4.translation(0.75, 0.5, 0.75))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)))
        .times(Mat4.rotation(Math.PI,0,1,0))
        .times(Mat4.rotation(Math.PI,1,0,0));

        let pig_left_ear = pig_transform.times(Mat4.translation(0.75, 0.5, -0.75))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)))
        .times(Mat4.rotation(Math.PI,1,0,0));


        let pig_front_right_leg = pig_transform.times(Mat4.translation(0.75, -0.5,0.75))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)))


        let pig_front_left_leg = pig_transform.times(Mat4.translation(0.75, -0.5,-0.75))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)))
        .times(Mat4.rotation(Math.PI/3,1,0,0));


        let pig_back_right_leg = pig_transform.times(Mat4.translation(-0.75, -0.5,0.75))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)))

        


        let pig_left_eye = pig_transform.times(Mat4.translation(1.25, 0.25,-0.25))
        .times(Mat4.inverse(Mat4.scale(12, 12,12)));

        let pig_nose = pig_transform.times(Mat4.translation(1.25, -0.1,0))
        .times(Mat4.inverse(Mat4.scale(6,6,6)));

        let pig_right_eye = pig_transform.times(Mat4.translation(1.25, 0.25,0.25))
        .times(Mat4.inverse(Mat4.scale(12, 12,12)));

        
        let pig_back_left_leg = pig_transform.times(Mat4.translation(-0.75, -0.5,-0.75))
        .times(Mat4.inverse(Mat4.scale(-4, -4,-4)))
        .times(Mat4.rotation(Math.PI/3,1,0,0))




        this.pig.shapes.pig.draw(context, program_state, pig_transform, this.pig.materials.pig);

        this.pig.shapes.pig_leg.draw(context, program_state, pig_front_right_leg, this.pig.materials.pig);
        this.pig.shapes.pig_leg.draw(context, program_state, pig_front_left_leg, this.pig.materials.pig);

        this.pig.shapes.pig_leg.draw(context, program_state, pig_back_right_leg, this.pig.materials.pig);
        this.pig.shapes.pig_leg.draw(context, program_state, pig_back_left_leg, this.pig.materials.pig);

        this.pig.shapes.pig_ear.draw(context, program_state, pig_left_ear, this.pig.materials.pigtail);
        this.pig.shapes.pig_ear.draw(context, program_state, pig_right_ear, this.pig.materials.pigtail);


        this.pig.shapes.pig_eye.draw(context,program_state, pig_left_eye, this.pig.materials.pigeye);
        this.pig.shapes.pig_eye.draw(context,program_state, pig_right_eye, this.pig.materials.pigeye);
        this.pig.shapes.pig_nose.draw(context,program_state, pig_nose, this.pig.materials.pignose);


        this.pig.shapes.pig_tail.draw(context,program_state, pig_tail, this.pig.materials.pigtail);

    }

    check_collision(pig, obstacle)
    {
        // Check if obstacle is in the same lane as the pig
        if ((pig.left_pos && obstacle.lane === 0) || (pig.right_pos && obstacle.lane === 2) || (!pig.right_pos && !pig.left_pos && obstacle.lane === 1))
        {
             // Check if obstacle is close to the pig
            if (obstacle.position[2][3] >= this.PIG_FRONT && obstacle.position[2][3] <= this.PIG_BACK && !obstacle.avoided)
            {
                // Check pig status and obstacle type
                if ((pig.jump && obstacle.type === "jump") || (pig.duck && obstacle.type === "duck"))
                {
                    obstacle.avoided = true;
                    return false;
                }

                return true;
            }
            
            return false;
        }
        return false;;
    }

    check_coin_collision(pig, coin)
    {
        if ((pig.left_pos && coin.lane === 0) || (pig.right_pos && coin.lane === 2) || (!pig.right_pos && !pig.left_pos && coin.lane === 1))
        {
            if (coin.position[2][3] >= this.PIG_FRONT && coin.position[2][3] <= this.PIG_BACK && !coin.collided)
            {
                coin.collided = true;
                return true;
            }
        }
        
    }


    display(context, program_state) {
        if (!context.scratchpad.controls) {
            // this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(
                Mat4.identity()
                .times(Mat4.translation(0, -2, -58))
                .times(Mat4.rotation(Math.PI/12, 1, 0, 0))

            
            );
            // program_state.set_camera(Mat4.rotation(0,0,0));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 500);
        
        const light_position = vec4(0, 10, 15, 1);
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
        // this.shapes.box_1.draw(context, program_state, model_transform, this.materials.obstacle);
        // this.shapes.spike.draw(context, program_state, model_transform, this.materials.obstacle);
        this.shapes.sphere_3.draw(context, program_state, Mat4.scale(100, 100, 200), this.materials.sky);
        
        // increment speed multiplier
        if (!this.game_over && this.game_start) {

            for (let i=this.coins.length-1; i>=0; i--)
            {
                if (this.coins[i].position[2][3] < this.END_OF_SCREEN)
                {
                    this.coins[i].render(context, program_state, this.speed_multiplier+Math.floor(this.total_score/100)*this.SPEED_INCREMENT);
                    if (this.check_coin_collision(this.pig, this.coins[i]))
                    {
                        console.log("coin collected");
                        this.coins_collected += 1;
                        this.total_score += 50;
                    }
                }
                else
                {
                    this.coins[i].setLane(getRandomNumber(3));
                    this.coins[i].resetPos();
                    this.coins[i].collided = false;
                }
            }

            for (let i=this.NUM_OBSTACLES-1; i>=0; i--)
            {
                
                if (this.obstacles[i].position[2][3] < this.END_OF_SCREEN)
                {
                    this.obstacles[i].render(context, program_state, this.speed_multiplier+Math.floor(this.total_score/100)*this.SPEED_INCREMENT);
                    // check for collisions
                    if (this.check_collision(this.pig, this.obstacles[i]))
                    {
                        console.log("COLLISION");
                        this.game_over = true;
                    };
                }
                else
                {
                    // 'remove' object, and add a new one
                    // randomize the position, type, and lane
                    this.obstacles[i].setTypeID(getRandomNumber(3));
                    this.obstacles[i].setLane(getRandomNumber(3));
                    this.obstacles[i].resetPosition();
                    this.obstacles[i].avoided = false;
                }
            }
            
            this.draw_pig(context,program_state,model_transform);
            this.draw_score(context,program_state,model_transform);
            this.shapes.ground.draw(context, program_state, this.ground_transform, this.materials.ground)

        }
        else if (this.game_over) {
            this.draw_game_over(context,program_state,model_transform);
            this.draw_score(context,program_state,model_transform);
            this.speed_multiplier = 1;
            this.coins_collected = 0;
            // reset obstacles
            this.obstacles = [];
            for (let i=0; i<this.NUM_WAVES; i++)
            {
                // calculate offset
                this.obstacles.push(new Obstacle(getRandomNumber(3), getRandomNumber(3), i*this.OBSTACLE_OFFSET));
                this.obstacles.push(new Obstacle(getRandomNumber(3), getRandomNumber(3), i*this.OBSTACLE_OFFSET));
            }
        }
        else{
            this.draw_start(context,program_state,model_transform);
            this.draw_loading_pig(context,program_state,model_transform);
            this.shapes.ground.draw(context, program_state, this.ground_transform, this.materials.ground_loading)

        }
    }
}


class Texture_Scroll_X extends Textured_Phong {
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                float slide_constant = 0.25*mod(animation_time, 4.0);
                mat4 slide = mat4(
                    vec4(1.0, 0.0, 0.0, 0.0),
                    vec4(0.0, -1.0, 0.0, 0.0),
                    vec4(0.0, 0.0, 1.0, 0.0),
                    vec4(0.0, slide_constant, 0.0, 1.0)
                );
                vec4 new_tex_coord = slide * (vec4(f_tex_coord, 0, 0) + vec4(1.0, 1.0, 0.0, 1.0));
                vec4 tex_color = texture2D( texture, new_tex_coord.xy);

                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}

class Texture_Scroll_Y extends Textured_Phong {
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                float slide_constant = 0.01*mod(animation_time, 100.0);
                mat4 slide = mat4(
                    vec4(1.0, 0.0, 0.0, 0.0),
                    vec4(0.0, 1.0, 0.0, 0.0),
                    vec4(0.0, 0.0, 1.0, 0.0),
                    vec4(slide_constant, 0.0, 0.0, 1.0)
                );
                vec4 new_tex_coord = slide * (vec4(f_tex_coord, 0, 0) + vec4(1.0, 1.0, 0.0, 1.0));
                vec4 tex_color = texture2D( texture, new_tex_coord.xy);

                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}