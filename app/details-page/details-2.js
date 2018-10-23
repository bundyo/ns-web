var frames = require("ui/frame"),
    vmModule = require("../main-page/main-view-model");

function pageNavigatedTo(args) {
    var page = args.object;
    page.bindingContext = vmModule.mainViewModel;
}
exports.pageNavigatedTo = pageNavigatedTo;

function hideSlideout() {
    frames.topmost().goBack();
}
exports.hideSlideout = hideSlideout;
