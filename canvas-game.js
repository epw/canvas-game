// Canvas-game - a Javascript library to aid in writing games in HTML5

// Game constants
var FRAME_RATE = 30; // Can be set by application
var KEY = { RIGHT:39, UP:38, LEFT:37, DOWN:40, SPACE:32, ESCAPE:27, RETURN:13};

// Declarations to allow normal inheritance
function Inherit () {
    var self = arguments[0];
    var parent = arguments[1];
    if( arguments.length > 2 ) {
	parent.apply( self, Array.prototype.slice.call( arguments, 2 ) );
    } else {
	parent.call( self );
    }
}

Function.prototype.Inherits = function( parent ) {
    this.prototype = new parent();
    this.prototype.constructor = this;
    this.prototype.parent = function () {
	if (arguments.length == 0) {
	    throw "parent function requires name of method to invoke.";
	}
	funname = arguments[0];
	return parent.prototype[funname].apply (this,
						Array.prototype.slice.call
                                                (arguments, 1));
    };
};

Function.prototype.def = function (name, data) {
    this.prototype[name] = data;
}
// End inheritance declarations

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

function load_image (src) {
    img = new Image ();
    img.src = src;
    return img;
}

function load_frames (srcs) {
    frames = [];
    for (src in srcs) {
	img = new Image ();
	img.src = srcs[src];
	frames.push (img);
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
    } else if (image instanceof Array) {
	this.frames = load_frames (image);
    } else if (typeof(image) == "function") {
	this.imagefun = image;
    } else {
	this.image = image;
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
Game_Object.def ("choose_frame",
		 function (n) {
		     this.image = this.frames[n];
		     return this.image;
		 });
Game_Object.def ("w",
		 function () {
		     if (typeof(this.width) == "undefined" && this.image) {
			 return this.image.width * this.scalex;
		     }
		     return this.width * this.scalex;
		 });
Game_Object.def ("h",
		 function () {
		     if (typeof(this.height) == "undefined" && this.image) {
			 return this.image.height * this.scaley;
		     }
		     return this.height * this.scaley;
		 });
Game_Object.def ("left",
		 function (val) {
		     if (typeof (val) == "undefined") {
			 return this.x - this.w() / 2;
		     }
		     this.x = val + this.w() / 2;
		     return this.x - this.w() / 2;
		 });
Game_Object.def ("right",
		 function (val) {
		     if (typeof (val) == "undefined") {
			 return this.x + this.w() / 2;
		     }
		     this.x = val - this.w() / 2;
		     return this.x + this.w() / 2;
		 });
Game_Object.def ("top",
		 function (val) {
		     if (typeof (val) == "undefined") {
			 return this.y - this.h() / 2;
		     }
		     this.y = val + this.h() / 2;
		     return this.y - this.h() / 2;
		 });
Game_Object.def ("bottom",
		 function (val) {
		     if (typeof (val) == "undefined") {
			 return this.y + this.h() / 2;
		     }
		     this.y = val - this.h() / 2;
		     return this.y + this.h() / 2;

		 });
Game_Object.def ("touching",
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
		});
Game_Object.def ("draw",
		 function (ctx) {
		     ctx.save ();
		     ctx.translate (this.x, this.y);
		     ctx.rotate (this.theta);
		     ctx.scale (this.scalex, this.scaley);
		     if (!this.imagefun) {
			 safe_draw_image (ctx, this.image,
					  -this.w() / 2, -this.h() / 2,
					  this.image.width, this.image.height);
		     } else {
			 this.imagefun (ctx);
		     }
		     ctx.restore ();
		 });
Game_Object.def ("update",
		 function () { return null; });
