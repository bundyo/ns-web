var vm = require("../main-page/main-view-model").mainViewModel,
    frame = require("ui/frame");

module.exports.pageLoaded = function (args) {
    var page = args.object;

    page.bindingContext = vm;
};

module.exports.onTapBinding = function () {
    frame.topmost().navigate("button/binding-text/binding-text");
};

module.exports.onTapEvent = function () {
    frame.topmost().navigate("button/tap-event/tap-event");
};
