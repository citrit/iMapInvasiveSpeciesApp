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
        if (parms !== null) {
            iMapApp.iMapPrefs.loadParams();
            iMapApp.uiUtils.gotoMainPage();
        } else {
            iMapApp.uiUtils.editPrefs("Initialization: Please fill in the preferences.");
            localStorage.setItem("firstInit", true);
            //iMapApp.iMapPrefs.saveParams();
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
    },
    // login to the site
    loginToMainSite: function(okCallBack) {
        console.log("Logging into FSU");
        // id='csrfmiddlewaretoken' name='csrfmiddlewaretoken' value='ebd4f9d9b0aa51f599d96c229ddc955f'
        var ret = false;
        // strUrl is whatever URL you need to call
        var strUrl = "http://hermes.freac.fsu.edu/nyimi/login/",
            strReturn = "";
        //$( "#hiddenLoginDiv" ).load( strUrl, function () {
        document.getElementById("hiddenLoginDiv").onload = function() {
            console.log('HTML: ' + $("#hiddenLoginDiv").html());
            var pData = {
                'csrfmiddlewaretoken': 'f248eb7050f2b3977121d03ddbb59e5f',
                'username': iMapApp.iMapPrefs.params.Username,
                'password': iMapApp.iMapPrefs.params.Password
            };
            console.log('posting login stuff: ' + JSON.stringify(pData));
            $.ajax({
                type: 'POST',
                url: strUrl,
                data: pData,
                success: function(msg) {
                    console.log('Posting res: ' + JSON.stringify(msg));
                },
                error: function(err, msg) {
                    console.log('Posting err: ' + JSON.stringify(err) + '\n MSG: ' + JSON.stringify(msg));
                }
            });
        };
        $("#hiddenLoginDiv").attr("src", strUrl);
    }
};