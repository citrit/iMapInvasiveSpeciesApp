var selected;
var screenCon;
var tab;
var curObservation;

function uiInit() {
	updateOrientation();
	$("#uploadButton").click(function() {
		$( "#uploadObs" ).dialog( "close" );
		var upCnt = 0;
		var obsvs = [];
		loadObservations(obsvs);
		$(obsvs).each(function(ind, val) {
			if (UploadUtils.doUpload(val)) 
				upCnt++;
			else
				return false;
		});
		if (upCnt > 0)
			alert('Uploaded [' + upCnt + '] records.');
		
	});
}

function updateOrientation() {
	var width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    var height = (window.innerHeight > 0) ? window.innerHeight : screen.height;
    $('#iMapMapdiv').height(height - 200);
    $('#iMapMapdiv').width(width - 25);
    $('#iMapMapdiv').trigger('create');
}

function goHome(){
	$('#header-text').text('');
	$('#navi').hide();
	$('#homescreen').show();
	$('#prefsScreen').hide();
	$('#takePic').hide();
	$('#getLoca').hide();
	$('#getDate').hide();
	$('#getProj').hide();
	$('#getSpec').hide();
	$('#button-footer').hide();
	$('#deleteObsButton').hide();
}
function tabPhoto(){
	console.log("Username: " + JSON.stringify(iMapPrefs.params.Username));
	if (iMapPrefs.params.Username !== "") {
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
	else
		navigator.notification.alert('Please fill out Preferences first', // message
			function() {prefsHome();}, // callback
			'Notification', // title
			'Ok' // buttonName
		);
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
}

$(document).on("swiperight", function(){
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
});
function chooseSpec(){
	//if(iMapPrefs.params.Plants.UseCommon == "true" && iMapPrefs.params.Plants.UseScientific == "true" && iMapPrefs.params.Plants.MyPlants.length == 0){
	selected = "<div data-role='fieldcontain' id='whatDiv'><label for='speciesSelect'>Choose:</label><select id='speciesSelect' data-overlay-theme='d' data-theme='b' data-native-menu='false' data-native-menu='false' data-filter='true'>";
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
	$('#listProj').show();
	selected = "<div data-role='fieldcontain' id='projDiv'><label for='projectSelect'>Choose:</label><select id='projectSelect' data-overlay-theme='d' data-theme='b' data-native-menu='false' data-native-menu='false' data-filter='true'>";
	selected += "<option value='-1'></option>";
	for(var i=0;i<DBFuncs.ProjectList.length;i++){
		selected+="<option value="+DBFuncs.ProjectList[i][1]+">"+DBFuncs.ProjectList[i][0]+"</option>";
	}
	selected += "</select></div>";
	$('#listProj').empty();
	$('#listProj').append($(selected)).trigger( "create" );
	$('#listProj').val(-1);
}
function noChoose(){
	$('#listProj').hide();
}

function prefsHome(){
	$('#fname').val(iMapPrefs.params.Firstname);
	$('#lname').val(iMapPrefs.params.Lastname);
	$('#uname').val(iMapPrefs.params.Username);
	$('#pword').val(iMapPrefs.params.Password);
	//iMapPrefs.params.Projects = $('#fname').val();
	$('#checkbox-common').attr('checked', iMapPrefs.params.Plants.UseCommon).checkboxradio("refresh");
	$('#checkbox-scientific').attr('checked', iMapPrefs.params.Plants.UseScientific).checkboxradio("refresh");
	//iMapPrefs.params.Plants.MyPlants = $('#fname').val();
	//iMapPrefs.params.PictureSize = $("input[name=radio-choice-size]:checked").val();
	$('#'+iMapPrefs.params.PictureSize).attr('checked', true).checkboxradio("refresh");
	//alert($.toJSON(iMapPrefs));
	$('#prefsScreen').show();
	$('#homescreen').hide();
}

function uploadObsDialog() {
	var obsvs = [];
	loadObservations(obsvs);
	if (obsvs.length > 0) {
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
		$(obsvs).each(function(ind, val) {
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

// Save the current preferences from the screen
function savePrefs() {
	iMapPrefs.params.Firstname = $('#fname').val();
	iMapPrefs.params.Lastname = $('#lname').val();
	iMapPrefs.params.Username = $('#uname').val();	
	iMapPrefs.params.Password = $('#pword').val();
	//iMapPrefs.params.Projects = $('#fname').val();
	iMapPrefs.params.Plants.UseCommon = $('#checkbox-common').is(':checked'); 
	iMapPrefs.params.Plants.UseScientific = $('#checkbox-scientific').is(':checked');
	//iMapPrefs.params.Plants.MyPlants = $('#fname').val();
	iMapPrefs.params.PictureSize = $("input[name=radio-choice-size]:checked").val();
	//alert($.toJSON(iMapPrefs));
	iMapPrefs.saveParams();
	DBFuncs.loadSpeciesList();
	chooseSpec();
	goHome();
}

function areYouSure(msg, yes, no) {
	console.log("Are you sure: " + msg);
	//$("#confirmDialog").text(msg).trigger( "create" );;
	$("#confirmDialog").dialog({});
	console.log('Poping up dialog');
	$.mobile.changePage('#confirmDialog',  { role: "dialog" });
	//$("#confirmDialog").dialog();
}
