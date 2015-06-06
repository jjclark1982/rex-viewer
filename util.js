// A minimal library for "$"-style web applications.

$ = document.getElementById.bind(document);
$$ = document.querySelectorAll.bind(document);

function parseQuery(str) {
    var obj = {};
    var pairs = str.split(/&/);
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split(/=/);
        if (pair.length < 2) {
            continue;
        }
        var key = decodeURIComponent(pair[0].replace(/\+/g, '%20'));
        var val = decodeURIComponent(pair[1].replace(/\+/g, '%20'));
        obj[key] = val;
    }
    return obj;
}

function serializeQuery(obj) {
    var pairs = [];
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        var key   = encodeURIComponent(    keys[i] ).replace(/%20/g, '+');
        var value = encodeURIComponent(obj[keys[i]]).replace(/%20/g, '+');
        pairs.push(key+'='+value);
    }
    return pairs.join('&');
}

// Make an HTTP request with the given options.
function request(url, options) {
    var xhr = new XMLHttpRequest();
    // standard arguments get treated specially. here are their default values:
    var args = {
        method: 'GET',
        async: true,
        query: null,
        headers: {},
        body: null
    };
    // any additional options get set directly on the xhr object.
    // this allows the calling function to specify arbitrary parameters such as 'onload'.
    options = options || {};
    for (var i in options) {
        if (args.hasOwnProperty(i)) {
            args[i] = options[i];
        }
        else {
            xhr[i] = options[i];
        }
    }
    if (args.query && typeof args.query !== 'string') {
        url = url + '?' + serializeQuery(args.query);
    }
    // serialize body as specified by Content-Type header
    if (args.body && typeof args.body !== 'string') {
        var contentType;
        for (var header in args.headers) {
            if (header.toLowerCase() == 'content-type') {
                contentType = args.headers[header];
                break;
            }
        }
        if (!contentType) {
            contentType = args.headers['Content-Type'] = 'application/json';
        }
        if (contentType == 'application/json') {
            args.body = JSON.stringify(args.body);
        }
        else if (contentType == 'application/x-www-form-urlencoded') {
            args.body = serializeQuery(args.body);
        }
    }
    xhr.open(args.method, url, args.async);
    for (var name in args.headers) {
        var value = args.headers[name];
        xhr.setRequestHeader(name, value);
    }
    xhr.send(args.body);
    return xhr;
}

// Fill in an element with the given value.
// Uses value for input elements, and text otherwise. Cross-browser compatible.
function setText(field, value) {
    var props = ['value', 'textContent', 'innerText'];
    for (var i in props) {
        var prop = props[i];
        if (prop in field) {
            field[prop] = value;
            return;
        }
    }
}

// Create a DOM element from a template string or element,
// and fill in named fields with values from `context`.
function render(template, context) {
    var container = document.createElement('div');
    var templateText = template.innerHTML || template;
    container.innerHTML = templateText.trim();
    var el = container.firstChild;
    for (var key in context) {
        var value = context[key];
        var selector = '[name="'+key+'"]';
        var fields = el.querySelectorAll(selector);
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            setText(field, value);
        }
    }
    return el;
}

function onEvent(element, type, handler) {
    if (element.addEventListener) {
        element.addEventListener(type, handler, false);
    } else if (element.attachEvent) {
        element.attachEvent("on" + type, handler);
    } else {
        element["on" + type] = handler;
    }
}

var util = {
    $: $,
    $$: $$,
    request: request,
    serializeQuery: serializeQuery,
    parseQuery: parseQuery,
    render: render,
    setText: setText,
    onEvent: onEvent
};

if (typeof module !== 'undefined') {
    module.exports = util;
}
else {
    this.$ = $;
    this.$$ = $$;
}
