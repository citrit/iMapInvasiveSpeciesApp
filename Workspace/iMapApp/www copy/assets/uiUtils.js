var iMapApp = iMapApp || {};

// Preferences for the app.
var MIN_COL_WIDTH = 300;

iMapApp.uiUtils = {
    params: {
        content: null,
        columns: 0,
        navbar: null,
        curObs: null
    },
    init: function() {
        iMapApp.uiUtils.content = $(".content");
        $(window).resize(iMapApp.uiUtils.onResize);
        iMapApp.uiUtils.params.navbar = $('.navbar').navbar({
            dropDownLabel: '<span class="icon"></span>',
            breakPoint: 1024, // define manual breakpoint - set it to 0 means no manual breakpoint
            toggleSpeed: 200 // call your togglespeed here -- set it to 0 to turn it off
        });
        iMapApp.uiUtils.loadProjectList();
        iMapApp.uiUtils.loadSpeciesList();
        // Bind actions to HTML elements
        $( "#uploadMenu" ).click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            var n = $( "#content input:checked" ).length;
            if (n == 0) {
                $('p[name="infoDialText"]').text('Please select cards.');
                iMapApp.uiUtils.openDialog('#infoDialog', 'Nothing selected to upload');
            }
            else {
                $('p[name="uplDialText"]').text('Are you sure you want to upload ' + n + ' Records?');
                iMapApp.uiUtils.openDialog('#uploadDialog', 'Upload Observations');
            }
        });
        $( "#deleteMenu" ).click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            var n = $( "#content input:checked" ).length;
            if (n == 0) {
                $('p[name="infoDialText"]').text('Please select cards.');
                iMapApp.uiUtils.openDialog('#infoDialog', 'Nothing selected to delete');
            }
            else {
                $('p[name="delDialText"]').text('Are you sure you want to delete ' + n + ' Records?');
                iMapApp.uiUtils.openDialog('#deleteDialog', 'Delete Observations');
            }
        });
        $( "#prefsMenu" ).click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            iMapApp.uiUtils.editPrefs();
        });
        $( "#addObs" ).click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            iMapApp.uiUtils.addObs();
        });
        $( "#obsLoc" ).change(function() {
            var pos = JSON.parse('[' + $($('input[name="obsLoc"]')[1]).val() + ']');
            iMapApp.iMapMap.setPosition(pos);
        });
        // Handle back button.
        document.addEventListener("backbutton", function(e){
           navigator.notification.confirm(
                'Exit app?', // message
                 function (buttonIndex) {
                     console.log("button: " + buttonIndex);
                    if (buttonIndex == 1) {
                        e.preventDefault();
                        navigator.app.exitApp();
                    }
                },            // callback to invoke with index of button pressed
                'Exit?',           // title
                ['Exit','Cancel']         // buttonLabels
            );
        }, false);
    },
    
    //
    // ** Card UI callbacks.
    //
    addObs: function() { // Seed dialog with defaults.
        iMapApp.uiUtils.openDialog('#editObsDialog', 'Add Observation');
        iMapApp.uiUtils.params.curObs = null;
        getDElem('[name="obsProjects"]').val(iMapApp.iMapPrefs.params.Project); 
        var now = new Date();
        var day = ("0" + now.getDate()).slice(-2);
        var month = ("0" + (now.getMonth() + 1)).slice(-2);
        var dt = now.getFullYear()+"-"+(month)+"-"+(day) ;
        getDElem('[name="obsDate"]').val(dt);
        iMapApp.uiUtils.setMapStuff();
        iMapApp.iMapMap.startGPSTimer();
        // Make the select searchable
        getDElem('select[name="obsProjects"]').select2({
                    placeholder: "Select a Project",
                    allowClear: false
             });
        getDElem('select[name="obsSpecies"]').select2({
                    placeholder: "Select a Species]",
                    allowClear: false
             });
    },
    
    editObs: function(editCard) { // Seed dialog with specific observation
        iMapApp.uiUtils.openDialog('#editObsDialog', 'Edit Observation');
        var obs = iMapApp.App.getObservation(editCard.id);
        iMapApp.uiUtils.params.curObs = obs;
        getDElem('[name="obsProjects"]').val(obs.getProjectID());
        getDElem('[name="obsSpecies"]').val(obs.getSpeciesID());
        
        var now = new Date(obs.getWhen());
        var day = ("0" + now.getDate()).slice(-2);
        var month = ("0" + (now.getMonth() + 1)).slice(-2);
        var dt = now.getFullYear()+"-"+(month)+"-"+(day) ;

        getDElem('[name="obsDate"]').val(obs.getWhen());
        //$('input[name="obsState"]').val(obs.getState());
        //$('input[name="obsCounty"]').val(obs.getCounty());
        getDElem('[name="obsLoc"]').val(obs.getWhere());
        console.log("Photo: " + obs.getPhotos());
        
        var lim = (obs.getPhotos() == ""?"assets/images/TakePhoto.png":obs.getPhotos());
        getDElem('[name="largeImage"]').attr("src", lim);
        //$('img[name="largeImage"]').src(obs.getPhotos());
        
        iMapApp.uiUtils.setMapStuff();
        
        var pos = JSON.parse('[' + obs.getWhere() + ']');
        iMapApp.iMapMap.setPosition(pos);
        getDElem('input[name="toggleGPS"]').attr('checked', false);
        // Make the select searchable
        getDElem('select[name="obsProjects"]').select2({
                    placeholder: "Select a Project",
                    allowClear: false
             });
        getDElem('select[name="obsSpecies"]').select2({
                    placeholder: "Select a Species]",
                    allowClear: false
             });
        //iMapApp.iMapMap.startGPSTimer();
    },
    
    deleteObs: function() {
        var delCards = $( "#content input:checked" );
        iMapApp.App.deleteCards(delCards);
    },
    
    setMapStuff: function() {
        iMapApp.iMapMap.init('#pgwModal #iMapMapdiv');
        var wid = $('#pgwModal [class="pm-body"]').width() - 20,
            hei = 300;
        iMapApp.iMapMap.fixSize(wid, hei);
        iMapApp.iMapMap.setMapType(iMapApp.iMapPrefs.params.MapType);
    },
            
    editObsOk: function(dial) { // Add new or save observation
        iMapApp.iMapMap.stopGPSTimer();
        var obs = (iMapApp.uiUtils.params.curObs == null?new iMapApp.Observation(): iMapApp.uiUtils.params.curObs);
        obs.setProject(getDElem('[name="obsProjects"]').find(":selected").text());
        obs.setProjectID(getDElem('[name="obsProjects"]').val());
        obs.setSpecies(getDElem('[name="obsSpecies"]').find(":selected").text());
        obs.setSpeciesID(getDElem('[name="obsSpecies"]').val());
        
        var dt = getDElem('[name="obsDate"]').val();
        obs.setWhen(dt);
        obs.setWhere(JSON.parse('[' + getDElem('[name="obsLoc"]').val() + ']'));
        
        var ims = getDElem('[name="largeImage"]').attr("src");
        console.log("image " + ims + "  indexOf: " +  ims.indexOf("TakePhoto"));
        console.log("photo " + obs.getPhotos());
        obs.setPhotos((ims.indexOf("TakePhoto") == -1?ims:""));
        console.log("photo " + obs.getPhotos());
        //$('img[name="largeImage"]').src(obs.getPhotos());
        
        if (iMapApp.uiUtils.params.curObs == null) {
            iMapApp.App.addObservation(obs);
        }
        iMapApp.App.saveObservations();
        iMapApp.uiUtils.params.curObs = null;
        $.pgwModal('close');
        iMapApp.App.renderCards();
    },
    
    setObsPosition: function(pos) {
        $($('input[name="obsLoc"]')[1]).val(pos);
    },
    
    uploadObservations: function() {
        var upCards = $( "#content input:checked" );
        iMapApp.App.uploadObservations(upCards);
    },
    
    //
    // ** Common UI stuff
    //
    onResize: function( eventData, handler ) {
        var targetColumns = Math.floor( $(document).width()/MIN_COL_WIDTH );
        if ( iMapApp.uiUtils.columns != targetColumns ) {
            iMapApp.uiUtils.layoutColumns(iMapApp.App.compiledCardTemplate);   
        }
    },
    
    //function to layout the columns
    layoutColumns: function(compiledCardTemplate) {
        iMapApp.uiUtils.content.detach();
        iMapApp.uiUtils.content.empty();

        iMapApp.uiUtils.columns = Math.floor( $(document).width()/MIN_COL_WIDTH );

        var columns_dom = [];
        for ( var x = 0; x < iMapApp.uiUtils.columns; x++ ) {
            var col = $('<div class="column">');
            col.css( "width", Math.floor(100/iMapApp.uiUtils.columns)+"%" );
            columns_dom.push( col );   
            iMapApp.uiUtils.content.append(col);
        }

        var cards_data = iMapApp.App.getCardsData();
        for ( var x = 0; x < cards_data.length; x++ ) {
            var html = compiledCardTemplate( cards_data[x] );

            var targetColumn = x % columns_dom.length;
            columns_dom[targetColumn].append( $(html) );
        }
        $("body").prepend (iMapApp.uiUtils.content);
    },
    
    stateChangeHandler: function(sel) {
        iMapApp.uiUtils.waitDialogOpen('Updating Projects and Species');
        iMapApp.App.updateStateData(sel.value);
        iMapApp.uiUtils.waitDialogClose();
    },
    
    loadProjectList: function() {
        var pdata = JSON.parse(localStorage.getItem("projectList"));
        if ( pdata == null) return;
        var prjs = ['listPrefProj', 'obsProjects'];
        prjs.forEach(function (value, index, ar) { 
            var selMen = $('select[name="' + value + '"]');
            selMen.empty();
            selMen
                 .append($("<option></option>")
                 .attr("value",-1)
                 .text(""));
            $.each( pdata, function( key, val ) {
                //console.log( "Inserting Project id: " + key + "  Name: " + val );
                selMen
                 .append($("<option></option>")
                 .attr("value",key)
                 .text(val)); 
            });
            selMen.sortOptions();
            selMen.val(-1);
        });
    },
    
    loadSpeciesList: function() {
        var pdata = JSON.parse(localStorage.getItem("speciesList"));
        if ( pdata == null) return;
        var selMen = $('select[name="obsSpecies"]');
        selMen.empty();
        selMen
             .append($("<option></option>")
             .attr("value",-1)
             .text(""));
        $.each( pdata, function( key, val ) {
            //console.log( "Inserting Species id: " + key  + "  Name: " + val );
            var lStr = iMapApp.App.getSpeciesName(key);
            selMen
             .append($("<option></option>")
             .attr("value",key)
             .text(lStr)); 
        });
        selMen.sortOptions();
        selMen.val(-1);
    },
    
    editPrefs: function() {
        iMapApp.uiUtils.openDialog('#prefsDialog', 'Edit Preferences');
        getDElem('input[name="fname"]').val(iMapApp.iMapPrefs.params.Firstname);
        getDElem('input[name="lname"]').val(iMapApp.iMapPrefs.params.Lastname);
        getDElem('input[name="uname"]').val(iMapApp.iMapPrefs.params.Username);
        getDElem('input[name="pword"]').val(iMapApp.iMapPrefs.params.Password);
        getDElem('select[name="stateSelect"]').val(iMapApp.iMapPrefs.params.CurrentState);
        getDElem('input[name="checkbox-common"]').attr('checked', iMapApp.iMapPrefs.params.Plants.UseCommon); 
        getDElem('input[name="checkbox-scientific"]').attr('checked', iMapApp.iMapPrefs.params.Plants.UseScientific);
        getDElem('input[value="'+iMapApp.iMapPrefs.params.PictureSize+'"]').attr('checked', true);
        getDElem('input[value="'+iMapApp.iMapPrefs.params.MapType+'"]').attr('checked', true);
        iMapApp.uiUtils.loadProjectList();
        getDElem('select[name="listPrefProj"]').val(iMapApp.iMapPrefs.params.Project);
        // Make the select searchable
        getDElem('select[name="listPrefProj"]').select2({
                    placeholder: "Select a State",
                    allowClear: true
             });
    },
    
    savePrefs: function() {
        var fnam = getDElem('input[name="fname"]').val();
        var lnam = getDElem('input[name="lname"]').val();
        var unam = getDElem('input[name="uname"]').val();
        var pwor = getDElem('input[name="pword"]').val();
        if (fnam == "" || lnam == "" || unam == "") {
            $('p[name="prefError"]').text('Please fill out Preferences first');
            //iMapApp.uiUtils.openDialog('#infoDialog', 'Empty Preferences');
            return;
        }
        //iMapApp.uiUtils.openDialog('#waitDialog', "Saving Preferences");

        iMapApp.iMapPrefs.params.Firstname = fnam;
        iMapApp.iMapPrefs.params.Lastname = lnam;
        iMapApp.iMapPrefs.params.Username = unam;	
        iMapApp.iMapPrefs.params.Password = pwor;
        iMapApp.iMapPrefs.params.Project = getDElem('select[name="listPrefProj"] :selected').val();

        if (iMapApp.iMapPrefs.params.Plants.UseCommon !== getDElem('input[name="checkbox-common"]').is(':checked') ||
                iMapApp.iMapPrefs.params.Plants.UseScientific !== getDElem('input[name="checkbox-scientific"]').is(':checked')) {
            //DBFuncs.loadSpeciesList();
        }

        //if (iMapPrefs.params.currentState !== $('#stateSelect').val()) {
        //    DBFuncs.loadProjectList();
        //}

        iMapApp.iMapPrefs.params.CurrentState = getDElem('select[name="stateSelect"]').val();
        iMapApp.iMapPrefs.params.Plants.UseCommon = getDElem('input[name="checkbox-common"]').is(':checked'); 
        iMapApp.iMapPrefs.params.Plants.UseScientific = getDElem('input[name="checkbox-scientific"]').is(':checked');
        //iMapPrefs.params.Plants.MyPlants = $('#fname').val();
        iMapApp.iMapPrefs.params.PictureSize = getDElem("input[name=radio-choice-size]:checked").val();
        iMapApp.iMapPrefs.params.MapType = getDElem("input[name=map-type]:checked").val();
        //alert($.toJSON(iMapPrefs));

        iMapApp.iMapPrefs.saveParams();
        iMapApp.uiUtils.loadSpeciesList();
        iMapApp.uiUtils.closeDialog();
    },
    
    //
    // ** Dialog stuff
    //
    openDialog: function(d, t) {
        $.pgwModal({
            target: d,
            title: t,
            closable: false,
            maxWidth: 350
        });
    },
    
    closeDialog: function() {
        $.pgwModal('close');
        iMapApp.iMapMap.stopGPSTimer();
    },
    
    waitDialogOpen: function(msg) {
        console.log("Modal Dialog...");
        var appendthis =  ("<div class='modal-overlay js-modal-close'></div>");
        $("body").append(appendthis);
        $('#waitPopup[name="waitDialogText"]').text(msg);
        $(".modal-overlay").fadeTo(500, 0.7);
        //$(".js-modalbox").fadeIn(500);
        //var modalBox = $(this).attr('data-modal-id');
        $('#waitPopup').fadeIn();
        //iMapApp.uiUtils.openDialog('#waitDialog', msg);
        //$.mobile.loading( 'show', {
        //    text: msg,
        //    textVisible: true,
        //    theme: 'a',
        //    html: ""
        //});
    },
    
    waitDialogClose: function() {
        console.log("unLoad Modal Dialig...");
        $(".modal-box, .modal-overlay").fadeOut(500, function() {
                                            $(".modal-overlay").remove();
                                            });
        //iMapApp.uiUtils.closeDialog();
        //$.mobile.loading( 'hide' );
    },
    
    toggleGPS: function() {
        if (getDElem('input[name="toggleGPS"]').is(':checked')) {
            iMapApp.iMapMap.startGPSTimer();
        }
        else {
            iMapApp.iMapMap.stopGPSTimer();
        }
    },
    
    updateStatusBar: function(msg) {
        $('#statusBarMsg').text(msg);
    }

}

//
// ** Utility functions
//
$.fn.sortOptions = function(){
    $(this).each(function(){
        var op = $(this).children("option");
        op.sort(function(a, b) {
            return a.text > b.text ? 1 : -1;
        })
        return $(this).empty().append(op);
    });
}

function getDElem(elem) {
    return $('#pgwModal').find(elem);
}
