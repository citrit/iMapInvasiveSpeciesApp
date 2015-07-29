var selected;
var screenCon;
var tab;
var curObservation;
var obsUploadCount;

$body = $("body");

function startModelLoading() {
    console.log("Loading...");
    $('#spinner').show();
}
function stopModelLoading () {
    console.log("unLoading...");
    $('#spinner').hide();
}

function uiInit() {
	updateOrientation();
	$("#uploadButton").click(function() {
		window.plugins.spinnerDialog.show("Uploading observations","Please wait...");
		$( "#uploadObs" ).dialog( "close" );
		obsUploadCount = 0;
		$(iMapApp.obsvs).each(function(ind, val) {
			if (UploadUtils.doUpload(val)) 
				obsUploadCount++;
			else
				return false;
		});
	});
	// Set size of main menu div
	var hei = $( window ).height();
    hei -= (hei * 0.33);
	console.log("Set height: "+ hei);
	$("#homescreentable").height(hei);
}

function updateOrientation() {
	var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    var height = (window.innerHeight > 0) ? window.innerHeight : screen.height;
    $('#iMapMapdiv').height(height - 200);
    $('#iMapMapdiv').width(width - 25);
    $('#iMapMapdiv').trigger('create');
}

function onNewObservationHandler() {
    window.plugins.spinnerDialog.show("Preparing New Observation","Please wait...");
    console.log("onNewObservation...");
    //startModelLoading();
    clearObservation();
    newObservation();
    //stopModelLoading();
    window.plugins.spinnerDialog.hide();
}

function clearObservation() {
	onPhotoURISuccess('img/empty.png');
	$('#projectSelect').val(iMapPrefs.params.Project);
	//$('#projectPrefSelect option[value="'+iMapPrefs.params.Project+'"]').attr("selected",true);
	$('#projectSelect').selectmenu('refresh', true);
	
	//$('#projectSelect').val("-1");
	//$('#projectSelect').selectmenu("refresh");
	$('#speciesSelect').val("-1");
	$('#speciesSelect').selectmenu("refresh");
	iMapMap.clearMap();
	curObservation = new iMapObservation();
	$('#dateField').val(curObservation.When);
	$('#toggleGPSButton').text("Turn off GPS");
	iMapMap.startGPSTimer();
}

function goHome(){
	/*tab="";
	$('#header-text').text('');
	$('#navi').hide();
	$('#homescreen').show();
	$('#prefsScreen').hide();
	$('#takePic').hide();
	$('#getLoca').hide();
	$('#getDate').hide();
	$('#getProj').hide();
	$('#getSpec').hide();*/
    
    $('#homescreen').show();
    $('#prefsScreen').hide();
    $('#entryScreen').hide();
	//$('#button-footer').hide();
	$('#deleteObsButton').hide();
    
	iMapMap.stopGPSTimer();
	$('#stateSelect').val(iMapPrefs.params.CurrentState);
    $('#stateSelect').selectmenu('refresh', true);
}

function newObservation() {
	console.log("Username: " + JSON.stringify(iMapPrefs.params.Username));
	if (iMapPrefs.params.Username !== "" && iMapPrefs.params.CurrentState !== "") {
		chooseProj();
        chooseSpec();
        $('#projectSelect').val(iMapPrefs.params.Project);
        $('#projectSelect').selectmenu('refresh', true);
        //tabPhoto();
        newEntry();
        iMapMap.setPosition([ -98.583333, 39.833333 ]);
	}
	else
		navigator.notification.alert('Please fill out Preferences first', // message
			function() {prefsHome();}, // callback
			'Notification', // title
			'Ok' // buttonName
		);
}

function newEntry() {
    $('#homescreen').hide();
    $('#prefsScreen').hide();
    $('#entryScreen').show();
    //$('#button-footer').show();
    var wid = $("#getLoca").width();
    var hei = $("#getLoca").height();
    iMapMap.fixSize(wid, hei);
    iMapMap.setMapType(iMapPrefs.params.MapType);
}

