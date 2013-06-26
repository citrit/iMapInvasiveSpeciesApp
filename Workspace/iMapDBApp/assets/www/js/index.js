
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
    	iMapApp.loadDatabase();
    },
    // Load the database.
    loadDatabase: function() {
    	DBFuncs.init();
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
	    		iMapApp.debugMsg("found existing user Params: " + parms);
	    		iMapPrefs.params = $.parseJSON(parms);
	    	}
	    	else {
	    		iMapApp.debugMsg("need to init user Params");
	    		localStorage.setItem("userParams", $.toJSON(iMapPrefs.params));
	    	}
		},
		saveParams: function() {
			iMapApp.debugMsg("iMapPrefs: saving user Params");
    		localStorage.setItem("userParams", $.toJSON(iMapPrefs.params));
		},
		loadParams: function() {
			iMapApp.debugMsg("iMapPrefs: loading user Params");
			iMapPrefs.params = $.parseJSON(localStorage.getItem("userParams"));
		}
}
