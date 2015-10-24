var iMapApp = iMapApp || {};

/**
  * Abstract Cell class which defines the API for all drawable
  * entities to follow
  */   
iMapApp.Observation = function(od) 
{
    var obsData = ( od == null?{
        Photos: null,
        Proj: "",
        ProjID: "",
        Species: new Array(),
        SpeciesID: "",
        When: Date.now(),
        Where: [ 0.0, 0.0 ],
        Objectid: iMapApp.App.guid(),
        State: "",
        County: ""
    } : od);
    
    // Getters
    this.getPhotos = function() { return obsData.Photos; }
    this.getProject = function() { return obsData.Proj; }
    this.getProjectID = function() { return obsData.ProjID; }
    this.getSpecies = function() { return obsData.Species; }
    this.getSpeciesID = function() { return obsData.SpeciesID; }
    this.getWhen = function() { return obsData.When; }
    this.getWhere = function() { return obsData.Where; }
    this.getObjectID = function() { return obsData.Objectid; }
    this.getState = function() { return obsData.State; }
    this.getCounty = function() { return obsData.County; }
    this.getObsData = function() { return obsData; }
    
    // Setters
    this.setPhotos = function(p) { obsData.Photos = p; }
    this.setProject = function(p) { obsData.Proj = p; }
    this.setProjectID = function(p) { obsData.ProjID = p; }
    this.setSpecies = function(s) { obsData.Species = s; }
    this.setSpeciesID = function(s) { obsData.SpeciesID = s; }
    this.setWhen = function(w) { obsData.When = w; }
    this.setWhere = function(w) { obsData.Where = w; }
    //this.setObjectid = function(oi) { obsData.Objectid = oi; }
    this.setState = function(s) { obsData.State = s; }
    this.setCounty = function(c) { obsData.County = c; }
    this.setObsData = function(od) { obsData = od; }
    
    // Serialization
    this.toJSON = function() { JSON.stringify(obsData);}
}
    
    
    /*
    
	// Save the current observation to the internal table.
	this.save = function(){
		
		var obsv = this;
		console.log("Saving Obs: " + $.toJSON(this));
		iMapDB.transaction(function (tx) {
			tx.executeSql("Select objectid from imiadmin_observation where objectid=?" , [obsv.Objectid], function(tx, results) {
                console.log("Doing record: " + obsv.Objectid);
				if (results.rows.length == 0) {
					var sqlStr = 'INSERT INTO imiadmin_observation (objectid, obsid,Obsorg,observername,Imapdataentrypersonid,Imapdataentrydate, Obsdate,obsstate,projectid,statespeciesid,commonname,scientificname,obsorigxcoord,obsorigycoord, repositoryavailable,digitalphoto,imapdataentrymethod,obsdatastatus,obscountyname, photourl1) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
					var parms = [obsv.Objectid, obsv.Objectid, "Org", obsv.Who, obsv.Who, obsv.When, obsv.When, obsv.ObsState, obsv.Project, 
					             obsv.Species[2], obsv.Species[0], obsv.Species[1],
					             obsv.Where[0], obsv.Where[1], 2, 1, "app", 1000, obsv.ObsCounty, obsv.Photos[0]];
                    console.log("Inserting Obs: " + $.toJSON(obsv.Objectid));
                    tx.executeSql(sqlStr, parms, DBFuncs.successCB, DBFuncs.errorCB);
                }
				else {
                    console.log("Inserting this time");
					var sqlStr = 'UPDATE imiadmin_observation SET obsid=?,Obsorg=?,observername=?,Imapdataentrypersonid=?,Imapdataentrydate=?, Obsdate=?,obsstate=?,projectid=?,statespeciesid=?,commonname=?,scientificname=?,obsorigxcoord=?,obsorigycoord=?, repositoryavailable=?,digitalphoto=?,imapdataentrymethod=?,obsdatastatus=?,obscountyname=?,photourl1=? WHERE objectid=?';
                    console.log("SqlStr worked");
                    var parms = [obsv.Objectid, "Org", obsv.Who, obsv.Who, obsv.When, obsv.When, obsv.ObsState, obsv.Project,
					             obsv.Species[2], obsv.Species[0], obsv.Species[1],
                                 obsv.Where[0], obsv.Where[1], 2, 1, "app", 1000, obsv.ObsCounty, obsv.Photos[0], obsv.Objectid ];
                    console.log("Updating Obs: " + $.toJSON(obsv.Objectid));
                    tx.executeSql(sqlStr, parms, DBFuncs.successCB, DBFuncs.errorCB);
                }
                DBFuncs.loadAllObservations();
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

*/