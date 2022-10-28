const pCanvas = document.querySelector("#universal-bg");
const figurecount = 300;

let whRatio = 1;
let scaleChanged = false;

const pVertShader =
    `
precision mediump float;
attribute vec2 aPosition;
attribute float aColor;
varying vec4 color;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
  color = vec4(vec3(aColor), 1.0);
}`;

const pFragShader =
    `
precision mediump float;
varying vec4 color;

void main(){
  gl_FragColor = color;
}
`

const pResize = () => {
    rResize();
    // Хочу небольшой блюр, хоть и не качественный
    pCanvas.width = window.innerWidth / 1;
    pCanvas.height = window.innerHeight / 1;
}

const rResize = () => {
    scaleChanged = true;
    whRatio = window.innerWidth / window.innerHeight;
}

window.addEventListener('resize', rResize);

pResize()


class Particle {
    constructor(x, y, z, rad) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.rad = 0.6;
        this.rot = 0;
    }

    getVerts(scroll) {
        let z = this.z;
        let x = this.x;
        let y = this.y + scroll * z;
        y = ((y + 1) / 2 + 0.15) % 1.3 - 0.15;
        y = y * 2 - 1;
        let rad = this.rad * z * 5.0;
        let rot = this.rot + scroll * (x + y + z) * 0.000;
        return [
            x + rad * Math.cos(rot), y + rad * Math.sin(rot) * whRatio,
            x + rad * Math.cos(rot + Math.PI * 2 / 3), y + rad * Math.sin(rot + Math.PI * 2 / 3) * whRatio,
            x + rad * Math.cos(rot + Math.PI * 4 / 3), y + rad * Math.sin(rot + Math.PI * 4 / 3) * whRatio
        ]
    }
}


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

Math.srandom = () => {
    return Math.random() * 2 - 1.0;
}

function part_main() {
    let scrollOld = -1000;

    const gl = pCanvas.getContext("webgl") || pCanvas.getContext("experimental-webgl");

    let figs = []

    for (let i = 0; i < figurecount; i++) {
        let x = new Particle(Math.srandom(), Math.srandom(), Math.random() * Math.random() * 0.5, Math.random())
        x.rot = ((Math.random() > 0.5 ? 1 : 0) + 0.5) * Math.PI;
        figs.push(x)
    }

    figs.sort(function (a, b) {
        return a.z - b.z
    });

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.09, 0.09, 0.09, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    let vertexShader = createShader(gl, pVertShader, gl.VERTEX_SHADER);
    let fragmentShader = createShader(gl, pFragShader, gl.FRAGMENT_SHADER);
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

    let VBO = gl.createBuffer();
    let EBO = gl.createBuffer();

    gl.useProgram(program);

    let verts = new Float32Array(figurecount * 6);

    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);

    let aPosLocation = gl.getAttribLocation(program, 'aPosition');
    gl.vertexAttribPointer(aPosLocation, 2, gl.FLOAT, false, 3 * 4, 0);
    gl.enableVertexAttribArray(aPosLocation);

    aPosLocation = gl.getAttribLocation(program, 'aColor');
    gl.vertexAttribPointer(aPosLocation, 1, gl.FLOAT, false, 3 * 4, 2 * 4);
    gl.enableVertexAttribArray(aPosLocation);

    let indicies = new Int32Array(figurecount * 3);
    for (var i = 0; i < figurecount * 3; i++) {
        indicies[i] = i;
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicies, gl.STATIC_DRAW);

    function updateAndRedraw() {
        scroll = (document.documentElement.scrollTop || document.body.scrollTop) / 60;
        if (scroll === scrollOld && !scaleChanged) {
            setTimeout(function () {
                window.requestAnimationFrame(updateAndRedraw)
            }, 10);
        }
        else {
            scaleChanged = false
            scrollOld = scroll;

            let v;
            for (let i = 0; i < figurecount; i++) {
                v = figs[i].getVerts(scroll);
                verts[9 * i] = v[0];
                verts[9 * i + 1] = v[1];
                verts[9 * i + 2] = 0.1 - figs[i].z * 1.5;
                verts[9 * i + 3] = v[2];
                verts[9 * i + 4] = v[3];
                verts[9 * i + 5] = 0.1 - figs[i].z * 1.5;
                verts[9 * i + 6] = v[4];
                verts[9 * i + 7] = v[5];
                verts[9 * i + 8] = 0.1 - figs[i].z * 1.5;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
            gl.bufferData(gl.ARRAY_BUFFER, verts, gl.DYNAMIC_DRAW);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicies, gl.STATIC_DRAW);

            gl.drawArrays(gl.TRIANGLES, 0, figurecount);

            setTimeout(function () {
                window.requestAnimationFrame(updateAndRedraw)
            }, 10);
        }
    }

    updateAndRedraw();
}

part_main();
