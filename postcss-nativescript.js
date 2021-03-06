var postcss = require('postcss'),
    digitRegExp = /^[\d\s]+$/,
    digitReplacementRegExp = /(\d+)+/g,
    dashCapitalRegExp = /([A-Z]?[a-z\d])([A-Z])/g,
    selectorRegExp = /(^\s?|>\s?|\+\s?|~\s?|,\s?|\s+)([A-Z]\w+?\b)/gm,
    dashCase = function (str) {
        return str.replace(dashCapitalRegExp, '$1-$2').toLowerCase();
    },
    sizeProps = {
        "font-size": true,
        fontSize: true,
        width: true,
        height: true,
        padding: true,
        margin: true,
        "padding-top": true,
        "padding-left": true,
        "padding-right": true,
        "padding-bottom": true,
        "margin-top": true,
        "margin-left": true,
        "margin-right": true,
        "margin-bottom": true,
        "border-radius": true,
        "min-height": true,
        "max-height": true,
        "min-width": true,
        "max-width": true,
        "border-width": true,
        border: true
    };

module.exports = postcss.plugin('postcss-nativescript', function (opts) {
    opts = opts || {};

    return function (css) {
        css.walk(function (node) {
            if (node.type === 'rule') {
                node.selector = node.selector.replace(selectorRegExp, (match, g1, g2) => {
                    return g1 + "ns-" + dashCase(g2);
                }).replace(/:highlighted|:pressed/gm, ":active").toLowerCase();
            }
        });

        css.walkDecls(function transformDecl(decl) {
            if (decl.prop === "horizontal-align" || decl.prop === "vertical-align") {
                decl.prop = 'align-self';

                switch (decl.value) {
                    case "left": decl.value = "flex-start"; break;
                    case "right": decl.value = "flex-end"; break;
                }
            }

            if (decl.prop in sizeProps && digitRegExp.test(decl.value)) {
                decl.value = decl.value.replace(digitReplacementRegExp, "$1px");
            }
        });
    };
});
