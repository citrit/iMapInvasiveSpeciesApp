var pictureSource; // picture source
var destinationType; // sets the format of returned value 
var iMapApp = {
	
	debugOut: true,
	 

	
	// Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
    	console.log("onDeviceReady made it here.");
    	iMapPrefs.init();
    	DBFuncs.init();
    	pictureSource=navigator.camera.PictureSourceType;
    	destinationType=navigator.camera.DestinationType;
    	goHome();
    	//if (iMapPrefs.loginToMainSite()) {
    		//alert('logged in to main site');
    	//}
    	//else {
    		//alert('not logged in to main site');
    	//}
    	iMapMap.init();
    },
    // Output debug messages.
    debugMsg: function(msg) {
    	if (iMapApp.debugOut)
    		console.log( msg );
    }
};

