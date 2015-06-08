var rex = null;
var tileset = null;

$("tileset").onload = function() {
    tileset = updateTileset();
    updateDrawnRex();
}

function updateTileset() {
    var tilesetImg = $('tileset');
    var tilesetName = $('tileset-name').textContent;
    var tileset = rexViewer.makeTileset(tilesetImg, tilesetName);
    $('tileset-dims').textContent = '('+tileset.width+'x'+tileset.height+')';
    return tileset;
}

function updateDrawnRex() {
    if (!rex) return;
    if (!tileset) {
        tileset = updateTileset();
    }

    $('xp-dims').textContent = '('+rex.layers[0].length+'x'+rex.layers[0][0].length+')';

    var el = $('drawn-rex');
    el.innerHTML = '';
    var div = rexViewer.drawRexToDOM(el, rex, tileset);
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
        rex = rexViewer.parseXPFile(reader.result);
        updateDrawnRex();
    };
    reader.readAsBinaryString(file);
});

/* load dwarf image on initial page load */
util.request('art/Dwarf_DragonDePlatino.xp', {
    onload: function(e) {
        rex = parseXPFile(this.response);
        updateDrawnRex();
    }
})
.overrideMimeType("text/plain; charset=x-user-defined")
