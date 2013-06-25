var DBFuncs = {
	
	iMapDB: null,
	
	// Application Constructor
    init: function() {
    	iMapApp.debugMsg("DB init");
    	iMapDB = window.openDatabase("iMapDB", "1.0", "iMap Invasive Species DB", 1000000);
    	iMapDB.transaction(DBFuncs.checkForDataFiles, DBFuncs.errorCB);
    	iMapDB.transaction(DBFuncs.checkForUpdates, DBFuncs.errorCB);
    },
    // check if the database has been loaded.
    checkForUpdates: function(tx, results) {
    	iMapApp.debugMsg("Check for server updates...");
    },
    // check if the database has been loaded.
    checkForDataFiles: function(tx, results) {
    	tx.executeSql("DROP TABLE IF EXISTS imiadmin_state_species_list");
    	tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='imiadmin_state_species_list'", [], DBFuncs.firstTimeDBLoad, DBFuncs.errorCB);
    },
	// Application Constructor
    firstTimeDBLoad: function(tx, results) {
    	iMapApp.debugMsg($.toJSON(results.rows));
    	
    	if (results.rows.length == 0) {
        	iMapApp.debugMsg("DB time to create the tables...");
    		DBFuncs.loadSQLFile(tx, "res/state_species_list.sql");
    	}
    	else {
        	iMapApp.debugMsg("DB is initialized. Nothinh to do here");
    	}
    },
    // Load the state species list
	loadSQLFile: function(tx, sqlFile) {
    	var request = new XMLHttpRequest();
    	iMapApp.debugMsg("Loading: " + sqlFile);
        request.open("GET", sqlFile, false);
        var rcnt = 0;
        request.onreadystatechange = function(){
        	iMapApp.debugMsg("state = " + request.readyState);
            if (request.readyState == 4) {
                if (request.status == 200 || request.status == 0) {
                    var sqlQueries = request.responseText.split("\n");
                    var curTable = "";
                    $.each(sqlQueries, function(index, val) {
						if (val.substr(0,6) == "CREATE") {
							//iMapApp.debugMsg("create: " + $.toJSON(val));
							if (val.substr(0,12) == "CREATE TABLE") {
								curTable = val.split(" ")[2];
							}
							tx.executeSql(val);
							rcnt++;
						}
						else {
							if (val.length > 0) {
								DBFuncs.execInsertCmd(tx,val, curTable);
								rcnt++;
							}
						}
                    });
                    iMapApp.debugMsg("Executed [" + rcnt + "] sql statements");
                }
            }
        }
        request.send();
    },
    // Parse Date
    dateFromString: function(str) {
    	var m = str.match(/(\d+)-(\d+)-(\d+)\s+(\d+):(\d+):(\d+)\.(\d+)/);
    	var ret = Number.NaN;
    	if (m && m.length > 6) {
    		ret = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6] * 100);
    	}
    	return ret;
    },
    // Exec insert command
    execInsertCmd: function(tx, val, intoTable) {
    	//vals = val.replace(/	/g, ",");
    	vals = val.split("	");
    	var sqlCmd = "INSERT INTO " + intoTable + " VALUES(";
    	$.each(vals, function(index, val) {
    		if (!isNaN(parseInt(val)) || !isNaN(parseFloat(val))) {
    			sqlCmd += val + ",";
    		}
    		else if (val == "t") {
    			sqlCmd += "TRUE,";
    		}
    		else if (val == "f") {
    			sqlCmd += "FALSE,";
    		}
    		else if (!isNaN(DBFuncs.dateFromString(val))){
    			sqlCmd += "Date(" + val + "),";
    		}
    		else {
    			sqlCmd += "\"" + val + "\",";
    		}
    		
    	});
    	//sqlCmd += vals
    	sqlCmd = sqlCmd.substr(0,sqlCmd.length-1) + ")";
    	iMapApp.debugMsg("execInserted: " + sqlCmd);
    	tx.executeSql(sqlCmd, null, DBFuncs.errorCB);
    },
    execSQL: function(sqlStr, callBackFunc) {
    	iMapDB.transaction(callBackFunc, DBFuncs.errorCB);
    },
    //Transaction error callback
    //
    errorCB: function(err) {
        console.log("Error processing SQL: "+$.toJSON(err));
    }
}