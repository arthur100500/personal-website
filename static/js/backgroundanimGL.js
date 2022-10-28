const canvas = document.querySelector("#delaunay-bg");
const canvasContainer = document.querySelector("#delaunay-bg-container");

const dotcnt = 140;
const speed = 0.002;
const widening = 1.3;

let colorData = document.querySelector('#bg-colors').dataset;

let clrTop = colorData.clrTop.slice(1, -1).split(", ").map(Number);
let clrBtm = colorData.clrBtm.slice(1, -1).split(", ").map(Number);

let colorTop = clrTop;
let colorBottom = clrBtm;

const vertShader =
    `
precision mediump float;
attribute vec2 aPosition;
attribute vec4 aColor;
varying vec4 color;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
  color = aColor;
}`;

const fragShader =
    `
precision mediump float;
varying vec4 color;

void main(){
  gl_FragColor = color;
}
`

function colToRgb(arg) {
    return "rgb(" + (arg[0] * 255) + ", " + (arg[1] * 255) + ", " + (arg[2] * 255) + ", " + arg[3] + ")";
}

canvasContainer.style.backgroundImage += "linear-gradient(" + colToRgb(clrTop) + ", " + colToRgb(clrBtm) + ");";

console.log(canvasContainer.style.cssText);

const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resize()
//window.addEventListener('resize', resize)

function getColorFromY(y) {
    return [colorTop[0] * y + colorBottom[0] * (1 - y),
        colorTop[1] * y + colorBottom[1] * (1 - y),
        colorTop[2] * y + colorBottom[2] * (1 - y),
        colorTop[3] * y + colorBottom[3] * (1 - y)]
}

Math.avg = function (a, b, c) {
    return (a + b + c) / 3;
}

class Dot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vel_x = 0;
        this.vel_y = 0;
    }

    update() {
        this.x += this.vel_x;
        this.y += this.vel_y;

        if (this.x < -1.1) this.vel_x = Math.abs(this.vel_x);
        if (this.x > 1 + 0.1) this.vel_x = -Math.abs(this.vel_x);
        if (this.y < -1.1) this.vel_y = Math.abs(this.vel_y);
        if (this.y > 1 + 0.1) this.vel_y = -Math.abs(this.vel_y);
    }
}

var dots = []


function createShader(gl, sourceCode, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        throw `Could not compile WebGL program.\n\n${sourceCode} \n\n${info}`;
    }
    return shader;
}

function main() {
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    for (var i = 0; i < dotcnt - 100; i++) {
        dots[100 + i] = new Dot((Math.random() * 2 - 1) * widening, (Math.random() * 2 - 1) * widening);
        dots[100 + i].vel_x = (Math.random() - 0.5) * speed;
        dots[100 + i].vel_y = (Math.random() - 0.5) * speed;
    }
    for (var i = 0; i < 25; i++) {
        dots[i] = new Dot((Math.random() * 2 - 1) * widening, -1.3);
        dots[i].vel_x = 0;
        dots[i].vel_y = 0;
    }
    for (var i = 25; i < 50; i++) {
        dots[i] = new Dot((Math.random() * 2 - 1) * widening, 1.3);
        dots[i].vel_x = 0;
        dots[i].vel_y = 0;
    }
    for (var i = 50; i < 75; i++) {
        dots[i] = new Dot(1.3, (Math.random() * 2 - 1) * widening);
        dots[i].vel_x = 0;
        dots[i].vel_y = 0;
    }
    for (var i = 75; i < 100; i++) {
        dots[i] = new Dot(-1.3, (Math.random() * 2 - 1) * widening);
        dots[i].vel_x = 0;
        dots[i].vel_y = 0;
    }

    var vertexShader = createShader(gl, vertShader, gl.VERTEX_SHADER);
    var fragmentShader = createShader(gl, fragShader, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        throw `Could not compile WebGL program. \n\n${info}`;
    }

    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    }

    var VBO = gl.createBuffer();
    var EBO = gl.createBuffer();

    dots_raw = []
    for (var i = 0; i < dotcnt; i++) {
        dots_raw[i * 2 + 0] = dots[i].x;
        dots_raw[i * 2 + 1] = dots[i].y;
    }

    const delaunay = new Delaunator(dots_raw);
    var triangles = delaunay.triangles;

    let verts = new Float32Array(triangles.length * 6);


    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);

    var trianglescnt = triangles.length;

    let indicies = new Int32Array(trianglescnt);
    for (var i = 0; i < trianglescnt; i++) {
        indicies[i] = i;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicies, gl.STATIC_DRAW);

    gl.useProgram(program);
    var aPosLocation = gl.getAttribLocation(program, 'aPosition');
    gl.vertexAttribPointer(aPosLocation, 2, gl.FLOAT, false, 6 * 4, 0);
    gl.enableVertexAttribArray(aPosLocation);

    var aPosLocation = gl.getAttribLocation(program, 'aColor');
    gl.vertexAttribPointer(aPosLocation, 4, gl.FLOAT, false, 6 * 4, 2 * 4);
    gl.enableVertexAttribArray(aPosLocation);

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, trianglescnt);

    function updateAndRedraw() {
        for (var i = 0; i < dotcnt; i++) {
            dots[i].update();
        }

        for (var i = 0; i < dotcnt; i++) {
            dots_raw[i * 2 + 0] = dots[i].x;
            dots_raw[i * 2 + 1] = dots[i].y;
        }

        delaunay.update();
        var triangles = delaunay.triangles;
        trianglescnt = triangles.length;


        for (var i = 0; i * 3 < triangles.length; i++) {
            color = getColorFromY((Math.avg(dots[triangles[i * 3]].y, dots[triangles[i * 3 + 1]].y, dots[triangles[i * 3 + 2]].y) * 0.5 + 0.5));
            for (var j = 0; j < 3; j++) {
                verts[18 * i + 6 * j + 0] = dots[triangles[i * 3 + j]].x;
                verts[18 * i + 6 * j + 1] = dots[triangles[i * 3 + j]].y;
                verts[18 * i + 6 * j + 2] = color[0];
                verts[18 * i + 6 * j + 3] = color[1];
                verts[18 * i + 6 * j + 4] = color[2];
                verts[18 * i + 6 * j + 5] = color[3];
            }
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicies, gl.STATIC_DRAW);

        gl.drawArrays(gl.TRIANGLES, 0, indicies.length);
        setTimeout(function () {
            window.requestAnimationFrame(updateAndRedraw)
        }, 10);
    }

    updateAndRedraw();
}

window.addEventListener("load", function setupWebGL(evt) {
    "use strict"
    window.removeEventListener(evt.type, setupWebGL, false);

    main();
}, false);
