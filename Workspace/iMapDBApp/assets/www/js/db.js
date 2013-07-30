<<<<<<< HEAD

=======
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
    	iMapDB.transaction(DBFuncs.loadSpeciesList, DBFuncs.errorCB);
    },
    // load the projects into the DB class
    loadProjectList: function(tx, results) {
    	iMapApp.debugMsg("Load the project list");
    	tx.executeSql("SELECT projectName from imiadmin_project", [], function(tx, results) {
    		for (var i=0;i<results.rows.length;i++) {
    			DBFuncs.ProjectList[i] = results.rows.item(i).projectName;
    		}
    		//iMapApp.debugMsg("iMapDB.ProjectList: " + $.toJSON(DBFuncs.ProjectList));
    	}, DBFuncs.errorCB);
    },
    // load the projects into the DB class
    loadSpeciesList: function(tx, results) {
    	iMapApp.debugMsg("Load the species list");
    	tx.executeSql("SELECT stateCommonName, state_scientific_name from imiadmin_state_species_list", [], function(tx, results) {
    		for (var i=0;i<results.rows.length;i++) {
    			DBFuncs.SpeciesList[i] = [ results.rows.item(i).stateCommonName, results.rows.item(i).state_scientific_name];
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
>>>>>>> e3f781303c399c0b85886447457c24383b0a5e4a
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
    	iMapDB.transaction(DBFuncs.loadSpeciesList, DBFuncs.errorCB);
    },
    // load the projects into the DB class
    loadProjectList: function(tx, results) {
    	iMapApp.debugMsg("Load the project list");
    	tx.executeSql("SELECT projectName from imiadmin_project", [], function(tx, results) {
    		for (var i=0;i<results.rows.length;i++) {
    			DBFuncs.ProjectList[i] = results.rows.item(i).projectName;
    		}
    		//iMapApp.debugMsg("iMapDB.ProjectList: " + $.toJSON(DBFuncs.ProjectList));
    	}, DBFuncs.errorCB);
    },
    // load the projects into the DB class
    loadSpeciesList: function(tx, results) {
    	iMapApp.debugMsg("Load the species list");
    	tx.executeSql("SELECT stateCommonName, state_scientific_name from imiadmin_state_species_list", [], function(tx, results) {
    		for (var i=0;i<results.rows.length;i++) {
    			DBFuncs.SpeciesList[i] = [ results.rows.item(i).stateCommonName, results.rows.item(i).state_scientific_name];
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