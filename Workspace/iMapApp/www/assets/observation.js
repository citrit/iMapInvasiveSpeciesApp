var iMapApp = iMapApp || {};

/**
 * Abstract Cell class which defines the API for all drawable
 * entities to follow
 */
iMapApp.Observation = function(od) {
    var obsData = (od == null ? {
        Photos: null,
        Proj: "",
        ProjID: "",
        iMap3ProjId: null,
        iMap3Org: null,
        Species: new Array(),
        SpeciesID: "",
        Detected: null,
        iMap3SpeciesID: null,
        AssesmentType: "",
        When: Date.now(),
        Where: [0.0, 0.0],
        SearchedArea: null,
        Objectid: iMapApp.App.guid(),
        Size: "o",
        SizeMetric: "oo",
        Dist: "0",
        NumTrees: 0,
        TimeSurvey: 0,
        AilanthusDBHGreaterSix: 0,
        Comment: "",
        iMap3Compatible: true, // any new records will be iMap 3 compatible, otherwise older records will not have this field
    } : od);

    // Getters
    this.getPhotos = function() { return obsData.Photos; };
    this.getPhotosFileName = function() { return obsData.Photos.replace(/^.*[\\\/]/, ''); }; //get just the file name
    this.getProject = function() { return obsData.Proj; };
    this.getProjectID = function() { return obsData.ProjID; };
    this.getiMap3ProjId = function() { return obsData.iMap3ProjId; };
    this.getiMap3Org = function() { return obsData.iMap3Org; };
    this.getSpecies = function() { return obsData.Species; };
    this.getSpeciesID = function() { return obsData.SpeciesID; };
    this.getiMap3SpeciesID = function() { return obsData.iMap3SpeciesID; };
    this.getDetected = function() { return obsData.Detected; };
    this.getWhen = function() { return obsData.When; };
    this.getWhere = function() { return obsData.Where; };
    this.getSearchedArea = function() { return obsData.SearchedArea; };
    this.getObjectID = function() { return obsData.Objectid; };
    this.getState = function() { return obsData.State; };
    this.getCounty = function() { return obsData.County; };
    this.getSize = function() { return obsData.Size; };
    this.getSizeMetric = function() { return obsData.SizeMetric; };
    this.getDist = function() { return obsData.Dist; };
    this.getNumTrees = function() { return obsData.NumTrees; };
    this.getTimeSurvey = function() { return obsData.TimeSurvey; };
    this.getAilanthusDBHGreaterSix = function() { return obsData.AilanthusDBHGreaterSix; };
    this.getComment = function() { return obsData.Comment; };
    this.getiMap3Compatible = function() { return obsData.iMap3Compatible; };
    this.getObsData = function() { return obsData; };

    // Setters
    this.setPhotos = function(p) { obsData.Photos = p; };
    this.setProject = function(p) { obsData.Proj = p; };
    this.setProjectID = function(p) { obsData.ProjID = p; };
    this.setiMap3ProjId = function(p) { obsData.iMap3ProjId = p; };
    this.setiMap3Org = function(o) { obsData.iMap3Org = o; };
    this.setiMap3SpeciesID = function(s) { obsData.iMap3SpeciesID = s; };
    this.setDetected = function(d) { obsData.Detected = d; };
    this.setWhen = function(w) { obsData.When = w; };
    this.setWhere = function(w) { obsData.Where = w; };
    this.setSearchedArea = function(b) { obsData.SearchedArea = b; };
    this.setState = function(s) { obsData.State = s; };
    this.setCounty = function(c) { obsData.County = c; };
    this.setSize = function(s) { obsData.Size = s; };
    this.setSizeMetric = function(sm) { obsData.SizeMetric = sm; };
    this.setDist = function(d) { obsData.Dist = d; };
    this.setNumTrees = function(n) { obsData.NumTrees = n; };
    this.setTimeSurvey = function(t) { obsData.TimeSurvey = t; };
    this.setAilanthusDBHGreaterSix = function(d) { obsData.AilanthusDBHGreaterSix = d; };
    this.setComment = function(c) { obsData.Comment = c; };
    this.setiMap3Compatible = function(c) { obsData.iMap3Compatible = c; };
    this.setObsData = function(od) { obsData = od; };

    // Serialization
    this.toJSON = function() { JSON.stringify(obsData); };
};


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