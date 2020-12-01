// run the code when the document has finished loading
window.onload = function () {
  // get the canvas element
  var canvas = document.getElementById('canvas');

  // get the context of the canvas, i.e. the object that allows us to draw
  var c = canvas.getContext('2d');

  // keep track of the number of times the player ball collides with enemy
  var hits = 0;
  var hits_leftcanvas = 0;

  // use a ball class to create ball objects... reduces code duplication
  class ball {
    // create a ball object
    constructor(x, y, vx, vy, bvx, bvy, radius, color) {
      this.x = x; // x position
      this.y = y; // y position
      this.vx = vx; // x velocity
      this.vy = vy; // y velocity
      this.bvx = bvx; // x velocity after bounce = vx * bvx
      this.bvy = bvy; // y velocity after bounce = vy * bvy
      this.radius = radius;
      this.color = color;
    }

    // draw the ball to the canvas
    draw() {
      c.beginPath();
      c.fillStyle = this.color;
      c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      c.fill();
    }

    // move the ball according to the velocity
    move() {
      this.x = this.x + this.vx;
      this.y = this.y + this.vy;
    }

    // determine if the ball has hit a boundary, multiply it by the
    // bounce values for the desired effect
    boundary_check_enemy() {
      if (
        this.y + this.radius + this.vy > canvas.height ||
        this.y - this.radius + this.vy < 0
      ) {
        this.vy = this.bvy * this.vy;
      }
      if (this.x + this.radius + this.vx > canvas.width) {
        this.vx = this.bvx * this.vx;
      }
      if (this.x - this.radius + this.vx < 0) {
        this.x = canvas.width - 50;
        this.y = 50 + Math.random() * 50;
        hits_leftcanvas++;
      }
    }
    boundary_check() {
      if (
        this.y + this.radius + this.vy > canvas.height ||
        this.y - this.radius + this.vy < 0
      ) {
        this.vy = this.bvy * this.vy;
      }
      if (
        this.x + this.radius + this.vx > canvas.width ||
        this.x - this.radius + this.vx < 0
      ) {
        this.vx = this.bvx * this.vx;
      }
    }
  }

  // create the player ball
  var player_ball = new ball(25, 250, 0, 0, 0, 0, 25, 'green');

  // create the enemy balls
  var num_enemies = 3;
  var enemy_balls = [];
  for (var i = 0; i < num_enemies; i++) {
    var xdir = Math.random() > 0.5 ? 1 : -1;
    var ydir = Math.random() > 0.5 ? 1 : -1;
    var vx = xdir * Math.floor(4 + Math.random() * 5);
    var vy = ydir * Math.floor(4 + Math.random() * 5);
    enemy_balls[i] = new ball(
      canvas.width - 50,
      50 + i * 50,
      vx,
      vy,
      -1,
      -1,
      25,
      'red'
    );
  }

  canvas.ontouchmove = function (e) {
    player_ball.boundary_check();
    player_ball.y = e.touches[0].clientY;
    player_ball.x = e.touches[0].clientX;
  };

  // change the direction of the ball based on the arrow key input
  document.onkeydown = function (e) {
    console.log(e.code);
    if (e.code == 'ArrowDown') player_ball.vy = 5;
    else if (e.code == 'ArrowUp') player_ball.vy = -5;
    else if (e.code == 'ArrowRight') player_ball.vx = 5;
    else if (e.code == 'ArrowLeft') player_ball.vx = -5;
  };

  // when the player releases a key, stop the movement in that direction
  document.onkeyup = function (e) {
    if (e.code == 'ArrowDown') player_ball.vy = 0;
    else if (e.code == 'ArrowUp') player_ball.vy = 0;
    else if (e.code == 'ArrowRight') player_ball.vx = 0;
    else if (e.code == 'ArrowLeft') player_ball.vx = 0;
  };

  // recogonizes and carries out any game logic, i.e. collisions
  function game_logic() {
    // check if the balls have collided with a boundary
    player_ball.boundary_check();
    for (var i = 0; i < num_enemies; i++) enemy_balls[i].boundary_check_enemy();

    // check if the player ball collides with any other balls
    for (var i = 0; i < num_enemies; i++) {
      // calculate the distance between the future ball positions
      var dx =
        enemy_balls[i].x + enemy_balls[i].vx - (player_ball.x + player_ball.vx);
      var dy =
        enemy_balls[i].y + enemy_balls[i].vy - (player_ball.y + player_ball.vy);
      var distance = Math.sqrt(dx * dx + dy * dy);

      // if a collision occurs, flip both ball's velocities
      if (distance < enemy_balls[i].radius + player_ball.radius) {
        hits++;
        enemy_balls[i].x = canvas.width - 50;
        enemy_balls[i].y = 50 + Math.random() * 100;
      }
    }

    // move the balls
    player_ball.move();
    for (var i = 0; i < num_enemies; i++) enemy_balls[i].move();
  }

  // draws the game state to the canvas
  function draw() {
    // clear the canvas so that we start off with a blank canvas
    c.clearRect(0, 0, canvas.width, canvas.height);

    // draw the balls to the screen
    player_ball.draw();
    for (var i = 0; i < num_enemies; i++) enemy_balls[i].draw();

    // draw the hits to the screen in the top-left corner
    c.font = '20px serif';
    c.fillText('Hits: ' + hits, 5, 20);
    c.fillText('Left Border Hits: ' + hits_leftcanvas, 5, 50);
  }

  // game loop runs every 30 milliseconds
  setInterval(function () {
    game_logic();
    draw();
  }, 30);
};
