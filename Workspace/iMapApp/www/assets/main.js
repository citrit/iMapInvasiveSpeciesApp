var iMapApp = iMapApp || {};
        
iMapApp.App = {
    observ: {},
    compiledCardTemplate: null,
    SpeciesURL: 'http://hermes.freac.fsu.edu/requests/state_species/species?state=',
	ProjectsURL: 'http://hermes.freac.fsu.edu/requests/state_species/project?state=',
    projectList: null,
    speciesList: null,

    init: function() {
        console.log("iMapApp.init");
        iMapApp.App.compiledCardTemplate = Mustache.compile( $("#card-template").html() );
        iMapApp.iMapPrefs.init();
        iMapApp.App.projectList = JSON.parse(localStorage.getItem("projectList"));
        iMapApp.App.speciesList = JSON.parse(localStorage.getItem("speciesList"));
        iMapApp.uiUtils.init();
        //debugTest();
        iMapApp.App.loadObservations();
        iMapApp.App.renderCards();
        //iMapApp.iMapMap.init();
    },
    
    //
    // ** Observations helpers
    //
    addObservation: function(obs) {
        iMapApp.App.observ[obs.getObjectID()] = obs;
        iMapApp.App.saveObservations();
        iMapApp.App.renderCards();
    },
    
    delObservation: function(idx) {
        console.log("Going to delete: " + idx);
        if (iMapApp.App.observ[idx].getPhotos() != "") {
            console.log("Deleteing image: " + iMapApp.App.observ[idx].getPhotos());
            iMapApp.App.removeImage(iMapApp.App.observ[idx].getPhotos());
        }
        delete iMapApp.App.observ[idx];
        iMapApp.App.saveObservations();
        iMapApp.App.renderCards();
    },
    
    //** Observation persist
    saveObservations: function() {
        var dStr = '[';
        for (var key in iMapApp.App.observ) {
            var el = iMapApp.App.observ[key];
            dStr += JSON.stringify(el.getObsData()) + ',';
        };
        dStr += ']';
        // Put the object into storage
        localStorage.setItem('iMapObservations', dStr);
        //localStorage.setItem('iMapObservations', JSON.stringify(iMapApp.App.observ));
    },
    
    loadObservations: function() {
        // Retrieve the object from storage
        var retrievedObject = localStorage.getItem('iMapObservations');
        iMapApp.App.observ = {};
        var dObs = eval(retrievedObject);
        if (dObs != null) {
            dObs.forEach( function(el, idx, array ) {
                console.log('retrievedObject: ', el);
                var ob = new iMapApp.Observation(el);
                iMapApp.App.addObservation(ob);
            });
        }
    },
    
    uploadObservations: function(obsIDs) {
        iMapApp.uiUtils.closeDialog();
        iMapApp.uiUtils.waitDialogOpen('Uploading Observations', obsIDs.length);
        
        obsIDs.each(function(ind, el ) {
            var spec = iMapApp.App.observ[el.id].getSpecies();
            iMapApp.uiUtils.updateStatusBar("Uploading: " + spec);
            iMapApp.uploadUtils.doUpload(iMapApp.App.observ[el.id]);
            iMapApp.uiUtils.updateStatusBar("Done: " + spec);
        });
    },
    
    numObservations: function() { return iMapApp.App.observ.length; },
    getObservation: function(idx) { return iMapApp.App.observ[idx]; },
 
    //
    // UI Helpers
    renderCards: function() {
        iMapApp.uiUtils.layoutColumns(iMapApp.App.compiledCardTemplate);
    },
    
   
    getCardsData: function() {
        var cards_data = [];
        for (var key in iMapApp.App.observ) {
            var el = iMapApp.App.observ[key];
            var ph = new Date(el.getWhen());
            cards_data.push({   
                image: el.getPhotos(),
                project: el.getProject(), 
                species: el.getSpecies(),
                date: el.getWhen(), 
                where: '' + el.getWhere(),
                state: el.getState(),
                county: el.getCounty(),
                objidx: '' + el.getObjectID()
            });
        };
        
        return cards_data;
    },
    
    deleteCards: function(delCards) {
        delCards.each(function( index, el ) {
            iMapApp.App.delObservation(el.id);
        });
        iMapApp.App.renderCards();
    },
    
    updateStateData: function(stat) {
        iMapApp.uiUtils.waitDialogOpen('Updating Projects and Species', 2);
        console.log("Getting projects: " + iMapApp.App.ProjectsURL + stat);
        $.getJSON( iMapApp.App.ProjectsURL + stat, function( pdata ) {
            iMapApp.App.projectList = {};
            pdata.projects.forEach(function(el, ind, array ) {
                iMapApp.App.projectList[el.id] = el.projectname;
            });
            localStorage.setItem("projectList", JSON.stringify(iMapApp.App.projectList));
            iMapApp.uiUtils.loadProjectList();
        }).success(function() { console.log("Load project list second success"); })
        .error(function(err) { alert("Update project list error: " + JSON.stringify(err)); })
        .complete(function() { console.log("Load project list complete");
                            iMapApp.uiUtils.waitDialogClose();});
        
        console.log("Getting species: " + iMapApp.App.SpeciesURL + stat);
        $.getJSON( iMapApp.App.SpeciesURL + stat, function( pdata ) {
            iMapApp.App.speciesList = {};
            pdata.species.forEach(function(el, ind, array ) {
                iMapApp.App.speciesList[el.statespeciesid ] = [el.statecommonname, el.state_scientific_name];
            });
            localStorage.setItem("speciesList", JSON.stringify(iMapApp.App.speciesList));
        }).success(function() { console.log("Load species list second success"); })
        .error(function(err) { alert("Update species list error: " + JSON.stringify(err)); })
        .complete(function() { console.log("Load species list complete"); 
                             iMapApp.uiUtils.waitDialogClose();});
        
        // Clear out the preferences my species list
        iMapApp.iMapPrefs.params.Plants.MyPlants.length = 0;
    },
    
    //
    // ** Utilities
    //
    sortProjsByName: function(a, b) {
      var aName = a.projectname.toLowerCase();
      var bName = b.projectname.toLowerCase(); 
      return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
    },
    
    sortSpecsByName: function(a, b) {
      var aName = a.statecommonname.toLowerCase();
      var bName = b.statecommonname.toLowerCase(); 
      return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
    },
    
    getProjectName: function(id) {
        return iMapApp.App.projectList[id];
    },
    
    getSpeciesName: function(id) {
        var lStr = "";
        if (iMapApp.iMapPrefs.params.Plants.UseCommon)
            lStr = iMapApp.App.speciesList[id][0] ;
        if (iMapApp.iMapPrefs.params.Plants.UseCommon && iMapApp.iMapPrefs.params.Plants.UseScientific)
            lStr += ": ";
        if (iMapApp.iMapPrefs.params.Plants.UseScientific)
            lStr += iMapApp.App.speciesList[id][1];
        return lStr;
    },
    
    guid: function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    },
    
    // get a new file entry for the moved image when the user hits the delete button
    // pass the file entry to removeFile()
    removeImage : function(imageURI){
      window.resolveLocalFileSystemURL(imageURI, iMapApp.App.removeFile, iMapApp.App.errorHandler);
    },

    // delete the file
    removeFile : function(fileEntry){
      fileEntry.remove();
    },

    // simple error handler
    errorHandler : function(e) {
        var msg = '';
        switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
               msg = 'QUOTA_EXCEEDED_ERR';
               break;
        case FileError.NOT_FOUND_ERR:
               msg = 'NOT_FOUND_ERR';
               break;
        case FileError.SECURITY_ERR:
               msg = 'SECURITY_ERR';
               break;
        case FileError.INVALID_MODIFICATION_ERR:
               msg = 'INVALID_MODIFICATION_ERR';
               break;
        case FileError.INVALID_STATE_ERR:
               msg = 'INVALID_STATE_ERR';
               break;
        default:
               msg = e.code;
        break;
        };
        console.log('Error: ' + msg);
    }
}
        
