This library is set up to help make HTML5 games with the <canvas> tag.

To use, copy canvas-game.js to the directory on your webserver
where you will be writing the game.

Assuming that the primary game page is in the same directory as canvas-game.js , include this line in between the <head> and </head>
tags of the HTML page:
     <script type="text/javascript" src="canvas-game.js"></script>

game.html and game.js contain an example of using the library. They
create three subclasses of Game_Object, named Thing, Static, and
Player. Player overrides Game_Object.update() in order to respond to
keyboard events, which are collected by key_press() and
key_release().

CONSTANTS

FRAME_RATE: The number of frames to be displayed per second. Can by
	dynamically adjusted by the application, if desired.
KEY: An associative array mapping names to HTML event keycode values,
	which can be used to store which keys are currently
	pressed. Some common keys which does not match their ASCII
	codes (or lack an ASCII code) have a constant name
	provided.

FUNCTIONS

ord (): Returns the character code (normally ASCII) of a character.
chr (): Returns the character represented by the integer given.
roll (): Return an integer in the range [0, n).
hypot (): Return hypotenuse of triangle with sides of length a and b.
between (): Return whether x is in the range [lower, upper] (or
	(lower, upper) if exclusive is true)
remove_from_array (): Remove object from array, and shorten array so
	that there is not an element containing null
	instead.
draw_game_message (): Draw the current game message, moving down the
	queue if necessary.
load_image (): Load an image from the server into an Image object.
load_frames (): Load a number of images into an array of frames.
safe_draw_image (): Draw an image to the <canvas> tag, with optionally
	specified width and height. If the global variable
	ignore_errors is set to true, all errors from
	ctx.drawImage are silently discarded.

CLASSES

Game_Msg: This class defines a message to be displayed across the
	screen. The timeout specifies the number of frames before it
	is cleared. Normally, a new Game_Msg should be pushed onto
	the game_messages queue so that calling draw_game_message ()
	from the game loop will display it as expected.

Game_Object: This class is the primary reason for the existence of
	canvas-game. It attempts to encapsulate much of the
	common functionality seen in objects in computer games.

	The image parameter may be any of:
		string - a path to an image
		function - a function to be called that renders the
			object.
		array - an array of paths to images loaded as different
	     		frames.
		other - if image["0"] is defined, it is assumed to be the
	     		first frame of the image. If not, the parameter is
	     		used directly and the library assumes it will
	     		display correctly.

	The scale parameter can be omitted (treated as 1), a
	single number which is used as the x and y factors, or an
	array with two elements, which are used separately as x
	and y values to scale the image.

	The theta parameter, if included, rotates the image.

	The shape parameter can be "rect" or "circle", and is
	used in determining whether two objects are touching.

Game_Object methods:

Game_Object.w(): Returns the width of the object

Game_Object.h(): Returns the height of the object

Game_Object.r(): Returns the radius of the object if it is a circle,
		 or null otherwise.
		 
Game_Object.left(): With no parameter, returns the position in pixels
	of the leftmost side of the object.
	With a parameter, sets the left side to the given
	value. Adjusts other object coordinates to match.
	
Game_Object.right(): As Game_Object.left(), but for right side of the
	object.
	
Game_Object.top(): As Game_Object.left(), but for top side of the
	object.
	
Game_Object.bottom(): As Game_Object.left(), but for bottom of the
	object.
	
Game_Object.resize(): Change the scaling factors of the object

Game_Object.touching(): Determine whether the object is touching the
	other object passed into the parameter. Uses
	each object's shape property to determine
	whether they are in contact.
	
Game_Object.point_in (): Determine whether the given point, a
	two-element array, falls inside the object's area.
	
Game_Object.draw (): Draw the object, using its position, scaling
	factors, and theta. If the library's assumptions about
	rendering the object are incorrect, this function should be
	overriden in subclasses. This function should be called in the
	game's main loop.
	
Game_Object.pass (): Used to determine whether an object's current
	position "passes", or is legal within the game's logic. Always
	returns true by default, can be overriden to implement new
	behaviors. Used by Game_Object.try_move() to determine whether
	the object's position should be altered.
	
Game_Object.try_move (): Test whether moving the object by (dx, dy)
	pixels would make Game_Object.pass() return false. If not,
	moves the object and returns true. Otherwise, returns false.
	
Game_Object.update (): By default, moves the object according to its
	velocity. This function should be called in the game's main
	loop, and should be overridden for more complex objects. The
	default behavior is likely useful to be called at some point
	in more complicated methods.
	
Game_Object.isTouchingBorder (border): Tests to see if the object is
	touching a given border of the screen. The borders are
	numbered as follows: Top = 1, Bottom = 2, Right = 3, Left =
	4.
