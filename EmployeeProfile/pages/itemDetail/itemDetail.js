(function () {
    "use strict";

    var storage = Windows.Storage;
    var dtm = Windows.ApplicationModel.DataTransfer.DataTransferManager;
    var capture = Windows.Media.Capture;
    var _photo;
    var _video;
    var start = Windows.UI.StartScreen;
    var notify = Windows.UI.Notifications;
    var popups = Windows.UI.Popups;

    var item;

    WinJS.UI.Pages.define("/pages/itemDetail/itemDetail.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            item = options && options.item ? Data.resolveItemReference(options.item) : Data.items.getAt(0);
            element.querySelector(".titlearea .pagetitle").textContent = item.name;
            element.querySelector("article .item-title").textContent = item.position;
            element.querySelector("article .item-subtitle").textContent = item.email;
            element.querySelector("article .item-image").src = item.backgroundImage;
            
            // Display skills list
            var skills = element.querySelector("article .item-skills");
            for (var i = 0; i < item.skills.length; i++) {
                var skill = document.createElement("h2");
                skill.textContent = item.skills[i];
                skill.className = "skill";
                skills.appendChild(skill);
            }

            var records = Data.getRecordsFromName(item.name);

            // Display projects list
            var projects = element.querySelector("article .item-projects");
            for (var i = 0; i < records.length; i++) {
                var project = document.createElement("h2");
                project.textContent = records.getItem(i).data.project;;
                project.className = "skill";
                projects.appendChild(project);
            }
            // Register for datarequested events for sharing
            dtm.getForCurrentView().addEventListener("datarequested", this.onDataRequested);

            document.getElementById("pin").addEventListener("click", function (e) {
                var uri = new Windows.Foundation.Uri("ms-appx:///" + item.tileImage);

                var tile = new start.SecondaryTile(
                    item.key,                                    // Tile ID
                    item.shortTitle,                             // Tile short name
                    item.title,                                  // Tile display name
                    JSON.stringify(Data.getItemReference(item)), // Activation argument
                    start.TileOptions.showNameOnLogo,            // Tile options
                    uri                                          // Tile logo URI
                );

                tile.requestCreateAsync();
            });

            // Handle click events from the Reminder command
            document.getElementById("remind").addEventListener("click", function (e) {
                // Create a toast notifier
                var notifier = notify.ToastNotificationManager.createToastNotifier();

                // Make sure notifications are enabled
                if (notifier.setting != notify.NotificationSetting.enabled) {
                    var dialog = new popups.MessageDialog("Notifications are currently disabled");
                    dialog.showAsync();
                    return;
                }

                // Get a toast template and insert a text node containing a message
                var template = notify.ToastNotificationManager.getTemplateContent(notify.ToastTemplateType.toastText01);
                var element = template.getElementsByTagName("text")[0];
                element.appendChild(template.createTextNode("Reminder!"));

                // Schedule the toast to appear 30 seconds from now
                var date = new Date(new Date().getTime() + 30000);
                var stn = notify.ScheduledToastNotification(template, date);
                notifier.addToSchedule(stn);
            });

        },

        onDataRequested: function (e) {
            var request = e.request;
            request.data.properties.title = item.name;
            request.data.properties.description = "EmployeeIn Indo";

            // Share recipe text
            var recipe = "\r\nSkills\r\n" + item.skills.join("\r\n");
            var recipe = "\r\nProyects\r\n" + item.skills.join("\r\n");


            request.data.setText(recipe);

            // Share recipe image
            var uri = item.backgroundImage;
            if (item.backgroundImage.indexOf("http://") != 0)
                uri = "ms-appx:///" + uri;

            uri = new Windows.Foundation.Uri(uri);
            var reference = storage.Streams.RandomAccessStreamReference.createFromUri(uri);
            request.data.properties.thumbnail = reference;
            request.data.setBitmap(reference);
        },

        unload: function () {
            WinJS.Navigation.removeEventListener("datarequested", this.onDataRequested);
        }
    });
})();
