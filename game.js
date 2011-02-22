var canvas;
var main_loop;

var keys = {};

var player;

var things = [];
Thing.prototype = new Game_Object;
function Thing (r) {
    if (typeof(r) == "undefined") {
	Game_Object.call (this);
	return;
    }
    Game_Object.call (this, draw_thing, 1,
		      roll (canvas.width - r * 2) + r,
		      roll (canvas.height - r * 2) + r, 0,
		      "rect");
    this.color = "rgb(255, 0, 0)";
    this.speed = 5;
    this.width = r * 2;
    this.height = r * 2;
}
Thing.prototype.pass =
    function () {
	if (this.left() < 0 || this.right() > canvas.width
 	    || this.top() < 0 || this.bottom() > canvas.height) {
 	    return false;
 	}
 	return true;
    };
Thing.prototype.update =
    function () {
	Game_Object.prototype.update.call (this);
	for (thing in things) {
		   if (things[thing] == this) {
 		       continue;
		   }
 		   this.color = "rgb(255, 0, 0)";
 		   if (this.touching (things[thing])) {
 		       this.color = "rgb(0, 255, 0)";
 		   }
 	}
    };

Player.prototype = new Thing;
function Player (r) {
    Thing.call (this, r);
    delete this.image;
    this.imagefun = draw_player;
    this.width = 40;
    this.height = 40;
    this.shape = "circle";
}
Player.prototype.update =
    function () {
	if (keys[KEY.LEFT]) {
	    player.vx = -player.speed;
	} else if (keys[KEY.RIGHT]) {
	    player.vx = player.speed;
	} else {
	    player.vx = 0;
	}
	
	if (keys[KEY.UP]) {
	    player.vy = -player.speed;
	} else if (keys[KEY.DOWN]) {
	    player.vy = player.speed;
	} else {
	    player.vy = 0;
	}

	Thing.prototype.update.call (this);
    };

function log (s) {
    $("#log").append ("<div class=\"logentry\">");
    $("#log").append ("<span class=\"logtimestamp\">"
		      + Math.floor((new Date()).getTime() / 1000) + "</span> ");
    $("#log").append (s  + "</div>\n");
}

function draw_thing (ctx) {
    ctx.save ();
    ctx.fillStyle = this.color;
    ctx.fillRect (-this.w() / 2, -this.h() / 2, this.w(), this.h());
    ctx.restore ();
}

function draw_player (ctx) {
    ctx.save ();
    ctx.fillStyle = this.color;
    ctx.beginPath ();
    ctx.arc (0, 0, this.w() / 2, 0, Math.PI * 2, false);
    ctx.fill ();
//    ctx.fillRect (-this.w() / 2, -this.h() / 2, this.w(), this.h());
    ctx.restore ();
}

function draw () {
    ctx = canvas.getContext ('2d');

    ctx.save ();

    ctx.fillStyle = "rgb(175, 200, 255)";
    ctx.fillRect (0, 0, canvas.width, canvas.height);

    ctx.restore ();

    for (thing in things) {
	things[thing].draw (ctx);
    }

}

function update () {
    for (thing in things) {
	things[thing].update ();
    }
    
    draw ();
}

function key_press (event) {
    keys[event.which] = true;
    keys[chr(event.which)] = true;
    switch (event.which) {
    }
}
function key_release (event) {
    keys[event.which] = false;
    keys[chr(event.which)] = false;
    switch (event.which) {
    case KEY.SPACE:
	log (player.left() + ", " + player.top()
	     + " (" + player.vx + ", " + player.vy + ")");
	break;
    case KEY.ESCAPE:
	clearInterval (main_loop);
	log ("Stopped");
	break;
    }
}

function init () {
    canvas = document.getElementById("canvas");

    player = new Player (20);
    things.push (player);
    things.push (new Thing(20));
    things[0].vx = 1;

    $(".loglabel").click (function () { $(this).toggle (); });

    main_loop = setInterval (update, 1000.0 / FRAME_RATE);
}

$(document).ready (init);
$(document).keydown (key_press);
$(document).keyup (key_release);
