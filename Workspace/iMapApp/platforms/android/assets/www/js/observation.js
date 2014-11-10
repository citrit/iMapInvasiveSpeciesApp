
// Hold the iMap Observation and define methods to to save to the DB the records.
function iMapObservation(dontDoWhere){

	this.Photos = new Array();
	this.Who = iMapPrefs.params.Username;
	this.Project = "";
	this.Species = new Array();
	var date = new Date();

    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    var today = year + "-" + month + "-" + day;       
    
    this.When = today;
    this.Where = [ 0.0, 0.0 ];
    var obsvs = [];
    loadObservations(obsvs);
    this.Objectid = obsvs.length+1;
    this.ObsState = "NY";
    this.ObsCounty = "Albany";
    var curobs = this;
    if (typeof dontDoWhere === "undefined") {
		navigator.geolocation.getCurrentPosition(function (position) {
				curobs.Where = [ position.coords.longitude, position.coords.latitude];
				iMapApp.debugMsg("Position: " + $.toJSON(curobs.Where));
				//alert('found location: ' + $.toJSON(curobs.Where));
				iMapMap.setPosition(curobs.Where);
			},
			function(err) {
				curobs.Where = [ -73.8648, 42.7186 ];
				iMapApp.debugMsg("Position: " + $.toJSON(curobs.Where));
				//alert('error location: ' + $.toJSON(curobs.Where));
				iMapMap.setPosition(curobs.Where);
			},
			{maximumAge: 300000, timeout:20000, enableHighAccuracy : true}
		);
	}
	// Save the current observation to the internal table.
	this.save = function(){
		
		var obsv = this;
		console.log("Saving Obs: " + $.toJSON(this));
		iMapDB.transaction(function (tx) {
			tx.executeSql("Select objectid from imiadmin_observation where objectid=?" , [obsv.Objectid], function(tx, results) {
				if (results.rows.length == 0) {
					var sqlStr = 'INSERT INTO imiadmin_observation (objectid, obsid,Obsorg,observername,Imapdataentrypersonid,Imapdataentrydate, Obsdate,obsstate,projectid,statespeciesid,commonname,scientificname,obsorigxcoord,obsorigycoord, repositoryavailable,digitalphoto,imapdataentrymethod,obsdatastatus,obscountyname, photourl1) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
					var parms = [obsv.Objectid, obsv.Objectid, "Org", obsv.Who, obsv.Who, obsv.When, obsv.When, obsv.ObsState, obsv.Project, 
					             obsv.Species[2], obsv.Species[0], obsv.Species[1],
					             obsv.Where[0], obsv.Where[1], 2, 1, "app", 1000, obsv.ObsCounty, obsv.Photos[0]];

					tx.executeSql(sqlStr, parms);
				}
				else {
					var sqlStr = 'UPDATE imiadmin_observation SET obsid=?,Obsorg=?,observername=?,Imapdataentrypersonid=?,Imapdataentrydate=?, Obsdate=?,obsstate=?,projectid=?,statespeciesid=?,commonname=?,scientificname=?,obsorigxcoord=?,obsorigycoord=?, repositoryavailable=?,digitalphoto=?,imapdataentrymethod=?,obsdatastatus=?,obscountyname=?,photourl1=? WHERE objectid=?';
					var parms = [obsv.Objectid, "Org", obsv.Who, obsv.Who, obsv.When, obsv.When, obsv.ObsState, obsv.Project, 
					             obsv.Species[2], obsv.Species[0], obsv.Species[1],
					             obsv.Where[0], obsv.Where[1], 2, 1, "app", 1000, obsv.ObsCounty, obsv.Photos[0], obsv.Objectid];
		            			iMapApp.debugMsg("Updating Obs: " + $.toJSON(obsv.Objectid));					
					tx.executeSql(sqlStr, parms);
				}
			}, DBFuncs.errorCB);
		});
	};

}

//Save the current observation to the internal table.
function loadObservations(obsvs){
	var ret = null;
	iMapDB.transaction(function (tx) {
		var sqlStr = "select objectid, obsid,obsorg,observername,imapdataentrypersonid,imapdataentrydate, obsdate,obsstate,projectid,statespeciesid,commonname,scientificname,obsorigxcoord,obsorigycoord, repositoryavailable,digitalphoto,imapdataentrymethod,obsdatastatus,obscountyname,photourl1 from imiadmin_observation";
		tx.executeSql(sqlStr, [], 
			function(tx, results) {
				for (var i=0;i<results.rows.length;i++) {
					var obsv = Object();
					obsv.Objectid = results.rows.item(i).objectid;
	    			obsv.Who = results.rows.item(i).observername;
	    			obsv.When = results.rows.item(i).imapdataentrydate;
	    			obsv.Project = results.rows.item(i).projectid;
	    			obsv.Species = [];
		            obsv.Species[0] = results.rows.item(i).commonname;
		            obsv.Species[1] = results.rows.item(i).scientificname;
		            obsv.Species[2] = results.rows.item(i).statespeciesid;
		            obsv.Where = [];
		            obsv.Where[0] = results.rows.item(i).obsorigxcoord; 
		            obsv.Where[1] = results.rows.item(i).obsorigycoord;
		            obsv.Objectid = results.rows.item(i).objectid;
		            obsv.ObsState = results.rows.item(i).obsstate;
		            obsv.ObsCounty = results.rows.item(i).obscountyname;
		            obsv.Photos = [];
		            obsv.Photos.push(results.rows.item(i).photourl1);
		            obsvs.push(obsv);
		            //iMapApp.debugMsg("load observation: " + $.toJSON(obsv));
	    		}
			}, 
		DBFuncs.errorCB);
	});
}

function delObservation() {
	var obs = curObservation;
	navigator.notification.confirm(
			'Delete observation: ' + obs.When + ' : ' + obs.Species[0], // message
			function (butt) {
				switch (butt) {
				case 1:
					console.log("Deleting observation: " + obs.Objectid);
					iMapDB.transaction(function (tx) {
						var sqlStr = "delete from imiadmin_observation where obsid=?";
						tx.executeSql(sqlStr, [obs.Objectid], 
							function(tx, results) {
								if (results.rows.length > 0) {
									console.log("Deleted observation: " + obs.Objectid + ' => ' + JSON.stringify(results.rows.item(0)));
					    		}
							}, 
							DBFuncs.errorCB
						);
					});
					break;
				case 2:
					break;
				}
			},            // callback to invoke with index of button pressed
            'Delete Obs?',           // title
            ['Delete','Cancel']         // buttonLabels
        );
	goHome();
}

function rmObservation(obs) {
	console.log("Deleting observation: " + obs.Objectid);
	iMapDB.transaction(function (tx) {
		var sqlStr = "delete from imiadmin_observation where obsid=?";
		tx.executeSql(sqlStr, [obs.Objectid], 
			function(tx, results) {
				if (results.rows.length > 0) {
					console.log("Deleted observation: " + obs.Objectid + ' => ' + JSON.stringify(results.rows.item(0)));
	    		}
			}, 
			DBFuncs.errorCB
		);
	});
}

//onError Callback receives a PositionError object
//
iMapObservation.prototype.onError = function(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}