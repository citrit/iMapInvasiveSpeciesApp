var iMapApp = iMapApp || {};
        
iMapApp.App = {
    observ: [],
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
        iMapApp.App.observ.push(obs);
        iMapApp.App.saveObservations();
        iMapApp.App.renderCards();
    },
    
    delObservation: function(idx) {
        console.log("Going to delete: " + idx);
        var rid = -1;
        iMapApp.App.observ.forEach( function(el, ind, array ) {
            if (el.getObjectid() == idx) { rid = ind; }
        });
        if (rid != -1) { 
            console.log("Deleting: " + rid);
            iMapApp.App.observ.splice(rid, 1);
            iMapApp.App.saveObservations();
            iMapApp.App.renderCards();
        }
    },
    
    //** Observation persist
    saveObservations: function() {
        var dStr = '[';
        iMapApp.App.observ.forEach( function(el, idx, array ) {
            dStr += JSON.stringify(el.getObsData()) + ',';
        });
        dStr += ']';
        // Put the object into storage
        localStorage.setItem('iMapObservations', dStr);
    },
    
    loadObservations: function() {
        // Retrieve the object from storage
        var retrievedObject = localStorage.getItem('iMapObservations');
        iMapApp.App.observ = [];
        var dObs = eval(retrievedObject);
        if (dObs != null) {
            dObs.forEach( function(el, idx, array ) {
                console.log('retrievedObject: ', el);
                var ob = new iMapApp.Observation(el);
                iMapApp.App.addObservation(ob);
            });
        }
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
        iMapApp.App.observ.forEach( function(el, idx, array ) {
            var dt = new Date(el.getWhen());
            cards_data.push({   
                image: el.getPhotos(),
                project: el.getProject(), 
                species: el.getSpecies(),
                date: el.getWhen(), 
                where: '' + el.getWhere(),
                state: el.getState(),
                county: el.getCounty(),
                objidx: '' + el.getObjectid()
            });
        });
        
        return cards_data;
    },
    
    deleteCards: function() {
        iMapApp.uiUtils.closeDialog();
        var delCards = $( "input:checked" );
        delCards.each(function( index, el ) {
            iMapApp.App.delObservation(el.id);
        });
    },
    
    updateStateData: function(stat) {
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
        .complete(function() { console.log("Load project list complete"); });
        
        console.log("Getting species: " + iMapApp.App.SpeciesURL + stat);
        $.getJSON( iMapApp.App.SpeciesURL + stat, function( pdata ) {
            iMapApp.App.speciesList = {};
            pdata.species.forEach(function(el, ind, array ) {
                iMapApp.App.speciesList[el.statespeciesid ] = [el.statecommonname, el.state_scientific_name];
            });
            localStorage.setItem("speciesList", JSON.stringify(iMapApp.App.speciesList));
            iMapApp.uiUtils.loadSpeciesList();
        }).success(function() { console.log("Load species list second success"); })
        .error(function(err) { alert("Update species list error: " + JSON.stringify(err)); })
        .complete(function() { console.log("Load species list complete"); });
    },
    
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



//page load initialization
$( window ).load(function(){
    console.log("Onload");
    //document.addEventListener('deviceready', iMapApp.App.init, false);
    iMapApp.App.init();
});

        