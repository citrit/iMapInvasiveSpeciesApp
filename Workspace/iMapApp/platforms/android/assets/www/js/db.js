
var DBFuncs = {
	
	iMapDB: null,
	ProjectList: new Array(),
	SpeciesList: new Array(),
	SpeciesURL: 'http://hermes.freac.fsu.edu/requests/state_species/species?state=',
	ProjectsURL: 'http://hermes.freac.fsu.edu/requests/state_species/project?state=',
    curState: '',

	// Application Constructor
    init: function() {
    	iMapApp.debugMsg("DB init");
    	iMapDB = window.sqlitePlugin.openDatabase({  
                name : "iMapInvasives.db"
    	 });
    	iMapDB.transaction(DBFuncs.checkForUpdates, DBFuncs.errorCB);
    	iMapDB.transaction(DBFuncs.loadProjectsByName, DBFuncs.errorCB);
    	DBFuncs.loadSpeciesList();
        iMapDB.transaction(DBFuncs.loadObservations, DBFuncs.errorCB);
    },
    
    loadProjects: function() {
        iMapDB.transaction(DBFuncs.loadObservations, DBFuncs.errorCB);
    },
    
    //Save the current observation to the internal table.
    loadObservations: function(tx1, results){
        console.log("Loading observations...");
        iMapApp.obsvs.length = 0;
        var sqlStr = "select * from imiadmin_observation";
        tx1.executeSql("select * from imiadmin_observation", [],
                   function(tx, results) {
                    console.log("Found observations");
                       
                   for (var i=0;i<results.rows.length;i++) {
                       console.log("Creating observation");
                       var obsv = Object();
                       obsv.Objectid = results.rows.item(i).objectid;
                       obsv.Who = results.rows.item(i).observername;
                       obsv.When = results.rows.item(i).imapdataentrydate;
                       obsv.Project = results.rows.item(i).projectid;
                       obsv.Species = [];
                       obsv.Species[0] = results.rows.item(i).commonname;
                       obsv.Species[1] = results.rows.item(i).scientificname;
                       obsv.Species[2] = results.rows.item(i).statespeciesid;
                       obsv.Where = [];
                       obsv.Where[0] = results.rows.item(i).obsorigxcoord;
                       obsv.Where[1] = results.rows.item(i).obsorigycoord;
                       obsv.Objectid = results.rows.item(i).objectid;
                       obsv.ObsState = results.rows.item(i).obsstate;
                       obsv.ObsCounty = results.rows.item(i).obscountyname;
                       obsv.Photos = [];
                       obsv.Photos.push(results.rows.item(i).photourl1);
                       iMapApp.obsvs.push(obsv);
                       console.log("load observation: " + $.toJSON(obsv));
                   }
                   },
                   DBFuncs.errorCB);
        console.log("Obsvs count: " + iMapApp.obsvs.length);
    },
    
    // load the projects into the DB class
    loadProjectList: function() {
        DBFuncs.ProjectList.length = 0;
        iMapDB.transaction(DBFuncs.loadProjectsByName, DBFuncs.errorCB);
    },
    // Load the projects
    loadProjectsByName: function(tx, results) {
    	iMapApp.debugMsg("Load the project list");
        tx.executeSql("SELECT projectName, id from imiadmin_project ORDER BY projectName ASC", [], function(tx, results) {
    		for (var i=0;i<results.rows.length;i++) {
                DBFuncs.ProjectList[i] = [ results.rows.item(i).projectName, results.rows.item(i).id];
    		}
    		//iMapApp.debugMsg("DBFuncs.ProjectList: " + $.toJSON(DBFuncs.ProjectList));
    	}, DBFuncs.errorCB);
    },
    // which sorting to do.
    loadSpeciesList: function() {
    	DBFuncs.SpeciesList.length = 0;
        iMapDB.transaction(DBFuncs.loadSpeciesByCommonList, DBFuncs.errorCB);
    },
    // load the species by common nameinto the DB class
    loadSpeciesByCommonList: function(tx, results) {
    	iMapApp.debugMsg("Load the species list");
        var sqlStr = "";
        if (iMapPrefs.params.Plants.UseCommon) {
            sqlStr = "SELECT stateCommonName, state_scientific_name, stateSpeciesID from imiadmin_state_species_list ORDER BY stateCommonName ASC";
        }
        else {
            sqlStr = "SELECT stateCommonName, state_scientific_name, stateSpeciesID from imiadmin_state_species_list ORDER BY state_scientific_name ASC";
        }
    	tx.executeSql(sqlStr, [], function(tx, results) {
    		for (var i=0;i<results.rows.length;i++) {
    			DBFuncs.SpeciesList[i] = [ results.rows.item(i).stateCommonName, results.rows.item(i).state_scientific_name, results.rows.item(i).stateSpeciesID];
    		}
    		//iMapApp.debugMsg("iMapDB.SpeciesList: " + $.toJSON(DBFuncs.SpeciesList));
    	}, DBFuncs.errorCB);
    },
    // check if the database has been loaded.
    checkForUpdates: function(tx, results) {
    	iMapApp.debugMsg("Check for server updates...");
        //tx.executeSql("SELECT count(*) from imiadmin_state_species_list"
        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='imiadmin_state_species_list'", [], function(tx, results) {
    		if (results.rows.length > 0) {
    			iMapApp.debugMsg("iMapInvasives DB all set.");
    		}
            else {
            	window.plugins.spinnerDialog.show("Creating tables","Please wait...");
                iMapApp.debugMsg("Creating database.");
                for(var i=0, len=createTablesSQL.length; i < len; i++){
                    tx.executeSql(createTablesSQL[i], [],  function(tx, results) {}, DBFuncs.errorCB);
                }
                window.plugins.spinnerDialog.hide();
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
    errorCB: function(tx, err) {
        console.log("Error processing SQL: "+$.toJSON(tx)+$.toJSON(err));
    },
    //Transaction error callback
    //
    successCB: function(tx, results) {
        console.log("Success: "+$.toJSON(results));
    },
    
    /// State change callback
    stateChange: function(sta) {
        DBFuncs.curState = sta;
        console.log("State: " + sta);
        iMapDB.transaction(DBFuncs.clearTables, DBFuncs.errorCB);
        //iMapDB.transaction(DBFuncs.updateStateData, DBFuncs.errorCB);
        DBFuncs.updateStateData();
        DBFuncs.loadSpeciesList();
        chooseSpec();
        DBFuncs.loadProjectList();
        chooseProj();
        
    },
    
    clearTables: function(tx, results) {
        // Delete all the rows first
        tx.executeSql('DELETE FROM imiadmin_project', [],  DBFuncs.successCB, DBFuncs.errorCB);
        tx.executeSql('DELETE FROM imiadmin_state_species_list', [],  DBFuncs.successCB, DBFuncs.errorCB);
        console.log("Deleted rows from tables");
    },
    
    updateStateData: function(tx, results) {
        window.plugins.spinnerDialog.show("Loading tables","Please wait...");
        $.getJSON( DBFuncs.ProjectsURL + DBFuncs.curState, function( pdata ) {
                  iMapDB.transaction(function(tx, results) {
                                     var sqlStr = 'INSERT INTO imiadmin_project (id, projectname) VALUES (?,?)';
                                     $.each( pdata.projects, function( key, val ) {
                                            //console.log( "Project id: " + val.id + "  Name: " + val.projectname );
                                            var parms = [parseInt(val.id), val.projectname];
                                            tx.executeSql(sqlStr, parms, DBFuncs.successCB, DBFuncs.errorCB);
                                            });
                                            DBFuncs.loadProjectsByName(tx, null);
                                     },
                                     DBFuncs.errorCB,
                                     function(tx, results) {
                                        });
    		});
    	$.getJSON( DBFuncs.SpeciesURL + DBFuncs.curState, function( sdata ) {
                  iMapDB.transaction(function(tx, results) {
                                     var sqlStr = 'INSERT INTO imiadmin_state_species_list (statespeciesid, statecommonname, state_scientific_name) VALUES (?,?,?)';
                                     $.each( sdata.species, function( key, val ) {
                                            //console.log( "Species id: " + val.statespeciesid + "  Name: " + val.statecommonname + " : " + val.state_scientific_name );
                                            var parms = [val.statespeciesid, val.statecommonname, val.state_scientific_name];
                                            tx.executeSql(sqlStr, parms, function(tx, results) {}, DBFuncs.errorCB);
                                            });
                                     DBFuncs.loadSpeciesByCommonList(tx, null);
                                     window.plugins.spinnerDialog.hide();
                                     },
                                     DBFuncs.errorCB,
                                     function(tx, results) {
                                        });
    		});
    },
    
    // Insert Species
    insertSpecies: function(specs, tx) {
    	
    },
    
    // Insert projects
    insertProjects: function(projs, tx) {
        
    }
}

var createTablesSQL =  [ 'CREATE TABLE imiadmin_observation (objectid integer NOT NULL, objectid_1 numeric(38,8), objectid_12 numeric(38,8), obsid character varying(255), statespeciesid character varying(255), observer character varying(255), obsorg character varying(255), obsdate timestamp without time zone, obsstate character varying(255), obscountyname character varying(255), obsnationalownership character varying(255), obssitedirections character varying(255), obssiteaccess character varying(255), obsorigxcoord numeric(38,8), obsorigycoord numeric(38,8), obsorigcoordsystem character varying(255), obsorigdatum character varying(255), obsdeterminationmethod character varying(255), obsmethod character varying(255), obscomments character varying(255), projectid character varying(255), assessmentid character varying(255), occurrenceid character varying(255), treatmentid character varying(255), surveyid character varying(255), repositoryavailable smallint, repositorylocation character varying(255), repositorybarcodeid character varying(255), digitalphoto smallint, photourl1 character varying(255), photocredit1 character varying(255), photourl2 character varying(255), photocredit2 character varying(255), photourl3 character varying(255), photocredit3 character varying(255), photourl4 character varying(255), photocredit4 character varying(255), photourl5 character varying(255), photocredit5 character varying(255), photocomments character varying(255), idbyexpert smallint, expertnameid character varying(255), sourceuniqueid character varying(255), imapdataentrydate timestamp without time zone, imapdataentrypersonid character varying(255), imapdataentrymethod character varying(255), imapbulkuploadid character varying(255), obsspeciesidmethod character varying(50), obsdatastatus character varying(50), obssuspiciousdistanceflag smallint, obsdeleteflag character varying(255), obsadmincomments character varying(255), obsqcdate timestamp without time zone, obsqcpersonid character varying(255), obsdate_real timestamp without time zone, obsorigy numeric(38,8), obsorigx numeric(38,8), obslobsdeterminationmethod character varying(255), ojectid numeric(38,8), record_id character varying(255), scientificname character varying(255), commonname character varying(255), organizationname character varying(255), observername character varying(255), expertnamefromuser character varying(255), expertnamefromadmin character varying(255), organization2 character varying(80), organization3 character varying(80), geom1 character varying(255), geom2 character varying(255), geom3 character varying(255), geom4 character varying(255), geom5 character varying(255), geom6 character varying(255), geom7 character varying(255), geom8 character varying(255), geom9 character varying(255), geom10 character varying(255), geom11 character varying(255), geom12 character varying(255), geom13 character varying(255), speciestype character varying(2), significantrecord smallint, minimum_view_level smallint, minimum_report_level smallint, minimum_download_level smallint, shape st_point, aux1 character varying(255), aux2 character varying(255), aux3 character varying(255), aux4 character varying(255), aux5 character varying(255), aux6 character varying(255), aux7 character varying(255), aux8 character varying(255), aux9 character varying(255), aux10 character varying(255), obscomments_long character varying(4000), obssiteaccess_long character varying(4000), obssitedirections_long character varying(4000), repositorybarcodeid_long character varying(4000));',
    'CREATE UNIQUE INDEX r1277_sde_rowid_uk_nydev ON imiadmin_observation (obsid);',
    'CREATE UNIQUE INDEX r127_sde_rowid_uk_nydev ON imiadmin_observation  (obsid);',
    'CREATE UNIQUE INDEX r208_sde_rowid_uk ON imiadmin_observation (objectid);',
    'CREATE TABLE imiadmin_state_species_list (id integer,national_id character varying(100),"stateSpeciesID" character varying(255) NOT NULL,"stateCommonName" character varying(255),state_scientific_name character varying(255),"minViewLevel" integer,"minReportLevel" integer,"localURL1" character varying(255),"localURL2" character varying(255),"stateSpeciesComments" character varying(255),"stateHarmType" character varying(100),"stateGrowthHabit_id" integer,"stateHabitat_id" integer,"trackedFlag" boolean ,"trackedStatusChangeDate" timestamp with time zone,"trackingComments" character varying(255),"stateiMapIRank_id" integer,"stateiMapIRankChangeDate" timestamp with time zone,"stateiMapIRankComments" character varying(255),"legallyRegulatedInState" boolean,"stateLegalStatus_id" integer,"stateLegalStatusChangeDate" date,"stateLegalStatusComments" character varying(255),"stateMinSepDistance" double precision,"stateMinSepDistanceComments" character varying(255),"stateSuspiciousDistance" double precision,"stateSuspiciousDistanceComments" character varying(255),"stateSpeciesUpdateDate" timestamp with time zone,"stateSpeciesUpdateAuthor_id" integer,"stateSpeciesInitialDate" timestamp with time zone,"stateSpeciesInitialAuthor_id" integer,"commonSpecies" boolean,"featuredSpecies" boolean,"iMapAssessmentTableType" character varying(2),photo_id_url character varying(255),photo_credit text,info_url character varying(255),kingdom character varying(255),taxa_class character varying(255),taxa_family character varying(255),minimumdownloadlevel integer);',
    'CREATE INDEX imiadmin_state_species_list_id ON imiadmin_state_species_list (national_id);',
    'CREATE TABLE imiadmin_project (id integer NOT NULL,"projectName" character varying(255) NOT NULL, "projectDescription" text, "projectLeadContact_id" integer, "projectStartDate" date, "projectEndDate" date, "projectActive" boolean, "projectComments" text, project_citizen_science boolean, project_land_manager_project boolean, "projectUpdateDate" date, "projectUpdateAuthor_id" integer, "projectInitialDate" date, "projectInitialAuthor_id" integer, project_cost double precision);',
    'CREATE INDEX "imiadmin_project_id" ON imiadmin_project ("id");',
];
