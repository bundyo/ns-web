var vm = require("../main-page/main-view-model");

exports.loaded = function(args) {
    args.object.bindingContext = vm;
};
