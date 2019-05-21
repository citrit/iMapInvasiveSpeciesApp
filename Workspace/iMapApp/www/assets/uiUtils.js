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
        iMapApp.uiUtils.loadProjectListNew();
        iMapApp.uiUtils.loadOrganizations();
        iMapApp.uiUtils.loadSpeciesListNew('state');
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
                    navigator.notification.confirm("You are about to upload the selected records using your cellular data plan. Would you like to proceed with the upload?", iMapApp.uiUtils.checkForWifiBeforeUpload, "Not Connected To Wi-Fi", ["Yes", "No"]);
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
        $('button[name="updateStateData"]').click(function () {
            var sname = getDElem('select[name="stateSelect"]').val(),
                email = $("#email").val(),
                password = $("#pword").val();
            iMapApp.iMapPrefs.params.Email = email;
            iMapApp.iMapPrefs.params.Password = password;
            iMapApp.iMapPrefs.params.CurrentState = sname;
            iMapApp.iMapPrefs.saveParams();
            iMapApp.uiUtils.updateUserData();
        });
        $("#browserLogin").click(function() {
            iMapApp.uiUtils.attemptIMapSignIn();
        });
        $("#obsLoc").change(function() {
            var pos = JSON.parse('[' + $('input[name="obsLoc"]').val() + ']');
            iMapApp.iMapMap.setPosition(pos);
        });
        $('#stateSelect').on('change', function() { iMapApp.uiUtils.jursidctionChangeHandler(); });
        $("#obsSpeciesiMap3").on('change', function() { iMapApp.uiUtils.speciesChangeHandler($("#obsSpeciesiMap3").val(), ($('input[name="species-detected"]:checked').val() == 'detected' ? true : false)); });
        $('input[name="species-detected"]').on('change', function() { iMapApp.uiUtils.speciesChangeHandler($("#obsSpeciesiMap3").val(), ($('input[name="species-detected"]:checked').val() == 'detected' ? true : false)); });

        $("#introOverlay").click(function() {
            iMapApp.uiUtils.introOverlayClose();
        });
        // Handle back button.
        document.addEventListener("backbutton", function(e) {
            if ($.mobile.activePage.is('#mainPage')) {
                iMapApp.uiUtils.openOkCancelDialog('iMapInvasives', 'Exit iMapInvasives?',
                    navigator.app.exitApp);
            } else {
                if (!iMapApp.uiUtils.credentialsEntered()) {
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

    attemptIMapSignInPromise: function () {
        /*

        sign-in to iMap 3 to be able to interact with the iMap 3 REST services
        returns a promise, resolved if authentiation appears successful,
        otherwise rejected with error message displayed to the user

        */
        return new Promise(function (resolve, reject) {
            // to-do: add check to see if params are set
            if (iMapApp.uiUtils.validUserParams()) {
                var iMapSignInPage = iMapApp.App.iMap3BaseURL + '/imap/login.jsp',
                    iMap3SignIn = cordova.InAppBrowser.open(iMapSignInPage, '_blank', 'location=no,hidden=yes');
                iMap3SignIn.addEventListener('loadstop', function (event) {
                    var theRequestString = 'j_username=' + iMapApp.iMapPrefs.params.Email + '&j_password=' + iMapApp.iMapPrefs.params.Password,
                        loginUrl = iMapApp.App.iMap3BaseURL + '/imap/j_spring_security_check',
                        theRequest = encodeURI(theRequestString),
                        xhr = new XMLHttpRequest();
                    xhr.open('POST', loginUrl);
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                    xhr.onload = function () {
                        var signInError = 0;
                        if (xhr.status != 200) {
                            iMap3SignIn.close();
                            navigator.notification.alert("Sorry, an error occured when attempting to sign-in to iMapInvasives. Please try again later.", false, "iMap 3 Log-In Failure");
                            signInError++;
                            reject();
                        };
                        if (xhr.responseURL == iMapApp.App.iMap3BaseURL + '/imap/login.jsp?login_error=1') {
                            iMap3SignIn.close();
                            navigator.notification.alert("Sorry, the username and password combination you provided is incorrect. Please check the credentials in the Preferences page and try again.", false, "Incorrect iMap 3 Credentials");
                            signInError++;
                            reject();
                        };
                        if (signInError === 0) {
                            console.log("iMap 3 auth appears OK");
                            resolve();
                        }
                        iMap3SignIn.close();
                    };
                    xhr.send(theRequest);
                });
            } else {
                reject('An error occurred while attempting to update your species, project, and organization lists.');
            }
        })
    },

    /*
    debug function
    */
    attemptIMapSignIn: function() {
        // to-do: add check to see if params are set
        iMapApp.uiUtils.waitDialogOpen('Attempting to authenticate with iMapInvasives 3', 10);
        var iMap3SignIn = cordova.InAppBrowser.open('https://imapinvasives.natureserve.org/imap/login.jsp', '_blank', 'location=no,hidden=yes');
        iMap3SignIn.addEventListener('loadstop', function(event) {
            var theRequestString = 'j_username=' + iMapApp.iMapPrefs.params.Email + '&j_password=' + iMapApp.iMapPrefs.params.Password;
            theRequest = encodeURI(theRequestString),
            xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://imapinvasives.natureserve.org/imap/j_spring_security_check');
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.onload = function() {
                var signInError = 0;
                if (xhr.status != 200) {
                    iMap3SignIn.close();
                    iMapApp.uiUtils.waitDialogClose(true);
                    navigator.notification.alert("Sorry, an error occured when attempting to sign-in to iMapInvasives. Please try again later.", false, "iMap 3 Log-In Failure");
                    signInError++;
                };
                if (xhr.responseURL == 'https://imapinvasives.natureserve.org/imap/login.jsp?login_error=1') {
                    iMap3SignIn.close();
                    iMapApp.uiUtils.waitDialogClose(true);
                    navigator.notification.alert("Sorry, the email address and password combination is incorrect. Please the credentials in the Preferences page and try again.", false, "Incorrect iMap 3 Credentials");
                    signInError++;
                };
                if (signInError === 0) {
                    console.log("iMap 3 auth appears OK");
                }
                iMap3SignIn.close();
                iMapApp.uiUtils.waitDialogClose(true);
            };
            xhr.send(theRequest);
        });
    },

    getPersonIDHandler: function() {
        // checks if the user is signed-in before attempting to get user ID
        iMapApp.uiUtils.checkIfSignedIn().then(function() {
            iMapApp.uiUtils.getPersonID();
        }).catch(function (e) {
            // if promise rejected, the user is not signed-in
            iMapApp.uiUtils.attemptIMapSignInPromise().then(function() {
                iMapApp.uiUtils.getPersonID();
            })
        });
    },

    getPersonID: function () {
        // use the new AOI utility to get the iMap3 personID and store it in the iMap Prefs params
        return new Promise(function (resolve, reject) {

            var newAOIurl = iMapApp.App.iMap3BaseURL + '/imap/services/aoi/new',
                xhr = new XMLHttpRequest();
            xhr.open('GET', newAOIurl);
            xhr.onload = function () {
                if (xhr.status == 200) {
                    var newAOI = JSON.parse(xhr.responseText);
                    iMapApp.iMapPrefs.params.personId = newAOI.createdBy.id; // store the personID in iMap Prefs
                    iMapApp.iMapPrefs.saveParams(); // save the changes
                    resolve();
                } else {
                    console.log("An error occurred when attempting to get the Person ID");
                    reject("An error occurred when attempting to get the Person ID");
                };
            };
            xhr.send();
        })
    },

    getUserDetailsHandler: function() {
        // checks if the user is signed-in before attempting to get user details

        iMapApp.uiUtils.checkIfSignedIn().then(function() {
            iMapApp.uiUtils.getUserDetails();
        }).catch(function (e) {
            // if promise rejected, the user is not signed-in
            iMapApp.uiUtils.attemptIMapSignInPromise().then(function() {
                iMapApp.uiUtils.getPersonID();
            })
        });
    },

    getUserDetails: function () {
        return new Promise(function (resolve, reject) {
            var personRecordUrl = iMapApp.App.iMap3BaseURL + '/imap/services/person/' + iMapApp.iMapPrefs.params.personId;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', personRecordUrl);
            xhr.onload = function () {
                if (xhr.status == 200) {
                    var personRecord = JSON.parse(xhr.responseText),
                        newOrganizations = [],
                        newProjects = [];

                    // store the organizations array in iMap3 Prefs
                    personRecord.organizationMembers.forEach(function (org) {
                        newOrganizations.push(org.organization);
                    });
                    iMapApp.iMapPrefs.params.iMap3Organizations = newOrganizations;

                    // store the projects array in the iMap3 Prefs
                    personRecord.projectMembers.forEach(function (proj) {
                        newProjects.push(proj.project);
                    });
                    iMapApp.iMapPrefs.params.iMap3Projects = newProjects;

                    // get the user's "home jurisdiction"
                    iMapApp.iMapPrefs.params.dStateID = personRecord.userAccount.dstateId;

                    // save the changes
                    iMapApp.iMapPrefs.saveParams();
                    resolve();
                } else {
                    console.log("An error occurred when attempting to get the person attributes");
                    reject("An error occurred when attempting to get the person attributes");
                };
            };
            xhr.send();
        })
    },

    /**
     * use the create new AOI service to determine if the user is currently authenticated with iMap.
     * 
     * @returns {Promise} resolved true if response is 200 (thus the user is already signed-in), resolved false if  response is 403 (user not signed-in), rejected if unexpected response recieved
     */
    checkIfSignedIn: function() {
        var newAOIurl = iMapApp.App.iMap3BaseURL + '/imap/services/aoi/new',
        xhr = new XMLHttpRequest();
        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                if (xhr.status == 200) {
                    resolve (true);
                } else if (xhr.status == 403) {
                    resolve (false);
                } else {
                    reject ('iMap returned an unexpected result when attempting to check if the user is signed-in. Response: ' + xhr.status);
                };
            };
            xhr.open('GET', newAOIurl);
            xhr.send();
        });
    },

    updateUserDataPromise: function () {
        return new Promise(function (resolve, reject) {
            if (iMapApp.uiUtils.validUserParams()) {
                iMapApp.uiUtils.checkIfSignedIn()
                    .then(function (signedInStatus) {
                        if (!signedInStatus) {
                            return iMapApp.uiUtils.attemptIMapSignInPromise();
                        } else {
                            return;
                        };
                    })
                    .then(function () {
                        return iMapApp.uiUtils.getPersonID()
                    })
                    .then(function () {
                        return iMapApp.uiUtils.getUserDetails();
                    })
                    .then(function () {
                        return iMapApp.App.downloadJurisdictionSppList(iMapApp.iMapPrefs.params.CurrentState);
                    })
                    .then(function () {
                        iMapApp.uiUtils.loadSpeciesListNew('state');
                        iMapApp.uiUtils.loadProjectListNew();
                        if (iMapApp.iMapPrefs.params.Project) {
                            // if the default project is already set, attempt to re-select it
                            getDElem('select[name="listPrefProj"]').val(iMapApp.iMapPrefs.params.Project);
                        }
                        iMapApp.uiUtils.loadOrganizations();
                        if (iMapApp.iMapPrefs.params.OrgDefault) {
                            // if the default organization is already set, attempt to re-select it
                            getDElem('select[name="listPrefOrg"]').val(iMapApp.iMapPrefs.params.OrgDefault);
                        }
                        iMapApp.App.listUpdateDateSetter();
                        resolve();
                    })
                    .catch(function (e) {
                        if (e) {
                            reject('An error occurred while attempting to update your species, project, and organization lists. Error details: ' + e);
                        } else {
                            reject('An error occurred while attempting to update your species, project, and organization lists.');
                        }
                    });
            } else {
                reject('An error occurred while attempting to update your species, project, and organization lists.');
            }
        });
    },

    updateUserData: function () {
        if (iMapApp.uiUtils.validUserParams()) {
            iMapApp.uiUtils.waitDialogOpen('Attempting to authenticate with iMapInvasives 3 to update your species, project, and organization lists...', 10);
            iMapApp.uiUtils.attemptIMapSignInPromise()
                .then(function () {
                    return iMapApp.uiUtils.getPersonID()
                })
                .then(function () {
                    return iMapApp.uiUtils.getUserDetails();
                })
                .then(function () {
                    return iMapApp.App.downloadJurisdictionSppList(iMapApp.iMapPrefs.params.CurrentState);
                })
                .then(function () {
                    iMapApp.uiUtils.loadSpeciesListNew('state');
                    iMapApp.uiUtils.loadProjectListNew();
                    if (iMapApp.iMapPrefs.params.Project) {
                        // if the default project is already set, attempt to re-select it
                        getDElem('select[name="listPrefProj"]').val(iMapApp.iMapPrefs.params.Project);
                    }
                    iMapApp.uiUtils.loadOrganizations();
                    if (iMapApp.iMapPrefs.params.OrgDefault) {
                        // if the default organization is already set, attempt to re-select it
                        getDElem('select[name="listPrefOrg"]').val(iMapApp.iMapPrefs.params.OrgDefault);
                    }
                    iMapApp.App.listUpdateDateSetter();
                    iMapApp.uiUtils.openInfoDialog('iMap Data Retrieval Successful', '<span class="success">Your iMapInvasives data was retrieved successfully (which includes your Species, Project, and Organization lists).</span>');
                })
                .catch(function (e) {
                    if (e) {
                        iMapApp.uiUtils.openInfoDialog('Error Updating Lists', 'An error occurred while attempting to update your species, project, and organization lists. Error details: ' + e);
                    } else {
                        iMapApp.uiUtils.openInfoDialog('Error Updating Lists', 'An error occurred while attempting to update your species, project, and organization lists.');
                    }
                })
                .then(function() {
                    iMapApp.uiUtils.waitDialogClose(true);
                });
        };
    },

    //
    // ** Card UI callbacks.
    //
    selectCards: function(chkd) {
        $.each($("#content input:checkbox"), function(index, val) {
            $(val).prop('checked', chkd);
        });
    },

    checkForWifiBeforeUpload: function(buttonReturn) {
        if (buttonReturn == 2) {
            // if the user selects "No" to the cellular upload prompt, do not proceed with the upload
            return;
        };
        var n = iMapApp.uiUtils.getActiveCards().find("input:checkbox:checked").length;
        if (n == 0) {
            iMapApp.uiUtils.openInfoDialog('No active cards selected', 'Please select cards (which include a species selection) and try again.');
        } else {
            iMapApp.uiUtils.openOkCancelDialog('Upload Observations', 'Are you sure you want to upload ' + n + ' record(s)?',
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
        getDElem('[name="obsProjectiMap3"]').val(iMapApp.iMapPrefs.params.Project);
        getDElem('#obsOrgiMap3').val(iMapApp.iMapPrefs.params.OrgDefault);
        getDElem('[name="obsSpeciesiMap3"]').val(-1); //.selectmenu().selectmenu('refresh', true);; 
        var now = new Date();
        var day = ("0" + now.getDate()).slice(-2);
        var month = ("0" + (now.getMonth() + 1)).slice(-2);
        var dt = now.getFullYear() + "-" + (month) + "-" + (day);
        getDElem('[name="obsDate"]').val(dt);
        getDElem('[name="largeImage"]').prop("src", "assets/images/TakePhoto3.png");
        getDElem('[name="obsLoc"]').val([0.0, 0.0]);
        getDElem('[name="sizeOfArea"]').val('o');
        getDElem('[name="sizeOfAreaMetric"]').val('oo');
        getDElem('[name="distribution"]').val('0');
        getDElem('[name="plantsAffectedCount"]').val('');
        getDElem('[name="timeSurveying"]').val('');
        getDElem('#ailanthusStemsGreaterSix').val('null');        
        getDElem('[name="obsComment"]').val('');
        iMapApp.uiUtils.setAdditionalFields("Off");
        iMapApp.uiUtils.toggleAilanthusFields("Off");
        iMapApp.iMapMap.setMapZoom(iMapApp.iMapPrefs.params.DefaultZoom);
        getDElem('input[name="toggleGPS"]').prop('checked', true);
        getDElem('select[name="flipMap"]').val(iMapApp.iMapPrefs.params.MapType);
        iMapApp.iMapMap.startGPSTimer();
        iMapApp.iMapMap.setPosition([-73.4689, 42.7187]);

        // initialize the detected radio buttons
        $('#radio-choice-species-detected').checkboxradio();
        $('#radio-choice-species-not-detected').checkboxradio();
        $('#radio-choice-species-detected').prop('checked',false);
        $('#radio-choice-species-not-detected').prop('checked',false);
        $('#radio-choice-species-detected').checkboxradio('refresh');
        $('#radio-choice-species-not-detected').checkboxradio('refresh');

        this.toggleSizeUnits(); // initialize/display the correct units

        iMapApp.uiUtils.checkLists(); // check that the iMap lists exist on the device

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
        getDElem('#obsProjectiMap3').val(obs.getiMap3ProjId()); //.selectmenu().selectmenu('refresh', true);;
        getDElem('#obsOrgiMap3').val(obs.getiMap3Org());
        getDElem('#obsSpeciesiMap3').val(obs.getiMap3SpeciesID()); //.selectmenu().selectmenu('refresh', true);;
        getDElem('[name="sizeOfArea"]').val(obs.getSize());
        getDElem('#sizeOfAreaMetric').val(obs.getSizeMetric());
        getDElem('[name="distribution"]').val(obs.getDist());
        getDElem('[name="plantsAffectedCount"]').val(obs.getNumTrees());
        getDElem('[name="timeSurveying"]').val(obs.getTimeSurvey());
        getDElem('#ailanthusStemsGreaterSix').val(obs.getAilanthusDBHGreaterSix());
        getDElem('[name="obsComment"]').val(obs.getComment());

        $('#radio-choice-species-detected').checkboxradio();
        $('#radio-choice-species-not-detected').checkboxradio();

        if (obs.getDetected()) {
            $('#radio-choice-species-detected').prop('checked',true);
            $('#radio-choice-species-not-detected').prop('checked',false); 
        } else {
            $('#radio-choice-species-detected').prop('checked',false);
            $('#radio-choice-species-not-detected').prop('checked',true); 
        };

        $('#radio-choice-species-detected').checkboxradio('refresh');
        $('#radio-choice-species-not-detected').checkboxradio('refresh');

        var now = new Date(obs.getWhen());
        var day = ("0" + now.getDate()).slice(-2);
        var month = ("0" + (now.getMonth() + 1)).slice(-2);
        var dt = now.getFullYear() + "-" + (month) + "-" + (day);

        getDElem('[name="obsDate"]').val(obs.getWhen());
        //$('input[name="obsState"]').val(obs.getState());
        //$('input[name="obsCounty"]').val(obs.getCounty());
        getDElem('[name="obsLoc"]').val(obs.getWhere());
        //console.log("Photo: " + obs.getPhotos());

        if (obs.getPhotosFileName()) {
            var activePhotoUrl = iMapApp.App.dataFolder + obs.getPhotosFileName();
            getDElem('[name="largeImage"]').attr("src", activePhotoUrl);
        } else {
            getDElem('[name="largeImage"]').attr("src", "assets/images/TakePhoto3.png");
        }

        iMapApp.uiUtils.setAdditionalFields(iMapApp.App.getSpeciesRecord(obs.getiMap3SpeciesID(), obs.getDetected()));

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
        var theCoords = JSON.parse('[' + getDElem('[name="obsLoc"]').val() + ']');
        iMapApp.iMapMap.stopGPSTimer();
        if (theCoords[0] == 0 || theCoords[1] == 0) {
            console.log("coordinates at 0,0");
            iMapApp.uiUtils.openInfoDialog("Invalid Geographic Coordinates","This record cannot be saved because the geographic coordinates are located at a longitude of 0 and/or a latitude of 0. To correct this problem, please either enable location services for the iMapInvasives App or manually change the record coordinates in the Location field to something other than (0, 0).");
            return;
        };
        if (getDElem('[name="obsSpeciesiMap3"]').val() == "-1") {
            iMapApp.uiUtils.openOkCancelDialog('Save Species', 'You have not specified a species, save Observation?', iMapApp.uiUtils.saveObs);
            return;
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
        };

        // check to see if either the species detected or not detected toggle was selected, return an error message if so
        if ($('#radio-choice-species-detected').prop('checked') === false && $('#radio-choice-species-not-detected').prop('checked') === false) {
            iMapApp.uiUtils.openInfoDialog("Detected Status Not Selected","Please select either Species Detected or Not Detected.");
            return;
        }
        iMapApp.uiUtils.saveObs();
    },

    saveObs: function() {
        var obs = (iMapApp.uiUtils.params.curObs == null ? new iMapApp.Observation() : iMapApp.uiUtils.params.curObs),
        detectedVal = ($('input[name="species-detected"]:checked').val() == 'detected' ? true : false);
        obs.setProject(getDElem('[name="obsProjects"]').find(":selected").text());
        obs.setiMap3Org(getDElem('#obsOrgiMap3').val());
        obs.setiMap3ProjId(getDElem('#obsProjectiMap3').val());
        obs.setiMap3SpeciesID(getDElem('#obsSpeciesiMap3').val());
        obs.setDetected(detectedVal);
        obs.setSize(getDElem('[name="sizeOfArea"]').val());
        obs.setSizeMetric(getDElem('#sizeOfAreaMetric').val());
        obs.setDist(getDElem('[name="distribution"]').val());
        obs.setNumTrees(getDElem('[name="plantsAffectedCount"]').val());
        obs.setTimeSurvey(getDElem('[name="timeSurveying"]').val());
        obs.setAilanthusDBHGreaterSix(getDElem('#ailanthusStemsGreaterSix').val());
        obs.setComment(getDElem('[name="obsComment"]').val());
        obs.setiMap3Compatible(true);

        var dt = getDElem('[name="obsDate"]').val();
        obs.setWhen(dt);
        obs.setWhere(JSON.parse('[' + getDElem('[name="obsLoc"]').val() + ']'));
        obs.setSearchedArea(iMapApp.iMapMap.getPoly());

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
    },

    speciesChangeHandler: function(sel, detected) {
        iMapApp.uiUtils.setAdditionalFields(iMapApp.App.getSpeciesRecord(sel), detected);
        iMapApp.uiUtils.toggleAilanthusFields(sel);
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

    loadProjectListNew: function() {
        console.log("****Loading iMap 3 projects");
        var projects = iMapApp.iMapPrefs.params.iMap3Projects;
        if (projects == null) return;
        var prjs = ['listPrefProj', 'obsProjectiMap3'];
        prjs.forEach(function(list) {
            var selMen = $('select[name="' + list + '"]');
            selMen.empty();
            for (var i = 0; i < projects.length; i++) {
                selMen
                    .append($("<option></option>")
                        .attr("value", projects[i]["id"])
                        .text(projects[i]["name"]));
            }
            selMen.sortOptions();
            selMen
                .prepend($("<option></option>")
                    .attr("value", -1)
                    .text(""));
            selMen.val(-1);
        });
    },

    loadOrganizations: function() {
        console.log("****Loading iMap 3 Organizations");
        var orgs = iMapApp.iMapPrefs.params.iMap3Organizations;
        if (orgs == null) return;
        var orgLists = ['listPrefOrg', 'obsOrgiMap3'];
        orgLists.forEach(function(list) {
            var selMen = $('#' + list);
            selMen.empty();
            for (var i = 0; i < orgs.length; i++) {
                selMen
                    .append($("<option></option>")
                        .attr("value", orgs[i]["id"])
                        .text(orgs[i]["name"]));
            }
            selMen.sortOptions();
            selMen
                .prepend($("<option></option>")
                    .attr("value", -1)
                    .text(""));
            selMen.val(-1);
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

    loadSpeciesListNew: function(listType) {
        var listTypeFull = listType + 'SpeciesList',
        pdata = JSON.parse(localStorage.getItem(listTypeFull));
        if (pdata == null) return;
        var selMen = $('select[name="obsSpeciesiMap3"]');
        selMen.empty();
        if ((iMapApp.iMapPrefs.params.Plants.MyPlants.length > 0) &&
            (getDElem('input[name="custSpeciesCheck"]').is(':checked'))) {
            iMapApp.iMapPrefs.params.Plants.MyPlants.forEach(function (p) {
                // filter out iMap3 "untracked" species
                if (pdata[p]['trackedInd'] === false) {
                    return;
                };
                var lStr = iMapApp.App.getSpeciesNameNew(pdata[p], true);
                selMen //<input name="your_name" value="your_value" type="checkbox">
                    .append($("<option></option>")
                    .attr("value", p)
                    .text(lStr));
            });
        } else {
            Object.keys(pdata).forEach(function (sp) {
                var theSp = pdata[Number(sp)],
                state = (listType == 'state' ? true : false),
                spName = iMapApp.App.getSpeciesNameNew(theSp, state),
                spVal = sp;
                // filter out iMap3 "untracked" species
                if (pdata[Number(sp)]['trackedInd'] === false) {
                    return;
                };
                selMen
                    .append($("<option></option>")
                        .attr("value", spVal)
                        .text(spName));
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
        this.prefIntroToggler();
        getDElem('p[name="prefError"]').text(msg);
        getDElem('#email').val(iMapApp.iMapPrefs.params.Email);
        getDElem('input[name="pword"]').val(iMapApp.iMapPrefs.params.Password);
        getDElem('select[name="stateSelect"]').val(iMapApp.iMapPrefs.params.CurrentState);
        getDElem('input[name="checkbox-common"]').checkboxradio();
        getDElem('input[name="checkbox-common"]').prop('checked', iMapApp.iMapPrefs.params.Plants.UseCommon);
        getDElem('input[name="checkbox-common"]').checkboxradio('refresh');
        getDElem('input[name="checkbox-scientific"]').checkboxradio();
        getDElem('input[name="checkbox-scientific"]').prop('checked', iMapApp.iMapPrefs.params.Plants.UseScientific);
        getDElem('input[name="checkbox-scientific"]').checkboxradio('refresh');
        var picSize = (iMapApp.iMapPrefs.params.PictureSize ? iMapApp.iMapPrefs.params.PictureSize : "medium");
        console.log("**picSize: " + picSize);
        getDElem('input[value="' + picSize + '"]').prop('checked', true);
        getDElem('input[name="checkbox-SaveOriginalPhotos"]').prop('checked', ((iMapApp.iMapPrefs.params.SaveOriginalPhotos === true || iMapApp.iMapPrefs.params.SaveOriginalPhotos == null) ? true : false)); // set save orginal photo to true if it is not explicitly set already
        getDElem('input[value="' + iMapApp.iMapPrefs.params.MapType + '"]').prop('checked', true);
        //iMapApp.uiUtils.loadProjectList();
        getDElem('select[name="listPrefProj"]').val(iMapApp.iMapPrefs.params.Project); //.selectmenu().selectmenu('refresh', true);
        getDElem('select[name="listPrefOrg"]').val(iMapApp.iMapPrefs.params.OrgDefault); //.selectmenu().selectmenu('refresh', true);
        getDElem('p[name="lastUpdateDate"]').text('Last iMap Lists Refresh: ' + (iMapApp.iMapPrefs.params.StateUpdate ? iMapApp.uiUtils.lastListsUpdateDateFormatter(iMapApp.iMapPrefs.params.StateUpdate) : "Never"));
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

    checkLists: function() {
        if (!iMapApp.iMapPrefs.params.personId) {
            navigator.notification.confirm("It appears that your full iMap 3 user data (project and organization lists) has not yet been retrieved from iMapInvasives. Would you like to attempt to retrieve this data now? (Or you can manually retrieve this data later in the Preferences page.)", iMapApp.uiUtils.checkListsButtonActions, "Full iMap 3 Data Not Found", ["Yes, Retrieve iMap Data Now", "No, Wait to Retrieve Later"]);
        }
    },

    checkListsButtonActions: function(i) {
        if (i === 1) {
            iMapApp.App.downloadJurisdictionSppList(iMapApp.iMapPrefs.params.CurrentState);
            iMapApp.uiUtils.updateUserData();
        } else {
            return;
        }
    },

    credentialsEntered: function() {
        var sname = getDElem('select[name="stateSelect"]').val(),
        email = $("#email").val(),
        password = $("#pword").val();

        if (email === "" || password === "" || sname === "" || sname === null) {
            iMapApp.uiUtils.openInfoDialog('Jurisdiction or Credentials Not Entered', 'In the Preferences Page, please select a jurisdiction and enter your iMap 3 email address and password to retrieve your user data/lists.');
            return false;
        };
        return true;
    },

    validUserParams: function() {
        if (!iMapApp.iMapPrefs.params.Email || !iMapApp.iMapPrefs.params.Password || !iMapApp.iMapPrefs.params.CurrentState || !(jQuery.isNumeric(iMapApp.iMapPrefs.params.CurrentState))) {
            iMapApp.uiUtils.openInfoDialog('Jurisdiction or Credentials Not Entered', 'In the Preferences Page, please select a jurisdiction, enter your iMap 3 email address, and save the Preferences. Then try your request again.');
            return false;
        };
        return true;
    },

    savePrefs: function(type) {
        /*
        var fnam = getDElem('input[name="fname"]').val();
        var lnam = getDElem('input[name="lname"]').val();
        var unam = getDElem('input[name="uname"]').val();
        var pwor = getDElem('input[name="pword"]').val();
        */
        var sname = getDElem('select[name="stateSelect"]').val();
        
        if (!sname) {
            iMapApp.uiUtils.openInfoDialog('Jurisdiction Not Selected', 'Please select a Jurisdiction, then Save Preferences to proceed.');
            return;
        }
        //iMapApp.uiUtils.openDialog('#waitDialog', "Saving Preferences");
        var sname = getDElem('select[name="stateSelect"]').val(),
        email = $("#email").val(),
        password = $("#pword").val();

        iMapApp.iMapPrefs.params.Email = email;
        iMapApp.iMapPrefs.params.Password = password;
        iMapApp.iMapPrefs.params.Project = getDElem('select[name="listPrefProj"] :selected').val();
        iMapApp.iMapPrefs.params.OrgDefault = getDElem('select[name="listPrefOrg"] :selected').val();

        /*
        if (iMapApp.iMapPrefs.params.Plants.UseCommon !== getDElem('input[name="checkbox-common"]').is(':checked') ||
            iMapApp.iMapPrefs.params.Plants.UseScientific !== getDElem('input[name="checkbox-scientific"]').is(':checked')) {
            //DBFuncs.loadSpeciesList();
        }
        */

        //if (iMapPrefs.params.currentState !== $('#stateSelect').val()) {
        //    DBFuncs.loadProjectList();
        //}

        if (!iMapApp.uiUtils.sciCommonButtonSelected()) {
            // if neither scientific or common name is selected, return an error
            iMapApp.uiUtils.openInfoDialog('Species Name Display Not Set', 'Please select to display either Scientific or Common species names (or both).');
            return
        }

        iMapApp.iMapPrefs.params.CurrentState = sname;
        iMapApp.iMapPrefs.params.Plants.UseCommon = getDElem('input[name="checkbox-common"]').is(':checked');
        iMapApp.iMapPrefs.params.Plants.UseScientific = getDElem('input[name="checkbox-scientific"]').is(':checked');
        //iMapPrefs.params.Plants.MyPlants = $('#fname').val();
        iMapApp.iMapPrefs.params.PictureSize = getDElem("input[name=radio-choice-size]:checked").val();
        iMapApp.iMapPrefs.params.SaveOriginalPhotos = getDElem('input[name="checkbox-SaveOriginalPhotos"]').is(':checked');
        iMapApp.iMapPrefs.params.MapType = getDElem("input[name=map-type]:checked").val();
        iMapApp.iMapPrefs.params.DefaultZoom = getDElem('input[name=zoomToRange]').val();
        iMapApp.iMapPrefs.params.Units = getDElem('#measurementSystem').val();
        iMapApp.iMapPrefs.params.WelcomePage = getDElem('input[name="checkbox-welcomepage"]').is(':checked');

        //alert($.toJSON(iMapPrefs));

        iMapApp.iMapPrefs.saveParams();
        iMapApp.uiUtils.loadSpeciesListNew('state');
        if (type == 'button') {
            iMapApp.uiUtils.gotoMainPage();
            var fInit = localStorage.getItem("firstInit");
            if (fInit) {
                iMapApp.uiUtils.introOverlayOpen();
                localStorage.removeItem("firstInit");
            }
        }
    },

    sciCommonButtonSelected: function() {
        if (getDElem('input[name="checkbox-common"]').is(':checked') === true || getDElem('input[name="checkbox-scientific"]').is(':checked') === true) {
            return true;
        } else {
            return false;
        }
    },

    chooseMySpecies: function() {
        var pdata = JSON.parse(localStorage.getItem("stateSpeciesList"));
        if (pdata !== null) {
            iMapApp.uiUtils.openDialog('#selectSpeciesDialog', 'Select Your Species');
            var skeys = getSortedKeys(pdata, iMapApp.App.getSpeciesNameNew);
            //console.log("sKeys: " + skeys);
            var selMen = $('div[name="speciesSelList"]');
            selMen.empty();
            selMen.data("role", "none");
            $.each(skeys, function(key, val) {
                if (pdata[val]['trackedInd'] === false) {
                    return;
                };
                var lStr = iMapApp.App.getSpeciesNameNew(pdata[val], 'state');
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
        iMapApp.uiUtils.loadSpeciesListNew('state');
    },

    checkParamsNotSet: function() {
        var ret = iMapApp.iMapPrefs.params.Firstname === "" || iMapApp.iMapPrefs.params.Lastname === "" || iMapApp.iMapPrefs.params.CurrentState === "";
        if (ret) {
            iMapApp.uiUtils.openInfoDialog('Preferences not set', 'Please fill in Preferences');
        }
        return ret;
    },

    prefsCancelButtonHandler: function() {
        if (iMapApp.iMapPrefs.params.CurrentState) {
            iMapApp.uiUtils.gotoMainPage();
        } else {
            iMapApp.uiUtils.openInfoDialog('Jurisdiction Not Selected', 'Please select a Jurisdiction, then Save Preferences to proceed.');
            return;
        }
    },

    gotoMainPage: function() {
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
        //$('#waitPopup[name="waitDialogText"]').text(msg);
        $('#waitDialogTextCustom').text(msg);
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
            (!localStorage.getItem("firstInit")) && (iMapApp.iMapPrefs.params.Email)) {
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

    setAdditionalFields: function(spRecord, detected) {
        var plantsEntry = document.getElementById("PlantsEntryDiv"),
        insectEntry = document.getElementById("InsectsEntryDiv"),
        kingdom = spRecord['kingdom'],
        taxaClass = spRecord['taxaClass'];
        plantsEntry.classList.add("hidden");
        insectEntry.classList.add("hidden");
        if (detected != false) {
            if (kingdom == 'Plantae') {
                plantsEntry.classList.remove("hidden");
            };
            if (taxaClass == 'Insecta') {
                insectEntry.classList.remove("hidden");
            };
        };
    },

    toggleAilanthusFields: function(species) {
        // toggles additional assessment fieldsto display only for Ailanthus altissima
        var ailanthusFields = document.getElementById("AilanthusEntryDiv");
        ailanthusFields.classList.add("hidden");
        if (species == 'NY-2-148863') {
            ailanthusFields.classList.remove("hidden");
        }
    },

    toggleSizeUnits: function () {
        // initializes/displays the correct units for size of area survey question
        document.getElementById("sizeOfArea").className = iMapApp.iMapPrefs.params.Units == "USCustomary" ? "visible" : "hidden"; // if the units are not set to USCustomary, set the class to 'hidden' 
        document.getElementById("sizeOfAreaMetric").className = iMapApp.iMapPrefs.params.Units == "Metric" ? "visible" : "hidden"; // if the units are not set to Metric, set the class to 'hidden' 
    },

    lastListsUpdateDateFormatter: function (theDate) {
       var lastUpdateDate = new Date(Date.parse(theDate));
       var dateFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
       return lastUpdateDate.toLocaleDateString(false, dateFormatOptions);
    },

    personIdChecker: function() {
        return (iMapApp.iMapPrefs.params.personId > 0 ? true : false);
    },

    prefIntroToggler: function() {
        // if the username is set, remove the intro box in preferences
        if (iMapApp.uiUtils.personIdChecker()) {
            getDElem('#pref-intro').addClass("hidden");
        }
    },

    jursidctionChangeHandler: function() {
        var sname = getDElem('select[name="stateSelect"]').val();
        if (sname) {
            iMapApp.App.downloadJurisdictionSppList(sname);
        };
    },

    bottomBarHelper: {
        bottomBarHelperAdd: function () {
            var elem = document.getElementById("footer-status-bar");
            if (!elem.classList.contains("footer-status-bar-push")) {
                elem.classList.add("footer-status-bar-push");
            }
        },
        bottomBarHelperRemove: function() {
            document.getElementById("footer-status-bar").classList.remove("footer-status-bar-push");
        }
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
    // returns a sorted array of iMap species IDs to use for list sorting
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys.sort(function(a, b) {
        if (getV(obj[a], true) < getV(obj[b], true))
            return -1;
        if (getV(obj[a], true) > getV(obj[b], true))
            return 1;
        return 0;
    });
}