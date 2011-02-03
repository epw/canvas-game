var canvas;
var main_loop;

var keys = {};

var balls = [];
Ball.Inherits (Game_Object);
function Ball (r) {
    Inherit (this, Game_Object, draw_ball, 1,
	     roll (canvas.width - r * 2) + r,
	     roll (canvas.height - r * 2) + r);
    this.width = r * 2;
    this.height = r * 2;
    this.color = "rgb(255, 0, 0)";
    this.speed = 5;
}
Ball.def ("try_move",
	  function (vx, vy) {
	      this.x += vx;
	      this.y += vy;

	      if (this.left() < 0 || this.right() > canvas.width
		  || this.top() < 0 || this.bottom() > canvas.height) {
		  this.x -= vx;
		  this.y -= vy;
	      }
	  });
Ball.def ("update",
	 function () {
	     if (keys[KEY.LEFT]) {
		 this.try_move (-this.speed, 0);
	     }
	     if (keys[KEY.RIGHT]) {
		 this.try_move (this.speed, 0);
	     }
	     if (keys[KEY.UP]) {
		 this.try_move (0, -this.speed);
	     }
	     if (keys[KEY.DOWN]) {
		 this.try_move (0, this.speed);
	     }
	 });

function draw_ball (ctx) {
    ctx.save ();
    ctx.fillStyle = this.color;
    ctx.beginPath ();
    ctx.arc (0, 0, this.w() / 2, 0, Math.PI * 2, false);
    ctx.fill ();
    ctx.restore ();
}

function draw () {
    ctx = canvas.getContext ('2d');

    ctx.save ();

    ctx.fillStyle = "rgb(175, 200, 255)";
    ctx.fillRect (0, 0, canvas.width, canvas.height);

    ctx.restore ();

    for (ball in balls) {
	balls[ball].draw (ctx);
    }

}

function update () {
    for (ball in balls) {
	balls[ball].update ();
    }

    draw ();
}

function key_press (event) {
    keys[event.which] = true;
    switch (event.which) {
    }
}
function key_release (event) {
    keys[event.which] = false;
    switch (event.which) {
    case KEY.ESCAPE:
	clearInterval (main_loop);
	$("#log").append ("<div>Stopped</div>\n");
	break;
    }
}

function init () {
    canvas = document.getElementById("canvas");

    balls.push (new Ball(20));

    main_loop = setInterval (update, 1000.0 / FRAME_RATE);
}

$(document).ready (init);
$(document).keydown (key_press);
$(document).keyup (key_release);
