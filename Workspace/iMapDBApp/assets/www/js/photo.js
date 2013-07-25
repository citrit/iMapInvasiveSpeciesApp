function takePhoto(){
	console.log("Take photo");
	Camera.sourceType = Camera.PictureSourceType.CAMERA;
	navigator.camera.getPicture(getPhoto, onFail, { quality: 50 });
  	}
  	function onPhotoURISuccess(imageURI) {
        var largeImage = document.getElementById('largeImage');
        largeImage.style.display = 'block';
        largeImage.src = imageURI;
      }
  	function getPhoto(source) {
        // Retrieve image file location from specified source
        navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50, 
          destinationType: destinationType.FILE_URI,
          sourceType: source });
      }
  	 function onFail(message) {
  	      alert('Failed because: ' + message);
  	    }
  	function onPhotoDataSuccess(imageData) {
        var smallImage = document.getElementById('smallImage');
        smallImage.style.display = 'block';
        smallImage.src = "data:image/jpeg;base64," + imageData;
      }
  	function previewPhoto(){
  		var container= document.getElementById("imageName");
  		largeImage.style.display = 'block';
        largeImage.src = container;
  	}