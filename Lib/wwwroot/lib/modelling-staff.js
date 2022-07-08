context = {
    data: [],
    input: [],
    graphs: [],
    onInputUpdate: undefined
};

window.addEventListener("keypress", function (e) {
    switch (e.key) {
        case "Enter":
            launch();
            break;
    }
});

function appendHTML(parent, html) {
    let container = document.createElement("div");
    container.innerHTML = html;
    parent.append(container.children[0]);
}

function createDataView(label, parameterName, value, suffix) {
    let elementId = "view" + parameterName;
    
    appendHTML(document.getElementsByClassName("data")[0],`
<div class="dataHolder">
    <div>${label}:</div>
    <div>
        <span id="${elementId}">${digits(value, 100)}</span>
        <span>${suffix}</span>
    </div>
</div>
`);
    
    context.data[parameterName] = document.getElementById(elementId);
}

function createControlView(label, parameterName, initialValue, setter, validator = numValidator) {
    let elementId = "input" + parameterName;

    appendHTML(document.getElementsByClassName("inputs")[0],`
<div>
    <div class="inputLabel">${label}</div>
    <input id="${elementId}" value="${initialValue}"/>
</div>
`);
    
    let input = document.getElementById(elementId);
    context.input[parameterName] = input;
    input.addEventListener("input", (event) => {
        let value = validator(event.target.value);
        event.target.value = value;
        value = parseFloat(value);
        
        if (isNaN(value))
            value = 0;
        
        setter(parameterName, value);
    });
}

function showData() {
    for (let dataKey in context.data) {
        context.data[dataKey].view.innerText = context.data[dataKey].getter();
    }
}

function setOnInputUpdate(listener) {
    context.onInputUpdate = listener;
}

function numValidator(str) {
    const BEFORE = 0;
    const AFTER_SIGN = 1;
    const AFTER_POINT = 2;

    let state = BEFORE;
    let newStr = "";

    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        switch (state) {
            case BEFORE:
                if ((47 < code && code < 58) || str[i] === "-") {
                    newStr += str[i];
                    state = AFTER_SIGN;
                } else if (str[i] === "." || str[i] === ",") {
                    newStr += ".";
                    state = AFTER_POINT;
                }
                break;
            case AFTER_SIGN:
                if (47 < code && code < 58) {
                    newStr += str[i];
                } else if (str[i] === "." || str[i] === ",") {
                    newStr += ".";
                    state = AFTER_POINT;
                }
                break;
            case AFTER_POINT:
                if (47 < code && code < 58) {
                    newStr += str[i];
                }
                break;
        }
    }
    return newStr;
}

function digits(num, mod) {
    if (typeof num === "function") {
        return () => digits(num(), mod);
    }
    if (num === undefined)
        return "";
    return Math.round(num * mod) / mod;
}

// LEGACY

let graphs = [];

function createGraph(xGetter, yGetter, xLabel, yLabel) {
    const WIDTH = 600;
    const HEIGHT = 600;
    let canvas = document.createElement("canvas");
    canvas.className = "canvas-graph";
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    document.getElementById("graphs").append(canvas);

    let ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(0, canvas.height);
    ctx.translate(canvas.width * 0.1, canvas.width * 0.1);

    let graph = graphs[graphs.length] = {
        xGetter: xGetter,
        yGetter: yGetter,
        xLabel: xLabel,
        yLabel: yLabel,
        view: canvas,
        context: ctx,
        data: []
    };

    graph.draw = function () {
        drawGraph(this.context, this.data, this.xLabel, this.yLabel);
    }
}

function clearGraphs() {
    for (let graphKey in graphs) {
        graphs[graphKey].data = [];
        graphs[graphKey].context.clear();
    }
}

function pushData() {
    for (let graphKey in graphs) {
        let graph = graphs[graphKey];
        graph.data[graph.data.length] = [graph.xGetter(), graph.yGetter()];
    }
}

function drawGraphs() {
    for (let graphKey in graphs) {
        graphs[graphKey].draw();
    }
}

