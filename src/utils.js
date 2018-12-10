const dashRegExp = /-(.)/g,
    dashCapitalRegExp = /([a-z\d])([A-Z])/g;

export function matches(element, query) {
    if (!element) {
        return true;
    }

    const matches = (element.matches || element.webkitMatchesSelector || element.msMatchesSelector);

    return matches ? matches.call(element, query) : true;
}

export function childOf(element, query) {
    while (!matches(element.parentElement, query)) {
        element = element.parentElement;
    }

    return element;
}

export function index(element) {
    if (element && element.parentElement) {
        return Array.from(element.parentElement.children).indexOf(element);
    }

    return -1;
}

export function forEach(callback, thisArg) {
    const that = this,
          isArray = that.length,
          collection = isArray ? that : Object.getOwnPropertyNames(that),
          len = collection.length;

    for (let i = 0; i < len; i++) {
        let index = isArray ? i : collection[i];

        if ((that instanceof NodeList && that.length && that[index]) ||
            (!(that instanceof NodeList) && that[index] !== undefined && that[index] !== null)) {
            callback.call(thisArg, that[index], index, that);
        }
    }

    return this;
}

const expr = function(expression) {
    expression = expression || "";

    if (expression && expression.charAt(0) !== "[") {
        expression = "." + expression;
    }

    expression = "d" + expression;

    return expression;
};

export function createFunction (expression) {
    new Function("d", "return " + expr(expression));
}

export function tryCatch(aargh, yeeah) {
    const rest = Array.prototype.slice.call(arguments, 2);

    try {
        aargh.call(this, rest[0], rest[1], rest[2]);
    } catch (e) {
        if (yeeah) {
            yeeah.call(this, e, rest[0], rest[1], rest[2]);
        }
    }
}

export function dashCase(str) {
    return str.replace(dashCapitalRegExp, '$1-$2').replace(/\./g, "-").toLowerCase();
}

export function camelCase(str) {
    return str.toLowerCase().replace(dashRegExp, function (m, g1) {
        return g1.toUpperCase();
    });
}

export function extend(deep) {
    let output,
        i = 1;

    if (typeof arguments[0] === 'boolean') {
        i = 2;
        output = arguments[1];
    } else {
        deep = false;
        output = arguments[0];
    }

    const merge = function (obj) {
        for (const prop in obj) {
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
        const obj = arguments[i];
        merge(obj);
    }

    return output;
}

export function Class() {}

Class.extend = function(proto) {
    const base = function() {},
          that = this,
          subclass = proto && proto.init ? proto.init : function () {
              that.apply(this, arguments);
          };

    base.prototype = that.prototype;

    const fn = subclass.fn = subclass.prototype = new base();

    for (let member in proto) {
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

let DOMParser = window.DOMParser;

const DOMParser_proto = DOMParser.prototype,
      real_parseFromString = DOMParser_proto.parseFromString;

tryCatch.call(this, function () {
    (new DOMParser).parseFromString("", "text/html");
}, function (ex) {
    DOMParser_proto.parseFromString = function (markup, type) {
        if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
            const doc = document.implementation.createHTMLDocument("");

            doc.documentElement.innerHTML = markup;

            return doc;
        } else {
            return real_parseFromString.apply(this, arguments);
        }
    };
});

DOMParser = new DOMParser;

export const parseDOMFromString = DOMParser.parseFromString.bind(DOMParser);

export function parseHTML(input) {
     const fragment = document.createDocumentFragment(),
         div = document.createElement("div");

     div.innerHTML = input;
     fragment.appendChild(div);

     return fragment.childNodes[0].childNodes;
}
