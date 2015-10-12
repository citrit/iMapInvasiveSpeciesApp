var pictureSource; // picture source
var destinationType; // sets the format of returned value 
var iMapApp = {
	
	debugOut: true,
    obsvs: [],
	
	// Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("orientationChanged", updateOrientation);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
    	console.log("onDeviceReady made it here.");
        
    	//navigator.splashscreen.show();
    	iMapPrefs.init();
    	DBFuncs.init();
    	pictureSource=navigator.camera.PictureSourceType;
    	destinationType=navigator.camera.DestinationType;
    	
    	//if (iMapPrefs.loginToMainSite()) {
    		//alert('logged in to main site');
    	//}
    	//else {
    		//alert('not logged in to main site');
    	//}
    	iMapMap.init();
    	//initSpeciesList();
    	//$("#speciesListDiv").jstree({ 
    	//	"plugins" : [ "themes", "html_data", "checkbox", "sort", "ui" ]
    	//});
    	// next add the onclick handler
    	$("#openSelectPopup").click(initObsList);
    	
    	// Confirm Dialog 
		$("#confirmDialog").dialog({
			autoOpen: false,
			modal: true
		});
    	
    	uiInit();
        //DBFuncs.iMapDB.transaction(iMapApp.loadObservations);
    	goHome();
    },
    // Output debug messages.
    debugMsg: function(msg) {
    	if (iMapApp.debugOut)
    		console.log( msg );
    }
};

function setRadio(id, checked) {
    var radio = $('#' + id);
    radio[0].checked = checked;
    radio.button().button("refresh");
}


function writeSpeciesHTML() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, DBFuncs.errorCB);
}

function gotFS(fileSystem) {
    fileSystem.root.getFile("specieslist.html", {create: true, exclusive: false}, gotFileEntry, DBFuncs.errorCB);
}

function gotFileEntry(fileEntry) {
    fileEntry.createWriter(gotFileWriter, DBFuncs.errorCB);
}

function gotFileWriter(writer) {
    writer.onwriteend = function(evt) {
        console.log("contents of file now 'some sample text'");
    };
    writer.write($('#speciesListDiv').html());
}
