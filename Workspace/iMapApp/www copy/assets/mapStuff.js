var iMapApp = iMapApp || {};
        
iMapApp.iMapMap = {
	olMap: null,
	locSource: null,
    baseLayer: null,
	dragCtl: null,
	mapLayer: null,
	timerVar: null,
    view: null,
    bingAPIKey: "AifZwUylySDsGAx5jp3QHunKxJ6Z0AkPa2-ZGFwb3-gtlIouPGBzI9H5DA-xUiPV",
	init: function(mapDiv) {
        iMapApp.iMapMap.view = new ol.View({
          center: [0.0, 0.0],
          zoom: 12
        });

        var iconStyle = new ol.style.Style({
          image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
            anchor: [0.5, 0.0],
            anchorOrigin: 'bottom-left',
            opacity: 0.75,
            src: 'assets/images/mobile-loc.png'
          }))
        });
        
        iMapApp.iMapMap.locSource = new ol.source.Vector({
          //features: iconFeatures //add an array of features
        });
        
        var vectorLayer = new ol.layer.Vector({
          source: iMapApp.iMapMap.locSource,
          style: iconStyle
        });
        
        iMapApp.iMapMap.baseLayer = new ol.layer.Tile({
          source: new ol.source.BingMaps({
            key: iMapApp.iMapMap.bingAPIKey,
            imagerySet: mapStyles[iMapApp.iMapPrefs.params.MapType]
          })
        });
        
        iMapApp.iMapMap.olMap = new ol.Map({
            interactions: ol.interaction.defaults().extend([new iMapApp.Drag()]),
            layers: [
                iMapApp.iMapMap.baseLayer,
                vectorLayer
            ],
            target: mapDiv,
            view: iMapApp.iMapMap.view
        });
	},
    
    addMoveFeatureCtl: function() {
        iMapApp.iMapMap.dragCtl = new OpenLayers.Control.ModifyFeature(iMapApp.iMapMap.locLayer); //dragComplete: function(	vertex	)
        iMapApp.iMapMap.olMap.addControl(iMapApp.iMapMap.dragCtl);
        iMapApp.iMapMap.dragCtl.activate();
    },
    
	// resize div
	fixSize: function(wid, hei) {
		console.log("MapResize W:"+wid+" H:"+hei);
		$("#pgwModal #iMapMapdiv").width(wid).height(hei);
		iMapApp.iMapMap.olMap.updateSize();
	},
    
	// Set the position pin in the map
	setPosition: function(pos) {
        iMapApp.iMapMap.locSource.clear();
        var vPos = ol.proj.transform(pos, 'EPSG:4326', iMapApp.iMapMap.view.getProjection() );
        var iconFeature = new ol.Feature({
          geometry: new ol.geom.Point(vPos),
          name: 'You are Here'
        });
        iMapApp.iMapMap.locSource.addFeature(iconFeature);
        iMapApp.iMapMap.view.setCenter(vPos);
	},
    
	clearMap: function() {
		console.log("====== ClearMap");
        iMapApp.iMapMap.locSource.clear();
	},
    
	getObsLocation: function () {
		/*var pt = new OpenLayers.LonLat(iMapApp.iMapMap.locLayer.features[0].geometry.x, iMapApp.iMapMap.locLayer.features[0].geometry.y)
				.transform(
						iMapApp.iMapMap.olMap.getProjectionObject(), // to Spherical Mercator Projection,
						new OpenLayers.Projection("EPSG:4326") // transform from WGS 1984
		        );
		return [ pt.lon, pt.lat ];*/
	},
    
	setMapType: function(typ) {
        /*console.log("Setting mapType: " + typ);
        var mapLay = iMapApp.iMapMap.olMap.getLayersByName(typ);
        console.log("Got layer: " + mapLay[0]);
        iMapApp.iMapMap.olMap.setBaseLayer(mapLay[0]);
        
        $('input:radio[name=radio-choice-maptype]').filter('[value='+typ+']').prop('checked', true);*/
        
        iMapApp.iMapMap.baseLayer.set("imagerySet", mapStyles[typ]);
        console.log("Switched to layer: " + typ);
	},
    
	startGPSTimer: function() {
		console.log("Start the timer");
		if (iMapApp.iMapMap.timerVar == null)
			iMapApp.iMapMap.timerVar = navigator.geolocation.watchPosition(iMapApp.iMapMap.getCurrentLocation, iMapApp.iMapMap.onError,
                { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
	},
    
	stopGPSTimer: function() {
		console.log("Stop the timer");
		navigator.geolocation.clearWatch(iMapApp.iMapMap.timerVar);
		iMapApp.iMapMap.timerVar = null;
	},
    
	getCurrentLocation: function(position) {
		//curobs.Where = [ position.coords.longitude, position.coords.latitude];
		console.log("Position: " + JSON.stringify([ position.coords.longitude, position.coords.latitude]));
		//alert('found location: ' + $.toJSON(curobs.Where));
		iMapApp.iMapMap.setPosition([ position.coords.longitude, position.coords.latitude]);
		iMapApp.uiUtils.setObsPosition([ position.coords.longitude, position.coords.latitude]);
	},
    // onSuccess Callback
    //   This method accepts a `Position` object, which contains
    //   the current GPS coordinates
    //
    onSuccess: function (position) {
        $('#geolocation').val('Latitude: '  + position.coords.latitude      + '<br />' +
        'Longitude: ' + position.coords.longitude     + '<br />' +
        '<hr />'      + element.innerHTML);
    },
    
    // onError Callback receives a PositionError object
    //
    onError: function (error) {
    	//iMapApp.iMapMap.setPosition([ -98.583333, 39.833333 ]);
    	//console.log('Setting default position: iMapApp.iMapMap.setPosition([-98.583333, 39.833333]);');
        
        switch(error.code) {
            case 1:
            case 2:
                navigator.notification.alert(
                                             'GPS error, please enable location.\n' + error.message,  // message
                                             null,         // callback
                                             'code: '    + error.code,            // title
                                             'Ok'                  // buttonName
                                             );
                iMapApp.iMapMap.stopGPSTimer();
                break;
            case 3:
                iMapApp.iMapMap.stopGPSTimer();
                iMapApp.iMapMap.startGPSTimer();
                break;
            default:
                break;
        }
    }

}

var mapStyles = {
          road: 'Road',
          aerial: 'Aerial',
          aerialwlabels: 'AerialWithLabels',
          collins: 'collinsBart',
          ordinance: 'ordnanceSurvey'
        };
//setTimeout(iMapApp.iMapMap.fixSize, 700);
//setTimeout(iMapApp.iMapMap.fixSize, 1500);