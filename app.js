var rexFile = null;
var tileWidth = 0;
var tileHeight = 0;
$("tileset").onload = updateDrawnRex;

function updateDrawnRex() {
    if (!rexFile) return;

    var tileset = $("tileset");
    tileWidth = tileset.naturalWidth / 16;
    tileHeight = tileset.naturalHeight / 16;

    var div = drawRex(rexFile);
    $('drawn-rex').innerHTML = '';
    $('drawn-rex').appendChild(div);
}

function handleDroppedFiles(dropTarget, callback) {
    util.onEvent(dropTarget, "dragenter", function(event){
        event.dataTransfer.effectAllowed = 'copyMove';
        event.dataTransfer.dropEffect = 'copy';
        dropTarget.style.backgroundColor = '#999';
        return true;
    });
    util.onEvent(dropTarget, "dragover", function(event){
        event.dataTransfer.effectAllowed = 'copyMove';
        event.dataTransfer.dropEffect = 'copy';
        dropTarget.style.backgroundColor = '#999';
        return true;
    });
    util.onEvent(dropTarget, "dragleave", function(event){
        dropTarget.style.backgroundColor = '';
        return true;
    });
    util.onEvent(dropTarget, "drop", function(event){
        dropTarget.style.backgroundColor = '';
        var file = event.dataTransfer.files[0];
        callback(file);
        return true;
    });
}

util.onEvent(document.body, "dragover", function(event){
    event.preventDefault();
});
util.onEvent(document.body, "drop", function(event){
    event.preventDefault();
});

handleDroppedFiles($("drop-tileset"), function(file){
    $('tileset-name').textContent = file.name;
    var reader = new FileReader();
    reader.onload = function(e){
        var tileset = $('tileset');
        var dataURL = reader.result;
        tileset.src = dataURL;
    };
    reader.readAsDataURL(file);
});

handleDroppedFiles($("drop-xp"), function(file){
    $('xp-name').textContent = file.name;
    var reader = new FileReader();
    reader.onload = function(e){
        rexFile = parseXPFile(reader.result);
        updateDrawnRex();
    };
    reader.readAsBinaryString(file);
});

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
    var layerCount = dataView.getInt32(4, true) % 10000;
    offset += 8;
    console.log("version:", version, "layers:", layerCount);
    var layers = [];
    while (offset < data.byteLength) {
        var layer = [];
        var width = dataView.getInt32(offset, true);
        var height = dataView.getInt32(offset+4, true);
        offset += 8;
        // console.log("processing layer", layers.length + ":", width, "x", height);
        for (var x = 0; x < width; x++) {
            layer[x] = [];
            for (var y = 0; y < height; y++) {
                var tile = {
                    charCode: dataView.getInt32(offset, true),
                    fgColor: getColor(dataView, offset+4),
                    bgColor: getColor(dataView, offset+7)
                };
                offset += 10;
                layer[x].push(tile);
            }
        }
        layers.push(layer);
    }
    return layers;
}

function drawRex(layers) {
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

function drawTile(ctx, tile, dx, dy) {
    // if (tile.charCode != 32)
    //     console.log("drawing tile", tile.charCode, "at", dx, ',', dy)
    // magenta background indicates a transparent cell
    if (tile.bgColor == "rgb(255,0,255)") return;

    var sx = tile.charCode % 16;
    var sy = tile.charCode / 16 | 0;

    var w = tileWidth;
    var h = tileHeight;

    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = tile.bgcolor;
    ctx.fillRect(dx*w, dy*h, w, h);
    ctx.drawImage(tileset, sx*w, sy*h, w, h, dx*w, dy*h, w, h);

    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = tile.fgColor;
    ctx.fillRect(dx*w, dy*h, w, h);
    ctx.drawImage(tileset, sx*w, sy*h, w, h, dx*w, dy*h, w, h);
}

util.request('art/Dwarf_DragonDePlatino.xp', {
    onload: function(e) {
        rexFile = parseXPFile(this.response);
        updateDrawnRex();
    }
})
.overrideMimeType("text/plain; charset=x-user-defined")
