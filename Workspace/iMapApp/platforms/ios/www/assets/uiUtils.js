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
            toggleSpeed: 320 // call your togglespeed here -- set it to 0 to turn it off
        });
        iMapApp.uiUtils.loadProjectList();
        iMapApp.uiUtils.loadSpeciesList();
        // Bind actions to HTML elements
        $( "#uploadMenu" ).click(function() {
            iMapApp.uiUtils.openDialog('#uploadDialog', 'Upload Observations');
        });
        $( "#deleteMenu" ).click(function() {
            var n = $( "#content input:checked" ).length;
            if (n == 0) {
                $('p[name="infoDialText"]').text('Please select cards.');
                iMapApp.uiUtils.openDialog('#infoDialog', 'Nothing to delete');
            }
            else {
                $('p[name="delDialText"]').text('Are you sure you want to delete ' + n + ' Records?');
                iMapApp.uiUtils.openDialog('#deleteDialog', 'Delete Observations');
            }
        });
        $( "#prefsMenu" ).click(function() {
            iMapApp.uiUtils.editPrefs();
        });
        $( "#addObs" ).click(function() {
            iMapApp.uiUtils.addObs();
        });
        $( "#obsLoc" ).change(function() {
            var pos = JSON.parse('[' + $($('input[name="obsLoc"]')[1]).val() + ']');
            iMapApp.iMapMap.setPosition(pos);
        });
    },
    
    //
    // ** Card UI callbacks.
    //
    addObs: function() { // Seed dialog with defaults.
        iMapApp.uiUtils.openDialog('#editObsDialog', 'Add Observation');
        iMapApp.uiUtils.params.curObs = null;
        $('#pgwModal').find('[name="obsProjects"]').val(iMapApp.iMapPrefs.params.Project); 
        var now = new Date();
        var day = ("0" + now.getDate()).slice(-2);
        var month = ("0" + (now.getMonth() + 1)).slice(-2);
        var dt = now.getFullYear()+"-"+(month)+"-"+(day) ;
        $('#pgwModal').find('[name="obsDate"]').val(dt);
        iMapApp.iMapMap.init('#pgwModal #iMapMapdiv');
        iMapApp.iMapMap.startGPSTimer();
    },
    
    editObs: function(editCard) { // Seed dialog with specific observation
        iMapApp.uiUtils.openDialog('#editObsDialog', 'Edit Observation');
        var obs = iMapApp.App.getObservation(editCard.id);
        iMapApp.uiUtils.params.curObs = obs;
        $('#pgwModal').find('[name="obsProjects"]').val(obs.getProjectID());
        $('#pgwModal').find('[name="obsSpecies"]').val(obs.getSpeciesID());
        
        var now = new Date(obs.getWhen());
        var day = ("0" + now.getDate()).slice(-2);
        var month = ("0" + (now.getMonth() + 1)).slice(-2);
        var dt = now.getFullYear()+"-"+(month)+"-"+(day) ;

        $('#pgwModal').find('[name="obsDate"]').val(obs.getWhen());
        //$('input[name="obsState"]').val(obs.getState());
        //$('input[name="obsCounty"]').val(obs.getCounty());
        $('#pgwModal').find('[name="obsLoc"]').val(obs.getWhere());
        console.log("Photo: " + obs.getPhotos());
        $('#pgwModal').find('[name="smallImage"]').attr("src",obs.getPhotos());
        //$('img[name="largeImage"]').src(obs.getPhotos());
        iMapApp.iMapMap.init('#pgwModal #iMapMapdiv');
        iMapApp.iMapMap.startGPSTimer();
    },
            
    editObsOk: function(dial) { // Add new or save observation
        iMapApp.iMapMap.stopGPSTimer();
        var obs = (iMapApp.uiUtils.params.curObs == null?new iMapApp.Observation(): iMapApp.uiUtils.params.curObs);
        obs.setProject($('#pgwModal').find('[name="obsProjects"]').find(":selected").text());
        obs.setProjectID($('#pgwModal').find('[name="obsProjects"]').val());
        obs.setSpecies($('#pgwModal').find('[name="obsSpecies"]').find(":selected").text());
        obs.setSpeciesID($('#pgwModal').find('[name="obsSpecies"]').val());
        
        var dt = $('#pgwModal').find('[name="obsDate"]').val();
        obs.setWhen(dt);
        obs.setWhere($('#pgwModal').find('[name="obsLoc"]').val());
        obs.setPhotos($('#pgwModal').find('[name="smallImage"]').attr("src"));
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
        iMapApp.uiUtils.waitDialogOpen();
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
                console.log( "Inserting Project id: " + key + "  Name: " + val );
                selMen
                 .append($("<option></option>")
                 .attr("value",key)
                 .text(val)); 
            });
            selMen.sortOptions();
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
            console.log( "Inserting Species id: " + key  + "  Name: " + val );
            var lStr = iMapApp.App.getSpeciesName(key);
            selMen
             .append($("<option></option>")
             .attr("value",key)
             .text(lStr)); 
        });
        selMen.sortOptions();
    },
    
    editPrefs: function() {
        iMapApp.uiUtils.openDialog('#prefsDialog', 'Edit Preferences');
        $($('input[name="fname"]')[1]).val(iMapApp.iMapPrefs.params.Firstname);
        $($('input[name="lname"]')[1]).val(iMapApp.iMapPrefs.params.Lastname);
        $($('input[name="uname"]')[1]).val(iMapApp.iMapPrefs.params.Username);
        $($('input[name="pword"]')[1]).val(iMapApp.iMapPrefs.params.Password);
        $('select[name="stateSelect"]').val(iMapApp.iMapPrefs.params.CurrentState);
        $('input[name="checkbox-common"]').attr('checked', iMapApp.iMapPrefs.params.Plants.UseCommon); 
        $('input[name="checkbox-scientific"]').attr('checked', iMapApp.iMapPrefs.params.Plants.UseScientific);
        $($('input[value="'+iMapApp.iMapPrefs.params.PictureSize+'"]')[1]).attr('checked', true);
        $($('input[value="'+iMapApp.iMapPrefs.params.MapType+'"]')[1]).attr('checked', true);
        iMapApp.uiUtils.loadProjectList();
        $('select[name="listPrefProj"]').val(iMapApp.iMapPrefs.params.Project);
    },
    
    savePrefs: function() {
        var fnam = $($('input[name="fname"]')[1]).val();
        var lnam = $($('input[name="lname"]')[1]).val();
        var unam = $($('input[name="uname"]')[1]).val();
        var pwor = $($('input[name="pword"]')[1]).val();
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
        iMapApp.iMapPrefs.params.Project = $($('select[name="listPrefProj"] :selected')[1]).val();

        if (iMapApp.iMapPrefs.params.Plants.UseCommon !== $('input[name="checkbox-common"]').is(':checked') ||
                iMapApp.iMapPrefs.params.Plants.UseScientific !== $('input[name="checkbox-scientific"]').is(':checked')) {
            //DBFuncs.loadSpeciesList();
        }

        //if (iMapPrefs.params.currentState !== $('#stateSelect').val()) {
        //    DBFuncs.loadProjectList();
        //}

        iMapApp.iMapPrefs.params.CurrentState = $($('select[name="stateSelect"]')[1]).val();
        iMapApp.iMapPrefs.params.Plants.UseCommon = $($('input[name="checkbox-common"]')[1]).is(':checked'); 
        iMapApp.iMapPrefs.params.Plants.UseScientific = $($('input[name="checkbox-scientific"]')[1]).is(':checked');
        //iMapPrefs.params.Plants.MyPlants = $('#fname').val();
        iMapApp.iMapPrefs.params.PictureSize = $("input[name=radio-choice-size]:checked").val();
        iMapApp.iMapPrefs.params.MapType = $("input[name=map-type]:checked").val();
        //alert($.toJSON(iMapPrefs));

        var selected = [];
        $('#checkboxes input:checked').each(function() {
                                            selected.push($(this).attr('name'));
                                            });

        iMapApp.iMapPrefs.saveParams();
        iMapApp.uiUtils.closeDialog();
    },
    
    //
    // ** Dialog stuff
    //
    openDialog: function(d, t) {
        $.pgwModal({
            target: d,
            title: t,
            maxWidth: 300
        });
    },
    
    closeDialog: function() {
        $.pgwModal('close');
        iMapApp.iMapMap.stopGPSTimer();
        iMapApp.uiUtils.params.navbar.disableDropDown();
    },
    
    waitDialogOpen: function() {
        //iMapApp.uiUtils.openDialog('#waitDialog', 'Please wait');
        $.mobile.loading( 'show', {
            text: 'foo',
            textVisible: true,
            theme: 'z',
            html: ""
        });
    },
    
    waitDialogClose: function() {
        //iMapApp.uiUtils.closeDialog();
        $.mobile.loading( 'hide' );
    },

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
