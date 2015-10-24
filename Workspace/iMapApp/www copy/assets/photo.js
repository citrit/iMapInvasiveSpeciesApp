var iMapApp = iMapApp || {};

// Photo utils for the app.

iMapApp.Photo = {
    init: function() {
    },
    
    getPhoto: function() {
        // Retrieve image file location from specified source
        navigator.camera.getPicture(iMapApp.Photo.onSuccess, iMapApp.Photo.onFail, { quality: 50,
            destinationType: Camera.DestinationType.FILE_URI 
        });
    },

    onSuccess: function(imageURI) {
        console.log("Got image: " + imageURI);
        getDElem('[name="largeImage"]').attr('src', imageURI);
    },

    onFail: function(message) {
        alert('Failed because: ' + message);
    },
    
    onPhotoDataSuccess: function(imageData) {
        var smallImage = getDElem('smallImage');
        smallImage.style().display = 'block';
        smallImage.src("data:image/jpeg;base64," + imageData);
    },
    
    previewPhoto: function(){
        var container= getDElem("imageName");
        var largeImage = getDElem('largeImage');
        largeImage.style.display = 'block';
        largeImage.src = container;
    }
}