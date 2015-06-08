var rexFile = null;
var tileWidth = 0;
var tileHeight = 0;
var tileset = $("tileset");
var tilesetC = null;
tileset.onload = updateDrawnRex;

function updateDrawnRex() {
    if (!rexFile) return;

    var tilesetName = $('tileset-name').textContent;
    var match = tilesetName.match(/(\d+)x(\d+)/);
    if (match) {
        tileWidth = match[1]
        tileHeight = match[2]        
    }
    else {
        // assume 16x16 layout
        tileWidth = tileset.naturalWidth / 16;
        tileHeight = tileset.naturalHeight / 16;        
    }
    $('tileset-dims').textContent = '('+tileWidth+'x'+tileHeight+')';

    var canvas = document.createElement('canvas');
    canvas.width = tileset.naturalWidth;
    canvas.height = tileset.naturalWidth;
    tilesetC = canvas.getContext('2d');
    tilesetC.drawImage(tileset, 0, 0);

    $('xp-dims').textContent = '('+rexFile.layers[0].length+'x'+rexFile.layers[0][0].length+')';

    var div = rexViewer.drawRex(rexFile);
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
        var tileset = $('tileset');
        var dataURL = reader.result;
        tileset.src = dataURL;
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
