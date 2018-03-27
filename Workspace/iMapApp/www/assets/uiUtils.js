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
        if (window.device && window.device.platform == "iOS") {
            StatusBar.overlaysWebView(false);
            console.log("Setting iOS top margin");
        }
        // Bind actions to HTML elements
        $("#selectAll").click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            iMapApp.uiUtils.selectCards(true);
        });
        $("#selectNone").click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            iMapApp.uiUtils.selectCards(false);
        });
        $("#uploadMenu").click(function() {
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
        $("#deleteMenu").click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            var n = $("#content input:checked").length;
            if (n == 0) {
                $('p[name="infoDialText"]').text('Please select cards.');
                iMapApp.uiUtils.openDialog('#infoDialog', 'Nothing selected to delete');
            } else {
                iMapApp.uiUtils.openOkCancelDialog('DELETE OBSERVATIONS?',
                    'Are you sure you want to DELETE ' + n + ' Records?', iMapApp.uiUtils.deleteObs);
            }
        });
        $("#prefsMenu").click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            iMapApp.uiUtils.editPrefs("");
        });
        $("#quitMenu").click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            iMapApp.uiUtils.openOkCancelDialog('iMapInvasives', 'Exit iMapInvasives?',
                navigator.app.exitApp);
        });
        $("#helpMenu").click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            $('p[name="versionText"]').text('Version: ' + iMapApp.App.version);
            iMapApp.uiUtils.openDialog('#helpDialog', 'Need Help?');
        });
        $("#addObs").click(function() {
            iMapApp.uiUtils.params.navbar.disableDropDown();
            iMapApp.uiUtils.addObs();
        });
        $('button[name="updateStateData"]').click(function() {
            if (iMapApp.uiUtils.checkParamsNotSet()) {
                return;
            } else {
                iMapApp.App.updateStateData(iMapApp.iMapPrefs.params.CurrentState);
                getDElem('p[name="lastUpdateDate"]').text('Last Update: ' + iMapApp.iMapPrefs.params.StateUpdate);
            }
        });
        $("#obsLoc").change(function() {
            var pos = JSON.parse('[' + $('input[name="obsLoc"]').val() + ']');
            iMapApp.iMapMap.setPosition(pos);
        });
        $("#stateSelect").on('change', function() { iMapApp.uiUtils.stateChangeHandler($("#stateSelect").val()); });
        $("#obsSpecies").on('change', function() { iMapApp.uiUtils.speciesChangeHandler($("#obsSpecies").val()); });

        $("#introOverlay").click(function() {
            iMapApp.uiUtils.introOverlayClose();
        });
        // Handle back button.
        document.addEventListener("backbutton", function(e) {
            if ($.mobile.activePage.is('#mainPage')) {
                iMapApp.uiUtils.openOkCancelDialog('iMapInvasives', 'Exit iMapInvasives?',
                    navigator.app.exitApp);
            } else {
                if (iMapApp.uiUtils.checkParamsNotSet()) {
                    return;
                }
                navigator.app.backHistory();
                iMapApp.iMapMap.stopGPSTimer();
            }
        }, false);
        iMapApp.iMapMap.init('iMapMapdiv');
        $(window).on("pagechange", function(event, data) {
            iMapApp.uiUtils.setMapStuff();
            iMapApp.App.renderCards();
            try {
                //getDElem('#zoomToRange').trigger('create');
                //getDElem('#zoomToRange').trigger('create').slider("option", "value", iMapApp.iMapPrefs.params['DefaultZoom']);

                //getDElem('select[name=flipMap]').trigger('create');
            } catch (ex) { console.log("Pageload exception: " + ex); }
        });
        iMapApp.uiUtils.checkIntroOverlay();
    },

    //
    // ** Card UI callbacks.
    //
    selectCards: function(chkd) {
        $.each($("#content input:checkbox"), function(index, val) {
            $(val).prop('checked', chkd);
        });
    },

    checkForWifiBeforeUpload: function() {
        var n = iMapApp.uiUtils.getActiveCards().find("input:checkbox:checked").length;
        if (n == 0) {
            iMapApp.uiUtils.openInfoDialog('Nothing selected to upload', 'Please select cards.');
        } else {
            iMapApp.uiUtils.openOkCancelDialog('Upload Observations', 'Are you sure you want to upload ' + n + ' Records?',
                iMapApp.uiUtils.uploadObservations);
        }
    },

    openInfoDialog: function(title, msg) {
        $('p[name="infoDialText"]').html(msg);
        iMapApp.uiUtils.openDialog('#infoDialog', title);
    },

    openOkCancelDialog: function(title, msg, callback) {
        iMapApp.uiUtils.openDialog('#okCancelDialog', title);
        $('#pgwModal').find('[value="OK"]').click(callback);
        $('#pgwModal p[name="okCancelText"]').text(msg);
    },

    addObs: function() { // Seed dialog with defaults.
        //iMapApp.uiUtils.openDialog('#editObsDialog', 'Add Observation');
        $.mobile.navigate("#editObsPage");
        iMapApp.App.checkDiskSpace();
        iMapApp.uiUtils.params.curObs = null;
        getDElem('[name="obsProjects"]').val(iMapApp.iMapPrefs.params.Project); //.selectmenu().selectmenu('refresh', true);
        getDElem('[name="obsSpecies"]').val(-1); //.selectmenu().selectmenu('refresh', true);; 
        var now = new Date();
        var day = ("0" + now.getDate()).slice(-2);
        var month = ("0" + (now.getMonth() + 1)).slice(-2);
        var dt = now.getFullYear() + "-" + (month) + "-" + (day);
        getDElem('[name="obsDate"]').val(dt);
        getDElem('[name="largeImage"]').prop("src", "assets/images/TakePhoto2.png");
        getDElem('[name="obsLoc"]').val([0.0, 0.0]);
        getDElem('[name="sizeOfArea"]').val('o');
        getDElem('[name="sizeOfAreaMetric"]').val('oo');
        getDElem('[name="distribution"]').val('0');
        getDElem('[name="numTreesSurveyed"]').val('');
        getDElem('[name="timeSurveying"]').val('');
        getDElem('[name="obsComment"]').val('');
        iMapApp.uiUtils.setAssessmentType("Off");
        iMapApp.iMapMap.setMapZoom(iMapApp.iMapPrefs.params.DefaultZoom);
        getDElem('input[name="toggleGPS"]').prop('checked', true);
        getDElem('select[name="flipMap"]').val(iMapApp.iMapPrefs.params.MapType);
        iMapApp.iMapMap.startGPSTimer();
        iMapApp.iMapMap.setPosition([-73.4689, 42.7187]);

        this.toggleSizeUnits(); // initialize/display the correct units

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
        $.mobile.navigate("#editObsPage");
        iMapApp.App.checkDiskSpace();
        iMapApp.uiUtils.params.navbar.disableDropDown();
        //iMapApp.uiUtils.openDialog('#editObsDialog', 'Edit Observation');
        var obs = iMapApp.App.getObservation(editCard.id);
        iMapApp.uiUtils.params.curObs = obs;
        getDElem('[name="obsProjects"]').val(obs.getProjectID()); //.selectmenu().selectmenu('refresh', true);;
        getDElem('[name="obsSpecies"]').val(obs.getSpeciesID()); //.selectmenu().selectmenu('refresh', true);;
        getDElem('[name="sizeOfArea"]').val(obs.getSize());
        getDElem('#sizeOfAreaMetric').val(obs.getSizeMetric());
        getDElem('[name="distribution"]').val(obs.getDist());
        getDElem('[name="numTreesSurveyed"]').val(obs.getNumTrees());
        getDElem('[name="timeSurveying"]').val(obs.getTimeSurvey());
        getDElem('[name="obsComment"]').val(obs.getComment());

        var now = new Date(obs.getWhen());
        var day = ("0" + now.getDate()).slice(-2);
        var month = ("0" + (now.getMonth() + 1)).slice(-2);
        var dt = now.getFullYear() + "-" + (month) + "-" + (day);

        getDElem('[name="obsDate"]').val(obs.getWhen());
        //$('input[name="obsState"]').val(obs.getState());
        //$('input[name="obsCounty"]').val(obs.getCounty());
        getDElem('[name="obsLoc"]').val(obs.getWhere());
        //console.log("Photo: " + obs.getPhotos());

        var lim = (obs.getPhotos() == "" ? "assets/images/TakePhoto2.png" : obs.getPhotos());
        getDElem('[name="largeImage"]').attr("src", lim);
        //$('img[name="largeImage"]').src(obs.getPhotos());

        iMapApp.uiUtils.setAssessmentType(iMapApp.App.getAssessmentType(obs.getSpeciesID()));

        iMapApp.uiUtils.setMapStuff();

        var pos = JSON.parse('[' + obs.getWhere() + ']');
        iMapApp.iMapMap.setPosition(pos);
        iMapApp.iMapMap.setMapZoom(iMapApp.iMapPrefs.params.DefaultZoom);
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


        // toggle the correct area dropdown to display based on what was entered in the observation
        // sorry, this probably isn't the most elegant approach, but works
        if (obs.getSize() != "o" || obs.getSizeMetric() != "oo") {
            // if the units had been set when the observation was created, load those units
            document.getElementById("sizeOfArea").className = obs.getSize() != "o" ? "visible" : "hidden"; // if the units are not set to USCustomary, set the class to 'hidden'
            document.getElementById("sizeOfAreaMetric").className = obs.getSizeMetric() != "oo" ? "visible" : "hidden"; // if the units are not set to Metric, set the class to 'hidden'             
        } else {
            // otherwise load the units that are currently set in the settings
            this.toggleSizeUnits();
        }
    },

    deleteObs: function() {
        var delCards = $("#content input:checked");
        iMapApp.uiUtils.closeDialog();
        iMapApp.App.deleteCards(delCards);
    },

    setMapStuff: function() {
        //iMapApp.iMapMap.init('#iMapMapdiv');
        var wid = $(window).width(),
            hei = 300;
        wid = (wid == 0 ? 300 : wid);
        iMapApp.iMapMap.fixSize(wid, hei);
        iMapApp.iMapMap.setMapType(iMapApp.iMapPrefs.params.MapType);
    },

    editObsOk: function(dial) { // Add new or save observation
        iMapApp.iMapMap.stopGPSTimer();
        if (getDElem('[name="obsSpecies"]').val() == "-1") {
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
        } else {
            iMapApp.uiUtils.saveObs();
        }
    },

    saveObs: function() {
        var obs = (iMapApp.uiUtils.params.curObs == null ? new iMapApp.Observation() : iMapApp.uiUtils.params.curObs);
        obs.setProject(getDElem('[name="obsProjects"]').find(":selected").text());
        obs.setProjectID(getDElem('[name="obsProjects"]').val());
        obs.setSpecies(getDElem('[name="obsSpecies"]').find(":selected").text());
        obs.setSpeciesID(getDElem('[name="obsSpecies"]').val());
        obs.setSize(getDElem('[name="sizeOfArea"]').val());
        obs.setSizeMetric(getDElem('#sizeOfAreaMetric').val());
        obs.setDist(getDElem('[name="distribution"]').val());
        obs.setNumTrees(getDElem('[name="numTreesSurveyed"]').val());
        obs.setTimeSurvey(getDElem('[name="timeSurveying"]').val());
        obs.setComment(getDElem('[name="obsComment"]').val());

        var dt = getDElem('[name="obsDate"]').val();
        obs.setWhen(dt);
        obs.setWhere(JSON.parse('[' + getDElem('[name="obsLoc"]').val() + ']'));

        var ims = getDElem('[name="largeImage"]').attr("src");
        //console.log("image " + ims + "  indexOf: " + ims.indexOf("TakePhoto"));
        //console.log("photo " + obs.getPhotos());
        obs.setPhotos((ims.indexOf("TakePhoto") == -1 ? ims : ""));
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
        $('span[name="gpsAccuracy"]').text("GPS Accuracy: " + ("0000" + acc).slice(-4) + ' m');
    },

    uploadObservations: function() {
        var upCards = iMapApp.uiUtils.getActiveCards().find("input:checkbox:checked");
        iMapApp.App.uploadObservations(upCards);
    },

    //
    // ** Common UI stuff
    //
    onResize: function(eventData, handler) {
        var targetColumns = Math.floor($(document).width() / MIN_COL_WIDTH);
        if (iMapApp.uiUtils.columns != targetColumns) {
            iMapApp.uiUtils.layoutColumns(iMapApp.App.compiledCardTemplate);
        }
        iMapApp.uiUtils.setMapStuff();
    },

    //function to layout the columns
    layoutColumns: function(compiledCardTemplate) {
        iMapApp.uiUtils.content.detach();
        iMapApp.uiUtils.content.empty();

        iMapApp.uiUtils.columns = Math.floor($(document).width() / MIN_COL_WIDTH);

        var columns_dom = [];
        for (var x = 0; x < iMapApp.uiUtils.columns; x++) {
            var col = $('<div class="column">');
            col.css("width", Math.floor(100 / iMapApp.uiUtils.columns) + "%");
            columns_dom.push(col);
            iMapApp.uiUtils.content.append(col);
        }

        var cards_data = iMapApp.App.getCardsData();
        for (x = 0; x < cards_data.length; x++) {
            var html = compiledCardTemplate(cards_data[x]);

            var targetColumn = x % columns_dom.length;
            columns_dom[targetColumn].append($(html));
        }
        $("#mainContent").prepend(iMapApp.uiUtils.content);
        var crds = iMapApp.uiUtils.getActiveCards();
        iMapApp.uiUtils.updateStatusBar("Records to Upload: " + crds.length);
    },

    getActiveCards: function(uncheck) {
        var ret = $('div[class="card"]').filter(function(index) {
            rval = $(this).find('[name="specVal"]').text() != "Species: None Selected";
            if (rval == false) {
                //$(this).find('[name="cardSelect"]').prop('checked', false);
                $(this).css({ 'background-color': '#CC3333' });
            }
            return rval;
        });
        return ret;
    },

    stateChangeHandler: function(sel) {
        console.log("Changing to state: " + sel);
        iMapApp.App.updateStateData(sel, true);
        getDElem('p[name="lastUpdateDate"]').text('Last Update: ' + iMapApp.iMapPrefs.params.StateUpdate);
    },

    speciesChangeHandler: function(sel) {
        iMapApp.uiUtils.setAssessmentType(iMapApp.App.getAssessmentType(sel));
    },

    loadProjectList: function() {
        console.log("****Loading projects");
        var pdata = JSON.parse(localStorage.getItem("projectList"));
        if (pdata == null) return;
        var prjs = ['listPrefProj', 'obsProjects'];
        prjs.forEach(function(value, index, ar) {
            var selMen = $('select[name="' + value + '"]');
            selMen.empty();
            $.each(pdata, function(key, val) {
                //console.log( "Inserting Project id: " + key + "  Name: " + val );
                selMen
                    .append($("<option></option>")
                        .attr("value", key)
                        .text(val));
            });
            selMen.sortOptions();
            selMen
                .prepend($("<option></option>")
                    .attr("value", -1)
                    .text(""));
            selMen.val(iMapApp.iMapPrefs.params.Project);
            //selMen.selectmenu();
            selMen.val(-1);
            //selMen.selectmenu('refresh', true);
        });
    },

    loadSpeciesList: function() {
        var pdata = JSON.parse(localStorage.getItem("speciesList"));
        if (pdata == null) return;
        var selMen = $('select[name="obsSpecies"]');
        selMen.empty();
        if ((iMapApp.iMapPrefs.params.Plants.MyPlants.length > 0) &&
            (getDElem('input[name="custSpeciesCheck"]').is(':checked'))) {
            $.each(iMapApp.iMapPrefs.params.Plants.MyPlants, function(key, val) {
                //console.log("Inserting Species id: " + key + "  Name: " + val);
                var lStr = iMapApp.App.getSpeciesName(val);
                selMen //<input name="your_name" value="your_value" type="checkbox">
                    .append($("<option></option>")
                    .attr("value", val)
                    .text(lStr));
            });
        } else {
            $.each(pdata, function(key, val) {
                //console.log("Inserting Species id: " + key + "  Name: " + val);
                var lStr = iMapApp.App.getSpeciesName(key);
                selMen
                    .append($("<option></option>")
                        .attr("value", key)
                        .text(lStr));
            });
        }
        selMen.sortOptions();
        selMen
            .prepend($("<option></option>")
                .attr("value", -1)
                .text("None Selected"));
        selMen.val(-1);
        //selMen.selectmenu();
        //selMen.selectmenu('refresh', true);
    },

    //
    // ** Dialog stuff
    //

    editPrefs: function(msg) {
        //iMapApp.uiUtils.openDialog('#prefsDialog', 'Edit Preferences');
        $.mobile.navigate("#prefPage");
        //$( ":mobile-pagecontainer" ).pagecontainer( "change", "#prefPage" );
        //getDElem('input[name=zoomRange]').slider();
        getDElem('p[name="prefError"]').text(msg);
        getDElem('input[name="fname"]').val(iMapApp.iMapPrefs.params.Firstname);
        getDElem('input[name="lname"]').val(iMapApp.iMapPrefs.params.Lastname);
        getDElem('input[name="uname"]').val(iMapApp.iMapPrefs.params.Username);
        getDElem('input[name="pword"]').val(iMapApp.iMapPrefs.params.Password);
        getDElem('select[name="stateSelect"]').val(iMapApp.iMapPrefs.params.CurrentState);
        getDElem('input[name="checkbox-common"]').prop('checked', iMapApp.iMapPrefs.params.Plants.UseCommon);
        getDElem('input[name="checkbox-scientific"]').prop('checked', iMapApp.iMapPrefs.params.Plants.UseScientific);
        var picSize = (iMapApp.iMapPrefs.params.PictureSize ? iMapApp.iMapPrefs.params.PictureSize : "medium");
        console.log("**picSize: " + picSize);
        getDElem('input[value="' + picSize + '"]').prop('checked', true);
        getDElem('input[value="' + iMapApp.iMapPrefs.params.MapType + '"]').prop('checked', true);
        //iMapApp.uiUtils.loadProjectList();
        getDElem('select[name="listPrefProj"]').val(iMapApp.iMapPrefs.params.Project); //.selectmenu().selectmenu('refresh', true);
        getDElem('p[name="lastUpdateDate"]').text('Last Update: ' + iMapApp.iMapPrefs.params.StateUpdate);
        getDElem('input[name="checkbox-welcomepage"]').prop('checked', iMapApp.iMapPrefs.params.WelcomePage);

        //getDElem('input[name=zoomToRange]').val(iMapApp.iMapPrefs.params['DefaultZoom']).trigger('create').slider('refresh', true);
        getDElem('#zoomToRange').attr('value', iMapApp.iMapPrefs.params.DefaultZoom);

        // Make the select searchable
        /*getDElem('select[name="listPrefProj"]').select2({
                    placeholder: "Select a State",
                    allowClear: true
             });*/
        iMapApp.uiUtils.introOverlayClose();
    },

    savePrefs: function() {
        var fnam = getDElem('input[name="fname"]').val();
        var lnam = getDElem('input[name="lname"]').val();
        var unam = getDElem('input[name="uname"]').val();
        var pwor = getDElem('input[name="pword"]').val();
        var sname = getDElem('select[name="stateSelect"]').val();
        if (fnam === "" || lnam === "" || unam === "" || sname === "") {
            iMapApp.uiUtils.openInfoDialog('Preferences not set', 'Please fill in Preferences');
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

        iMapApp.iMapPrefs.params.CurrentState = sname;
        iMapApp.iMapPrefs.params.Plants.UseCommon = getDElem('input[name="checkbox-common"]').is(':checked');
        iMapApp.iMapPrefs.params.Plants.UseScientific = getDElem('input[name="checkbox-scientific"]').is(':checked');
        //iMapPrefs.params.Plants.MyPlants = $('#fname').val();
        iMapApp.iMapPrefs.params.PictureSize = getDElem("input[name=radio-choice-size]:checked").val();
        iMapApp.iMapPrefs.params.MapType = getDElem("input[name=map-type]:checked").val();
        iMapApp.iMapPrefs.params.DefaultZoom = getDElem('input[name=zoomToRange]').val();
        iMapApp.iMapPrefs.params.Units = getDElem('#measurementSystem').val();
        iMapApp.iMapPrefs.params.WelcomePage = getDElem('input[name="checkbox-welcomepage"]').is(':checked');

        //alert($.toJSON(iMapPrefs));

        iMapApp.iMapPrefs.saveParams();
        iMapApp.uiUtils.loadSpeciesList();
        iMapApp.uiUtils.gotoMainPage();
        var fInit = localStorage.getItem("firstInit");
        if (fInit) {
            iMapApp.uiUtils.introOverlayOpen();
            localStorage.removeItem("firstInit");
        }
    },

    chooseMySpecies: function() {
        var pdata = JSON.parse(localStorage.getItem("speciesList"));
        if (pdata !== null) {
            iMapApp.uiUtils.openDialog('#selectSpeciesDialog', 'Select Your Species');
            var skeys = getSortedKeys(pdata, iMapApp.App.getSpeciesName);
            //console.log("sKeys: " + skeys);
            var selMen = $('div[name="speciesSelList"]');
            selMen.empty();
            selMen.data("role", "none");
            $.each(skeys, function(key, val) {
                var lStr = iMapApp.App.getSpeciesName(val);
                //console.log( "Inserting Species id: " + val  + "  Name: " + lStr );
                var chk = (iMapApp.iMapPrefs.params.Plants.MyPlants.indexOf(val) >= 0 ? 'checked' : '');
                selMen
                    .append($('<input class="chooseMySpecies" type="checkbox"  value="' + val + '" lStr="' + lStr + '" ' + chk + '/>' + lStr + '</input><br />'));
            });
        }
    },

    saveMySpecSpecies: function() {
        var selMen = $('#pgwModal').find('div[name="speciesSelList"]').find('input:checked');
        iMapApp.iMapPrefs.params.Plants.MyPlants = [];
        $.each(selMen, function(key, val) {
            console.log("key: " + key + " Val: " + val.getAttribute("value"));
            iMapApp.iMapPrefs.params.Plants.MyPlants.push(val.getAttribute("value"));
        });
        iMapApp.uiUtils.closeDialog();
        iMapApp.uiUtils.loadSpeciesList();
    },

    checkParamsNotSet: function() {
        var ret = iMapApp.iMapPrefs.params.Firstname === "" || iMapApp.iMapPrefs.params.Lastname === "" ||
            iMapApp.iMapPrefs.params.Username === "" || iMapApp.iMapPrefs.params.CurrentState === "";
        if (ret) {
            iMapApp.uiUtils.openInfoDialog('Preferences not set', 'Please fill in Preferences');
        }
        return ret;
    },

    gotoMainPage: function() {
        if (iMapApp.uiUtils.checkParamsNotSet()) return;
        iMapApp.iMapMap.stopGPSTimer();
        $.mobile.navigate("#mainPage");
        //iMapApp.uiUtils.checkIntroOverlay();
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
        //var appendthis =  ("<div class='modal-overlay js-modal-close'></div>");
        //$("body").append(appendthis);
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

    waitDialogClose: function(forceClose) {
        iMapApp.uiUtils.params.waitDlgCnt--;
        if ((iMapApp.uiUtils.params.waitDlgCnt <= 0) ||
            (forceClose == true)) {
            console.log("unLoad Modal Dialog...");
            $(".modal-box").fadeOut(500, function() {
                //$(".modal-overlay").remove();
            });
            //iMapApp.uiUtils.closeDialog();
            //$.mobile.loading( 'hide' );
        }
    },

    checkIntroOverlay: function() {
        console.log("Open Welcome Page: " + iMapApp.iMapPrefs.params.WelcomePage);
        //if (localStorage.getItem("introDone") != "true") {
        if ((iMapApp.iMapPrefs.params.WelcomePage == true) &&
            (!localStorage.getItem("firstInit"))) {
            iMapApp.uiUtils.introOverlayOpen();
            console.log('Opened Welcome PAge');
        }
    },

    introOverlayOpen: function() {
        $('#introOverlay').css("visibility", "visible");
    },

    introOverlayClose: function() {
        $('#introOverlay').css("visibility", "hidden");
        localStorage.setItem("introDone", true);
    },

    toggleGPS: function() {
        console.log('Toggle GPS: ' + getDElem('input[name="toggleGPS"]').is(':checked'));
        if (getDElem('input[name="toggleGPS"]').is(':checked')) {
            iMapApp.iMapMap.startGPSTimer();
        } else {
            iMapApp.iMapMap.stopGPSTimer();
        }
    },

    toggleMapType: function() {
        iMapApp.iMapPrefs.params.MapType = getDElem('select[name="flipMap"] :selected').val();
        iMapApp.iMapMap.setMapType(iMapApp.iMapPrefs.params.MapType);
    },

    updateStatusBar: function(msg) {
        $('#statusBarMsg').text(msg);
    },

    setAssessmentType: function(assesType) {
        console.log("Setting assesment type: " + assesType);
        var x = document.getElementById("TerestrialPlantsEntryDiv");
        x.style.display = "none";
        x = document.getElementById("InsectsEntryDiv");
        x.style.display = "none";
        switch (assesType) {
            case "PT":
                x = document.getElementById("TerestrialPlantsEntryDiv");
                x.style.display = "block";
                break;
            case "I":
                x = document.getElementById("InsectsEntryDiv");
                x.style.display = "block";
                break;
            default:
                break;
        }
    },

    toggleSizeUnits: function () {
        // initializes/displays the correct units for size of area survey question
        document.getElementById("sizeOfArea").className = iMapApp.iMapPrefs.params.Units == "USCustomary" ? "visible" : "hidden"; // if the units are not set to USCustomary, set the class to 'hidden' 
        document.getElementById("sizeOfAreaMetric").className = iMapApp.iMapPrefs.params.Units == "Metric" ? "visible" : "hidden"; // if the units are not set to Metric, set the class to 'hidden' 
    }

};

//
// ** Utility functions
//
$.fn.sortOptions = function() {
    $(this).each(function() {
        var op = $(this).children("option");
        op.sort(function(a, b) {
            return a.text > b.text ? 1 : -1;
        });
        return $(this).empty().data("role", "none").append(op);
    });
};

jQuery.fn.center = function() {
    this.css("position", "absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
        $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
        $(window).scrollLeft()) + "px");
    return this;
};


function getDElem(elem) {
    //return $('#pgwModal').find(elem);
    return $(elem);
}

function getSortedKeys(obj, getV) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys.sort(function(a, b) {
        if (getV(a) < getV(b))
            return -1;
        if (getV(a) > getV(b))
            return 1;
        return 0;
    });
}