
var DBFuncs = {
	
	iMapDB: null,
	ProjectList: new Array(),
	SpeciesList: new Array(),
	
	// Application Constructor
    init: function() {
    	iMapApp.debugMsg("DB init");
    	iMapDB = window.sqlitePlugin.openDatabase({  
    		   name : "iMapInvasives"  
    	 });
    	iMapDB.transaction(DBFuncs.checkForUpdates, DBFuncs.errorCB);
    	iMapDB.transaction(DBFuncs.loadProjectList, DBFuncs.errorCB);
    	DBFuncs.loadSpeciesList();
    },
    // load the projects into the DB class
    loadProjectList: function(tx, results) {
    	iMapApp.debugMsg("Load the project list");
    	tx.executeSql("SELECT projectName, id from imiadmin_project ORDER BY projectName ASC", [], function(tx, results) {
    		for (var i=0;i<results.rows.length;i++) {
    			DBFuncs.ProjectList[i] = [ results.rows.item(i).projectName, results.rows.item(i).id];
    		}
    		//iMapApp.debugMsg("iMapDB.ProjectList: " + $.toJSON(DBFuncs.ProjectList));
    	}, DBFuncs.errorCB);
    },
    // which sorting to do.
    loadSpeciesList: function() {
    	DBFuncs.SpeciesList.length = 0;
    	if (iMapPrefs.params.Plants.UseCommon) {
    		iMapDB.transaction(DBFuncs.loadSpeciesByCommonList, DBFuncs.errorCB);
    	}
    	else {
    		iMapDB.transaction(DBFuncs.loadSpeciesByScientificList, DBFuncs.errorCB);
    	}
    },
    // load the species by common nameinto the DB class
    loadSpeciesByCommonList: function(tx, results) {
    	iMapApp.debugMsg("Load the species list");
    	tx.executeSql("SELECT stateCommonName, state_scientific_name, stateSpeciesID from imiadmin_state_species_list ORDER BY stateCommonName ASC", [], function(tx, results) {
    		for (var i=0;i<results.rows.length;i++) {
    			DBFuncs.SpeciesList[i] = [ results.rows.item(i).stateCommonName, results.rows.item(i).state_scientific_name, results.rows.item(i).stateSpeciesID];
    		}
    		//iMapApp.debugMsg("iMapDB.SpeciesList: " + $.toJSON(DBFuncs.SpeciesList));
    	}, DBFuncs.errorCB);
    },
    // load the species by scientific name into the DB class
    loadSpeciesByScientificList: function(tx, results) {
    	iMapApp.debugMsg("Load the species list");
    	tx.executeSql("SELECT stateCommonName, state_scientific_name, stateSpeciesID from imiadmin_state_species_list ORDER BY state_scientific_name ASC", [], function(tx, results) {
    		for (var i=0;i<results.rows.length;i++) {
    			DBFuncs.SpeciesList[i] = [ results.rows.item(i).stateCommonName, results.rows.item(i).state_scientific_name, results.rows.item(i).stateSpeciesID];
    		}
    		//iMapApp.debugMsg("iMapDB.SpeciesList: " + $.toJSON(DBFuncs.SpeciesList));
    	}, DBFuncs.errorCB);
    },
    // check if the database has been loaded.
    checkForUpdates: function(tx, results) {
    	iMapApp.debugMsg("Check for server updates...");
    	tx.executeSql("SELECT count(*) from imiadmin_state_species_list", [], function(tx, results) {
    		if (results.rows.length > 0) {
    			iMapApp.debugMsg("iMapInvasives DB all set.");
    		}
    	}, DBFuncs.errorCB);
    },
    // check if the database has been loaded.
    checkForDataFiles: function(tx, results) {
    	tx.executeSql("DROP TABLE IF EXISTS imiadmin_state_species_list");
    	tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='imiadmin_state_species_list'", [], DBFuncs.firstTimeDBLoad, DBFuncs.errorCB);
    },
    // Exec a simple SQL command
    execSQL: function(sqlStr, callBackFunc) {
    	iMapDB.transaction(callBackFunc, DBFuncs.errorCB);
    },
    //Transaction error callback
    //
    errorCB: function(err) {
        console.log("Error processing SQL: "+$.toJSON(err));
    }
}