function drawGraph(ctx, data, xLabel, yLabel) {
    ctx.reset();
    ctx.translateCoordinates(0, ctx.canvas.height);
    ctx.scaleCoordinates(1, -1);
    ctx.translateCoordinates(ctx.canvas.width * 0.1, ctx.canvas.width * 0.1);

    let edges = getEdges(data);

    let dotsPerUnitX = ctx.canvas.width * 0.8 / edges.width();
    let dotsPerUnitY = ctx.canvas.height * 0.8 / edges.height();

    ctx.scaleCoordinates(dotsPerUnitX, dotsPerUnitY);
    ctx.translateCoordinates(-edges.left, -edges.bottom);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "gray";
    ctx.drawPath(data);

    ctx.strokeStyle = "black";
    ctx.drawLine(edges.left, 0, edges.right, 0);
    ctx.drawLine(0, edges.bottom, 0, edges.top);

    ctx.lineWidth = 1;

    const fontSize = 14;

    ctx.textAlign = "right";
    ctx.font = fontSize + "px " + ctx.font.split(" ")[1];

    let step = niceStepByRange(edges.height());
    for (let borderY = Math.ceil(edges.bottom / step) * step; borderY <= edges.top; borderY += step) {
        ctx.drawLine(
            -edges.width() * 0.01, borderY,
            (Math.round(borderY / step) % 5 === 0) ? edges.right : 0, borderY);
        ctx.fillText(shortNumString(digits(borderY, 100)), -edges.width() * 0.02, borderY - fontSize * 0.4 / dotsPerUnitY);
    }

    ctx.textAlign = "center";

    let stepX = niceStepByRange(edges.width());
    for (let x = Math.ceil(edges.left / stepX) * stepX; x < edges.right; x += stepX) {
        ctx.drawLine(
            x, -edges.height() * 0.01,
            x, 0);
        ctx.fillText(shortNumString(digits(x, 100)), x, -fontSize * 1.5 / dotsPerUnitY);
    }

    let labelFontSize = fontSize + 4;
    ctx.font = labelFontSize + "px " + ctx.font.split(" ")[1]

    ctx.textAlign = "left";
    ctx.fillText(xLabel, edges.right + edges.width() * 0.03, -labelFontSize * 0.4 / dotsPerUnitY);

    ctx.textAlign = "center";
    ctx.fillText(yLabel, 0, edges.top + edges.height() * 0.03);
}

function getEdges(data) {
    let edges = {left: 1E20, top: -1E20, bottom: 1E20, right: -1E20};
    edges.width = function () {
        return this.right - this.left;
    }
    edges.height = function () {
        return this.top - this.bottom;
    }

    for (let i = 0; i < data.length; i++) {
        edges.left = Math.min(edges.left, data[i][0]);
        edges.right = Math.max(edges.right, data[i][0]);
        edges.bottom = Math.min(edges.bottom, data[i][1]);
        edges.top = Math.max(edges.top, data[i][1]);
    }

    return edges;
}

function niceStepByRange(range) {
    // console.log(range);
    // if (range < 0.2)
    //     return 0.01;
    let step = Math.pow(10, Math.floor(Math.log10(range)) - 1);
    if (range / step > 35) {
        return step * 5;
    } else if (range / step > 20) {
        return step * 2;
    } else {
        return step;
    }
}

function shortNumString(num) {
    let negative = false;
    if (num < 0) {
        negative = true;
        num *= -1;
    }
    let n = 0;
    while (num >= 100) {
        num = Math.floor(num) / 1000;
        n += 3;
    }
    if (n === 0) {
        if (negative)
            return -num;
        else
            return num;
    }
    if (negative)
        return "-" + num + "E" + n;
    else
        return num + "E" + n;
}

function max(ar, getValue) {
    let max = -Infinity;
    for (let key in ar) {
        if (getValue(ar[key]) > max) {
            max = getValue(ar[key]);
        }
    }
    return max;
}

function derivative(data) {
    let der = [];
    der[0] = [data[0][0], 0];
    for (let i = 1; i + 1 < data.length; i++) {
        let x = data[i][0];
        let dx = data[i + 1][0] - data[i - 1][0];
        let dy = data[i + 1][1] - data[i - 1][1];
        der[i] = [x, dy / dx];
    }
    der[data.length - 1] = [data[data.length - 1][0], 0];

    return smooth(der);
}

function smooth(data) {
    let result = [];
    let radius = 100;
    let power = 2;
    let radiusPowered = Math.pow(radius, power);
    for (let i = 0; i < data.length; i++) {
        let weight = 0;
        let value = 0;
        for (let ii = Math.max(i, radius) - i - radius; ii <= radius && i + ii < data.length; ii++) {
            if (i + ii < 0)
                continue;
            let w = radiusPowered - Math.pow(ii, power);
            // let w = Math.pow(1 - ii/radius, power);// / (1 + Math.pow(ii, power));radiusPowered - Math.pow(ii, power);
            value += data[i + ii][1] * w;
            weight += w;
        }
        result[i] = [data[i][0], value / weight]
    }

    return result;
}

