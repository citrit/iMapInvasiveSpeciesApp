
// Hold the iMap Observation and define methods to to save to the DB the records.
function iMapObservation(){

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
    this.Objectid = 0;
    this.ObsState = "NY";
    this.ObsCounty = "Albany";
    var curobs = this;
	navigator.geolocation.getCurrentPosition(function (position) {
			curobs.Where = [ position.coords.longitude, position.coords.latitude];
			iMapApp.debugMsg("Position: " + $.toJSON(curobs.Where));
			alert('location: ' + $.toJSON(curobs.Where));
			iMapMap.setPosition(curobs.Where);
		},
		function() {
			curobs.Where = [ -73.8648, 42.7186 ];
			iMapApp.debugMsg("Position: " + $.toJSON(curobs.Where));
			alert('location: ' + $.toJSON(curobs.Where));
			iMapMap.setPosition(curobs.Where);
		}//,
		//{maximumAge: 300000, timeout:10000, enableHighAccuracy : true}
	);

	// Save the current observation to the internal table.
	this.save = function(){
		
		var obsv = this;
		alert("Obs: " + $.toJSON(this));
		iMapDB.transaction(function (tx) {
			tx.executeSql("Select objectid from imiadmin_observation where objectid=?" , [obsv.Objectid], function(tx, results) {
				if (results.rows.length == 0) {
					var sqlStr = 'INSERT INTO imiadmin_observation (objectid, obsid,Obsorg,observername,Imapdataentrypersonid,Imapdataentrydate, Obsdate,obsstate,projectid,statespeciesid,commonname,scientificname,obsorigxcoord,obsorigycoord, repositoryavailable,digitalphoto,imapdataentrymethod,obsdatastatus,obscountyname) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
					var parms = [obsv.Objectid, obsv.Objectid, "Org", obsv.Who, obsv.Who, obsv.When, obsv.When, obsv.ObsState, obsv.Project, 
					             obsv.Species[0], obsv.Species[1], obsv.Species[2],
					             obsv.Where[0], obsv.Where[1], 2, 1, "app", 1000, obsv.ObsCounty];

					//repositoryavailable (set to 2 for all data)
					//digitalphoto (0 if there are no photos, otherwise 1)
					//imapdataentrymethod (set to for all data)
					//obsdatastatus (set to for all data)
					//shape
					 
					//geometry columns (something to talk about in the future.  We have a point in polygon routine that assigns up to 14 values based on where the point falls.  There is a table that contains the names of the layers that the state has chosen.  Lets just skip this for now.
					//obscountyname
					tx.executeSql(sqlStr, parms);
				}
				else {
					var sqlStr = 'UPDATE imiadmin_observation SET obsid=?,Obsorg=?,observername=?,Imapdataentrypersonid=?,Imapdataentrydate=?, Obsdate=?,obsstate=?,projectid=?,statespeciesid=?,commonname=?,scientificname=?,obsorigxcoord=?,obsorigycoord=?, repositoryavailable=?,digitalphoto=?,imapdataentrymethod=?,obsdatastatus=?,obscountyname=? WHERE objectid=?';
					var parms = [obsv.Objectid, "Org", obsv.Who, obsv.Who, obsv.When, obsv.When, obsv.ObsState, obsv.Project, 
					             obsv.Species[0], obsv.Species[1], obsv.Species[2],
					             obsv.Where[0], obsv.Where[1], 2, 1, "app", 1000, obsv.ObsCounty,obsv.Objectid];
		            			iMapApp.debugMsg("Updating Obs: " + $.toJSON(obsv.Objectid));					
					tx.executeSql(sqlStr, parms);
				}
			}, DBFuncs.errorCB);
		});
	};

}

//Save the current observation to the internal table.
iMapObservation.prototype.loadObservations = function(obsvs){
	var ret = null;
	iMapDB.transaction(function (tx) {
		var sqlStr = "select objectid, obsid,Obsorg,Observername,Imapdataentrypersonid,Imapdataentrydate, Obsdate,obsstate,projectid,statespeciesid,commonname,scientificname,obsorigxcoord,obsorigycoord, repositoryavailable,digitalphoto,imapdataentrymethod,obsdatastatus,obscountyname from imiadmin_observation";
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
		            obsv.Objectid = results.rows.item(i).objectid;
		            obsv.ObsState = results.rows.item(i).obsstate;
		            obsv.ObsCounty = results.rows.item(i).obscountyname;
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