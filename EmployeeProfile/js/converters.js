(function (WinJS) {
  
    var totalCount = WinJS.Binding.converter(function (group) {
        var items = Data.getItemsFromGroup(group);

        return items.length;
    });

    WinJS.Namespace.define("Converters", {
        totalCount: totalCount,
    });
})(WinJS);
