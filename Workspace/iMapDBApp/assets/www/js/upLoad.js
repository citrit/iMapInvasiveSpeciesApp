var UploadUtils = {
	
	debugOut: true,
	
	// Application Constructor
    initialize: function() {
        
    },
    
    login: function () {
    	//if (iMapPrefs.loginToMainSite()) {
		//alert('logged in to main site');
		//}
		//else {
			//alert('not logged in to main site');
		//}
    },
    
    reachableCallback: function(reachability) {
        // There is no consistency on the format of reachability
        var networkState = reachability.code || reachability;

        var states = {};
        states[NetworkStatus.NOT_REACHABLE]                      = 'No network connection';
        states[NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK] = 'Carrier data connection';
        states[NetworkStatus.REACHABLE_VIA_WIFI_NETWORK]         = 'WiFi connection';

        if (networkState != NetworkStatus.NOT_REACHABLE) {
        	$("#uploadButton").removeAttr("disabled");
        	$("#uploadButton").text("Upload Obs");
        }
    },
    
    doUpload: function() {
    	var madeIt = iMapPrefs.loginToMainSite();
    	console.log("Made connection: " + madeIt);
    }

}