function debugTest() {
    console.log("Adding debug records");
    var obs = new iMapApp.Observation();
    obs.setCounty('Albany');
    obs.setProject('Toms project');
    obs.setSpecies('Common something or other');
    obs.setState('NY');
    obs.setWhen(Date.now());
    obs.setWhere([-48.56, 73.456]);
    iMapApp.App.addObservation(obs);
    
    obs = new iMapApp.Observation();
    obs.setCounty('Schenectady');
    obs.setProject('Jackies project');
    obs.setSpecies('Bobcat');
    obs.setState('NY');
    obs.setWhen(Date.now());
    obs.setWhere([-49.56, 72.456]);
    obs.setPhotos("assets/images/new.png")
    iMapApp.App.addObservation(obs);
    
    iMapApp.App.saveObservations();
    iMapApp.App.loadObservations();
    
    iMapApp.iMapPrefs.params.Firstname= "Tom";
    iMapApp.iMapPrefs.params.Lastname = "Citriniti";
    iMapApp.iMapPrefs.params.Username= "tomcitriniti";
    iMapApp.iMapPrefs.params.Project = "My Project";
    iMapApp.iMapPrefs.params.Firstname= "Tom";
    
}

if (navigator.platform == 'MacIntel') {
    console.log("Setting Chrome Debug vars");
    var Connection = {};
    Connection.WIFI = 1;
    navigator.connection = {};
    navigator.connection.type = Connection.WIFI;
}
    

//page load initialization
$( window ).load(function(){
    console.log("Onload " + navigator.platform);
    document.addEventListener('deviceready', iMapApp.App.init, false);
    //iMapApp.App.init();
});

        