var vm = require("../../main-page/main-view-model").mainViewModel,
    texts = [
        "Text bound",
        "VM Bound",
        "Just Bound"
    ];

module.exports.pageLoaded = function (args) {
    var page = args.object;

    page.bindingContext = vm;

    vm.set("content", "Text bound");
};

module.exports.rebind = function () {
    vm.set("content", texts[Math.floor(Math.random(1)*3)]);
};