/*function tabPhoto(){
    window.plugins.spinnerDialog.hide();
	tab='photo';
	$('#header-text').text('Select Photo');
	$('#pic').addClass('ui-btn-active');
	$('#navi').show();
	$('#homescreen').hide();
	$('#prefsScreen').hide();
	$('#takePic').show();
	$('#getLoca').hide();
	$('#getDate').hide();
	$('#getProj').hide();
	$('#getSpec').hide();
	$('#button-footer').show();
	
}
function tabWhere(){
	tab='where';
	$('#header-text').text('Where');
	$('#wher').addClass('ui-btn-active');
	$('#navi').show();
	$('#homescreen').hide();
	$('#prefsScreen').hide();
	$('#takePic').hide();
	$('#getLoca').show();
	$('#getDate').hide();
	$('#getProj').hide();
	$('#getSpec').hide();
	$('#button-footer').show();
	var wid = $("#getLoca").width();
	var hei = $("#getLoca").height();
	iMapMap.fixSize(wid, hei);
	iMapMap.setMapType(iMapPrefs.params.MapType);
}
function tabWhat(){
	tab='what';
	$('#header-text').text('What Species');
	$('#wha').addClass('ui-btn-active');
	$('#navi').show();
	$('#homescreen').hide();
	$('#prefsScreen').hide();
	$('#takePic').hide();
	$('#getLoca').hide();
	$('#getDate').hide();
	$('#getProj').hide();
	$('#getSpec').show();
	$('#button-footer').show();
}
function tabProject(){
	tab='project';
    $('#projectSelect').selectmenu('refresh', true);
	$('#header-text').text('Select Project');
	$('#proj').addClass('ui-btn-active');
	$('#navi').show();
	$('#homescreen').hide();
	$('#prefsScreen').hide();
	$('#takePic').hide();
	$('#getLoca').hide();
	$('#getDate').hide();
	$('#getProj').show();
	$('#getSpec').hide();
	$('#button-footer').show();
}
function tabWhen(){
	tab = 'when';
	$('#header-text').text('Observation Date');
	$('#dateField').val(curObservation.When);
	$('#whe').addClass('ui-btn-active');
	$('#navi').show();
	$('#homescreen').hide();
	$('#prefsScreen').hide();
	$('#takePic').hide();
	$('#getLoca').hide();
	$('#getDate').show();
	$('#getProj').hide();
	$('#getSpec').hide();
	$('#button-footer').show();
}*/

/*$(document).on("swiperight", function(){
	if(tab=="project"){
		tabPhoto();
	}
	else if(tab=="what"){
		tabProject();
	}
	else if(tab=="when"){
		tabWhat();
	}
	else if(tab=="where"){
		tabWhen();
	}
});
$(document).on("swipeleft", function(){
	if(tab=="photo"){
		tabProject();
	}
	else if(tab=="project"){
		tabWhat();
	}
	else if(tab=="what"){
		tabWhen();
	}
	else if(tab=="when"){
		tabWhere();
	}
});*/


function chooseSpec(){
    console.log("Building Species select");
    //if(iMapPrefs.params.Plants.UseCommon == "true" && iMapPrefs.params.Plants.UseScientific == "true" && iMapPrefs.params.Plants.MyPlants.length == 0){
	selected = "<div data-role='fieldcontain' id='whatDiv'><label for='speciesSelect' style='color:white'>Choose Species:</label><select id='speciesSelect' data-overlay-theme='d' data-theme='b' data-native-menu='false' data-native-menu='false' data-filter='true'>";
	selected += "<option value='-1'></option>";
	for(var i=0;i<DBFuncs.SpeciesList.length;i++){
		var lStr = "";
		if (iMapPrefs.params.Plants.UseCommon)
			lStr = DBFuncs.SpeciesList[i][0];
		if (iMapPrefs.params.Plants.UseCommon && iMapPrefs.params.Plants.UseScientific)
			lStr += ": ";
		if (iMapPrefs.params.Plants.UseScientific)
			lStr += DBFuncs.SpeciesList[i][1];
		selected+="<option value="+i+">"+lStr+"</option>";
	}
	selected += "</select></div>";
	//}
	
	$('#listSpec').empty();
	$('#listSpec').append($(selected)).trigger( "create" );
	$('#listSpec').val(-1);
}
function chooseProj(){
    console.log("Building Projects select");
    $('#listProj').show();
	selected = "<div data-role='fieldcontain' id='projDiv'><label for='projectSelect' style='color:white'>Choose Project:</label><select id='projectSelect' data-overlay-theme='d' data-theme='b' data-native-menu='false' data-native-menu='false' data-filter='true'>";
	selected += "<option value='-1'></option>";
	selected2 = "<div data-role='fieldcontain' id='projPrefDiv'><label for='projectPrefSelect' style='color:white'>Choose default project:</label><select id='projectPrefSelect' data-overlay-theme='d' data-theme='b' data-native-menu='false' data-native-menu='false' data-filter='true'>";
	selected2 += "<option value='-1'></option>";
    //console.log("DBFuncs.ProjectList: " + $.toJSON(DBFuncs.ProjectList));
	for(var i=0;i<DBFuncs.ProjectList.length;i++){
        //console.log("Project: " + $.toJSON(DBFuncs.ProjectList[i]));
        
		selected+="<option value="+DBFuncs.ProjectList[i][1]+">"+DBFuncs.ProjectList[i][0]+"</option>";
		selected2+="<option value="+DBFuncs.ProjectList[i][1]+">"+DBFuncs.ProjectList[i][0]+"</option>";
	}
	selected += "</select></div>";
	selected2 += "</select></div>";
	$('#listProj').empty();
	$('#listProj').append($(selected)).trigger( "create" );
	$('#listProj').val(-1);
	
	$('#listPrefProj').empty();
	$('#listPrefProj').append($(selected2)).trigger( "create" );
	$('#listPrefProj').val(-1);
}
function noChoose(){
	$('#listProj').hide();
}

