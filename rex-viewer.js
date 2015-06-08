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
    console.log("version:", version, "layers:", layerCount);
    var layers = [];
    while (offset < data.byteLength) {
        var width = dataView.getUint32(offset, true);
        var height = dataView.getUint32(offset+4, true);
        offset += 8;
        if (width == 0 || height == 0) break; // avoid looping forever
        // console.log("processing layer", layers.length + ":", width, "x", height);
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

function drawRex(rexFile) {
    var layers = rexFile.layers;
    var layerWidth = layers[0].length;
    var layerHeight = layers[0][0].length;

    var div = document.createElement('div');
    div.style.backgroundColor = 'black';
    div.style.width = layerWidth * tileWidth;
    div.style.height = layerHeight * tileHeight;

    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var canvas = drawLayer(layer);
        div.appendChild(canvas);
    }

    return div;
}

function drawLayer(layer) {
    var layerWidth = layer.length;
    var layerHeight = layer[0].length;

    console.log("drawing layer", layerWidth, "x", layerHeight);

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = layerWidth * tileWidth;
    canvas.height = layerHeight * tileHeight;
    canvas.style.position = 'absolute';

    for (var x = 0; x < layer.length; x++) {
        for (var y = 0; y < layer[x].length; y++) {
            drawTile(ctx, layer[x][y], x, y);
        }
    }
    return canvas;
}

function inter(start, fraction, end) {
    return (start + fraction*(end-start))|0;
}

function drawTile(dst, tile, x, y) {
    // if (tile.charCode != 32)
    //     console.log("drawing tile", tile.charCode, "at", dx, ',', dy)
    // magenta background indicates a transparent cell
    if (tile.bgColor == "rgb(255,0,255)") return;

    var w = tileWidth;
    var h = tileHeight;
    var sx = (tile.charCode % 16) * w;
    var sy = (tile.charCode / 16 | 0 ) * h;
    var dx = x * w;
    var dy = y * h;

    var tileData = tilesetC.getImageData(sx, sy, w, h);
    var data = tileData.data;
    for (var i = 0; i < data.length; i+=4) {
        // console.log(data[i], inter(tile.bgR, (data[i]/255), tile.fgR));
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
