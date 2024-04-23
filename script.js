function $(x) {
    return document.querySelector(x)
}
function $$(x) {
    return document.querySelectorAll(x)
}

var c = $$(".reactionCanvas")[0];
var ctx = c.getContext("2d");
ctx.beginPath();
ctx.arc(95, 50, 10, 0, 2 * Math.PI);
ctx.fillStyle = "red";
ctx.fill();
