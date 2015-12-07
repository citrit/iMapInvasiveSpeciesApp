var iMapApp = iMapApp || {};

// Preferences for the app.
var MIN_COL_WIDTH = 300;

iMapApp.uiUtils = {
    params: {
        content: null,
        columns: 0,
        navbar: null,
        curObs: null,
        waitDlgCnt: 0
    },
    init: function() {
        iMapApp.uiUtils.content = $(".content");
        $(window).resize(iMapApp.uiUtils.onResize);
        iMapApp.uiUtils.params.navbar = $('.navbar').navbar({
            dropDownLabel: '<span class="icon"></span>',
            breakPoint: 1024, // define manual breakpoint - set it to 0 means no manual breakpoint
            toggleSpeed: 0 // call your togglespeed here -- set it to 0 to turn it off
        });
        iMapApp.uiUtils.loadProjectList();
        iMapApp.uiUtils.loadSpeciesList();
        // Bind actions to HTML elements
        $( "#selectAll" ).click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            iMapApp.uiUtils.selectCards(true);
        });
        $( "#selectNone" ).click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            iMapApp.uiUtils.selectCards(false);
        });
        $( "#uploadMenu" ).click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            switch (navigator.connection.type) {
                case Connection.WIFI:
                    iMapApp.uiUtils.checkForWifiBeforeUpload();
                    break;
                case Connection.NONE:
                    $('p[name="infoDialText"]').text('No network connection.');
                    iMapApp.uiUtils.openDialog('#infoDialog', 'There is not network connection');
                    break;
                default:
                    iMapApp.uiUtils.openOkCancelDialog('Upload over Cellular', 
                                                   'You are about to upload using your data plan, continue?',
                                                   iMapApp.uiUtils.checkForWifiBeforeUpload);
                    break;
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
                iMapApp.uiUtils.openOkCancelDialog('Delete Observations', 
                                                   'Are you sure you want to delete ' + n + ' Records?', iMapApp.uiUtils.deleteObs);
            }
        });
        $( "#prefsMenu" ).click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            iMapApp.uiUtils.editPrefs();
        });
        $( "#quitMenu" ).click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            iMapApp.uiUtils.openOkCancelDialog('iMapInvasives', 'Exit iMapInvasives?',
                                               navigator.app.exitApp);
        });
        $( "#addObs" ).click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            iMapApp.uiUtils.addObs();
        });
        $( 'button[name="updateStateData"]').click(function() {
            iMapApp.App.updateStateData(iMapApp.iMapPrefs.params.CurrentState);
        });
        $( "#obsLoc" ).change(function() {
            var pos = JSON.parse('[' + $('input[name="obsLoc"]').val() + ']');
            iMapApp.iMapMap.setPosition(pos);
        });
        // Handle back button.
        document.addEventListener("backbutton", function(e){
            if($.mobile.activePage.is('#mainPage')){
               iMapApp.uiUtils.openOkCancelDialog('iMapInvasives', 'Exit iMapInvasives?',
                                               navigator.app.exitApp);
            }
            else {
                navigator.app.backHistory();
                iMapApp.iMapMap.stopGPSTimer();
            }
        }, false);
        iMapApp.iMapMap.init('#iMapMapdiv');
        $( window ).on( "pagechange", function( event, data ) {
            iMapApp.uiUtils.setMapStuff();
            iMapApp.App.renderCards();
            try {
                //getDElem('#zoomToRange').trigger('create');
                //getDElem('#zoomToRange').trigger('create').slider("option", "value", iMapApp.iMapPrefs.params['DefaultZoom']);

                //getDElem('select[name=flipMap]').trigger('create');
            } catch (ex) {console.log("Pageload exception: " + ex);}
        });
    },
    
    //
    // ** Card UI callbacks.
    //
    selectCards: function(chkd) {
        $.each($( "#content input:checkbox" ), function( index, val ) {
            $(val).prop('checked', chkd);
        });
    },
    
    checkForWifiBeforeUpload: function() {
        var n = iMapApp.uiUtils.getActiveCards().find("input:checkbox:checked").length;
        if (n == 0) {
            $('p[name="infoDialText"]').text('Please select cards.');
            iMapApp.uiUtils.openDialog('#infoDialog', 'Nothing selected to upload');
        }
        else {
            iMapApp.uiUtils.openOkCancelDialog('Upload Observations', 'Are you sure you want to upload ' + n + ' Records?',
                                               iMapApp.uiUtils.uploadObservations);
        }
    },
    
    openOkCancelDialog: function(title, msg, callback) {
        iMapApp.uiUtils.openDialog('#okCancelDialog', title);
        $('#pgwModal').find('[value="OK"]').click(callback);
        $('#pgwModal p[name="okCancelText"]').text(msg);
    },
    
    addObs: function() { // Seed dialog with defaults.
        //iMapApp.uiUtils.openDialog('#editObsDialog', 'Add Observation');
        $.mobile.navigate( "#editObsPage");
        iMapApp.uiUtils.params.curObs = null;
        getDElem('[name="obsProjects"]').val(iMapApp.iMapPrefs.params.Project).
        selectmenu().selectmenu('refresh', true);
        getDElem('[name="obsSpecies"]').val(-1).
        selectmenu().selectmenu('refresh', true);; 
        var now = new Date();
        var day = ("0" + now.getDate()).slice(-2);
        var month = ("0" + (now.getMonth() + 1)).slice(-2);
        var dt = now.getFullYear()+"-"+(month)+"-"+(day) ;
        getDElem('[name="obsDate"]').val(dt);
        iMapApp.iMapMap.startGPSTimer();
        getDElem('[name="largeImage"]').prop("src", "assets/images/TakePhoto.png");
        getDElem('[name="obsLoc"]').val([0.0, 0.0]);
        iMapApp.iMapMap.setMapZoom(iMapApp.iMapPrefs.params['DefaultZoom']);
        getDElem('input[name="toggleGPS"]').prop('checked', true);
        getDElem('select[name="flipMap"]').val(iMapApp.iMapPrefs.params.MapType);
        iMapApp.iMapMap.setPosition([-73.4689, 42.7187]);
        // Make the select searchable
        /*getDElem('select[name="obsProjects"]').select2({
                    placeholder: "Select a Project",
                    allowClear: false
             });
        getDElem('select[name="obsSpecies"]').select2({
                    placeholder: "Select a Species]",
                    allowClear: false
             });*/
        //$(window).trigger('resize');
        //iMapApp.uiUtils.setMapStuff();
    },
    
    editObs: function(editCard) { // Seed dialog with specific observation
        $.mobile.navigate( "#editObsPage");
        iMapApp.uiUtils.params.navbar.disableDropDown();
        //iMapApp.uiUtils.openDialog('#editObsDialog', 'Edit Observation');
        var obs = iMapApp.App.getObservation(editCard.id);
        iMapApp.uiUtils.params.curObs = obs;
        getDElem('[name="obsProjects"]').val(obs.getProjectID()).
        selectmenu().selectmenu('refresh', true);;
        getDElem('[name="obsSpecies"]').val(obs.getSpeciesID()).
        selectmenu().selectmenu('refresh', true);;
        
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
        iMapApp.iMapMap.setMapZoom(iMapApp.iMapPrefs.params['DefaultZoom']);
        getDElem('input[name="toggleGPS"]').prop('checked', false);
        getDElem('select[name="flipMap"]').val(iMapApp.iMapPrefs.params.MapType);

        // Make the select searchable
        /*getDElem('select[name="obsProjects"]').select2({
                    placeholder: "Select a Project",
                    allowClear: false
             });
        getDElem('select[name="obsSpecies"]').select2({
                    placeholder: "Select a Species]",
                    allowClear: false
             });*/
        //iMapApp.iMapMap.startGPSTimer();
        //$( window ).height($( window ).height()-1);
    },
    
    deleteObs: function() {
        var delCards = $( "#content input:checked" );
        iMapApp.uiUtils.closeDialog();
        iMapApp.App.deleteCards(delCards);
    },
    
    setMapStuff: function() {
        //iMapApp.iMapMap.init('#iMapMapdiv');
        var wid = $(window).width() - 20,
            hei = 300;
        wid = (wid == 0?300:wid);
        iMapApp.iMapMap.fixSize(wid, hei);
        iMapApp.iMapMap.setMapType(iMapApp.iMapPrefs.params.MapType);
    },
            
    editObsOk: function(dial) { // Add new or save observation
        iMapApp.iMapMap.stopGPSTimer();
        if (getDElem('[name="obsSpecies"]').val() == "-1"){
            iMapApp.uiUtils.openOkCancelDialog('Save Species', 'You have not specified a species, save Observation?',
                                               iMapApp.uiUtils.saveObs);
            /*var closeDiag = false;
            navigator.notification.confirm(
                    'You have not specified a species, save Observation?', // message
                     function (buttonIndex) {
                         console.log("button: " + buttonIndex);
                         if (buttonIndex == 1)
                             iMapApp.uiUtils.saveObs();
                    },            // callback to invoke with index of button pressed
                    'Species missing',           // title
                    ['Yes', 'No']         // buttonLabels
                );
            $('#infoDialog2').attr('open', true);*/
        }
        else {
            iMapApp.uiUtils.saveObs();
        }
    },
    
    saveObs: function() {
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
        //$.pgwModal('close');
        iMapApp.uiUtils.closeDialog();
        iMapApp.uiUtils.gotoMainPage();
        //iMapApp.App.renderCards();
    },
    
    setObsPosition: function(pos) {
        $('input[name="obsLoc"]').val(pos[0].toFixed(7) + ', ' + pos[1].toFixed(7));
    },
    
    setObsAccuracy: function(acc) {
        $('span[name="gpsAccuracy"]').text("Accuracy: " + ("0000" + acc).slice(-4) + ' m');
    },
    
    uploadObservations: function() {
        var upCards = iMapApp.uiUtils.getActiveCards().find("input:checkbox:checked");
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
        iMapApp.uiUtils.setMapStuff();
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
        $("#mainContent").prepend (iMapApp.uiUtils.content);
        var crds = iMapApp.uiUtils.getActiveCards();
        iMapApp.uiUtils.updateStatusBar("Records to Upload: " + crds.length);
    },
    
    getActiveCards: function(uncheck) {
        var ret = $('div[class="card"]').filter(function( index ) {
            rval = $(this).find('[name="specVal"]').text() != "Species: None Selected";
            if (rval == false) {
                //$(this).find('[name="cardSelect"]').prop('checked', false);
                $(this).css({'background-color':'#CC3333'})
            }
            return rval;
        });
        return ret;
    },
    
    stateChangeHandler: function(sel) {
        iMapApp.App.updateStateData(sel.value, true);
        getDElem('p[name="lastUpdateDate"]').text('Last Update: ' + iMapApp.iMapPrefs.params.StateUpdate); 
    },
    
    loadProjectList: function() {
        var pdata = JSON.parse(localStorage.getItem("projectList"));
        if ( pdata == null) return;
        var prjs = ['listPrefProj', 'obsProjects'];
        prjs.forEach(function (value, index, ar) { 
            var selMen = $('select[name="' + value + '"]');
            selMen.empty();
            $.each( pdata, function( key, val ) {
                //console.log( "Inserting Project id: " + key + "  Name: " + val );
                selMen
                 .append($("<option></option>")
                 .attr("value",key)
                 .text(val)); 
            });
            selMen.sortOptions();
            selMen
                 .prepend($("<option></option>")
                 .attr("value",-1)
                 .text(""));
            selMen.val(iMapApp.iMapPrefs.params.Project);
            selMen.selectmenu();
            selMen.selectmenu('refresh', true);
        });
    },
    
    loadSpeciesList: function() {
        var pdata = JSON.parse(localStorage.getItem("speciesList"));
        if ( pdata == null) return;
        var selMen = $('select[name="obsSpecies"]');
        selMen.empty();
        if (iMapApp.iMapPrefs.params.Plants.MyPlants.length > 0) {
            $.each(iMapApp.iMapPrefs.params.Plants.MyPlants, function( key, val ) {
                //console.log( "Inserting Species id: " + key  + "  Name: " + val );
                var lStr = iMapApp.App.getSpeciesName(val);
                selMen
                 .append($("<option></option>")
                 .attr("value",val)
                 .text(lStr)); 
            });
        }
        else {
            $.each( pdata, function( key, val ) {
                //console.log( "Inserting Species id: " + key  + "  Name: " + val );
                var lStr = iMapApp.App.getSpeciesName(key);
                selMen
                 .append($("<option></option>")
                 .attr("value",key)
                 .text(lStr)); 
            });
        }
        selMen.sortOptions();
        selMen
             .prepend($("<option></option>")
             .attr("value",-1)
             .text("None Selected"));
        selMen.val(-1);
        selMen.selectmenu();
        selMen.selectmenu('refresh', true);
    },
    
    //
    // ** Dialog stuff
    //
    
    editPrefs: function() {
        //iMapApp.uiUtils.openDialog('#prefsDialog', 'Edit Preferences');
        $.mobile.navigate( "#prefPage");
        //$( ":mobile-pagecontainer" ).pagecontainer( "change", "#prefPage" );
        //getDElem('input[name=zoomRange]').slider();
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
        getDElem('select[name="listPrefProj"]').val(iMapApp.iMapPrefs.params.Project).
        selectmenu().selectmenu('refresh', true);
        getDElem('p[name="lastUpdateDate"]').text('Last Update: ' + iMapApp.iMapPrefs.params.StateUpdate); 
        
        //getDElem('input[name=zoomToRange]').val(iMapApp.iMapPrefs.params['DefaultZoom']).trigger('create').slider('refresh', true);
        getDElem('#zoomToRange').attr('value', iMapApp.iMapPrefs.params['DefaultZoom']);
        
        // Make the select searchable
        /*getDElem('select[name="listPrefProj"]').select2({
                    placeholder: "Select a State",
                    allowClear: true
             });*/
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
        iMapApp.iMapPrefs.params['DefaultZoom'] = getDElem('input[name=zoomToRange]').val();

        //alert($.toJSON(iMapPrefs));

        iMapApp.iMapPrefs.saveParams();
        iMapApp.uiUtils.loadSpeciesList();
        iMapApp.uiUtils.gotoMainPage();
    },
    
    chooseMySpecies: function() {
        var pdata = JSON.parse(localStorage.getItem("speciesList"));
        if ( pdata != null) {
            iMapApp.uiUtils.openDialog('#selectSpeciesDialog', 'Select Your Species');
            var skeys = getSortedKeys(pdata, iMapApp.App.getSpeciesName);
            var selMen = $('div[name="speciesSelList"]');
            selMen.empty();
            $.each( skeys, function( key, val ) {
                var lStr = iMapApp.App.getSpeciesName(val);
                //console.log( "Inserting Species id: " + val  + "  Name: " + lStr );
                var chk = (iMapApp.iMapPrefs.params.Plants.MyPlants.indexOf(val) >= 0?'checked':'');
                selMen
                 .append($('<input type="checkbox" value="' + val + '" lStr="' + lStr + '" ' + chk + '/>' + lStr + '</input><br />')); 
            });
        }
    },
    
    saveMySpecSpecies: function() {
        var selMen = $('#pgwModal').find('div[name="speciesSelList"]').find('input:checked');
        iMapApp.iMapPrefs.params.Plants.MyPlants = [];
        $.each( selMen, function( key, val ) {
            console.log("key: " + key + " Val: " + val.getAttribute("value"));
            iMapApp.iMapPrefs.params.Plants.MyPlants.push(val.getAttribute("value"));
        });
        iMapApp.uiUtils.closeDialog();
        iMapApp.uiUtils.loadSpeciesList();
    },
    
    gotoMainPage: function() {
        $.mobile.navigate( "#mainPage");
        //$( ":mobile-pagecontainer" ).pagecontainer( "change", "#mainPage");
    },
    
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
    
    waitDialogOpen: function(msg, cnt) {
        iMapApp.uiUtils.params.waitDlgCnt = cnt;
        console.log("Modal Dialog...");
        var appendthis =  ("<div class='modal-overlay js-modal-close'></div>");
        $("body").append(appendthis);
        $('#waitPopup[name="waitDialogText"]').text(msg);
        $(".modal-overlay").fadeTo(500, 0.7);
        //$(".js-modalbox").fadeIn(500);
        //var modalBox = $(this).attr('data-modal-id');
        $('#waitPopup').center();
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
        iMapApp.uiUtils.params.waitDlgCnt--;
        if (iMapApp.uiUtils.params.waitDlgCnt <= 0) {
            console.log("unLoad Modal Dialog...");
            $(".modal-box, .modal-overlay").fadeOut(500, function() {
                                                $(".modal-overlay").remove();
                                                });
            //iMapApp.uiUtils.closeDialog();
            //$.mobile.loading( 'hide' );
        }
    },
    
    toggleGPS: function() {
        if (getDElem('input[name="toggleGPS"]').is(':checked')) {
            iMapApp.iMapMap.startGPSTimer();
        }
        else {
            iMapApp.iMapMap.stopGPSTimer();
        }
    },
    
    toggleMapType: function() {
        iMapApp.iMapPrefs.params.MapType = getDElem('select[name="flipMap"] :selected').val();
        iMapApp.iMapMap.setMapType(iMapApp.iMapPrefs.params.MapType);
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

jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
                                                $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
                                                $(window).scrollLeft()) + "px");
    return this;
}


function getDElem(elem) {
    //return $('#pgwModal').find(elem);
    return $(elem);
}

function getSortedKeys(obj, getV) {
    var keys = []; for(var key in obj) keys.push(key);
    return keys.sort(function(a,b){
        if ( getV(a) < getV(b) )
          return -1;
        if ( getV(a) > getV(b) )
          return 1;
        return 0;
    });
}