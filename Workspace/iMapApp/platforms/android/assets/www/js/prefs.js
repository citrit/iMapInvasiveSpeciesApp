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
			//$( "#hiddenLoginDiv" ).load( strUrl + ' #login_request_wrapper', function () {
			document.getElementById("hiddenLoginDiv").onload = function() {
				console.log('LoginDiv HTML: ' + $( "#hiddenLoginDiv" ).html());
				var subForm = $("#hiddenLoginDiv").contents().find("form"); //$('#hiddenLoginDiv').find('form');
				if (subForm != null) {
					//alert ("found form");
					console.log("logingIntoToMainSite[" + $('#id_username').val() + "]: " + iMapPrefs.params.Username);
					$(subForm).find('#id_username').val(iMapPrefs.params.Username);
					$(subForm).find('#id_password').val(iMapPrefs.params.Password);
					iMapApp.debugMsg("Before submit");
					strReturn = subForm.submit();
					iMapApp.debugMsg("after submit");
					console.log(typeof strReturn) ;
					document.getElementById("hiddenLoginDiv").onload = null;
					ret = true;
					okCallBack(ret);
				}
				iMapApp.debugMsg("loginToMainSite[" + $(subForm).find('#id_username').val() + "]: ");
			};
			$("#hiddenLoginDiv").attr("src", strUrl);
		}
}
