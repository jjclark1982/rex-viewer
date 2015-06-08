var rexFile = null;
var tileset = null;

$("tileset").onload = function() {
    tileset = updateTileset();
    updateDrawnRex();
}

function updateTileset() {
    var tilesetImg = $('tileset');
    var tilesetName = $('tileset-name').textContent;
    var tileWidth, tileHight;
    var match = tilesetName.match(/(\d+)x(\d+)/);
    if (match) {
        tileWidth = match[1]
        tileHeight = match[2]        
    }
    else {
        // assume 16x16 layout
        tileWidth = tilesetImg.naturalWidth / 16;
        tileHeight = tilesetImg.naturalHeight / 16;        
    }
    $('tileset-dims').textContent = '('+tileWidth+'x'+tileHeight+')';
    var rowLength = tilesetImg.naturalWidth / tileWidth;

    var canvas = document.createElement('canvas');
    canvas.width = tilesetImg.naturalWidth;
    canvas.height = tilesetImg.naturalWidth;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(tilesetImg, 0, 0);

    var tileset = {
        width: tileWidth,
        height: tileHeight,
        rowLength: rowLength,
        canvas: canvas,
        context: ctx
    }
    return tileset;
}

function updateDrawnRex() {
    if (!rexFile) return;
    if (!tileset) {
        tileset = updateTileset();
    }

    $('xp-dims').textContent = '('+rexFile.layers[0].length+'x'+rexFile.layers[0][0].length+')';

    var div = rexViewer.drawRex(rexFile, tileset);
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
    var reader = new FileReader();
    reader.onload = function(e){
        $('tileset-name').textContent = file.name;
        var dataURL = reader.result;
        $('tileset').src = dataURL;
    };
    reader.readAsDataURL(file);
});

handleDroppedFiles($("drop-xp"), function(file){
    var reader = new FileReader();
    reader.onload = function(e){
        $('xp-name').textContent = file.name;
        rexFile = rexViewer.parseXPFile(reader.result);
        updateDrawnRex();
    };
    reader.readAsBinaryString(file);
});

/* load dwarf image on initial page load */
util.request('art/Dwarf_DragonDePlatino.xp', {
    onload: function(e) {
        rexFile = parseXPFile(this.response);
        updateDrawnRex();
    }
})
.overrideMimeType("text/plain; charset=x-user-defined")
