var pictureSource; // picture source
var destinationType; // sets the format of returned value 
var iMapApp = {
	
	debugOut: true,
	
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
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
    	console.log("onDeviceReady made it here.");
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
    	
    	chooseProj();
    	chooseSpec();
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

function editObs(arg) {
	$('#selectObsPage').popup('close');
	$('#deleteObsButton').show();
	var obsvs = [];
	loadObservations(obsvs);
	//console.log('Obs[' + arg + ']: ' + JSON.stringify(obsvs[arg]));
	
	curObservation = new iMapObservation(false);
	curObservation.Who = obsvs[arg].Who;
	curObservation.When = obsvs[arg].When;
	curObservation.Project = obsvs[arg].Project;
	curObservation.Species = obsvs[arg].Species;
	curObservation.Where = obsvs[arg].Where;
	curObservation.Objectid = obsvs[arg].Objectid;
	curObservation.ObsState = obsvs[arg].ObsState;
	curObservation.ObsCounty = obsvs[arg].County;
	curObservation.Photos = obsvs[arg].Photos;
	
	onPhotoURISuccess(curObservation.Photos[0]);
	$('#dateField').val(curObservation.When);
	iMapMap.setPosition(curObservation.Where);
	
	$('#projectSelect').val('');
	var idx = jQuery.inArray(curObservation.Project, DBFuncs.ProjectList);
	//alert(idx);
	var opt = $('#projectSelect').find('option[value=option'+idx+']');
	//alert(curObservation.Project + ' = ' + opt.text());
	opt.attr("selected",true);
	$('#projectSelect').selectmenu("refresh");
	
	// Set the species list
	$('#speciesSelect').val('');
	var indx = 0;
	$.grep(DBFuncs.SpeciesList, function(v,i) {
		if (v[0] === curObservation.Species[0] &&
	    		v[1] === curObservation.Species[1])
			indx = i;
	    return indx > 0;
	});
	//alert('idx: ' + indx);
	var spc = $('#speciesSelect').find('option[value='+indx+']');
	//alert(curObservation.Species + ' = ' + spc.text());
	spc.attr("selected",true);
	$('#speciesSelect').selectmenu("refresh");
	tabPhoto();
	return false;
}

function clearObservation() {
	onPhotoURISuccess('');
	$('#projectSelect').val(0);
	$('#projectSelect').selectmenu("refresh");
	$('#speciesSelect').val(0);
	$('#speciesSelect').selectmenu("refresh");
}


//Save the current observation.
//First set the curObservation fieldw then call save.
function saveObservation() {
	//alert($("#listProj :selected").text());
	var methods = [],
		obj = $('#listSpec').find('#speciesSelect :selected');
	//alert(obj.val());
	curObservation.Species = DBFuncs.SpeciesList[obj.val()];
	
	curObservation.Project = $("#listProj :selected").text(); // $("speciesSelect");
	
	//curObservation.When = $('#dateField').val();
	curObservation.Photos.push($('#largeImage').attr('src'));
	//alert($('#largeImage').attr('src'));
	curObservation.save();
	goHome();
}

function initObsList() {
	var obsvs = [];
	loadObservations(obsvs);
	var htmlStr = '<ul data-role="listview" data-inset="true" id="loadObsList">';
	htmlStr += '<li data-role="divider" data-theme="b">Observation</li>';
	$.each(obsvs, function(ind, val) {
		htmlStr += '<li><a href="#" onclick="return editObs(' + ind + ')">' + val.When + " : " + val.Species[0] + '</a></li>';
	});
	htmlStr += '</ul>';
	$('#selectObsPage').html(htmlStr).trigger( "create" );
	//$('#selectObsPage').selectmenu();
	var ret = $("#selectObsPage").popup("open");
	return false;
}

function initSpeciesList() {
	var curIndex = null;
	var htmlDiv = "<ul>";
	//console.log($('#speciesListDiv').html());
	$(DBFuncs.SpeciesList).each ( function () {
		if ($(this)[0].charAt(0) != '*') {
			if ((typeof this[0] == 'string') && (curIndex != $(this)[0].charAt(0))) {
				if (curIndex != null) {
					//htmlDiv += "</fieldset></div>";
					htmlDiv += "</ul></li>";
				}
				curIndex = $(this)[0].charAt(0);
				//htmlDiv += '<div data-role="collapsible"><h3>' + curIndex + 
				//	'</h3><fieldset id="specList-' + $(this)[0].charAt(0) + '" data-role="controlgroup" data-type="vertical">';
				htmlDiv += "<li><a>"+ curIndex + "</a><ul>";
			}
			//htmlDiv += "<input id='" + $(this)[0] + "' value='" + $(this)[0] + "' data-theme='c' type='checkbox'>" +
			//"<label for='" + $(this)[0] + "'>" + $(this)[0] + "</label>";
			htmlDiv += "<li><a>" + $(this)[0] + "<a></li>";
		}
	});
	htmlDiv += "</ul>";
	$('#speciesListDiv').html(htmlDiv);
	$('#speciesListDiv').selectmenu();
	//console.log($('#speciesListDiv').html());
	//writeSpeciesHTML();
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
