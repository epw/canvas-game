var canvas;
var main_loop;

var keys = {};


function draw () {
    ctx = canvas.getContext ('2d');

    ctx.save ();

    ctx.fillStyle = "rgb(175, 200, 255)";
    ctx.fillRect (0, 0, canvas.width, canvas.height);

    ctx.restore ();
}

function update () {
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
	break;
    case KEY.ESCAPE:
	clearInterval (main_loop);
	log ("Stopped");
	break;
    }
}

function init () {
    canvas = document.getElementById("canvas");

    $(".loglabel").click (function () { $(this).toggle (); });

    main_loop = setInterval (update, 1000.0 / FRAME_RATE);
}

$(document).ready (init);
$(document).keydown (key_press);
$(document).keyup (key_release);
