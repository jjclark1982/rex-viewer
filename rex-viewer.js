if (typeof document === 'undefined') {
    var Canvas = require('canvas');
    function makeCanvas(width, height) {
        var canvas = new Canvas(width, height);
        return canvas;
    }
}
else {
    function makeCanvas(width, height) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
}

function getColor(dataView, offset) {
    var r = dataView.getUint8(offset);
    var g = dataView.getUint8(offset+1);
    var b = dataView.getUint8(offset+2);
    return 'rgb('+r+','+g+','+b+')';
}

function parseXPFile(xpFile) {
    var data = pako.inflate(xpFile);
    var dataView = new DataView(data.buffer);
    var offset = 0;
    var version = dataView.getInt32(0, true);
    var layerCount = dataView.getUint32(4, true) % 10000;
    offset += 8;
    console.error("version:", version, "layers:", layerCount);
    var layers = [];
    while (offset < data.byteLength) {
        var width = dataView.getUint32(offset, true);
        var height = dataView.getUint32(offset+4, true);
        offset += 8;
        if (width == 0 || height == 0) break; // avoid looping forever
        // console.error("processing layer", layers.length + ":", width, "x", height);
        var layer = [];
        for (var x = 0; x < width; x++) {
            layer[x] = [];
            for (var y = 0; y < height; y++) {
                var tile = {
                    charCode: dataView.getInt32(offset, true),
                    fgColor: getColor(dataView, offset+4),
                    bgColor: getColor(dataView, offset+7),
                    fgR: dataView.getUint8(offset+4),
                    fgG: dataView.getUint8(offset+5),
                    fgB: dataView.getUint8(offset+6),
                    bgR: dataView.getUint8(offset+7),
                    bgG: dataView.getUint8(offset+8),
                    bgB: dataView.getUint8(offset+9),
                };
                offset += 10;
                layer[x].push(tile);
            }
        }
        layers.push(layer);
    }
    var rexFile = {
        version: version,
        layers: layers
    }
    return rexFile;
}

function drawRex(rexFile, tileset) {
    var layers = rexFile.layers;
    var layerWidth = layers[0].length;
    var layerHeight = layers[0][0].length;

    var div = document.createElement('div');
    div.style.backgroundColor = 'black';
    div.style.width = layerWidth * tileset.width;
    div.style.height = layerHeight * tileset.height;

    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var canvas = drawLayer(layer, tileset);
        canvas.style.position = 'absolute';
        div.appendChild(canvas);
    }

    return div;
}

function drawLayer(layer, tileset) {
    var layerWidth = layer.length;
    var layerHeight = layer[0].length;

    console.error("drawing layer", layerWidth, "x", layerHeight);

    var width = layerWidth*tileset.width;
    var height = layerHeight*tileset.height;
    var canvas = makeCanvas(width, height);

    var ctx = canvas.getContext('2d');
    for (var x = 0; x < layer.length; x++) {
        for (var y = 0; y < layer[x].length; y++) {
            drawTile(ctx, tileset, layer[x][y], x, y);
        }
    }
    return canvas;
}

function inter(start, fraction, end) {
    return (start + fraction*(end-start))|0;
}

function drawTile(dst, tileset, tile, x, y) {
    // if (tile.charCode != 32)
    //     console.error("drawing tile", tile.charCode, "at", dx, ',', dy)
    // magenta background indicates a transparent cell
    if (tile.bgColor == "rgb(255,0,255)") return;

    var w = tileset.width;
    var h = tileset.height;
    var sx = (tile.charCode % tileset.rowLength     ) * w;
    var sy = (tile.charCode / tileset.rowLength | 0 ) * h;
    var dx = x * w;
    var dy = y * h;

    var tileData = tileset.context.getImageData(sx, sy, w, h);
    var data = tileData.data;
    for (var i = 0; i < data.length; i+=4) {
        // console.error(data[i], inter(tile.bgR, (data[i]/255), tile.fgR));
        data[i  ] = inter(tile.bgR, (data[i  ]/255), tile.fgR);
        data[i+1] = inter(tile.bgG, (data[i+1]/255), tile.fgG);
        data[i+2] = inter(tile.bgB, (data[i+2]/255), tile.fgB);
    }
    dst.putImageData(tileData, dx, dy);
}

var rexViewer = {
    parseXPFile: parseXPFile,
    drawRex: drawRex,
    drawLayer: drawLayer,
    drawTile: drawTile
};

if (typeof module !== 'undefined') {
    module.exports = rexViewer;
}
