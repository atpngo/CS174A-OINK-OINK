# CS174A-OINK-OINK

# Brief Overview

This is a endless runner game inspired by Subway Surfers and was created using tiny-graphics.
The player operates a pig, and has to duck, jump, and dodge a variety of obstacles, and if the player
collides with an obstacle, then the game ends. The longer the player survives, the higher the score will be. 
Furthermore, the player is able to collect coins to further increase the score. 
As time progresses, the obstacles move faster and faster.

# How to Run the Game

The repository for this game can be found at https://github.com/atpngo/CS174A-OINK-OINK.
After downloading the necessary code, the user can run either host.bat on Windows devices
or host.command on MacOS devices. Afterwards, the game will be running at http://localhost:8000/.

# How to Play the Game

To start the game, the user can press Enter.
The left, right, up, and down arrow keys are used to move and control the pig.
The user can press m in order to toggle the background music, while the game is being played.
At any time, the user can press Escape in order to reset back to the start screen.
These controls can be found in the bottom control panel at anytime!

# Features

Interaction: The player can navigate the pig by using the corresponding keys.

Collision detection: Collision detection is used to detect when the pig runs into an obstacle
as well as when the pig runs into a coin in order to end the game or increase the score depending on what
the pig ran into. Without collision detection, the pig would be able to clip through objects, and the game
would never end.

Texture and Shading: The pig and the obstacles all have applied textures and shading in order to make the 
game look nice. Furthermore, the ground and sky have moving textures.

Camera and Lighting: The camera and light are both placed at the front of the screen so that the user can
see the oncoming obstacles. When objects are at the front of the screen, it is easy to tell how the lighting
interacts with the objects. 

Sound: When the game begins, background music will be played, which can be toggled on and off. Moreover, the pig
makes an "Oink" sound whenever it moves.