(function (WinJS) {
  
    var totalCount = WinJS.Binding.converter(function (group) {
        var items = Data.getItemsFromGroup(group);

        return items.length;
    });

    var skills = WinJS.Binding.converter(function (skills) {
        return skills.join();
    });

    WinJS.Namespace.define("Converters", {
        totalCount: totalCount,
        skills: skills,
    });
})(WinJS);
