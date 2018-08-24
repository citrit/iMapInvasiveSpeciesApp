var iMapApp = iMapApp || {};

// Photo utils for the app.

iMapApp.Photo = {
    init: function() {},

    getPhotoLibrary: function() {
        // If a photo from the photo library is requested, check for permission on iOS
        if (device.platform == "iOS") {
            cordova.plugins.diagnostic.getCameraRollAuthorizationStatus(function(status) {
                switch (status) {
                    case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                        console.log("Photo Library Permission not requested");
                        cordova.plugins.diagnostic.requestCameraRollAuthorization(function(status) {
                            console.log("Authorization request for camera roll was " + (status == cordova.plugins.diagnostic.permissionStatus.GRANTED ? "granted" : "denied"));
                            if (status == cordova.plugins.diagnostic.permissionStatus.GRANTED) {
                                iMapApp.Photo.getPhoto(true);
                            }
                        }, function(error){
                            console.error(error);
                        });
                        break;
                    case cordova.plugins.diagnostic.permissionStatus.DENIED:
                        console.log("Photo Library Permission denied");
                        navigator.notification.alert("iMapInvasives does not have permission to access to your photo library. Please enable Photo Library access to the iMapApp in the device Privacy Settings.", iMapApp.uploadUtils.alertDismiss, "Photo Library Permission Denied");
                        break;
                    case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                        console.log("Permission granted");
                        iMapApp.Photo.getPhoto(true);
                        break;
                }
            }, function(error){
                console.error("The following error occurred: "+error);
            });
        } else {
            iMapApp.Photo.getPhoto(true);
        }
    },

    getPhoto: function(library) {
        // Retrieve image file location from specified source
        var qual = 50;
        switch (iMapApp.iMapPrefs.params.PictureSize) {
            case 'small':
                qual = 25;
                break;
            case 'medium':
                qual = 40;
                break;
            case 'large':
                qual = 60;
                break;
            default:
                console.log("uh oh, made it to default image quality");
                qual = 50;
        }
        console.log("Getting image with quality: " + qual);
        navigator.camera.getPicture(iMapApp.Photo.onSuccess, iMapApp.Photo.onFail, {
            quality: qual,
            destinationType: Camera.DestinationType.DATA_URL,
            saveToPhotoAlbum: ((library === true) ? false : ((iMapApp.iMapPrefs.params.SaveOriginalPhotos === true || iMapApp.iMapPrefs.params.SaveOriginalPhotos == null) ? true : false)),
            correctOrientation: true,
            sourceType: ((library === true) ? Camera.PictureSourceType.SAVEDPHOTOALBUM : Camera.PictureSourceType.CAMERA),
            encodingType: Camera.EncodingType.JPEG
        });
        iMapApp.uiUtils.bottomBarHelper.bottomBarHelperAdd();
    },

    onSuccess: function(imageData) {
        // Delete old image
        var imgFile = getDElem('[name="largeImage"]').attr('src');
        if (imgFile != null) {
            iMapApp.App.removeImage(imgFile);
        }
        var filename = iMapApp.App.guid() + ".jpg";
        console.log("Captured image: " + filename);
        //getDElem('[name="largeImage"]').attr('src', imageURI);
        // To define the type of the Blob
        var contentType = "image/jpg";
        // if cordova.file is not available use instead :
        //var folderpath = "file:///storage/emulated/0/";
        iMapApp.Photo.savebase64AsImageFile(iMapApp.App.dataFolder, filename, imageData, contentType, getDElem('[name="largeImage"]'));
        console.log("Got image: " + folderpath + filename);
    },

    onFail: function(message) {
        alert('Failed because: ' + message);
    },

    onPhotoDataSuccess: function(imageData) {
        var smallImage = getDElem('smallImage');
        smallImage.style().display = 'block';
        smallImage.src("data:image/jpeg;base64," + imageData);
    },

    previewPhoto: function() {
        var container = getDElem("imageName");
        var largeImage = getDElem('largeImage');
        largeImage.style.display = 'block';
        largeImage.src = container;
    },

    /**
     * Create a Image file according to its database64 content only.
     * 
     * @param folderpath {String} The folder where the file will be created
     * @param filename {String} The name of the file that will be created
     * @param content {Base64 String} Important : The content can't contain the following string (data:image/png[or any other format];base64,). Only the base64 string is expected.
     */
    savebase64AsImageFile: function(folderpath, filename, content, contentType, img) {
        // Convert the base64 string in a Blob
        var DataBlob = iMapApp.Photo.b64toBlob(content, contentType);

        console.log("Starting to write the file: " + folderpath + filename);

        window.resolveLocalFileSystemURL(folderpath, function(dir) {
            console.log("Access to the directory granted succesfully");
            dir.getFile(filename, { create: true }, function(file) {
                console.log("File created succesfully.");
                file.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function() {
                        console.log("Successful file write, setting image src");
                        img.attr('src', folderpath + filename);
                    };

                    fileWriter.onerror = function(e) {
                        console.log("Failed file write: " + e.toString());
                    };
                    console.log("Writing content to file: " + folderpath + filename);
                    fileWriter.write(DataBlob);

                }, function() {
                    alert('Unable to save file in path ' + folderpath);
                });
            });
        });
    },

    /**
     * Convert a base64 string in a Blob according to the data and contentType.
     * 
     * @param b64Data {String} Pure base64 string without contentType
     * @param contentType {String} the content type of the file i.e (image/jpeg - image/png - text/plain)
     * @param sliceSize {Int} SliceSize to process the byteCharacters
     * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
     * @return Blob
     */
    b64toBlob: function(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
};