function stateChangeHandler(sel) {
	if (iMapPrefs.params.CurrentState !== sel.value) {
		console.log("Change in selected state");
	    DBFuncs.stateChange(sel.value);
	    iMapPrefs.params.Project = "";
	    iMapPrefs.params.CurrentState = sel.value;
	    iMapPrefs.saveParams();
	}
}

function prefsHome(){
	window.plugins.spinnerDialog.show("Loading Preferences","Please wait...");
    chooseProj();
    
	$('#fname').val(iMapPrefs.params.Firstname);
	$('#lname').val(iMapPrefs.params.Lastname);
	$('#uname').val(iMapPrefs.params.Username);
	$('#pword').val(iMapPrefs.params.Password);
	
	//iMapPrefs.params.Projects = $('#fname').val();
    //$('#projectPrefSelect option[value="'+iMapPrefs.params.Project+'"]').attr("selected",true);
    console.log("Project: " + iMapPrefs.params.Project);
	$('#projectPrefSelect').val(iMapPrefs.params.Project);
	$('#projectPrefSelect').selectmenu('refresh', true);
	
	$('#checkbox-common').attr('checked', iMapPrefs.params.Plants.UseCommon).checkboxradio("refresh");
	$('#checkbox-scientific').attr('checked', iMapPrefs.params.Plants.UseScientific).checkboxradio("refresh");
	//iMapPrefs.params.Plants.MyPlants = $('#fname').val();
	//iMapPrefs.params.PictureSize = $("input[name=radio-choice-size]:checked").val();
	$('#'+iMapPrefs.params.PictureSize).attr('checked', true).checkboxradio("refresh");
	$('#'+iMapPrefs.params.MapType).attr('checked', true).checkboxradio("refresh");

	//alert($.toJSON(iMapPrefs));
	$('#prefsScreen').show();
	$('#homescreen').hide();
    $('#entryScreen').hide();
    window.plugins.spinnerDialog.hide();
    
}

function uploadObsDialog() {
	if (iMapApp.obsvs.length > 0) {
//		iMapPrefs.loginToMainSite(function (okStat) {
//			if (okStat) {
//				console.log('logged in, time to upload');
//				$("#uploadButton").removeAttr("disabled");
//				$("#uploadButton").click(function () {
//					$( "#uploadObs" ).dialog( "close" );
//					UploadUtils.doUpload();
//				});
//				//'
//				$("#uploadButton").text("Upload Obs");
//			} 
//			else {
//				console.log('Login failed');
//				navigator.notification.alert('Unable to login, is your password correct?', // message
//					function() {}, // callback
//					'Login error', // title
//					'Ok' // buttonName
//				);
//			}
//		});
		lStr = "";
		$(iMapApp.obsvs).each(function(ind, val) {
			lStr += "<li>" + val.When + " : " + val.Species[0] + "</li>";
		});
		//console.log("Upload Obs: " + obsvs);
		$("#obsUploadList").empty();
		$("#obsUploadList").append(lStr);
		$("#uploadObs").dialog({});
		var networkState = navigator.connection.type;

//		$("#uploadButton").attr("disabled", "disabled");
//		$("#uploadButton").text("No Connection");

		// navigator.network.isReachable('fsu.edu',
		// UploadUtils.reachableCallback);
		$.mobile.changePage('#uploadObs', {
			role : "dialog"
		});
	}
	else
		navigator.notification.alert('No observations to save', // message
			function() {}, // callback
			'Notification', // title
			'Ok' // buttonName
		);
}

