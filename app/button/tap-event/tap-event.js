var vm = require("../../main-page/main-view-model").mainViewModel;

module.exports.pageLoaded = function (args) {
    var that = this,
        page = args.object;

    that.counter = 0;

    vm.onTap = function () {
        that.counter++;
        vm.set("countMessage", "Tapped " + that.counter + " times!");
    };

    page.bindingContext = vm;

    vm.set("countMessage", "Tapped " + that.counter + " times!");
};
