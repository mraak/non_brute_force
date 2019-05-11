# brute_force

## modes
- **p**lace - places boid on the floor using mouse (last placed is controllable by arrow keys, others are automated)
- **e**dit - edits floor (**1** floor, **2** reward, **5** penalty)


## Dogs tasks

How does dog see its task? There are three possible contradictory options.

1. Check as many paths and corners as possible for possible indicators (food places)
2. Find the right path through the maze to get the jackpot (big final food rewared)
3. No clue what to do with the maze

Tests on 04.05.2019 have revealed that dogs could start with 1 or 3 (in case of untrained dogs) but then rather quickly realize that the real goal is 2. This happened with "pro" dogs and also completely untrained dogs. This was tested by first sending them into a maze with no indicators, then with all the indicators added (at every junction or turn), then remove them again, then add less indicators, and alternate in such way until they will go straight to through the maze along the correct path. After two iteration all the dogs started going straight through a simple maze, directly towards the jackpot. The maze was very simple, it would need to be repeated with more complex mazes to extract other behaviours.

The simulated, algorithmic dogs (players) need to reflect this behaviour.


## Algorithmic player types

### 1. random explorer 

- every path selection has equal probability 

### 2. random dog explorer

- Path selection factors: completely random every time
- can also change direction for no reason

### 3. memorized dog explorer

Memory of previous successeful attempts plays a role in path selection. 

- Path selection factors: randomnes, memory
- can also change direction for no reason but with much lesser probability 

### 4. memorized, eating dog explorer

Food indicators placed along the correct path start playing a role.

- Path selection factors: randomnes, memory, food (sight)
- can also change direction for no reason but with much lesser probability 

### [optional] 5. memorized, eating, smelling dog explorer

Smell of food across the walls starts playing a role in path selection. Maybe the dog can get confused if there's an indicator just on the other side of the wall. Dog can't see it but can smell it.

- Path selection factors: randomnes, memory, food (sight), smell
- can also change direction for no reason but with much lesser probability 






