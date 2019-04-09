var iMapApp = iMapApp || {};

iMapApp.uploadUtils = {

    debugOut: true,
    obsvs: [],
    numUploads: 0,
    errorCnt: 0,
    uploadCnt: 0,

    // Application Constructor
    initialize: function() {

    },

    reachableCallback: function(reachability) {
        // There is no consistency on the format of reachability
        var networkState = reachability.code || reachability;

        var states = {};
        states[NetworkStatus.NOT_REACHABLE] = 'No network connection';
        states[NetworkStatus.REACHABLE_VIA_CARRIER_DATA_NETWORK] = 'Carrier data connection';
        states[NetworkStatus.REACHABLE_VIA_WIFI_NETWORK] = 'WiFi connection';

        if (networkState != NetworkStatus.NOT_REACHABLE) {
            $("#uploadButton").removeAttr("disabled");
            $("#uploadButton").text("Upload Obs");
        }
    },

    doUpload: function(obss) {
        iMapApp.uploadUtils.obsvs = obss;
        iMapApp.uploadUtils.numUploads = obss.length;
        iMapApp.uploadUtils.errorCnt = 0;
        iMapApp.uploadUtils.uploadCnt = 0;
        iMapApp.uploadUtils.syncUploads(0);
    },

    syncUploads: function(retCode) {
        //		iMapPrefs.init();
        //		iMapPrefs.Username = 'tomcitriniti';
        //		iMapPrefs.Password = '';
        var ok = iMapApp.uploadUtils.obsvs.length > 0;
        if (ok) {
            console.log("uploading " + iMapApp.uploadUtils.obsvs.length + " of " + iMapApp.uploadUtils.numUploads);
            obs = iMapApp.App.observ[iMapApp.uploadUtils.obsvs.get(0).id];
            iMapApp.uploadUtils.obsvs.splice(0, 1);
            console.log('Going to upload: ' + JSON.stringify(obs.getObsData()));
            iMapApp.uploadUtils.uploadHandleriMap3(obs);
        } else {
            $('p[name="infoDialText"]').text('Uploaded [' + (iMapApp.uploadUtils.numUploads - iMapApp.uploadUtils.errorCnt) + '] records.');
            iMapApp.uiUtils.openDialog('#infoDialog', 'Upload complete');
            iMapApp.uiUtils.waitDialogClose(true);
        }
    },

    doSendToServer: function(obs) {
        //var stShp = "ST_GEOMETRY('POINT(" + obs.getWhere()[0] + " " + obs.getWhere()[1]
        //		+ ")',8)";
        //console.log("ST_GEOM: " + stShp);

        var url = 'http://hermes.freac.fsu.edu/requests/uploadObservation/uploadTool';
        //console.log("Do image: " + (obs.getPhotos() !== "" ? 1 : 0));
        var spIDLen = obs.getSpeciesID().length;
        var spl = JSON.parse(localStorage.getItem("speciesList"));
        getDElem('[name="sizeOfArea"]').val(obs.getSize());
        getDElem('[name="distribution"]').val(obs.getDist());
        var obsComment = obs.getComment();
        switch (iMapApp.App.getSpeciesRecord(obs.getSpeciesID())) {
            case "PT":
                obsComment = ''; // reset the obs comment
                var obsCommentsAll = [];

                // add the elements to the array if they are not the default value/empty
                obs.getSize() != "o" ? obsCommentsAll.push("Abundance - Size of Area: " + $("#sizeOfArea option[value='" + obs.getSize() + "']").text()) : false;
                obs.getSizeMetric() != "oo" ? obsCommentsAll.push("Abundance -  Size of Area: " + $("#sizeOfAreaMetric option[value='" + obs.getSizeMetric() + "']").text()) : false;
                obs.getDist() != 0 ? obsCommentsAll.push("Abundance - Distribution: " +  $("#distribution option[value='" + obs.getDist() + "']").text()) : false;
                obs.getAilanthusDBHGreaterSix() != 'null' ? obsCommentsAll.push("Ailanthus with DBH six inches or greater present: " + $("#ailanthusStemsGreaterSix option[value='" + obs.getAilanthusDBHGreaterSix() + "']").text()) : false;
                obs.getComment() != '' ? obsCommentsAll.push("General Comments:\n" + obs.getComment()) : false;
                var obsCommentsAllLen = obsCommentsAll.length;
                for (var i = 0; i < obsCommentsAllLen; i++) {
                    // loops through the ObsCommentsAll array and forms the obsComment string
                    if (i < (obsCommentsAllLen - 1)) {
                        obsComment += obsCommentsAll[i] + "\n";
                    } else {
                        // to prevent the comment ending on a new line
                        obsComment += obsCommentsAll[i];
                    }
                }
                break;
            case "I":
                if (obs.getNumTrees() > 0 || obs.getTimeSurvey() > 0) {
                    obsComment = "Insect search effort - Number of trees/hosts surveyed: " + obs.getNumTrees() +
                    "\nMinutes spent surveying: " + obs.getTimeSurvey() +
                    "\nGeneral Comments: \n" + obs.getComment();
                }
                break;
        }
        var postData = {
            photourl1: obs.getPhotos(),
            photourl2: '',
            photourl3: '',
            photourl4: '',
            photourl5: '',
            photocredit1: '',
            photocredit2: '',
            photocredit3: '',
            photocredit4: '',
            photocredit5: '',
            digitalphoto: (obs.getPhotos() != "" ? 1 : 0),
            obsdatastatus: 1000,
            imapdataentrypersonid: iMapApp.iMapPrefs.params.Username,
            observername: iMapApp.iMapPrefs.params.Username,
            obsstate: obs.getState(),
            projectid: obs.getProjectID(),
            statespeciesid: (spIDLen > 2 ? obs.getSpeciesID() : ""),
            commonname: (spIDLen > 2 ? spl[obs.getSpeciesID()][0] : ""),
            scientificname: (spIDLen > 2 ? spl[obs.getSpeciesID()][1] : ""),
            imapdataentrydate: iMapApp.uploadUtils.getDateTime(true), //2013-11-11
            obsdate: obs.getWhen(), //2013-11-11
            obsorigxcoord: obs.getWhere()[0], //-75.41016000000012
            obsorigycoord: obs.getWhere()[1], //43.40667000000026
            obscomments_long: obsComment,
            imapdataentrymethod: 'Mobile-App',
            repositoryavailable: 2
                //,
                //shape: stShp
        };
        console.log("Do sendToServer: " + JSON.stringify(postData));
        $.ajax({
            type: "GET",
            url: url,
            data: postData,
            async: true,
            success: function(jqXHR, textStatus, errorThrown) {
                console.log("URL request success: " + typeof jqXHR);
                var ret = null;
                try {
                    ret = eval("(" + jqXHR + ")");
                    if (ret.code === 0) {
                        console.log('Upload successful: ' + obs.getWhen() + ' : ' +
                            obs.getSpecies() + " => " + textStatus);
                        console.log('return: ' + JSON.stringify(ret));
                        var img = iMapApp.App.dataFolder + obs.getPhotos().split('=').pop();
                        obs.setPhotos(img);
                        iMapApp.App.delObservation(obs.getObjectID());
                    } else if (ret.code == 1 && ret.msg == "'NoneType' object has no attribute '__getitem__'") {
                        navigator.notification.alert("Please check that a valid iMapInvasives username and password have been entered in the Preferences page and then try again.\nTechnical Details: Code[" + ret.code + "]: " + ret.msg, iMapApp.uploadUtils.alertDismiss, "Upload Failed");
                        iMapApp.uploadUtils.errorCnt++;
                    } else if (ret.code == 1 && ret.msg == "list index out of range") {
                        navigator.notification.alert("The point which you are attempting to upload is outside of boundaries of the state which has been selected in the Preferences page.\nTechnical Details: Code[" + ret.code + "]: " + ret.msg, iMapApp.uploadUtils.alertDismiss, "Upload Failed");
                        iMapApp.uploadUtils.errorCnt++;
                    } else if (ret.code == 2) {
                        navigator.notification.alert("Please check that a valid iMapInvasives username and password have been entered in the Preferences page and then try again.\nTechnical Details: Code[" + ret.code + "]: " + ret.msg, iMapApp.uploadUtils.alertDismiss, "Upload Failed");
                        iMapApp.uploadUtils.errorCnt++;
                    } else {
                        console.log('Upload error: Code[' + ret.code + ']: ' + ret.msg);
                        navigator.notification.alert("A problem occurred while uploading data to iMapInvasives. Please view the error message below and try to correct any issues before trying your upload again. If the problem persists, please contact iMapInvasives.\nTechnical Details: Code[" + ret.code + "]: " + ret.msg, iMapApp.uploadUtils.alertDismiss, "Upload Failed");
                        //alert('Upload error: Code[' + ret.code + ']: ' + ret.msg);
                        iMapApp.uploadUtils.errorCnt++;
                    }
                } catch (err) {
                    iMapApp.uiUtils.waitDialogClose();
                    console.log('Exception error[' + JSON.stringify(err) + ']: ' + jqXHR);
                    navigator.notification.alert("Please check that a valid iMapInvasives username and password have been entered in the Preferences page and then try again.\nException Details: [" + JSON.stringify(err) + "]: " + jqXHR, iMapApp.uploadUtils.alertDismiss, "Upload Failed");
                    //alert('Exception error[' + JSON.stringify(err) + ']: ' + jqXHR);
                    iMapApp.uploadUtils.errorCnt++;
                } finally {
                    iMapApp.uiUtils.waitDialogClose();
                    iMapApp.uploadUtils.syncUploads(ret.code);
                }
            },
            // dataType: dataType,
            error: function(jqXHR, textStatus, errorThrown) {
                iMapApp.uiUtils.waitDialogClose(true);
                iMapApp.uploadUtils.errorCnt++;
                console.log('Upload error: ' + JSON.stringify(jqXHR) + " -> " +
                    JSON.stringify(textStatus) + " -> " +
                    JSON.stringify(errorThrown));
                if (errorThrown.code == 19) {
                    alert('Connection error: ' + errorThrown.message);
                } else {
                    alert('Upload error[' + textStatus + ']: ' +
                        errorThrown.message);
                }
            }
        });
    },

    uploadImage: function(imageName, obs) {
        var ret = '';
        var imgUploadURL = "http://imapimageupload.appspot.com/imageupload";
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = imageName.substr(imageName.lastIndexOf('/') + 1);
        options.mimeType = "text/plain";

        var params = new Object();

        options.params = params;

        var ft = new FileTransfer();
        console.log("starting transfer: " + options.fileName);
        ft.upload(imageName, encodeURI(imgUploadURL),
            function(res) { //alert("Return: " + JSON.stringify(res.response)); 
                var ans = eval("(" + res.response + ")");
                console.log("Res: " + JSON.stringify(ans));
                ret = imgUploadURL + "?fileName=" + ans.fileName;
                obs.setPhotos(ret);
                iMapApp.uploadUtils.doSendToServer(obs);
            },
            function(err) {
                console.log("Upload error: " + JSON.stringify(err));
                iMapApp.uiUtils.waitDialogClose();
            },
            options
        );
        console.log("end transfer: " + options.fileName);
        return ret;
    },

    success: function(data, textStatus, jqXHR) {
        console.log('success: ' + JSON.stringify(data) + " -> " +
            JSON.stringify(textStatus));
    },

    alertDismiss: function() {
        return;
    },

    getDateTime: function(useTime) {
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hour = now.getHours();
        var minute = now.getMinutes();
        var second = now.getSeconds();
        if (month.toString().length == 1) {
            month = '0' + month;
        }
        if (day.toString().length == 1) {
            day = '0' + day;
        }
        if (hour.toString().length == 1) {
            hour = '0' + hour;
        }
        if (minute.toString().length == 1) {
            minute = '0' + minute;
        }
        if (second.toString().length == 1) {
            second = '0' + second;
        }
        var dateTime = '';
        if (typeof useTime !== "undefined") {
            dateTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
        } else {
            dateTime = year + '-' + month + '-' + day;
        }
        console.log("Current date: " + dateTime);
        return dateTime;
    },

    getNewPresentSpRecord: function(stateSpId) {
        return new Promise((resolve, reject) => {
            var theRequestString = iMapApp.App.iMap3BaseURL + '/imap/services/presentSpecies/new/' + stateSpId;
            xhr = new XMLHttpRequest();
            xhr.withCredentials = true;
            xhr.open('GET', theRequestString);
            xhr.onload = function() {
                if (xhr.status == 200) {
                    var theResponse = JSON.parse(xhr.responseText);
                    resolve(theResponse);
                } else {
                    reject();
                };
            };
            xhr.send();
        });
    },

    getNewNotDetectSpRecord: function(stateSpId) {
        return new Promise((resolve, reject) => {
            var theRequestString = iMapApp.App.iMap3BaseURL + '/imap/services/notDetectedSpecies/new/' + stateSpId;
            xhr = new XMLHttpRequest();
            xhr.withCredentials = true;
            xhr.open('GET', theRequestString);
            xhr.onload = function() {
                if (xhr.status == 200) {
                    var theResponse = JSON.parse(xhr.responseText);
                    resolve(theResponse);
                } else {
                    reject();
                };
            };
            xhr.send();
        });
    },

    iMap3RecordFormatter: function(record, newPresentSpRecord, notDetectedSpRecord, recordPhoto) {
        /**
         * Formats the record for submission to iMap 3
         */
        var dateYear = Number(record.getWhen().substring(0,4)),
        dateMonth = record.getWhen().substring(5,7) - 1,
        dateDay = record.getWhen().substring(8,10),
        aoiTemplate = {
            "areaOfInterestId": null,
            "organization": (record.getiMap3Org() != '-1' ? {'id': Number(record.getiMap3Org())} : null),
            "createdBy": {
                "id": iMapApp.iMapPrefs.params.personId
            },
            "leadContactId": null,
            "leadContact": null,
            "comments": null,
            "landscapeTypeComments": null,
            "disturbanceComments": null,
            "deletedInd": false,
            "sensitiveInd": false,
            "dataEntryDate": null,
            "damageToHost": null,
            "bulkUploadId": null,
            "permissionReceived": null,
            "siteAddress": null,
            "sourceUniqueId": null,
            "searchDate": new Date(dateYear, dateMonth, dateDay, 0, 0, 0).getTime(),
            "targetTreatmentNeeded": null,
            "searchGoals": null,
            "followUp": null,
            "ownershipComments": null,
            "crewPaidHours": null,
            "crewVolunteerHours": null,
            "siteName": null,
            "crewComments": null,
            "crewVolunteerNum": null,
            "crewNumPaid": null,
            "airTemperature": null,
            "waterTemperature": null,
            "weatherComments": null,
            "windSpeed": null,
            "survey123Version": null,
            "modifiedDate": null,
            "modifiedBy": null,
            "samplingDetails": null,
            "searchedAreaPostTreatment": null,
            "searchedAreaMaps": [],
            "treatmentsInSearchedArea": [],
            "searchedAreaAquatic": null,
            "areaOfInterestPolygon": {
                "shape": {
                    "spatialReference": {
                        "latestWkid": 3857,
                        "wkid": 102100
                    },
                    "rings": record.getSearchedArea()
                }
            },
            "photos": [],
            "presences": [],
            "presentSpeciesIds": [],
            "absence": null,
            "notDetectedSpeciesIds": [],
            "treatments": [],
            "treatmentIds": [],
            "dwaterTemperatureUnitId": null,
            "dwindSpeedUnitId": null,
            "jsearchFocusAreasAquatic": [],
            "jsearchFocusAreasTerrestrial": [],
            "dairTemperatureUnitId": null,
            "dwindDirectionId": null,
            "jsamplingMethods": [],
            "jwaterBodyTypes": [],
            "dsiteDisturbanceTypeId": null,
            "dsiteDisturbanceSeverityId": null,
            "dlandscapeTypeId": null,
            "dstateId": iMapApp.iMapPrefs.params.dStateID,
            "lazy": false,
            "dremovedReasonId": null,
            "dcloudCoverId": null,
            "dsurveyTypeId": null,
            "jownerships": [],
            "jhostSpecies": [],
            "dnativeVegetationDistributionId": null,
            "dpresenceDeterminationMethodId": null
        };
        if (newPresentSpRecord) {
            var presenceRecord = {
                "presenceId": null,
                "areaOfInterest": null,
                "areaOfInterestId": null,
                "observer": {
                    "id": iMapApp.iMapPrefs.params.personId
                },
                "createdBy": {
                    "id": iMapApp.iMapPrefs.params.personId
                },
                "observationDate": new Date(dateYear, dateMonth, dateDay, 0, 0, 0).getTime(),
                "dataEntryDate": null,
                "timeLengthSearched": (record.getTimeSurvey() ? (record.getTimeSurvey() * 60) : null),
                "approximateInd": false,
                "approximationNotes": null,
                "bufferDistance": null,
                "modifiedDate": null,
                "modifiedBy": null,
                "presenceLine": null,
                "presencePoint": {
                    "shape": {
                        "spatialReference": {
                            "wkid": 4326
                        },
                        "x" : record.getWhere()[0], 
                        "y" : record.getWhere()[1]
                    }
                },
                "presencePolygon": null,
                "speciesList": [newPresentSpRecord],
                "ddataEntryMethodId": 2,
                "conservationLands": [],
                "deleted": false,
                "lazy": false,
                "dremovedReasonId": null,
                "ismas": [],
                "waterbodies": [],
                "counties": [],
                "hydrobasins": [],
                "usgsTopos": [],
                "countries": [],
                "states": [],
                "imap2Id": null,
                "shapeType": "point",
                "bufferInfo": {
                    "bufferUnits": "meters",
                    "bufferSize": "5",
                    "autoBuffered": false
                }
            };
            aoiTemplate['presences'].push(presenceRecord);

            if (record.getComment()) {
                aoiTemplate['presences'][0]['speciesList'][0]['comments'] = record.getComment();
            };
            if (record.getDist() != '0') {
                aoiTemplate['presences'][0]['speciesList'][0]['psPlant']['dplantDistributionId'] = Number(record.getDist());
            };
            if (record.getNumTrees() != 0) {
                aoiTemplate['presences'][0]['speciesList'][0]['psAnimalInsect']['plantsAffectedCount'] = Number(record.getNumTrees());
            };
            if (record.getSize() != 'o' || record.getSizeMetric() != 'oo') {
                aoiTemplate['presences'][0]['speciesList'][0]['comments'] += '\n\n' + $("#sizeOfAreaMetric option[value='" + record.getSizeMetric() + "']").text() + $("#sizeOfArea option[value='" + record.getSize() + "']").text();
            };
            if (record.getiMap3ProjId() != '-1') {
                aoiTemplate['presences'][0]['speciesList'][0]['taggedProjects'] = [{"project":{"id": record.getiMap3ProjId()}}];
            };
            if (recordPhoto) {
                aoiTemplate['presences'][0]['speciesList'][0]['photos'] = [{"presentSpeciesPhotoId":null,"presentSpeciesId":null,"photoUrl":recordPhoto,"photoCredit":null}];
            };
        };
        if (notDetectedSpRecord) {
            var notDetectedRecord = {
                "absenceId": null,
                "areaOfInterest": null,
                "areaOfInterestId": null,
                "observer": {
                    "id": iMapApp.iMapPrefs.params.personId
                },
                "createdBy": {
                    "id": iMapApp.iMapPrefs.params.personId
                },
                "observationDate": new Date(dateYear, dateMonth, dateDay, 0, 0, 0).getTime(),
                "dataEntryDate": null,
                "timeLengthSearched": (record.getTimeSurvey() ? (record.getTimeSurvey() * 60) : null),
                "modifiedDate": null,
                "modifiedBy": null,
                "absencePolygon": {
                    "shape": {
                        "spatialReference": {
                            "latestWkid": 3857,
                            "wkid": 102100
                        },
                        "rings": record.getSearchedArea()
                    }
                },
                "speciesList": [notDetectedSpRecord],
                "editableFields": [
                    "dremovedReasonId",
                    "deletedInd",
                    "observer",
                    "observationDate",
                    "timeLengthSearched",
                    "absencePolygon",
                    "speciesList"
                ],
                "lazy": false,
                "deleted": false,
                "ddataEntryMethodId": null,
                "dremovedReasonId": null,
                "conservationLands": [],
                "usgsTopos": [],
                "countries": [],
                "ismas": [],
                "waterbodies": [],
                "counties": [],
                "states": [],
                "hydrobasins": [],
                "imap2Id": null
            };
            aoiTemplate['absence'] = notDetectedRecord;

            if (record.getComment()) {
                aoiTemplate['absence']['speciesList'][0]['comments'] = record.getComment();
            };
            if (record.getiMap3ProjId() != '-1') {
                aoiTemplate['absence']['speciesList'][0]['taggedProjects'] = [{"project":{"id": record.getiMap3ProjId()}}];
            };
            if (recordPhoto) {
                aoiTemplate['absence']['speciesList'][0]['photos'] = [{"presentSpeciesPhotoId":null,"presentSpeciesId":null,"photoUrl":recordPhoto,"photoCredit":null}];
            }
        };

        return aoiTemplate;
    },

    uploadRecordiMap3: function (formattedRecord) {
        return new Promise((resolve, reject) => {
            var theRequest = encodeURIComponent("record") + "=" + encodeURIComponent(JSON.stringify(formattedRecord)),
                xhr = new XMLHttpRequest(),
                uploadURL = iMapApp.App.iMap3BaseURL + '/imap/services/aoi/update';
            xhr.withCredentials = true;
            xhr.open('POST', uploadURL);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.onload = function () {
                if (xhr.status === 202) {
                    console.log("MISSION SUCCESS");
                    resolve();
                }
                else {
                    alert('Request failed.  Returned status of ' + xhr.status);
                    reject();
                }
            };
            xhr.send(theRequest);
        });
    },

    /**
    * Adapted from Cordova Blog Article titled "Transition off of cordova-plugin-file-transfer"
    * Published 18 Oct 2017 by Fil Maj
    * 
    * Uploads a photo to iMap 3
    * @param {string} fileName The filename of the target photo to upload to iMap 3
    * @returns {Promise} Promise object resolved if upload successful, rejected if an error occurs at any point during the upload.
    */
    uploadiMap3Photo: function (fileName) {
        return new Promise((resolve, reject) => {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
                console.log('file system open: ' + fs.name);
                fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
                    fileEntry.file(function (file) {
                        var reader = new FileReader();
                        reader.onloadend = function () {
                            // Create a blob based on the FileReader ArrayBuffer "result"
                            var blob = new Blob([new Uint8Array(this.result)], { type: "image/jpeg" }),
                                testFormData = new FormData(),
                                fileName = String('imap_app_photo_' + Date.now() + '.jpg');
                            testFormData.append('file', blob, fileName);

                            var xhr = new XMLHttpRequest(),
                                photoUploadUrl = iMapApp.App.iMap3BaseURL + '/imap/services/image';
                            xhr.withCredentials = true;
                            xhr.open("POST", photoUploadUrl, true);
                            xhr.onload = function () {
                                if (xhr.status === 200) {
                                    // if a 200 response is returned, the upload was successful
                                    // resolve the promise passing the resulting JSON 
                                    resolve(xhr.responseText);
                                } else {
                                    reject('Request failed.  Returned status of ' + xhr.status);
                                }
                            };
                            // Pass the blob in to XHR's send method
                            xhr.send(testFormData);
                        };
                        // Read the file as an ArrayBuffer
                        reader.readAsArrayBuffer(file);
                    }, function (err) {
                        console.error('error getting fileentry file!' + err);
                        reject('An error occurred while retrieving the image.');
                    });
                }, function (err) {
                    console.error('error getting file! ' + err);
                    reject('An error occurred retrieving the image.');
                });
            }, function (err) {
                console.error('error getting persistent fs! ' + err);
                reject('An error occurred accessing the device file storage.');
            });
        });
    },


    uploadHandleriMap3: function (rawObs) {
        var newSpRecord = null; // a variable to hold either the new present or not detected species
        iMapApp.uiUtils.checkIfSignedIn()
        .then(function (signedInStatus) {
            if (!signedInStatus) {
                return iMapApp.uiUtils.attemptIMapSignInPromise();
            } else {
                return;
            };
        })
        .then(function() {
            // check if the user data has yet been retrieved
            if (!iMapApp.iMapPrefs.params.dStateID || !iMapApp.iMapPrefs.params.personId) {
                // download user details if user data has not yet been retrieved
                return iMapApp.uiUtils.updateUserDataPromise();
            } else {
                // otherwise, continue execution
                return;
            }
        })
        .then(function() {
            if(rawObs.getiMap3Compatible() === true) {
                return;
            } else {
                throw "This record is not compatiable with iMap 3 because it was created with an older version of the iMap Mobile App. Please edit the record and re-save it before uploading again.";
            }
        })
        .then(function() {
            if (rawObs.getDetected() === true) {
                return iMapApp.uploadUtils.getNewPresentSpRecord(rawObs.getiMap3SpeciesID());
            } else if (rawObs.getDetected() === false) {
                return iMapApp.uploadUtils.getNewNotDetectSpRecord(rawObs.getiMap3SpeciesID());
            } else {
                throw "Detected or Not Detected Unset for Record";
            };
        })
        .then(function (newRecord) {
            newSpRecord = newRecord;
            if (rawObs.getPhotos() !== '') {
                // if the record contains a photo, attempt to upload a photo
                var filename = rawObs.getPhotos().replace(/^.*[\\\/]/, ''); //get just the file name
                return iMapApp.uploadUtils.uploadiMap3Photo(filename);
            } else {
                // if no photo exists, simply return false
                return false;
            };
        })
        .then(function (newPhotoJSON) {
            var newPhotoURL = (newPhotoJSON ? JSON.parse(newPhotoJSON)['url'] : false); // if newPhotoJSON is set, get the new photo URL

            if (rawObs.getDetected() === true) {
                recordToUpload = iMapApp.uploadUtils.iMap3RecordFormatter(rawObs, newSpRecord, null, newPhotoURL);
            } else if (rawObs.getDetected() === false) {
                recordToUpload = iMapApp.uploadUtils.iMap3RecordFormatter(rawObs, null, newSpRecord, newPhotoURL);
            } else {
                throw "Detected or Not Detected Unset for Record";
            };
            return iMapApp.uploadUtils.uploadRecordiMap3(recordToUpload);
        })
        .then(function () {
            iMapApp.App.delObservation(obs.getObjectID());
            iMapApp.uploadUtils.syncUploads();
        })
        .catch(function (e) {
            var error = (e ? "An error occurred while uploading the selected record. Details: " + e : "An unexpected error occurred while uploading the selected record.");
            console.log(error);
            navigator.notification.alert(error, false, "iMap 3 Record Upload Failure");
            iMapApp.uiUtils.waitDialogClose(true);
        });
    }
};
