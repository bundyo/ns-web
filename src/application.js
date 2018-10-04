const utils = require("./utils"),
    Class = utils.Class,
    req = require.context("../../app", true, /\.(js|xml|html|css)$/),
    tagRegExp = /(<\/?)((?!\?|\\|!|au-)\S*?)(\s|>)/g,
    selfClosingRegExp = /<([^\s/>]+?)(\s[^>]*?)\/>|<([\w:-]+?)\/>/g,
    modules = [],
    Application = Class.extend({
        started: null,

        init: function (entry) {
        },

        setEntry: function (entry) {
            this.entry = entry;
        },

        renderModule: function (module, placeholder, parentModule) {
            var that = this,
                template,
                binding,
                found;

            module = module.replace("./", "");

            parentModule && (parentModule = parentModule.replace(/\/[^/]*$/, ""));

            utils.tryCatch(function () {
                template = req("./" + module + ".xml");
            }, function () {
                utils.tryCatch(function () {
                    template = req("./" + (parentModule || module) + "/" + module + ".xml");
                }, function () {
                    utils.tryCatch(function () {
                        template = req("./" + module + ".html");
                    }, function () {
                        if (!template) {
                            template = req("./" + (parentModule || module) + "/" + module + ".html");
                        }
                    });
                });
            });

            if (template) {
                utils.tryCatch(req.bind("./" + module + ".css"));

                template = template.replace(/\sxmlns="[^"]*?"/ig, "")
                    .replace(/<!--[\s\S]*?-->/gm, "")
                    .replace(tagRegExp, function (match, g1, g2, g3) {
                        return g1 + "ns-" + utils.dashCase(g2) + g3;
                    })
                    .replace(selfClosingRegExp, function (match, g1, g2, g3) {
                        return "<" + (g3 ? g3 : g1 + (g2 ? g2 : "")) + "></" + (g3 || g1) + ">";
                    });

                var render = utils.parseHTML(template.trim())[0];

                modules[module] = (placeholder || document.body).appendChild(render);

                modules[module].component = modules[module].__instance.proxy.__data;
                modules[module].__nsBindings = {
                    __calculated: {}
                };

                var attributes = modules[module].__instance.get();

                utils.forEach.call(Object.keys(attributes), function (attr) {
                    var xmlNamespace = attr.indexOf("xmlns:") === 0,
                        namespace = "ns-" + attr.replace("xmlns:", "") + ":",
                        value = attributes[attr],
                        treeWalker = document.createTreeWalker(modules[module], NodeFilter.SHOW_ELEMENT);

                    while (true) {
                        if (xmlNamespace && treeWalker.currentNode.localName.indexOf(namespace) === 0) {
                            that.renderModule(value + "/" + treeWalker.currentNode.localName.replace(namespace, ""), treeWalker.currentNode, module);
                        }

                        var attribs = treeWalker.currentNode.attributes;

                        utils.forEach.call(attribs, function (value) {
                            if (value.nodeValue[0] === "{") {
                                var expression = value.nodeValue.replace(/^\{+?([^{}]*?)}+?$/g, "$1").trim();

                                if (/^\w+$/.test(expression)) {
                                    binding = modules[module].__nsBindings[expression];

                                    if (!binding) {
                                        binding = [];
                                    }

                                    found = false;
                                    utils.forEach.call(binding, function (item) {
                                        if (item.element == treeWalker.currentNode &&
                                            item.attr === value.nodeName) {
                                            found = true;
                                        }
                                    });

                                    if (!found) {
                                        binding.push({
                                            element: treeWalker.currentNode,
                                            attr: value.nodeName
                                        });

                                        modules[module].__nsBindings[expression] = binding;
                                    }
                                } else {
                                    binding = modules[module].__nsBindings.__calculated[value.nodeName];

                                    if (!binding) {
                                        binding = [];
                                    }

                                    found = false;
                                    utils.forEach.call(binding, function (item) {
                                        if (item[value.nodeName] &&
                                            item.element == treeWalker.currentNode) {
                                            found = true;
                                        }
                                    });

                                    if (!found) {
                                        binding.push({
                                            element: treeWalker.currentNode,
                                            expr: utils.createFunction(expression)
                                        });

                                        modules[module].__nsBindings.__calculated[value.nodeName] = binding;
                                    }
                                }
                            }
                        });

                        if (!treeWalker.nextNode()) {
                            break;
                        }
                    }
                });

                return modules[module];
            }
        },

        scheduleAnimation: function (currentEntry, nextEntry, callback) {
            if (currentEntry) {
                var prevElement = currentEntry.resolvedPage.sender,
                    nextElement = nextEntry.resolvedPage.sender,
                    parentElement = nextElement.parentElement,
                    transitionEnd = function () {
                        parentElement.removeEventListener("transitionend", transitionEnd);

                        parentElement.classList.remove("ns-fx", "ns-fx-end", "ns-fx-start", "ns-fx-slide", "ns-fx-reverse");

                        prevElement.classList.add("ns-fx-hidden");
                        prevElement.classList.remove("ns-fx-current", "ns-fx-next");
                        nextElement.classList.remove("ns-fx-next", "ns-fx-current");
                        callback();
                    };

                if (currentEntry.isBack) {
                    parentElement.classList.add("ns-fx-reverse");
                }

                prevElement.classList.add("ns-fx-current");
                nextElement.classList.add("ns-fx-next");

                prevElement.classList.remove("ns-fx-hidden");
                nextElement.classList.remove("ns-fx-hidden");

                parentElement.classList.add("ns-fx", "ns-fx-start", "ns-fx-slide");
                nextElement.offsetWidth;

                parentElement.transitionHandled = false;
                parentElement.addEventListener("transitionend", transitionEnd);

                parentElement.classList.remove("ns-fx-start");
                parentElement.classList.add("ns-fx-end");
            } else {
                callback();
            }
        },

        start: function (options) {
            var that = this;

            that.onLoaded = that.onLoaded.bind(that, options);
            document.addEventListener("DOMContentLoaded", that.onLoaded);
        },

        onLoaded: function (options) {
            var that = this;

            document.removeEventListener("DOMContentLoaded", that.onLoaded);

            that.renderModule(options.moduleName);
            //this.navigate(options.moduleName);
        }
    }),
    application = new Application();

module.exports = application;
