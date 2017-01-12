var iMapApp = iMapApp || {};

// Photo utils for the app.

iMapApp.Photo = {
    init: function() {
    },
    
    getPhoto: function() {
        // Retrieve image file location from specified source
        var qual = 50;
        switch(iMapApp.iMapPrefs.params.PictureSize) {
            case 'small':
                qual = 25;
                break;
            case 'medium':
                qual = 50;
                break;
            case 'large':
                qual = 100;
                break;
            default:
                console.log("uh oh, made it to default image quality");
                qual = 50;
        }
        console.log("Getting image with quality: " + qual);
        navigator.camera.getPicture(iMapApp.Photo.onSuccess, iMapApp.Photo.onFail, { 
            quality: qual,
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