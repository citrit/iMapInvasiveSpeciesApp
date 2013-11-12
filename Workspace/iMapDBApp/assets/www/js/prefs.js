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
		loginToMainSite: function() {
			iMapApp.debugMsg("Logging into main site");
			// id='csrfmiddlewaretoken' name='csrfmiddlewaretoken' value='ebd4f9d9b0aa51f599d96c229ddc955f'
			var ret = false;
			// strUrl is whatever URL you need to call
			var strUrl = "http://hermes.freac.fsu.edu/nyimi/login/", strReturn = "";
			var subForm = $('login_request_wrapper').find('form');
			if (subForm != null) {
				//alert ("found form");
				iMapApp.debugMsg("logingIntoToMainSite[" + $('#id_username') + "]: " + iMapPrefs.Username);
				$('#id_username').val(iMapPrefs.Username);
				$('#id_password').val(iMapPrefs.Password);
				iMapApp.debugMsg("Before submit");
				strReturn = subForm.submit();
				iMapApp.debugMsg("after submit");
				$( "#outputStuff" ).innerHTML = strReturn ;
				ret = true;
			}
			iMapApp.debugMsg("loginToMainSite[" + $('#id_username').val() + "]: ");
			
			return ret;
		}
}
