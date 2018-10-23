var frames = require("ui/frame");
var platform = require("platform");
var vmModule = require("./main-view-model");
var twoPaneLayout = Math.min(platform.screen.mainScreen.widthDIPs, platform.screen.mainScreen.heightDIPs) > 600;

vmModule.mainViewModel.set("message", "test");
vmModule.mainViewModel.set("goBack", function () {
    frames.topmost().goBack();
});
vmModule.mainViewModel.set("onTap", () => {
    console.log("tappity");
});

function pageLoaded(args) {
    var page = args.object;
    page.bindingContext = vmModule.mainViewModel;
}
exports.pageLoaded = pageLoaded;

function showSlideout() {
    vmModule.mainViewModel.items.setItem(2, { title: "title", info: "info" });
    vmModule.mainViewModel.items.setItem(5, { title: "title 2", info: "info 2" });
    frames.topmost().navigate("details-page/details-page");
}
exports.showSlideout = showSlideout;

exports.showButtons = function () {
    frames.topmost().navigate("button/button");
};

function listViewItemTap(args) {
//    if (!twoPaneLayout) {
        frames.topmost().navigate("details-page/details-2");
//    }
    vmModule.mainViewModel.set("selectedItem", args.view.bindingContext);
}
vmModule.mainViewModel.listViewItemTap = listViewItemTap;
exports.listViewItemTap = listViewItemTap;
