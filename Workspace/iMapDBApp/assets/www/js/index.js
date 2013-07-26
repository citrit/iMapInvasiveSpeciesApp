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
    	tabPhoto();
    	if (iMapPrefs.loginToMainSite()) {
    		alert('logged in to main site');
    	}
    	else {
    		alert('not logged in to main site');
    	}
    },
    // Output debug messages.
    debugMsg: function(msg) {
    	if (iMapApp.debugOut)
    		console.log( msg );
    }
};

var iMapPrefs = {
		params: {
			Firstname: "",
			Lastname: "",
			Username: "",
			Password: "",
			Projects: [],
			Plants: {
				UseCommon: true,
				UseScientific: true,
				MyPlants: []
			},
			PictureSize: "Medium",
		},
		init: function() {
			var parms = localStorage.getItem("userParams");
	    	if (parms != null) {
	    		iMapPrefs.loadParams();
	    	}
	    	else {
	    		iMapPrefs.saveParams();
	    	}
		},
		// Save the current prefs to localstorage
		saveParams: function() {
			iMapApp.debugMsg("iMapPrefs: saving user Params");
    		localStorage.setItem("userParams", $.toJSON(iMapPrefs.params));
		},
		// load the prefs from localstorage
		loadParams: function() {
			iMapApp.debugMsg("iMapPrefs: loading user Params");
			iMapPrefs.params = $.parseJSON(localStorage.getItem("userParams"));
		},
		// login to the site
		loginToMainSite: function() {
			// id='csrfmiddlewaretoken' name='csrfmiddlewaretoken' value='ebd4f9d9b0aa51f599d96c229ddc955f'
			var ret = false;
			// strUrl is whatever URL you need to call
			var strUrl = "http://hermes.freac.fsu.edu/nyimi/login/", strReturn = "";

			jQuery.ajax({
				url: strUrl,
				data: {csrfmiddlewaretoken:'ebd4f9d9b0aa51f599d96c229ddc955f', 
					csrfmiddlewaretoken:'ebd4f9d9b0aa51f599d96c229ddc955f',
					username:'tomcitriniti', password:'changeme2013'},
				type: 'POST',
				success: function(html) {
					strReturn = html;
					ret = true;
				},
				error: function( jqXHR, textStatus, errorThrown ){
					iMapApp.debugMsg("error: " + textStatus + " ex: " + errorThrown);
					ret = false;
				},
				async:false
			});
			iMapApp.debugMsg("loginToMainSite: " + strReturn);
			
			return ret;
		}
}
