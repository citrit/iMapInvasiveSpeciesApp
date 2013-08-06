
// Hold the iMap Observation and define methods to to save to the DB the records.
function iMapObservation(){

	iMapObservation.prototype.Photos = new Array();
	iMapObservation.prototype.Who = iMapPrefs.params.Username;
	iMapObservation.prototype.Project = "";
	iMapObservation.prototype.Species = new Array();
	iMapObservation.prototype.When = new Date().toLocaleString();
	iMapObservation.prototype.Where = [ 0.0, 0.0 ];
	navigator.geolocation.getCurrentPosition(function (position) {
			this.Where = [ position.coords.longitude, position.coords.latitude];
			iMapApp.debugMsg("Position: " + $.toJSON(position));
		}, 
		function() {
			iMapApp.debugMsg("Position: " + $.toJSON(this.Where));
		}//,
		//{maximumAge: 300000, timeout:10000, enableHighAccuracy : true}
	);
}

// Save the current observation to the internal table.
iMapObservation.prototype.save = function(){
	
	var obsv = this;
	
	iMapDB.transaction(function (tx) {
		var sqlStr = 'INSERT INTO imiadmin_observation (Objectid, Obsid,Obsorg,Observername,Imapdataentrypersonid,Imapdataentrydate, Obsdate,obsstate,projectid,statespeciesid,commonname,scientificname,obsorigxcoord,obsorigycoord, repositoryavailable,digitalphoto,imapdataentrymethod,obsdatastatus,obscountyname) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
		var parms = [-1, -1, "Org", obsv.Who, obsv.Who, obsv.When, obsv.When, "NY", obsv.Project, 
		             obsv.Species[0], obsv.Species[1], obsv.Species[2],
		             obsv.Where[0], obsv.Where[1], 2, 1, "app", 1000, "Albany"];

		//repositoryavailable (set to 2 for all data)
		//digitalphoto (0 if there are no photos, otherwise 1)
		//imapdataentrymethod (set to “app” for all data)
		//obsdatastatus (set to ‘1000’ for all data)
		//shape
		 
		//geometry columns (something to talk about in the future.  We have a point in polygon routine that assigns up to 14 values based on where the point falls.  There is a table that contains the names of the layers that the state has chosen.  Lets just skip this for now.
		//obscountyname
		tx.executeSql(sqlStr, parms);
	}, DBFuncs.errorCB);
}

//Save the current observation to the internal table.
iMapObservation.prototype.loadObservations = function(obsvs){
	var ret = null;
	iMapDB.transaction(function (tx) {
		var sqlStr = "select Objectid, Obsid,Obsorg,Observername,Imapdataentrypersonid,Imapdataentrydate, Obsdate,obsstate,projectid,statespeciesid,commonname,scientificname,obsorigxcoord,obsorigycoord, repositoryavailable,digitalphoto,imapdataentrymethod,obsdatastatus,obscountyname from imiadmin_observation";
		tx.executeSql(sqlStr, [], 
			function(tx, results) {
				for (var i=0;i<results.rows.length;i++) {
					var obsv = new iMapObservation();
	    			//DBFuncs.ProjectList[i] = results.rows.item(i).projectName;
	    			obsv.Who = results.rows.item(i).Observername;
	    			obsv.When = results.rows.item(i).Imapdataentrydate;
	    			obsv.Project = results.rows.item(i).projectid;
		            obsv.Species[0] = results.rows.item(i).statespeciesid;
		            obsv.Species[1] = results.rows.item(i).commonname;
		            obsv.Species[2] = results.rows.item(i).scientificname;
		            obsv.Where[0] = results.rows.item(i).obsorigxcoord; 
		            obsv.Where[1] = results.rows.item(i).obsorigycoord;
		            obsvs.push(obsv);
		            iMapApp.debugMsg("load observation: " + $.toJSON(obsv));
	    		}
			}, 
		DBFuncs.errorCB);
	});
}

//onError Callback receives a PositionError object
//
iMapObservation.prototype.onError = function(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}