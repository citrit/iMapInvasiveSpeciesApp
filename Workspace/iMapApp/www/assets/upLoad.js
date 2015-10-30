var iMapApp = iMapApp || {};

iMapApp.uploadUtils = {

	debugOut : true,
    obsvs: [],

	// Application Constructor
	initialize : function() {

	},

	login : function() {
		//if (iMapPrefs.loginToMainSite()) {
		//alert('logged in to main site');
		//}
		//else {
		//alert('not logged in to main site');
		//}
	},

	reachableCallback : function(reachability) {
		// There is no consistency on the format of reachability
		var networkState = reachability.code || reachability;

		var states = {};
		states[NetworkStatus.NOT_REACHABLE] = 'No network connection';
		states[NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK] = 'Carrier data connection';
		states[NetworkStatus.REACHABLE_VIA_WIFI_NETWORK] = 'WiFi connection';

		if (networkState != NetworkStatus.NOT_REACHABLE) {
			$("#uploadButton").removeAttr("disabled");
			$("#uploadButton").text("Upload Obs");
		}
	},

	doUpload : function(obss) {
        iMapApp.uploadUtils.obsvs = obss;
        iMapApp.uploadUtils.syncUploads();
    },
    
    syncUploads: function() {
		//		iMapPrefs.init();
		//		iMapPrefs.Username = 'tomcitriniti';
		//		iMapPrefs.Password = '';
		var ret = true;
		var ok = iMapApp.uploadUtils.obsvs.length > 0; //iMapPrefs.loginToMainSite();
		if (ok) {
            obs = iMapApp.App.observ[iMapApp.uploadUtils.obsvs.get(0).id];
            iMapApp.uploadUtils.obsvs.splice(0,1);
			console.log('Going to upload: ' + JSON.stringify(obs.getObsData()));
			var imgURL = null;
			if (obs.getPhotos() !== "") {
				console.log("Uploading image: " + obs.getPhotos());
				iMapApp.uploadUtils.uploadImage(obs.getPhotos(), obs);
			} else {
				console.log("Uploading Observation");
				iMapApp.uploadUtils.doSendToServer(obs);
			}
		}
		return ret;
	},

	doSendToServer : function(obs) {
        //var stShp = "ST_GEOMETRY('POINT(" + obs.getWhere()[0] + " " + obs.getWhere()[1]
		//		+ ")',8)";
		//console.log("ST_GEOM: " + stShp);
        
		var url = 'https://hermes.freac.fsu.edu/requests/uploadObservation/uploadTool';
		console.log("Do image: " + (obs.getPhotos() !== ""?1:0));
		//console.log("Do sendToServer: " + JSON.stringify(obs.getObsData()));
        var spIDLen = obs.getSpeciesID().length;
        var spl = JSON.parse(localStorage.getItem("speciesList"));
		var postData = {
				photourl1 : obs.getPhotos(),
				photourl2 : '',
				photourl3 : '',
				photourl4 : '',
				photourl5 : '',
				photocredit1 : '',
				photocredit2 : '',
				photocredit3 : '',
				photocredit4 : '',
				photocredit5 : '',
				digitalphoto : (obs.getPhotos() !== ""?1:0),
				obsdatastatus : 1000,
				imapdataentrypersonid : iMapApp.iMapPrefs.params.Username,
				observername : iMapApp.iMapPrefs.params.Username,
				obsstate : obs.getState(),
				projectid : obs.getProjectID(),
				statespeciesid : (spIDLen > 2?obs.getSpeciesID():""),
				commonname : (spIDLen > 2?spl[obs.getSpeciesID()][0]:""),
				scientificname : (spIDLen > 2?spl[obs.getSpeciesID()][1]:""),
				imapdataentrydate : iMapApp.uploadUtils.getDateTime(true), //2013-11-11
				obsdate : obs.getWhen(), //2013-11-11
				obsorigxcoord : obs.getWhere()[0], //-75.41016000000012
				obsorigycoord : obs.getWhere()[1], //43.40667000000026
				imapdataentrymethod : 'Mobile-App',
				repositoryavailable : 2
			//,
			//shape: stShp
			};
		$.ajax({
			type : "GET",
			url : url,
			data : postData,
			async : true,
			success : function(jqXHR, textStatus, errorThrown) {
				console.log("URL request success: " + typeof jqXHR);
				try {
					ret = eval("(" + jqXHR + ")");
					if (ret.code === 0) {
						console.log('Upload successful: ' + obs.getWhen() + ' : '
								+ obs.getSpecies() + " => " + textStatus);
						console.log('return: ' + JSON.stringify(ret));
						iMapApp.App.delObservation(obs.getObjectID());
						ret = true;
					} else if (ret.code === 2) {
						alert("Bad username or password")
					} else {
						console.log('Upload error: ' + JSON.stringify(ret));
						alert('Upload error: ' + JSON.stringify(ret));
					}
				} catch (err) {
                    iMapApp.uiUtils.waitDialogClose();
					console.log('Exception error[' + JSON.stringify(err) + ']: ' + jqXHR);
					alert('Exception error[' + JSON.stringify(err) + ']: ' + jqXHR);
				}
                finally {
                    iMapApp.uiUtils.waitDialogClose();
                    iMapApp.uploadUtils.syncUploads();
                }
			},
			// dataType: dataType,
			error : function(jqXHR, textStatus, errorThrown) {
                iMapApp.uiUtils.waitDialogClose();
				console.log('Upload error: ' + JSON.stringify(jqXHR) + " -> "
						+ JSON.stringify(textStatus) + " -> "
						+ JSON.stringify(errorThrown));
				if (errorThrown.code == 19) {
					alert('Connection error: ' + errorThrown.message);
				} else {
					alert('Upload error[' + textStatus + ']: '
							+ errorThrown.message);
				}
			}
		});
	},

	uploadImage : function(imageName, obs) {
		var ret = '';
		var imgUploadURL = "http://1-dot-imapimageupload.appspot.com/imageupload";
		var options = new FileUploadOptions();
		options.fileKey = "file";
		options.fileName = imageName.substr(imageName.lastIndexOf('/') + 1);
		options.mimeType = "text/plain";

		var params = new Object();

		options.params = params;

		var ft = new FileTransfer();
        console.log("starting transfer: " + options.fileName);
		ft.upload(imageName, encodeURI(imgUploadURL), 
            function(res) {//alert("Return: " + JSON.stringify(res.response)); 
                var ans = eval("(" + res.response + ")");
                console.log("Res: " + JSON.stringify(ans));
                ret = imgUploadURL + "?fileName=" + ans.fileName;
                obs.setPhotos(ret);
                iMapApp.uploadUtils.doSendToServer(obs);
            }, function(err) {
                console.log("Errors: " + JSON.stringify(err));
            }, 
            options
        );
		console.log("end transfer: " + options.fileName);
		return ret;
	},

	uploadImageOld : function(imageName) {
		var ret = '';
		var imgUploadURL = "http://1-dot-imapimageupload.appspot.com/imageupload";
		var fd = new FormData();
		//console.log("Create files: " + '<input type="file" name="' + imageName
		//		+ '" id="fileToUpload">');
		var files = $('<input type="file" name="' + imageName
				+ '" id="fileToUpload">');
		var files = document.getElementById('fileToUpload').files;
		for (var i = 0; i < files.length; i++) {
			//console.log("Got file " + JSON.stringify(files[i]));
			fd.append("file" + i, files[i]);
		}
		//fd.append("file0", files[0]);

		$.ajax({
			url : imgUploadURL,
			type : 'POST',
			data : fd,
			cache : false,
			dataType : 'json',
			async : false,
			processData : false, // Don't process the files
			contentType : false, // Set content type to false as jQuery will tell the server its a query string request
			success : function(data, textStatus, jqXHR) {
				//alert("Return: " + JSON.stringify(data));
				ret = imgUploadURL + "?fileName=" + data.fileName;
			},
			error : function(jqXHR, textStatus, errorThrown) {
				// Handle errors here
				console.log('ERRORS: ' + textStatus + " : " + errorThrown);
				// STOP LOADING SPINNER
			}
		});
		return ret;
	},

	success : function(data, textStatus, jqXHR) {
		console.log('success: ' + JSON.stringify(data) + " -> "
				+ JSON.stringify(textStatus));
	},
	
	getDateTime: function(useTime) {
	    var now     = new Date(); 
	    var year    = now.getFullYear();
	    var month   = now.getMonth()+1; 
	    var day     = now.getDate();
	    var hour    = now.getHours();
	    var minute  = now.getMinutes();
	    var second  = now.getSeconds(); 
	    if(month.toString().length == 1) {
	        var month = '0'+month;
	    }
	    if(day.toString().length == 1) {
	        var day = '0'+day;
	    }   
	    if(hour.toString().length == 1) {
	        var hour = '0'+hour;
	    }
	    if(minute.toString().length == 1) {
	        var minute = '0'+minute;
	    }
	    if(second.toString().length == 1) {
	        var second = '0'+second;
	    }
	    var dateTime = ''; 
	    if (typeof useTime !== "undefined") {
	    	dateTime = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second; 
		}
	    else {
	    	dateTime = year+'-'+month+'-'+day;
	    }
	    console.log("Current date: " + dateTime);
	    return dateTime;
	}
}
