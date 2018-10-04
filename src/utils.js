var dashRegExp = /-(.)/g,
    dashCapitalRegExp = /([a-z\d])([A-Z])/g;

function forEach(callback, thisArg) {
    var index,
        that = this,
        isArray = that.length,
        collection = isArray ? that : Object.getOwnPropertyNames(that),
        len = collection.length;

    for (var i = 0; i < len; i++) {
        index = isArray ? i : collection[i];

        if ((that instanceof NodeList && that.length && that[index]) ||
            (!(that instanceof NodeList) && that[index] !== undefined && that[index] !== null)) {
            callback.call(thisArg, that[index], index, that);
        }
    }

    return this;
}

var expr = function(expression) {
    expression = expression || "";

    if (expression && expression.charAt(0) !== "[") {
        expression = "." + expression;
    }

    expression = "d" + expression;

    return expression;
};

function createFunction (expression) {
    new Function("d", "return " + expr(expression));
}

function tryCatch(aargh, yeeah) {
    var rest = Array.prototype.slice.call(arguments, 2);

    try {
        aargh.call(this, rest[0], rest[1], rest[2]);
    } catch (e) {
        if (yeeah) {
            yeeah.call(this, e, rest[0], rest[1], rest[2]);
        }
    }
}

function dashCase(str) {
    return str.replace(dashCapitalRegExp, '$1-$2').replace(/\./g, "-").toLowerCase();
}

function camelCase(str) {
    return str.toLowerCase().replace(dashRegExp, function (m, g1) {
        return g1.toUpperCase();
    });
}

function extend(deep) {
    var output,
        i = 1;

    if (typeof arguments[0] === 'boolean') {
        i = 2;
        output = arguments[1];
    } else {
        deep = false;
        output = arguments[0];
    }

    var merge = function (obj) {
        for (var prop in obj) {
            if (deep && typeof obj[prop] === 'object') {
                output[prop] = extend(true, output[prop] || {}, obj[prop]);
            } else {
                if (obj[prop] !== undefined && obj[prop] !== null) {
                    output[prop] = obj[prop];
                }
            }
        }
    };

    for (; i < arguments.length; i++) {
        var obj = arguments[i];
        merge(obj);
    }

    return output;
}

function Class() {}

Class.extend = function(proto) {
    var base = function() {},
        member,
        that = this,
        subclass = proto && proto.init ? proto.init : function () {
            that.apply(this, arguments);
        },
        fn;

    base.prototype = that.prototype;
    fn = subclass.fn = subclass.prototype = new base();

    for (member in proto) {
        if (proto[member] != null && proto[member].constructor === Object) {
            fn[member] = extend(true, {}, base.prototype[member], proto[member]);
        } else {
            fn[member] = proto[member];
        }
    }

    fn.constructor = subclass;
    subclass.extend = that.extend;

    return subclass;
};

var DOMParser = window.DOMParser,
    DOMParser_proto = DOMParser.prototype,
    real_parseFromString = DOMParser_proto.parseFromString;

tryCatch.call(this, function () {
    (new DOMParser).parseFromString("", "text/html");
}, function (ex) {
    DOMParser_proto.parseFromString = function (markup, type) {
        if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
            var doc = document.implementation.createHTMLDocument("");

            doc.documentElement.innerHTML = markup;

            return doc;
        } else {
            return real_parseFromString.apply(this, arguments);
        }
    };
});

DOMParser = new DOMParser;

function parseHTML(input) {
     var fragment = document.createDocumentFragment(),
         div = document.createElement("div");

     div.innerHTML = input;
     fragment.appendChild(div);

     return fragment.childNodes[0].childNodes;
}

module.exports = {
    forEach: forEach,
    extend: extend,
    Class: Class,
    parseDOMFromString: DOMParser.parseFromString.bind(DOMParser),
    tryCatch: tryCatch,
    dashCase: dashCase,
    camelCase: camelCase,
    parseHTML: parseHTML,
    createFunction: createFunction
};
