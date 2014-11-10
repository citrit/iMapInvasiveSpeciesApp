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
    
    doUpload: function (obs) {
		var url = 'http://hermes.freac.fsu.edu/requests/uploadObservation/uploadTool';
//		iMapPrefs.init();
//		iMapPrefs.Username = 'tomcitriniti';
//		iMapPrefs.Password = '';
		var ret = false;
		var ok = true; //iMapPrefs.loginToMainSite();
		var stShp = "ST_GEOMETRY('POINT("+obs.Where[0]+" "+obs.Where[1]+")',8)";
		console.log("ST_GEOM: " +stShp);
		if (ok) {
			console.log('Going to upload: ' + JSON.stringify(obs) );
			var postData = { 
				photourl1: obs.Photos[0],
				photourl2: '',
				photourl3: '',
				photourl4: '',
				photourl5: '',
				photocredit1: '',
				photocredit2: '',
				photocredit3: '',
				photocredit4: '',
				photocredit5: '',
				digitalphoto: 0,
				obsdatastatus: 1000,
				imapdataentrypersonid: obs.Who,
				observername: obs.Who,
				obsstate: obs.ObsState,
				projectid: obs.Project,
				statespeciesid: obs.Species[2],
				commonname: obs.Species[0],
				scientificname: obs.Species[1],
				imapdataentrydate: obs.When, //2013-11-11
				obsdate: obs.When, //2013-11-11
				obsorigxcoord: obs.Where[0], //-75.41016000000012
				obsorigycoord: obs.Where[1], //43.40667000000026
				imapdataentrymethod: 'Mobile-App',
				repositoryavailable: 2//,
				//shape: stShp
			};
			console.log("Do ajax call");
			$.ajax({
			  type: "GET",
			  url: url,
			  data: postData,
			  async: false,
			  success: function (jqXHR, textStatus, errorThrown)
			    {
				  console.log("URL request success: " + typeof jqXHR);
				  try {
					  ret = eval("(" + jqXHR + ")");
					  if (ret.code === 0) {
						  console.log('Upload successful: ' + obs.When + ' : ' + obs.Species[0] + " => " + textStatus);
						  console.log('return: ' + JSON.stringify(ret));
						  rmObservation(obs);
						  ret = true;
					  }
					  else {
						  console.log('Upload error: ' + JSON.stringify(ret));
						  alert('Upload error: ' + JSON.stringify(ret));
					  }
				  }
				  catch (err) {
					  console.log('Upload error[' + err + ']: ' + jqXHR);
					  alert('Upload error[' + err + ']: ' + jqXHR);
				  }
				  
				 
			    },
			  //dataType: dataType,
			  error: function (jqXHR, textStatus, errorThrown)
			    {
				  console.log('Upload error: ' + JSON.stringify(jqXHR) + " -> " + JSON.stringify(textStatus)+ " -> " + JSON.stringify(errorThrown));
				  if (errorThrown.code == 19) {
					  alert('Connection error: ' + errorThrown.message);
				  }
				  else {
					  alert('Upload error[' + textStatus + ']: ' + errorThrown.message);
				  }
			    }
			});
		}
		return ret;
	},
	
	success: function (data, textStatus, jqXHR) {
		console.log('success: ' + JSON.stringify(data) + " -> " + JSON.stringify(textStatus));
	}
}
