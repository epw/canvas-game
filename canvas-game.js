// Canvas-game - a Javascript library to aid in writing games in HTML5

// Game constants
var FRAME_RATE = 30; // Can be set by application

var KEY = { RIGHT:39, UP:38, LEFT:37, DOWN:40, SPACE:32, ESCAPE:27, RETURN:13,
	    SHIFT:16, CONTROL:17, ALT:18, PERIOD:190, MINUS:189, DELETE:46};

// Game variable, can be altered
//var screen_clip = {"x": 0, "y": 0, "w": 640, "h": 480};

// Utility functions
function ord (c) {
    return c.charCodeAt(0);
}
function chr(d) {
    return String.fromCharCode(d);
}

function roll (n) {
    return Math.floor (Math.random() * n);
}

function hypot (a, b) {
    return Math.sqrt (a*a + b*b);
}

function between (x, lower, upper, exclusive) {
    if (typeof (exclusive) == "undefined") {
	exclusive = false;
    }
    if (lower > upper) {
	var tmp = upper;
	upper = lower;
	lower = tmp;
    }
    if (!exclusive) {
	return (x >= lower) && (x <= upper);
    }
    return (x > lower) && (x < upper);
}

function remove_from_array (array, obj) {
    ind = array.indexOf (obj);
    if (ind != -1) {
	array.splice (ind, 1);
    }
}
// End utility functions

var game_messages = [];

function Game_Msg (msg, color, timeout, font, background) {
    this.msg = msg;
    if (color == undefined) {
	this.color = "rgb(255, 255, 255)";
    } else {
	this.color = color;
    }
    this.timeout = timeout;
    if (font == undefined || font == null) {
	this.font = "48px Sans";
    } else {
	this.font = font;
    }
    this.size = 48;
    if (background == undefined) {
	this.background = "black";
    } else {
	this.background = background;
    }
}

function draw_game_message (ctx, canvas) {
    if (game_messages.length == 0) {
	return;
    }
    if (game_messages[0].timeout == 0) {
	game_messages.shift ();
	if (game_messages.length == 0) {
	    return;
	}
    }
    msg = game_messages[0];
    msg.timeout--;

    ctx.save ();
    ctx.fillStyle = msg.color;
    ctx.font = msg.font;
    strs = msg.msg.split ("\n");
    for (s in strs) {
	ctx.save ();
	w = ctx.measureText (strs[s]);
	ctx.translate (canvas.width / 2 - w.width / 2,
		       canvas.height / 2 - 10 + s * (msg.size + 5));
	ctx.save ();
	ctx.translate (0, -(msg.size - 5));
	ctx.globalAlpha = .5;
	ctx.fillStyle = msg.background;
	ctx.fillRect (0, 0, w.width, msg.size);
	ctx.restore ();
	ctx.fillText (strs[s], 0, 0);
	ctx.restore ();
    }
    ctx.restore ();
}


function load_image (src) {
    img = new Image ();
    img.src = src;
    return img;
}

function load_frames (srcs) {
    frames = null;
    if (srcs instanceof Array) {
	frames = [];
    } else {
	frames = {};
    }
    for (src in srcs) {
	img = new Image ();
	img.src = srcs[src];
	frames[src] = img;
    }
    return frames;
}

var ignore_errors = true;
function safe_draw_image (ctx, image, x, y, w, h) {
    try {
        if (w == undefined) {
            ctx.drawImage (image, x, y);
        } else {
            ctx.drawImage (image, x, y, w, h);
        }
    } catch (x) {
	if (!ignore_errors) {
	    throw x;
	}
    }
}

function Game_Object (image, scale, x, y, theta, shape) {
    if (typeof (image) == "undefined") {
	image = null;
	return;
    }
    if (typeof (scale) == "undefined") {
	scale = 1;
    }
    if (typeof (x) == "undefined") {
	x = 0;
    }
    if (typeof (y) == "undefined") {
	y = 0;
    }
    if (typeof (theta) == "undefined") {
	theta = 0;
    }
    if (typeof (shape) == "undefined") {
	shape = "rect";
    }
    
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    if (scale instanceof Array) {
	this.scalex = scale[0];
	this.scaley = scale[1];
    } else {
	this.scalex = scale;
	this.scaley = scale;
    }
    this.theta = theta;
    this.shape = shape;

    if (typeof (image) == "string") {
	this.image = load_image (image);
    } else if (image instanceof Function) {
	this.imagefun = image;
    } else {
	this.frames = load_frames (image);
	if (image instanceof Array) {
	    this.current_frame = 0;
	} else {
	    this.current_frame = "0";
	}
	this.image = this.frames[this.current_frame];
    }

    if (this.shape == "circle") {
	if (this.image) {
            if (this.image.width && this.image.height) {
		this.width = (this.image.width * this.scalex
			      + this.image.height * this.scaley) / 2;
		this.height = this.width;
	    }
	}
    }
}
Game_Object.prototype.w =
    function () {
	if (typeof(this.width) == "undefined" && this.image) {
	    return this.image.width * this.scalex;
	}
	return this.width * this.scalex;
    };
Game_Object.prototype.h =
    function () {
	if (typeof(this.height) == "undefined" && this.image) {
	    return this.image.height * this.scaley;
	}
	return this.height * this.scaley;
    };
Game_Object.prototype.r =
    function () {
	if (this.shape != "circle") {
	    return null;
	}

	return (this.w() + this.h()) / 2;
    };
