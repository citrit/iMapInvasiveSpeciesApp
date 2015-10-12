var iMapApp = iMapApp || {};

// Photo utils for the app.

iMapApp.Photo = {
    params: {
        Firstname: "",
        CurrentState: ""
    },
    init: function() {
    }
    takePhoto: function(){
        console.log("Take photo");
        Camera.sourceType = Camera.PictureSourceType.CAMERA;
        navigator.camera.getPicture(iMapApp.Photo.getPhoto, iMapApp.Photo.onFail, { quality: 50 });
    }
    onPhotoURISuccess: function(imageURI) {
        var largeImage = document.getElementById('largeImage');
        largeImage.style.display = 'block';
        largeImage.src = imageURI;
    }
    getPhoto: function(source) {
        // Retrieve image file location from specified source
        navigator.camera.getPicture(onPhotoURISuccess, iMapApp.Photo.onFail, { quality: 50, 
            destinationType: destinationType.FILE_URI,
            sourceType: source });
    }
    onFail: function(message) {
        alert('Failed because: ' + message);
    }
    onPhotoDataSuccess: function(imageData) {
        var smallImage = document.getElementById('smallImage');
        smallImage.style.display = 'block';
        smallImage.src = "data:image/jpeg;base64," + imageData;
    }
    previewPhoto: function(){
        var container= document.getElementById("imageName");
        var largeImage = document.getElementById('largeImage');
        largeImage.style.display = 'block';
        largeImage.src = container;
    }
}