function derivativeV2(data) {
    der = [];

    // der[0] = [data[0][0],
    //     (data[1][1] - data[0][1]) / (data[1][0] - data[0][0])
    // ];

    {
        let x = data[0][0];
        let dx = data[1][0] - data[0][0];
        let dy = data[1][1] - data[0][1];
        der[0] = [x, dy / dx];
    }
    let pl = 1;
    for (let i = 1; i + Math.max(pl, 1) < data.length; i++) {
        let x = data[i][0];
        let dx = data[i + pl][0] - data[i - 1][0];
        let dy = data[i + pl][1] - data[i - 1][1];
        der[i] = [x, dy / dx];
    }

    let precision = 10;

    if (precision == 1) {
        let x = data[data.length - 1][0];
        let dydx = der[der.length - 1];
        der[data.length - 1] = [x, dydx[1]];
        return der;
    }

    ders = [[]];
    for (let i = 0; i < precision; i++) {
        ders[0][i] = der[der.length - precision + i];
    }

    for (let i = 1; i < precision; i++) {
        ders[i] = []
        for (let j = 0; j < precision - i; j++) {
            ders[i][j] = [
                ders[i - 1][j + 1][0],
                (ders[i - 1][j + 1][1] - ders[i - 1][j][1]) / (ders[i - 1][j + 1][0] - ders[i - 1][j][0])
            ];
        }
    }

    let lastX = data[data.length - 1][0]
    let lastDX = lastX - data[data.length - 2][0];

    for (let i = 7; i < precision - 1; i++) {
        let dersLine = ders[precision - 1 - i];
        let prevLine = ders[precision - 2 - i];
        prevLine[prevLine.length] = [
            lastX,
            prevLine[prevLine.length - 1][1] + dersLine[dersLine.length - 1][1] * lastDX
        ]
    }

    der[der.length] = ders[0][precision];

    // let prevLastDer = der[der.length - 2];
    // let lastDer = der[der.length - 1];
    // let lastPoint = data[data.length - 1];
    //
    // let der2 = (lastDer[1] - prevLastDer[1])/(lastDer[0] - prevLastDer[0]);
    // der[der.length] = [lastPoint[0], lastDer[1] + der2 * (lastPoint[0] - lastDer[0])];

    derOut = [];
    let radius = 100
    let power = 4;
    for (let i = 0; i < der.length; i++) {
        let weight = 0;
        let value = 0;
        for (let ii = -radius; ii <= radius; ii++) {
            if (i + ii < 0 || i + ii >= der.length)
                continue;
            let w = Math.pow(radius, power) - Math.pow(ii, power);
            // let w = 1/(Math.cosh(ii))
            value += der[i + ii][1] * w;
            weight += w;
        }
        derOut[i] = [der[i][0], value / weight]
    }
    // derOut[der.length - 1] = der[der.length - 1];

    return derOut;
}

function derivativeOld(data) {
    let der = [];

    der[0] = [data[0][0], (data[1][1] - data[0][1]) / (data[1][0] - data[0][0])];

    for (let i = 1; i + 1 < data.length; i++) {
        let x = data[i][0];
        let dx = data[i + 1][0] - data[i - 1][0];
        let dy = data[i + 1][1] - data[i - 1][1];
        der[i] = [x, dy / dx];
    }

    let precision = 20;

    let ders = [[]];
    for (let i = 0; i < precision; i++) {
        ders[0][i] = der[der.length - precision + i];
    }

    for (let i = 1; i < precision; i++) {
        ders[i] = []
        for (let j = 0; j < precision - i; j++) {
            ders[i][j] = [
                ders[i - 1][j + 1][0],
                (ders[i - 1][j + 1][1] - ders[i - 1][j][1]) / (ders[i - 1][j + 1][0] - ders[i - 1][j][0])
            ];
        }
    }

    let lastX = data[data.length - 1][0]
    let lastDX = lastX - data[data.length - 2][0];

    for (let i = 0; i < precision - 1; i++) {
        let dersLine = ders[precision - 1 - i];
        let prevLine = ders[precision - 2 - i];
        prevLine[prevLine.length] = [
            lastX,
            prevLine[prevLine.length - 1][1] + dersLine[dersLine.length - 1][1] * lastDX
        ]
    }

    der[der.length] = ders[0][precision];

    // let prevLastDer = der[der.length - 2];
    // let lastDer = der[der.length - 1];
    // let lastPoint = data[data.length - 1];
    //
    // let der2 = (lastDer[1] - prevLastDer[1])/(lastDer[0] - prevLastDer[0]);
    // der[der.length] = [lastPoint[0], lastDer[1] + der2 * (lastPoint[0] - lastDer[0])];

    return der;
}