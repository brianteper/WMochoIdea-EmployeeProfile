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
            element.querySelector(".titlearea .pagetitle").textContent = item.proyecto;
            element.querySelector("article .item-title").textContent = item.nombre;
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

            // Register for datarequested events for sharing
            dtm.getForCurrentView().addEventListener("datarequested", this.onDataRequested);

            // Handle click events from the Photo command
            document.getElementById("photo").addEventListener("click", function (e) {
                var camera = new capture.CameraCaptureUI();

                // Capture a photo and display the share UI
                camera.captureFileAsync(capture.CameraCaptureUIMode.photo).then(function (file) {
                    if (file != null) {
                        _photo = file;
                        dtm.showShareUI();
                    }
                });
            });

            // Handle click events from the Video command
            document.getElementById("video").addEventListener("click", function (e) {
                var camera = new capture.CameraCaptureUI();
                camera.videoSettings.format = capture.CameraCaptureUIVideoFormat.wmv;

                // Capture a video and display the share UI
                camera.captureFileAsync(capture.CameraCaptureUIMode.video).then(function (file) {
                    if (file != null) {
                        _video = file;
                        dtm.showShareUI();
                    }
                });
            });

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
            request.data.properties.title = item.title;

            if (_photo != null) {
                request.data.properties.description = "Recipe photo";
                request.data.setStorageItems([_photo]);
                //var reference = storage.Streams.RandomAccessStreamReference.createFromFile(_photo);
                //request.data.properties.Thumbnail = reference;
                //request.data.setBitmap(reference);
                _photo = null;
            }
            else if (_video != null) {
                request.data.properties.description = "Recipe video";
                request.data.setStorageItems([_video]);
                _video = null;
            }
            else {
                request.data.properties.description = "Recipe skills and directions";

                // Share recipe text
                var recipe = "\r\nskills\r\n" + item.skills.join("\r\n");
                request.data.setText(recipe);

                // Share recipe image
                var uri = item.backgroundImage;
                if (item.backgroundImage.indexOf("http://") != 0)
                    uri = "ms-appx:///" + uri;

                uri = new Windows.Foundation.Uri(uri);
                var reference = storage.Streams.RandomAccessStreamReference.createFromUri(uri);
                request.data.properties.thumbnail = reference;
                request.data.setBitmap(reference);
            }
        },

        unload: function () {
            WinJS.Navigation.removeEventListener("datarequested", this.onDataRequested);
        }
    });
})();
