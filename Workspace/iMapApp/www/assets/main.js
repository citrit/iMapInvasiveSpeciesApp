var iMapApp = iMapApp || {};

iMapApp.App = {
    observ: {},
    compiledCardTemplate: null,
    SpeciesURL: 'http://hermes.freac.fsu.edu/requests/state_species_pdg/species?state=',
    ProjectsURL: 'http://hermes.freac.fsu.edu/requests/state_species/project?state=',
    iMap3BaseURL: 'https://imapinvasives.natureserve.org',
    projectList: null,
    speciesList: null,
    nationalSpeciesList: null,
    stateSpeciesList: null,
    version: 0.0,
    dataFolder: null,

    init: function() {
        console.log("iMapApp.App.init");
        if (navigator.platform != 'MacIntel') {
            cordova.getAppVersion.getVersionNumber(function(version) {
                iMapApp.App.version = version;
                console.log("Version: " + iMapApp.App.version);
            });
        }
        iMapApp.App.compiledCardTemplate = Mustache.compile($("#card-template").html());
        iMapApp.iMapPrefs.init();
        iMapApp.App.stateSpeciesList = JSON.parse(localStorage.getItem("stateSpeciesList"));
        iMapApp.uiUtils.init();
        //debugTest();
        iMapApp.App.loadObservations();
        iMapApp.App.renderCards();
        iMapApp.App.checkUpdateDuration(iMapApp.iMapPrefs.params.StateUpdate);
        iMapApp.App.dataFolder = (cordova.file.documentsDirectory == null ? cordova.file.externalApplicationStorageDirectory : cordova.file.documentsDirectory);
        iMapApp.uiUtils.bottomBarHelper.bottomBarHelperRemove();
        window.addEventListener("orientationchange", function(){
            iMapApp.uiUtils.bottomBarHelper.bottomBarHelperRemove();
        });
    },

    //
    // ** Observations helpers
    //
    addObservation: function(obs) {
        iMapApp.App.observ[obs.getObjectID()] = obs;
        iMapApp.App.saveObservations();
        iMapApp.App.renderCards();
    },

    delObservation: function(idx) {
        console.log("Going to delete: " + idx);
        if (iMapApp.App.observ[idx].getPhotosFileName() !== "") {
            var img = iMapApp.App.dataFolder + iMapApp.App.observ[idx].getPhotosFileName();
            console.log("Deleteing image: " + img);
            iMapApp.App.removeImage(img);
        }
        delete iMapApp.App.observ[idx];
        iMapApp.App.saveObservations();
        iMapApp.App.renderCards();
    },

    //** Observation persist
    saveObservations: function() {
        var dStr = '[';
        for (var key in iMapApp.App.observ) {
            var el = iMapApp.App.observ[key];
            dStr += JSON.stringify(el.getObsData()) + ',';
        }
        dStr += ']';
        // Put the object into storage
        localStorage.setItem('iMapObservations', dStr);
        //localStorage.setItem('iMapObservations', JSON.stringify(iMapApp.App.observ));
    },

    loadObservations: function() {
        // Retrieve the object from storage
        var retrievedObject = localStorage.getItem('iMapObservations');
        iMapApp.App.observ = {};
        var dObs = eval(retrievedObject);
        if (dObs !== null) {
            if (dObs.length > 24) {
                iMapApp.uiUtils.openInfoDialog('Uploading is Recommended', 'Reminder: you have at least 25 observations; uploading is recommended');
            }
            dObs.forEach(function(el, idx, array) {
                console.log('retrievedObject: ' + JSON.stringify(el));
                var ob = new iMapApp.Observation(el);
                iMapApp.App.addObservation(ob);
            });
        }
    },

    uploadObservations: function(obsIDs) {
        iMapApp.uiUtils.closeDialog();
        iMapApp.uiUtils.waitDialogOpen('Uploading Observations', obsIDs.length);
        iMapApp.uploadUtils.doUpload(obsIDs);

        /*obsIDs.each(function(ind, el ) {
            var spec = iMapApp.App.observ[el.id].getSpecies();
            iMapApp.uiUtils.updateStatusBar("Uploading: " + spec);
            iMapApp.uploadUtils.doUpload(iMapApp.App.observ[el.id]);
            iMapApp.uiUtils.updateStatusBar("Done: " + spec);
        });*/
    },

    numObservations: function() { return Object.keys(iMapApp.App.observ).length; },
    getObservation: function(idx) { return iMapApp.App.observ[idx]; },

    //
    // UI Helpers
    getSpeciesRecord: function(stSpecID) {
        // as of iMap 3, just return the entire species record instead of assessment 
        return iMapApp.App.stateSpeciesList[stSpecID];
    },

    checkLastUpdate: function() {

    },

    renderCards: function() {
        iMapApp.uiUtils.layoutColumns(iMapApp.App.compiledCardTemplate);
    },

    getCardsData: function() {
        var cards_data = [];
        for (var key in iMapApp.App.observ) {
            var el = iMapApp.App.observ[key];
            var ph = new Date(el.getWhen());
            var activePhotoUrl = null;
            if (el.getPhotosFileName()) {
                activePhotoUrl = iMapApp.App.dataFolder + el.getPhotosFileName();
            }
            cards_data.unshift({
                image: activePhotoUrl,
                project: el.getProject(),
                species: iMapApp.App.getSpeciesNameNew(iMapApp.App.getSpeciesRecord(el.getiMap3SpeciesID()), true),
                detected: (el.getDetected() ? 'Detected' : 'Not Detected'),
                date: el.getWhen(),
                where: '' + el.getWhere(),
                state: el.getState(),
                county: el.getCounty(),
                objidx: '' + el.getObjectID()
            });
        }

        return cards_data;
    },

    deleteCards: function(delCards) {
        delCards.each(function(index, el) {
            iMapApp.App.delObservation(el.id);
        });
        iMapApp.App.renderCards();
    },

    updateStateData: function(stat, clearList, loadSppList) {
        var projUpdateSucc = false;
        var sppUpdateSucc = false;
        iMapApp.uiUtils.waitDialogOpen('Updating Projects and Species', 2);
        console.log("Getting projects: " + iMapApp.App.ProjectsURL + stat);
        $.getJSON(iMapApp.App.ProjectsURL + stat, function(pdata) {
                iMapApp.App.projectList = {};
                pdata.projects.forEach(function(el, ind, array) {
                    iMapApp.App.projectList[el.id] = el.projectname;
                });
                localStorage.setItem("projectList", JSON.stringify(iMapApp.App.projectList));
                iMapApp.uiUtils.loadProjectList();
            }).success(function() {
                console.log("Load project list second success");
                projUpdateSucc = true;
            })
            .error(function(err) { navigator.notification.alert("The iMapInvasives projects list update failed. Please ensure that you have selected a state/province and that your device is connected to the internet. Then try again by selecting \"Refresh iMap Lists.\"\nIf the problem continues to occur, please try again later.", iMapApp.App.alertDismiss, "Projects List Update Failed"); })
            .complete(function() {
                console.log("Load project list complete");
                iMapApp.uiUtils.waitDialogClose();
                if (projUpdateSucc == true && sppUpdateSucc == true) {
                    // Update last lists update date to current date if lists both updated successfully
                    iMapApp.App.listUpdateDateSetter();
                    if (loadSppList) {
                        iMapApp.uiUtils.loadSpeciesList();
                    }
                }
            });

        console.log("Getting species: " + iMapApp.App.SpeciesURL + stat);
        $.getJSON(iMapApp.App.SpeciesURL + stat, function(pdata) {
                iMapApp.App.speciesList = {};
                cnt = 0;
                pdata.species.forEach(function(el, ind, array) {
                    iMapApp.App.speciesList[el.statespeciesid] = [el.statecommonname, el.state_scientific_name, el.imapassessmenttabletype];
                });
                localStorage.setItem("speciesList", JSON.stringify(iMapApp.App.speciesList));
            }).success(function() {
                console.log("Load species list second success");
                sppUpdateSucc = true;
            })
            .error(function(err) { navigator.notification.alert("The iMapInvasives state species list update failed. Please ensure that you have selected a state/province and that your device is connected to the internet. Then try again by selecting \"Refresh iMap Lists.\"\nIf the problem continues to occur, please try again later.", iMapApp.App.alertDismiss, "Species List Update Failed"); })
            .complete(function() {
                console.log("Load species list complete");
                iMapApp.uiUtils.waitDialogClose();
                if (projUpdateSucc == true && sppUpdateSucc == true) {
                    // Update last lists update date to current date if lists both updated successfully
                    iMapApp.App.listUpdateDateSetter();
                    if (loadSppList) {
                        iMapApp.uiUtils.loadSpeciesList();
                    }
                }
            });

        // Clear out the preferences my species list
        if (clearList) {
            iMapApp.iMapPrefs.params.Plants.MyPlants.length = 0;
        }
        iMapApp.iMapPrefs.saveParams();
    },

    downloadJurisdictionSppList: function (dState) {
        return new Promise((resolve, reject) => {
            // get the iMap species list for the specified jurisdiction and store it in localStorage
            var jurisdictionSpp = iMapApp.App.iMap3BaseURL + '/imap/services/stateSpecList/all/' + dState,
                xhr = new XMLHttpRequest();
            xhr.open('GET', jurisdictionSpp);
            xhr.onload = function () {
                if (xhr.status == 200) {
                    var newJurisSppList = JSON.parse(xhr.responseText);
                    iMapApp.App.sppListHandler(newJurisSppList, 'stateSpeciesList');
                    resolve();
                } else {
                    console.log("An error occurred when attempting to get the jurisdiction species list");
                    reject("An error occurred when attempting to get the jurisdiction species list");
                };
            };
            xhr.send();
        })
    },

    downloadNatSppList: function () {
        // get the iMap national species list and store it in localStorage
        var natSpp = iMapApp.App.iMap3BaseURL + '/imap/services/natSpecList/all/',
        xhr = new XMLHttpRequest();
        xhr.open('GET', natSpp);
        xhr.onload = function() {
            if (xhr.status == 200) {
                var newNatSppList = JSON.parse(xhr.responseText);
                iMapApp.App.sppListHandler(newNatSppList, 'nationalSpeciesList');
            } else {
                console.log("An error occurred when attempting to get the jurisdiction species list");
            };
        };
        xhr.send();
    },

    sppListHandler: function (rawNewSppList, listType) {
        /*

        formats the input species lists to save them in localStorage

        */
        var newListObj = {},
        sppId = listType + 'Id';
        for (let i = 0; i < rawNewSppList.length; i++) {
            newListObj[rawNewSppList[i][sppId]] = rawNewSppList[i]; // re-work the species list object to include a species Id as the key
        };
        localStorage.setItem(listType, JSON.stringify(newListObj)); // update localStorage item for species list with new data
        if (listType == 'stateSpeciesList') {
            iMapApp.App.stateSpeciesList = newListObj;
        }
    },

    //
    // ** Utilities
    //
    checkUpdateDuration: function(dt) {
        var dts = dt.split('-');
        var updDate = new Date(dts[0], parseInt(dts[1]) - 1, dts[2]);
        var now = new Date();
        var diffDays = parseInt((now - updDate) / (1000 * 60 * 60 * 24));
        if (diffDays > 90) {
            navigator.notification.confirm("Your iMap 3 User Data (Project, Organization, and Species Lists) may be out of date. Would you like to attempt to retrieve this data from iMap now? (Or you can manually retrieve this data later in the Preferences page.)", iMapApp.uiUtils.checkListsButtonActions, "iMap Lists Update Needed", ["Yes, Refresh iMap Data Now", "No, Wait to Refresh Later"]);
        }
    },

    getDateString: function() {
        var now = new Date();
        var day = ("0" + now.getDate()).slice(-2);
        var month = ("0" + (now.getMonth() + 1)).slice(-2);
        var dt = now.getFullYear() + "-" + (month) + "-" + (day);
        return dt;
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

    getSpeciesNameNew: function(sp, state) {
        var common = (state ? 'stateCommonName' : 'commonName'),
        sci = (state ? 'stateScientificName' : 'scientificName'),
        lStr = "None Selected";
        if (sp != -1 && sp) {
            if (iMapApp.iMapPrefs.params.Plants.UseCommon)
                lStr = sp[common];
            if (iMapApp.iMapPrefs.params.Plants.UseCommon && iMapApp.iMapPrefs.params.Plants.UseScientific)
                lStr += ": ";
            if (iMapApp.iMapPrefs.params.Plants.UseScientific) {
                lStr = (lStr == "None Selected" ? "" : lStr) + sp[sci];
            }
        }
        return lStr;
    },

    getSpeciesName: function(id) {
        var lStr = "None Selected";
        if (id != -1) {
            if (iMapApp.iMapPrefs.params.Plants.UseCommon)
                lStr = iMapApp.App.speciesList[id][0];
            if (iMapApp.iMapPrefs.params.Plants.UseCommon && iMapApp.iMapPrefs.params.Plants.UseScientific)
                lStr += ": ";
            if (iMapApp.iMapPrefs.params.Plants.UseScientific) {
                lStr = (lStr == "None Selected" ? "" : lStr) + iMapApp.App.speciesList[id][1];
            }
        }
        return lStr;
    },

    guid: function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    },

    // get a new file entry for the moved image when the user hits the delete button
    // pass the file entry to removeFile()
    removeImage: function(imageURI) {
        if (imageURI != "null")
            window.resolveLocalFileSystemURL(imageURI, iMapApp.App.removeFile, iMapApp.App.errorHandler);
    },

    // delete the file
    removeFile: function(fileEntry) {
        console.log("Removing: " + fileEntry);
        fileEntry.remove();
    },

    alertDismiss: function() {
        return;
    },

    // simple error handler
    errorHandler: function(e) {
        var msg = '';
        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            default:
                msg = e.code;
                break;
        }
        console.log('Error: ' + msg);
    },

    checkDiskSpace: function() {
        try {
            cordova.exec(function(arg) {
                    console.log("Get disk space: " + JSON.stringify(arg));
                    if (arg < 1024) {
                        iMapApp.uiUtils.openInfoDialog('Storage is low', 'Please clear old photos prior to adding new images.');
                    }
                },
                function(arg) {
                    console.log("Error retrieving disk space: " + JSON.stringify(arg));
                },
                "File", "getFreeDiskSpace", []);
        } catch (exx) {
            console.log("Check Disk Space: " + JSON.stringify(exx));
        }
    },

    listUpdateDateSetter: function () {
        // Only update the last iMap Lists Refresh date if the update was successful
        iMapApp.iMapPrefs.params.StateUpdate = iMapApp.App.getDateString();
        getDElem('p[name="lastUpdateDate"]').text('Last iMap Lists Refresh: ' + iMapApp.uiUtils.lastListsUpdateDateFormatter(iMapApp.iMapPrefs.params.StateUpdate));
        iMapApp.iMapPrefs.saveParams();
    }
};

function debugTest() {

    alert('Device Model: ' + device.model + '<br />' +
        'Device Cordova: ' + device.cordova + '<br />' +
        'Device Platform: ' + device.platform + '<br />' +
        'Device UUID: ' + device.uuid + '<br />' +
        'Device Version: ' + device.version + '<br />');
    /*console.log("Adding debug records");
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
    iMapApp.iMapPrefs.params.Firstname= "Tom";*/

}

if (navigator.platform == 'MacIntel') {
    console.log("Setting Chrome Debug vars");
    var Connection = {};
    Connection.WIFI = 1;
    navigator.connection = {};
    navigator.connection.type = Connection.WIFI;
    navigator.notification = { alert: alert };
}


//page load initialization
$(document).ready(function() {
    console.log("Onload " + navigator.platform);
    document.addEventListener('deviceready', iMapApp.App.init, false);

    if (navigator.platform == 'MacIntel')
        iMapApp.App.init();
});