Game_Object.prototype.left =
    function (val) {
	if (typeof (val) == "undefined") {
	    return this.x - this.w() / 2;
	}
	this.x = val + this.w() / 2;
	return this.x - this.w() / 2;
    };
Game_Object.prototype.right =
    function (val) {
	if (typeof (val) == "undefined") {
	    return this.x + this.w() / 2;
	}
	this.x = val - this.w() / 2;
	return this.x + this.w() / 2;
    };
Game_Object.prototype.top =
    function (val) {
	if (typeof (val) == "undefined") {
	    return this.y - this.h() / 2;
	}
	this.y = val + this.h() / 2;
	return this.y - this.h() / 2;
    };
Game_Object.prototype.bottom =
    function (val) {
	if (typeof (val) == "undefined") {
	    return this.y + this.h() / 2;
	}
	this.y = val - this.h() / 2;
	return this.y + this.h() / 2;

    };
Game_Object.prototype.resize = 
    function (scale) {
	if (typeof (scale) == "undefined") {
	    return [this.scalex, this.scaley];
	}
	if (scale instanceof Array) {
	    this.scalex = scale[0];
	    this.scaley = scale[1];
	} else {
	    this.scalex = scale;
	    this.scaley = scale;
	}
    };
Game_Object.prototype.touching =
    function (gobj) {
	if (this.shape == "circle") {
	    if (gobj.shape == "circle") {
		return (hypot (this.x - gobj.x, this.y - gobj.y)
			<= (this.w() / 2 + gobj.w() / 2));
	    } else if (gobj.shape == "rect") {
		if (between (this.x, gobj.left(), gobj.right())) {
		    return (this.bottom() >= gobj.top()
			    && this.top() <= gobj.bottom());
		}
		if (between (this.y, gobj.top(), gobj.bottom())) {
		    return (this.right() >= gobj.left()
			    && this.left() <= gobj.right());
		}
		if ((hypot (this.x - gobj.left(),
			    this.y - gobj.top())
		     <= this.w() / 2)
		    || (hypot (this.x - gobj.right(),
			       this.y - gobj.top())
			<= this.w() / 2)
		    || (hypot (this.x - gobj.right(),
			       this.y - gobj.bottom())
			<= this.w() / 2)
		    || (hypot (this.x - gobj.left(),
			       this.y - gobj.bottom())
			<= this.w() / 2)) {
		    return true;
		}
		return false;
	    } else {
		return "Argument object has unknown shape "
		    + gobj.shape;
	    }
	} else if (this.shape == "rect") {
	    if (gobj.shape == "circle") {
		return gobj.touching (this);
	    } else if (gobj.shape == "rect") {
		return (this.left() <= gobj.right()
			&& this.right() >= gobj.left()
			&& this.top() <= gobj.bottom()
			&& this.bottom() >= gobj.top());
	    } else {
		return "Argument object has unknown shape "
		    + gobj.shape;
	    }
	} else {
	    return "this object has unknown shape "
		+ gobj.shape;
	}
	return null;
    };
Game_Object.prototype.point_in =
    function (point, other) {
	if (typeof (other) != "undefined") {
	    point = [point, other];
	}
	if (this.shape == "circle") {
	    return (hypot (point[0] - this.x, point[1] - this.y) < this.r());
	} else if (this.shape == "rect") {
	    return (between (point[0], this.left(), this.right())
		    && between (point[1], this.top(), this.bottom()));
	}
	return "unknown shape";
    };
Game_Object.prototype.draw =
    function (ctx) {
	if (typeof (screen_clip) != "undefined") {
	    if (this.right() < screen_clip.x
		|| this.left() > screen_clip.x + screen_clip.w
		|| this.bottom() < screen_clip.y
		|| this.top() > screen_clip.y + screen_clip.h) {
		return;
	    }
	}
	if (typeof (this.frames) != "undefined" && this.frames != []) {
	    this.image = this.frames[this.current_frame];
	}
	ctx.save ();
	ctx.translate (Math.floor(this.x), Math.floor(this.y));
	ctx.rotate (this.theta);
	ctx.scale (this.scalex, this.scaley);
	if (!this.imagefun) {
	    safe_draw_image (ctx, this.image,
			     -this.w() / 2, -this.h() / 2,
			     this.w(), this.h());
	} else {
	    this.imagefun (ctx);
	}
	ctx.restore ();
    };
Game_Object.prototype.pass =
    function () {
	return true;
    };
Game_Object.prototype.try_move =
    function (dx, dy) {
	this.x += dx;
	this.y += dy;

	if (this.pass() == false) {
	    this.x -= dx;
	    this.y -= dy;
	}
    };
Game_Object.prototype.update =
    function () {
	this.try_move (this.vx, 0);
	this.try_move (0, this.vy);
    };

//@arguments border - an enum representing the border
//@return a boolean representing whether the object is touching the border in question (true) or not (false)
//TODO: needs to be expanded for circular play areas
Game_Object.prototype.isTouchingBorder =
    function (border) {
	switch(border) {
	case 1: //top
	    if( this.y <= 0 ){
		return true;
	    }
	case 2: //bottom
	    if( this.y >= canvas.height ){
		return true;
	    }
	case 4: //left
	    if( this.x <= 0 ){
		return true;
	    }
	case 3: //right
 	    if( this.x >= canvas.width ){
		return true;
	    } else{
		return false;
	    }
	    break;
	}
	return null; // Never reached
    };
