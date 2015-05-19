
var DBFuncs = {
	
	iMapDB: null,
	ProjectList: new Array(),
	SpeciesList: new Array(),
	
	// Application Constructor
    init: function() {
    	iMapApp.debugMsg("DB init");
    	iMapDB = window.sqlitePlugin.openDatabase({  
                name : "iMapInvasives.db"
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
        //tx.executeSql("SELECT count(*) from imiadmin_state_species_list"
        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='imiadmin_state_species_list'", [], function(tx, results) {
    		if (results.rows.length > 0) {
    			iMapApp.debugMsg("iMapInvasives DB all set.");
    		}
            else {
                iMapApp.debugMsg("Creating database.");
                for(var i=0, len=createTablesSQL.length; i < len; i++){
                    tx.executeSql(createTablesSQL[i], [],  function(tx, results) {}, DBFuncs.errorCB);
                }
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

var createTablesSQL =  [ 'CREATE TABLE imiadmin_observation (objectid integer NOT NULL, objectid_1 numeric(38,8), objectid_12 numeric(38,8), obsid character varying(255), statespeciesid character varying(255), observer character varying(255), obsorg character varying(255), obsdate timestamp without time zone, obsstate character varying(255), obscountyname character varying(255), obsnationalownership character varying(255), obssitedirections character varying(255), obssiteaccess character varying(255), obsorigxcoord numeric(38,8), obsorigycoord numeric(38,8), obsorigcoordsystem character varying(255), obsorigdatum character varying(255), obsdeterminationmethod character varying(255), obsmethod character varying(255), obscomments character varying(255), projectid character varying(255), assessmentid character varying(255), occurrenceid character varying(255), treatmentid character varying(255), surveyid character varying(255), repositoryavailable smallint, repositorylocation character varying(255), repositorybarcodeid character varying(255), digitalphoto smallint, photourl1 character varying(255), photocredit1 character varying(255), photourl2 character varying(255), photocredit2 character varying(255), photourl3 character varying(255), photocredit3 character varying(255), photourl4 character varying(255), photocredit4 character varying(255), photourl5 character varying(255), photocredit5 character varying(255), photocomments character varying(255), idbyexpert smallint, expertnameid character varying(255), sourceuniqueid character varying(255), imapdataentrydate timestamp without time zone, imapdataentrypersonid character varying(255), imapdataentrymethod character varying(255), imapbulkuploadid character varying(255), obsspeciesidmethod character varying(50), obsdatastatus character varying(50), obssuspiciousdistanceflag smallint, obsdeleteflag character varying(255), obsadmincomments character varying(255), obsqcdate timestamp without time zone, obsqcpersonid character varying(255), obsdate_real timestamp without time zone, obsorigy numeric(38,8), obsorigx numeric(38,8), obslobsdeterminationmethod character varying(255), ojectid numeric(38,8), record_id character varying(255), scientificname character varying(255), commonname character varying(255), organizationname character varying(255), observername character varying(255), expertnamefromuser character varying(255), expertnamefromadmin character varying(255), organization2 character varying(80), organization3 character varying(80), geom1 character varying(255), geom2 character varying(255), geom3 character varying(255), geom4 character varying(255), geom5 character varying(255), geom6 character varying(255), geom7 character varying(255), geom8 character varying(255), geom9 character varying(255), geom10 character varying(255), geom11 character varying(255), geom12 character varying(255), geom13 character varying(255), speciestype character varying(2), significantrecord smallint, minimum_view_level smallint, minimum_report_level smallint, minimum_download_level smallint, shape st_point, aux1 character varying(255), aux2 character varying(255), aux3 character varying(255), aux4 character varying(255), aux5 character varying(255), aux6 character varying(255), aux7 character varying(255), aux8 character varying(255), aux9 character varying(255), aux10 character varying(255), obscomments_long character varying(4000), obssiteaccess_long character varying(4000), obssitedirections_long character varying(4000), repositorybarcodeid_long character varying(4000));',
    'CREATE INDEX a166_ix1 ON imiadmin_observation  (shape);',
    'CREATE INDEX a84_ix1_nydev ON imiadmin_observation (shape);',
    'CREATE UNIQUE INDEX r1277_sde_rowid_uk_nydev ON imiadmin_observation (obsid);',
    'CREATE UNIQUE INDEX r127_sde_rowid_uk_nydev ON imiadmin_observation  (obsid);',
    'CREATE UNIQUE INDEX r208_sde_rowid_uk ON imiadmin_observation (objectid);',
    'CREATE TABLE imiadmin_state_species_list (id integer NOT NULL,national_id character varying(100) NOT NULL,"stateSpeciesID" character varying(255) NOT NULL,"stateCommonName" character varying(255),state_scientific_name character varying(255),"minViewLevel" integer,"minReportLevel" integer,"localURL1" character varying(255),"localURL2" character varying(255),"stateSpeciesComments" character varying(255),"stateHarmType" character varying(100),"stateGrowthHabit_id" integer,"stateHabitat_id" integer,"trackedFlag" boolean NOT NULL,"trackedStatusChangeDate" timestamp with time zone,"trackingComments" character varying(255),"stateiMapIRank_id" integer,"stateiMapIRankChangeDate" timestamp with time zone,"stateiMapIRankComments" character varying(255),"legallyRegulatedInState" boolean NOT NULL,"stateLegalStatus_id" integer,"stateLegalStatusChangeDate" date,"stateLegalStatusComments" character varying(255),"stateMinSepDistance" double precision,"stateMinSepDistanceComments" character varying(255),"stateSuspiciousDistance" double precision,"stateSuspiciousDistanceComments" character varying(255),"stateSpeciesUpdateDate" timestamp with time zone,"stateSpeciesUpdateAuthor_id" integer,"stateSpeciesInitialDate" timestamp with time zone,"stateSpeciesInitialAuthor_id" integer,"commonSpecies" boolean NOT NULL,"featuredSpecies" boolean NOT NULL,"iMapAssessmentTableType" character varying(2),photo_id_url character varying(255),photo_credit text,info_url character varying(255),kingdom character varying(255),taxa_class character varying(255),taxa_family character varying(255),minimumdownloadlevel integer);',
    'CREATE INDEX imiadmin_state_species_list_national_id ON imiadmin_state_species_list (national_id);',
    'CREATE INDEX "imiadmin_state_species_list_stateGrowthHabit_id" ON imiadmin_state_species_list ("stateGrowthHabit_id");',
    'CREATE INDEX "imiadmin_state_species_list_stateHabitat_id" ON imiadmin_state_species_list ("stateHabitat_id");',
    'CREATE INDEX "imiadmin_state_species_list_stateLegalStatus_id" ON imiadmin_state_species_list ("stateLegalStatus_id");',
    'CREATE INDEX "imiadmin_state_species_list_stateSpeciesInitialAuthor_id" ON imiadmin_state_species_list ("stateSpeciesInitialAuthor_id");',
    'CREATE INDEX "imiadmin_state_species_list_stateSpeciesUpdateAuthor_id" ON imiadmin_state_species_list ("stateSpeciesUpdateAuthor_id");',
    'CREATE INDEX "imiadmin_state_species_list_stateiMapIRank_id" ON imiadmin_state_species_list ("stateiMapIRank_id");',
    'CREATE TABLE imiadmin_project (id integer NOT NULL,"projectName" character varying(255) NOT NULL, "projectDescription" text NOT NULL, "projectLeadContact_id" integer, "projectStartDate" date, "projectEndDate" date, "projectActive" boolean NOT NULL, "projectComments" text, project_citizen_science boolean NOT NULL, project_land_manager_project boolean NOT NULL, "projectUpdateDate" date, "projectUpdateAuthor_id" integer, "projectInitialDate" date, "projectInitialAuthor_id" integer, project_cost double precision);',
    'CREATE INDEX "imiadmin_project_projectInitialAuthor_id" ON imiadmin_project ("projectInitialAuthor_id");',
    'CREATE INDEX "imiadmin_project_projectLeadContact_id" ON imiadmin_project ("projectLeadContact_id");',
    'CREATE INDEX "imiadmin_project_projectUpdateAuthor_id" ON imiadmin_project ("projectUpdateAuthor_id");'
];
