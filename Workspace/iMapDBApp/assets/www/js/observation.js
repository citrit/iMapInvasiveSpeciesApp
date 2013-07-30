
// Hold the iMap Observation and define methods to to save to the DB the records.
function iMapObservation(){

	iMapObservation.prototype.Photos = new Array();
	iMapObservation.prototype.Who = iMapPrefs.params.Username;
	iMapObservation.prototype.Project = null;
	iMapObservation.prototype.Species = null;
	iMapObservation.prototype.When = new Date().toLocaleString();
	iMapObservation.prototype.Where = null;
	navigator.geolocation.getCurrentPosition(function (position) {
			this.Where = [ position.coords.longitude, position.coords.latitude];
			iMapApp.debugMsg("Position: " + $.toJSON(position));
		}, 
		function() {
			this.Where = [ 0.0, 0.0 ];
			iMapApp.debugMsg("Position: " + $.toJSON(this.Where));
		},
		{maximumAge: 300000, timeout:10000, enableHighAccuracy : true}
	);
}

// Add methods like this.  All Person objects will be able to invoke this
iMapObservation.prototype.save = function(){
	
	iMapDB.transaction(function (tx) {
		var sqlStr = 'INSERT INTO imiadmin_observation (Objectid, Obsid,Obsorg,Observername,Imapdataentrypersonid,Imapdataentrydate, Obsdate,obsstate,projectid,statespeciesid,commonname,scientificname,obsorigxcoord,obsorigycoord, repositoryavailable,digitalphoto,imapdataentrymethod,obsdatastatus,obscountyname) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
		var parms = [-1, -1, "Org", this.Who, this.Who, this.When, this.When, "NY", this.Project, 
		             this.Species[0], this.Species[1], this.Species[2],
		             this.Where[0], this.Where[1], 2, 1, "app", 1000, "Albany"];

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

//onError Callback receives a PositionError object
//
iMapObservation.prototype.onError = function(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}