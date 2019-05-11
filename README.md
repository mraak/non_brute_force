# !brute_force: sim

## Dogs tasks

How does dog see its task? There are three possible contradictory options.

1. Check as many paths and corners as possible for possible indicators (food places) (exploration)
2. Find the right path through the maze to get the jackpot (big final food rewared) (exploitation)
3. No clue what to do with the maze

Tests on 04.05.2019 have revealed that dogs could start with 1 or 3 (in case of untrained dogs) but then rather quickly realize that the real goal is 2. This happened with "pro" dogs and also completely untrained dogs. This was tested by first sending them into a maze with no indicators, then with all the indicators added (at every junction or turn), then remove them again, then add less indicators, and alternate in such way until they will go straight to through the maze along the correct path. After two iteration all the dogs started going straight through a simple maze, directly towards the jackpot. The maze was very simple, it would need to be repeated with more complex mazes to extract other behaviours.

The simulated, algorithmic dogs (players) need to reflect this behaviour.


## Algorithmic player types

These are building up upon each other, every type adds complexity to previous type.

### 1. random explorer 

- playar always walks straight in one direction
- player bumps into the wall and finds the path forward
- if no path forward is available, only then the player turns back along the same path
- if it comes to junction, every path selection has equal probability 

### 2. random dog explorer

- Path selection factors: completely random every time
- can also change direction for no reason

### 3. memorized dog explorer

Memory of previous successeful attempts plays a role in path selection. 

- Path selection factors: randomnes, memory (the longer into the path is a selection, the smaller the memory factor), curiosity
- can also change direction for no reason but with much lesser probability 

### 4. memorized, eating dog explorer

Food indicators placed along the correct path start playing a role.

- Path selection: food in sight, avoid already explored paths, exploatation/exploration ratio
- can also change direction for no reason but with much lesser probability 

### [optional] 5. memorized, eating, smelling dog explorer

Smell of food across the walls starts playing a role in path selection. Maybe the dog can get confused if there's an indicator just on the other side of the wall. Dog can't see it but can smell it.


## modes
- **p**lace - places boid on the floor using mouse (last placed is controllable by arrow keys, others are automated)
- **e**dit - edits floor (**1** floor, **2** reward, **5** penalty)


# !brute_force: ML

Dog trains the trainer and trainer trains the dog. Trainer is watching the dog how it solves mazes and figures out the best way to train the dog how to become a better maze solver. Trainer trains the dog by gradually increasing the complexity of the mazes, and adding and removing different number of indicators. A success is when a dog solves the maze with no indicators, only having the final jackpot at the end of the maze.

Dog can learn the following things 

1. That the goal of the game is to solve the maze, as opposed for example to check as many paths as possible.
2. To solve the same non-changing maze correctly and memorize it as quickly as possible. Different teaching methods might have different success rates that need to be ranked.
3. To become a better maze solver in general, i.e. to better solve completelly new random mazes. This also needs to be evaluated by seeing how fast can a dog solve a maze before and after the training. The before and after mazes need to be different but of the same complexity. 

Curiosity as reward? 
Actor critic model, solution to Credit Assignment Problem.


https://en.wikipedia.org/wiki/Place_cell

Symbolic learning in humans difficult in faceless walls, but easier if marked with visual clues. Maybe dogs have better path remembering. 

Humans problems: fear, panic, anger, emotions, agency bias, sense of justice, symbolic representation . 
Dogs: no such problems

# Next live test

- Effect of position of crossing on memory. Do they remember more crossings that are closer to start or closer to end? 
- Effect of big failures on remembering already explored paths.









