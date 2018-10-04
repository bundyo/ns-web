var observable = require("data/observable");
var observableArray = require("data/observable-array");
var ViewModelItem = (function () {
    function ViewModelItem(title, info) {
        this.title = title;
        this.info = info;
    }
    return ViewModelItem;
}());
exports.ViewModelItem = ViewModelItem;
var items = new observableArray.ObservableArray();
for (var i = 0; i < 20; i++) {
    items.push(new ViewModelItem("Item " + i, "This is the item with number " + i + "."));
}
exports.mainViewModel = new observable.Observable();
exports.mainViewModel.set("items", items);
