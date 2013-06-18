var DBFuncs = {
	
	// Application Constructor
    init: function() {
    	iMapApp.debugMsg("DB init");
    	iMapDB = window.openDatabase("iMapDB", "1.0", "iMap Invasive Species DB", 400000);
    	iMapDB.transaction(DBFuncs.checkForDataFiles, DBFuncs.errorCB);
    },
    // check if the database has been loaded.
    checkForDataFiles: function(tx, results) {
    	tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='imiadmin_state_species_list'", [], DBFuncs.firstTimeDBLoad, DBFuncs.errorCB);
    },
	// Application Constructor
    firstTimeDBLoad: function(tx, results) {
    	iMapApp.debugMsg("DB time to load the tables...");
    	iMapApp.debugMsg($.toJSON(results.rows));
    	
    	if (results.rows.length == 0) {
    		iMapApp.debugMsg('time to init database');
    		DBFuncs.loadStateSpeciesList(tx);
    	}
    },
    // Load the state species list
	loadStateSpeciesList: function(tx) {
    	var request = new XMLHttpRequest();
    	iMapApp.debugMsg("Loading species list");
        request.open("GET", "res/state_species_list.sql", false);
        request.onreadystatechange = function(){
        	iMapApp.debugMsg("state = " + request.readyState);
            if (request.readyState == 4) {
                if (request.status == 200 || request.status == 0) {
                    var sqlQueries = request.responseText.split("\n");
                    $.each(sqlQueries, function(index, val) {
                    	iMapApp.debugMsg("val: " + val);
						if (val.substr(0,5) == "CREATE") {
							tx.executeSql(val);
						}
						else {
							DBFuncs.execInsertCmd(tx,val);
						}
                    });
                }
            }
        }
        request.send();
    },
    // Exec insert command
    execInsertCmd: function(tx, val) {
    	vals = val.split("	");
    	iMapApp.debugMsg("execInsert: " + $.toJSON(vals));
    },
    //Transaction error callback
    //
    errorCB: function(err) {
        console.log("Error processing SQL: "+err.code);
    }
}