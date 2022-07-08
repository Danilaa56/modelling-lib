CanvasRenderingContext2D.prototype.width = CanvasRenderingContext2D.prototype.width || function () {
    return this.canvas.width;
}

CanvasRenderingContext2D.prototype.height = CanvasRenderingContext2D.prototype.height || function () {
    return this.canvas.height;
}

CanvasRenderingContext2D.prototype.clear = CanvasRenderingContext2D.prototype.clear || function () {
    this.save();
    this.setTransform(1, 0, 0, 1, 0, 0);
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.restore();
};

CanvasRenderingContext2D.prototype.reset = CanvasRenderingContext2D.prototype.reset || function () {
    this.setTransform(1, 0, 0, 1, 0, 0);
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.customTransform.loadIdentity();
};

CanvasRenderingContext2D.prototype.invertY = CanvasRenderingContext2D.prototype.invertY || function () {
    this.translate(0, this.height());
    this.scale(1, -1);
}

CanvasRenderingContext2D.prototype.drawLine = function (x1, y1, x2, y2) {
    this.beginPath();
    this.moveTo(x1, y1);
    this.lineTo(x2, y2);
    this.stroke();
    this.closePath();
}

CanvasRenderingContext2D.prototype.drawPath = function (data) {
    if (data.length < 2) {
        return;
    }
    this.beginPath();
    this.moveTo(data[0][0], data[0][1]);
    for (let i in data) {
        this.lineTo(data[i][0], data[i][1]);
    }
    this.stroke();
    this.closePath();
}

CanvasRenderingContext2D.prototype.zone = {
    minX: 0, maxX: 0,
    minY: 0, maxY: 0,
}

CanvasRenderingContext2D.prototype.activeZone = function (zone) {
    let fraction = zone.fraction;
    let tranFrac = (1 - fraction) / 2;
    let width = this.canvas.width;
    let height = this.canvas.height;

    this.translate(width * tranFrac, height * tranFrac);

    let pixelsPerMeter = Math.min(
        width * fraction / (zone.maxX - zone.minX),
        height * fraction / (zone.maxY - zone.minY));

    this.scale(pixelsPerMeter, pixelsPerMeter);
    this.zone = {
        minX: 0, maxX: width * fraction / pixelsPerMeter,
        minY: 0, maxY: height * fraction / pixelsPerMeter,
    }
    this.translateCoordinates(-zone.minX, -zone.minY);
}

CanvasRenderingContext2D.prototype.normalTranslate = CanvasRenderingContext2D.prototype.translate;
CanvasRenderingContext2D.prototype.translate = function (x, y) {
    if (x === 0 && y === 0) return;
    this.normalTranslate(x, y);
}

CanvasRenderingContext2D.prototype.follow = function (x, y) {
    this.translateCoordinates(this.zone.minX - Math.min(x, this.zone.minX), this.zone.minY - Math.min(y, this.zone.minY));
    this.translateCoordinates(this.zone.maxX - Math.max(x, this.zone.maxX), this.zone.maxY - Math.max(y, this.zone.maxY));
}

CanvasRenderingContext2D.prototype.customTransform = {
    x: 0,
    y: 0,
    xScale: 1,
    yScale: 1,
    loadIdentity: function () {
        this.x = 0;
        this.y = 0;
        this.xScale = 1;
        this.yScale = 1;
    }
};

CanvasRenderingContext2D.prototype.scaleCoordinates = function (xScale, yScale) {
    this.customTransform.xScale *= xScale;
    this.customTransform.yScale *= yScale;
};
CanvasRenderingContext2D.prototype.translateCoordinates = function (x, y) {
    this.zone.minX -= x;
    this.zone.maxX -= x;
    this.zone.minY -= y;
    this.zone.maxY -= y;
    this.customTransform.x += x * this.customTransform.xScale;
    this.customTransform.y += y * this.customTransform.yScale;
};
{
    let usualMoveTo = CanvasRenderingContext2D.prototype.moveTo;
    CanvasRenderingContext2D.prototype.moveTo = function (x, y) {
        let customTransform = this.customTransform;
        usualMoveTo.call(this, x * customTransform.xScale + customTransform.x, y * customTransform.yScale + customTransform.y);
    };
    let usualLineTo = CanvasRenderingContext2D.prototype.lineTo;
    CanvasRenderingContext2D.prototype.lineTo = function (x, y) {
        let customTransform = this.customTransform;
        usualLineTo.call(this, x * customTransform.xScale + customTransform.x, y * customTransform.yScale + customTransform.y);
    };
    let usualFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y) {
        let customTransform = this.customTransform;
        usualFillText.call(this, text, x * customTransform.xScale + customTransform.x, y * customTransform.yScale + customTransform.y);
    };
}