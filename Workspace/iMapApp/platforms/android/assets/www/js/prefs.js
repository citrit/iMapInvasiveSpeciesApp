// Preferences for the app.

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
		loginToMainSite: function(okCallBack) {
			console.log("Logging into FSU");
			// id='csrfmiddlewaretoken' name='csrfmiddlewaretoken' value='ebd4f9d9b0aa51f599d96c229ddc955f'
			var ret = false;
			// strUrl is whatever URL you need to call
			var strUrl = "http://hermes.freac.fsu.edu/nyimi/login/", strReturn = "";
			//$( "#hiddenLoginDiv" ).load( strUrl, function () {
			document.getElementById("hiddenLoginDiv").onload = function() {
				console.log('HTML: ' + $( "#hiddenLoginDiv" ).html())
				var pData = { 'csrfmiddlewaretoken' : 'f248eb7050f2b3977121d03ddbb59e5f', 
								'username': iMapPrefs.params.Username, 
								'password' : iMapPrefs.params.Password };
				console.log('posting login stuff: ' + JSON.stringify(pData));
				$.ajax({
					  type: 'POST',
					  url: strUrl,
					  data: pData,
					  success: function(msg) {
						  console.log('Posting res: ' + JSON.stringify(msg) );
					  },
					  error: function(err, msg) {
						  console.log('Posting err: ' + JSON.stringify(err) + '\n MSG: ' + JSON.stringify(msg));
					  }
					});
			};
			$("#hiddenLoginDiv").attr("src", strUrl);
		}
}
