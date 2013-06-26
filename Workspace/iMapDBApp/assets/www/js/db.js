var DBFuncs = {
	
	iMapDB: null,
	
	// Application Constructor
    init: function() {
    	iMapApp.debugMsg("DB init");
    	iMapDB = window.sqlitePlugin.openDatabase({  
    		   name : "iMapInvasives"  
    	 });
    	iMapDB.transaction(DBFuncs.checkForUpdates, DBFuncs.errorCB);
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