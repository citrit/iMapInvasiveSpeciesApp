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
    
    doUpload: function () {
		var url = 'http://hermes.freac.fsu.edu/nyimi/dataentry/submit/';
//		iMapPrefs.init();
//		iMapPrefs.Username = 'tomcitriniti';
//		iMapPrefs.Password = '';
		var ok = true; //iMapPrefs.loginToMainSite();
		
		if (ok) {
			console.log('Going to upload: ' + ok );
			var postData = { 
				csrfmiddlewaretoken: 'f966559df6661be0bf04594bdc3aabf2',
				photourl1: 'photourl1_2013_11_11_tomcitriniti_95hu9wh2.jpg',
				photourl2: '',
				photourl3: '',
				photourl4: '',
				photourl5: '',
				photocredit1: '',
				photocredit2: '',
				photocredit3: '',
				photocredit4: '',
				photocredit5: '',
				step_1_data_observer: 'Yes',
				step_1_existing_user: '',
				step_2_project: 'Yes',
				step_2_project_list: '',
				species_select_type: 'Plant',
				step_3_species_list_common: '-1',
				step_3_species_list_common: '-1',
				step_3_species_list_common: 'NY-2-136391',
				step_3_species_common_name: 'Amur%20Maple',
				step_3_species_list_scientific: '-1',
				step_3_species_list_scientific: '-1',
				step_3_species_list_scientific: 'NY-2-136391',
				step_3_species_scientific_name: 'Acer%20ginnala',
				step_3_species_id: 'NY-2-136391',
				step_4_observed_date: '2013-11-11',
				step_5_coordinate_system: 'latlon',
				step_5_coord_x: '-75.41016',
				step_5_coord_y: '43.40667',
				step_5_current_coordinate_x: '466789.8428462542',
				step_5_current_coordinate_x_lon_lat: '-75.41016000000012',
				step_5_current_coordinate_y: '4806058.103717405',
				step_5_current_coordinate_y_lon_lat: '43.40667000000026',
				step_5_current_coordinate_x_mercator: '-8394620.6118393',
				step_5_current_coordinate_y_mercator: '5374077.4478864',
				data_entry_method: 'On-Line'
			};
			
			$.ajax({
			  type: "POST",
			  url: url,
			  data: postData,
			  success: UploadUtils.success,
			  //dataType: dataType,
			  error: function (jqXHR, textStatus, errorThrown)
			    {
				  console.log('Upload error: ' + JSON.stringify(jqXHR) + " -> " + JSON.stringify(textStatus)+ " -> " + JSON.stringify(errorThrown));
			    }
			});
		}
	},
	
	success: function (data, textStatus, jqXHR) {
		console.log('success: ' + JSON.stringify(data) + " -> " + JSON.stringify(textStatus));
	}
}