function writeImageFile() {
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, DBFuncs.errorCB);
}

function gotFS(fileSystem) {
	fileSystem.root.getFile($('#largeImage').attr('src'), {create: true, exclusive: false}, gotFileEntry, DBFuncs.errorCB);
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

function editObs(arg) {
    window.plugins.spinnerDialog.show("Retrieving Observation","Please wait...");
    chooseProj();
    chooseSpec();

    $('#selectObsPage').popup('close');
    $('#deleteObsButton').show();
    //var obsvs = [];
    //loadObservations(obsvs);
    //console.log('Obs[' + arg + ']: ' + JSON.stringify(obsvs[arg]));
    
    curObservation = new iMapObservation(false);
    curObservation.Who = iMapApp.obsvs[arg].Who;
    curObservation.When = iMapApp.obsvs[arg].When;
    curObservation.Project = iMapApp.obsvs[arg].Project;
    curObservation.Species = iMapApp.obsvs[arg].Species;
    curObservation.Where = iMapApp.obsvs[arg].Where;
    curObservation.Objectid = iMapApp.obsvs[arg].Objectid;
    curObservation.ObsState = iMapApp.obsvs[arg].ObsState;
    curObservation.ObsCounty = iMapApp.obsvs[arg].County;
    curObservation.Photos = iMapApp.obsvs[arg].Photos;
    
    onPhotoURISuccess('img/empty.png');
    if (curObservation.Photos[0].length > 0) {
    	onPhotoURISuccess(curObservation.Photos[0]);
    	console.log("PhotoURL: " + curObservation.Photos[0]);
    }
    $('#dateField').val(curObservation.When);
    iMapMap.setPosition(curObservation.Where);
    
    $('#projectSelect').val('-1');
    /*var idx = -1;
     jQuery.each( DBFuncs.ProjectList, function( i, val ) {
     if (val[0] ===curObservation.Project) {
     idx = val[1];
     return false;
     }
     });
     alert(idx);*/
    var opt = $('#projectSelect').find('option[value='+curObservation.Project+']');
    //console.log(curObservation.Project + ' = ' + opt.text());
    opt.attr("selected",true);
    //$('#projectSelect').val(curObservation.Project);
    $('#projectSelect').selectmenu("refresh");
    
    // Set the species list
    $('#speciesSelect').val('-1');
    var indx = 0;
    $.grep(DBFuncs.SpeciesList, function(v,i) {
           if (v[0] === curObservation.Species[0] &&
               v[1] === curObservation.Species[1]) {
           indx = i;
           console.log('Found indx: ' + indx);
           }
           //console.log("Species: " + v + " = " + curObservation.Species);
           return 	v[0] === curObservation.Species[0] &&
           v[1] === curObservation.Species[1];
           });
    //alert('idx: ' + indx);
    var spc = $('#speciesSelect').find('option[value='+indx+']');
    //alert(curObservation.Species + ' = ' + spc.text());
    spc.attr("selected",true);
    $('#speciesSelect').selectmenu("refresh");
    //tabPhoto();
    newEntry();
    window.plugins.spinnerDialog.hide();
    return false;
}

//Save the current observation.
//First set the curObservation fieldw then call save.
function saveObservation() {
    //alert($("#listProj :selected").text());
    var methods = [],
    obj = $('#listSpec').find('#speciesSelect :selected');
    //alert(obj.val());
    curObservation.Species = DBFuncs.SpeciesList[obj.val()];
    console.log("Species: " + JSON.stringify(curObservation.Species));
    
    curObservation.Project = $("#projectSelect :selected").val(); // $("speciesSelect");
    
    curObservation.When = $('#dateField').val();
    curObservation.Where = iMapMap.getObsLocation();
    curObservation.Photos.push($('#largeImage').attr('src'));
    curObservation.ObsState = $('#stateSelect').val();
    //alert($('#largeImage').attr('src'));
    curObservation.save();
    window.setTimeout(DBFuncs.loadAllObservations, 1000);
    goHome();
}

function initObsList() {
    if (iMapApp.obsvs.length > 0) {
        var htmlStr = '<ul data-role="listview" data-inset="true" id="loadObsList">';
        htmlStr += '<li data-role="divider" data-theme="b">Observation</li>';
        $.each(iMapApp.obsvs, function(ind, val) {
               htmlStr += '<li><a href="#" onclick="return editObs(' + ind + ')">' + val.When + " : " + val.Species[0] + '</a></li>';
               });
        htmlStr += '</ul>';
        $('#selectObsPage').html(htmlStr).trigger( "create" );
        //$('#selectObsPage').selectmenu();
        var ret = $("#selectObsPage").popup("open");
    }
    else
        navigator.notification.alert(
                                     'No observations to edit',  // message
                                     function () {},         // callback
                                     'Notification',            // title
                                     'Ok'                  // buttonName
                                     );
    return false;
}

function initSpeciesList() { /// not used.
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
    $('#speciesListDiv').empty();
    $('#speciesListDiv').html(htmlDiv);
    $('#speciesListDiv').selectmenu();
    //console.log($('#speciesListDiv').html());
    //writeSpeciesHTML();
}


// Save the current preferences from the screen
function savePrefs() {
	if ($('#fname').val() == "" || $('#lname').val() == "" || $('#uname').val() == "") {
        navigator.notification.alert('Please fill out Preferences first', // message
                                     function() {}, // callback
                                     'Notification', // title
                                     'Ok' // buttonName
                                     );
        return;
    }
    window.plugins.spinnerDialog.show("Saving Preferences","Please wait...");
    
	iMapPrefs.params.Firstname = $('#fname').val();
	iMapPrefs.params.Lastname = $('#lname').val();
	iMapPrefs.params.Username = $('#uname').val();	
	iMapPrefs.params.Password = $('#pword').val();
	iMapPrefs.params.Project = $("#listPrefProj :selected").val();
	
	if (iMapPrefs.params.Plants.UseCommon !== $('#checkbox-common').is(':checked') ||
			iMapPrefs.params.Plants.UseScientific !== $('#checkbox-scientific').is(':checked')) {
		DBFuncs.loadSpeciesList();
		}
    
    //if (iMapPrefs.params.currentState !== $('#stateSelect').val()) {
    //    DBFuncs.loadProjectList();
    //}
	
    iMapPrefs.params.CurrentState = $('#stateSelect').val();
	iMapPrefs.params.Plants.UseCommon = $('#checkbox-common').is(':checked'); 
	iMapPrefs.params.Plants.UseScientific = $('#checkbox-scientific').is(':checked');
	//iMapPrefs.params.Plants.MyPlants = $('#fname').val();
	iMapPrefs.params.PictureSize = $("input[name=radio-choice-size]:checked").val();
	iMapPrefs.params.MapType = $("input[name=map-type]:checked").val();
	//alert($.toJSON(iMapPrefs));
    
	iMapPrefs.saveParams();
	goHome();
	window.plugins.spinnerDialog.hide();
    
}

function toggleGPS() {
	if ($('#toggleGPSButton').text() == "Turn off GPS") {
		$('#toggleGPSButton').text("Turn on GPS");
		iMapMap.stopGPSTimer();
	}
	else {
		$('#toggleGPSButton').text("Turn off GPS");
		iMapMap.startGPSTimer();
	}
	console.log("Toggling state: " + $('#toggleGPSButton').text());
}

function areYouSure(msg, yes, no) {
	console.log("Are you sure: " + msg);
	//$("#confirmDialog").text(msg).trigger( "create" );;
	$("#confirmDialog").dialog({});
	console.log('Poping up dialog');
	$.mobile.changePage('#confirmDialog',  { role: "dialog" });
	//$("#confirmDialog").dialog();
}

function handleMapType(typ) {
    iMapMap.setMapType(typ);
}

function handleMapTypeRoad() {
    iMapMap.setm('road');
}
