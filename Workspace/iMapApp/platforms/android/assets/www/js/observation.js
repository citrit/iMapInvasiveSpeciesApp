
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
    
    this.When = UploadUtils.getDateTime();
    this.Where = [ 0.0, 0.0 ];
    var obsvs = [];
    this.Objectid = iMapApp.obsvs.length+1;
    console.log("obs.Object.id: " + this.Objectid)
    this.ObsState = "NY";
    this.ObsCounty = "Albany";
    var curobs = this;
    if (typeof dontDoWhere === "undefined") {
		
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
                    console.log("Inserting Obs: " + $.toJSON(obsv.Objectid));
                    tx.executeSql(sqlStr, parms, DBFuncs.successCB, DBFuncs.errorCB);
                }
				else {
					var sqlStr = 'UPDATE imiadmin_observation SET obsid=?,Obsorg=?,observername=?,Imapdataentrypersonid=?,Imapdataentrydate=?, Obsdate=?,obsstate=?,projectid=?,statespeciesid=?,commonname=?,scientificname=?,obsorigxcoord=?,obsorigycoord=?, repositoryavailable=?,digitalphoto=?,imapdataentrymethod=?,obsdatastatus=?,obscountyname=?,photourl1=? WHERE objectid=?';
					var parms = [obsv.Objectid, "Org", obsv.Who, obsv.Who, obsv.When, obsv.When, obsv.ObsState, obsv.Project, 
					             obsv.Species[2], obsv.Species[0], obsv.Species[1],
                                 obsv.Where[0], obsv.Where[1], 2, 1, "app", 1000, obsv.ObsCounty, obsv.Photos[0], obsv.Objectid];
                    console.log("Updating Obs: " + $.toJSON(obsv.Objectid));
                    tx.executeSql(sqlStr, parms, DBFuncs.successCB, DBFuncs.errorCB);
                }
			}, DBFuncs.errorCB);
		});
	};

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
                                window.setTimeout(DBFuncs.loadAllObservations, 1000);
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
				window.setTimeout(DBFuncs.loadAllObservations, 1000);
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