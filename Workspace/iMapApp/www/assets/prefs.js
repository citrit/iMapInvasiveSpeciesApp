var iMapApp = iMapApp || {};

// Preferences for the app.

iMapApp.iMapPrefs = {
    params: {
        Firstname: "",
        Lastname: "",
        Email: "", // iMap 3 email address
        Username: "", // depricated as of iMap 3
        Password: "",
        personId: 0, // iMap 3 person ID
        userId: 0, // iMap 3 user ID
        dStateID: 0, // user's iMap 3 home jurisdiction
        Project: null,
        OrgDefault: null,
        iMap3Projects: [], // user's associated projects
        iMap3Organizations: [], // user's associated organizations
        Plants: {
            UseCommon: true,
            UseScientific: false,
            MyPlants: []
        },
        PictureSize: "medium",
        SaveOriginalPhotos: true,
        MapType: "Road",
        CurrentState: "",
        DefaultZoom: 12,
        Units: "USCustomary",
        StateUpdate: '',
        WelcomePage: true
    },
    init: function() {
        var parms = localStorage.getItem("userParams");
        if (parms === null) {
            // if app preferences have never been initialized, direct user to the Preferences page
            iMapApp.uiUtils.editPrefs();
            localStorage.setItem("firstInit", true);
        } else {
            iMapApp.iMapPrefs.loadParams();
            if (!iMapApp.iMapPrefs.params.Email) {
                // if app preferences have been initialized but the iMap3 user account info is empty, direct user to the Preferences page
                // reset some Preferences for iMap3
                iMapApp.iMapPrefs.params.Password = "";
                iMapApp.iMapPrefs.params.Plants.MyPlants = [];
                iMapApp.uiUtils.editPrefs();
            } else {
                // if app preferences appear OK, direct user to the main screen
                iMapApp.uiUtils.gotoMainPage();
            }
        }
    },
    // Save the current prefs to localstorage
    saveParams: function() {
        console.log("iMapApp.iMapPrefs: saving user Params: " + JSON.stringify(iMapApp.iMapPrefs.params));
        localStorage.setItem("userParams", JSON.stringify(iMapApp.iMapPrefs.params));
    },
    // load the prefs from localstorage
    loadParams: function() {
        iMapApp.iMapPrefs.params = JSON.parse(localStorage.getItem("userParams"));
        if (iMapApp.iMapPrefs.params.WelcomePage == null) {
            iMapApp.iMapPrefs.params.WelcomePage = true;
        }
        console.log("iMapApp.iMapPrefs: loading user Params: " + JSON.stringify(iMapApp.iMapPrefs.params));
    }
};