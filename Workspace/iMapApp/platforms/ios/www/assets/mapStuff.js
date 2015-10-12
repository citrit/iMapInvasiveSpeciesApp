var iMapApp = iMapApp || {};
        
iMapApp.iMapMap = {
	olMap: null,
	locLayer: null,
	dragCtl: null,
	mapLayer: null,
	timerVar: null,
    bingAPIKey: "AifZwUylySDsGAx5jp3QHunKxJ6Z0AkPa2-ZGFwb3-gtlIouPGBzI9H5DA-xUiPV",
	init: function(mdiv) {
        // create map
		var lay1 = new OpenLayers.Layer.OSM("road", null, {
            transitionEffect: 'resize'
        });
        var lay2 = new OpenLayers.Layer.Bing({
                                             name: "aerial",
                                             key: iMapApp.iMapMap.bingAPIKey,
                                             type: "Aerial"
                                             });
		iMapApp.iMapMap.olMap = new OpenLayers.Map({
	        div: mdiv,
	        theme: null,
	        controls: [
	            new OpenLayers.Control.Attribution(),
	            new OpenLayers.Control.TouchNavigation({
	                dragPanOptions: {
	                    enableKinetic: true
	                }
	            })//,
                //new OpenLayers.Control.LayerSwitcher()
	            //new OpenLayers.Control.Zoom()
	        ],
            layers: [ lay1, lay2 ],
	        zoom: 12
	    });
        //iMapApp.iMapMap.olMap.addControl(new OpenLayers.Control.MobileLayerSwitcher());
		iMapApp.iMapMap.olMap.setCenter( new OpenLayers.LonLat( -73.75, 42.68 )
		  		.transform(
		          new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
		          iMapApp.iMapMap.olMap.getProjectionObject() // to Spherical Mercator Projection
		        ), 13);
		//var markers = new OpenLayers.Layer.Markers( "Markers" );
	    //map.addLayer(markers);
		iMapApp.iMapMap.locLayer = new OpenLayers.Layer.Vector("locLayer", {
	        styleMap: new OpenLayers.StyleMap({
	            externalGraphic: "assets/images/mobile-loc.png",
	            graphicOpacity: 1.0,
	            graphicWidth: 16,
	            graphicHeight: 26,
	            graphicYOffset: -26,
                displayInLayerSwitcher: 0
	        })
	    });
		iMapApp.iMapMap.olMap.addLayer(iMapApp.iMapMap.locLayer);
        iMapApp.iMapMap.addMoveFeatureCtl();
	},
    addMoveFeatureCtl: function() {
        iMapApp.iMapMap.dragCtl = new OpenLayers.Control.ModifyFeature(iMapApp.iMapMap.locLayer); //dragComplete: function(	vertex	)
        iMapApp.iMapMap.olMap.addControl(iMapApp.iMapMap.dragCtl);
        iMapApp.iMapMap.dragCtl.activate();
    },
	// resize div
	fixSize: function(wid, hei) {
		console.log("MapResize W:"+wid+" H:"+hei);
		$("#iMapMapdiv").width(wid).height(hei);
		iMapApp.iMapMap.olMap.updateSize();
	},
	// Set the position pin in the map
	setPosition: function(pos) {
		var lonLat = new OpenLayers.LonLat( pos[0], pos[1] )
	        .transform(
	          new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
	          iMapApp.iMapMap.olMap.getProjectionObject() // to Spherical Mercator Projection
	        );
		 var features = {
            "type": "FeatureCollection",
            "features": [
                { "type": "Feature", "geometry": {"type": "Point", "coordinates": [lonLat.lon, lonLat.lat]},
                    "properties": {"Name": "Current Location"}}
            ]
		 };
		 iMapApp.iMapMap.locLayer.removeAllFeatures();
		 var reader = new OpenLayers.Format.GeoJSON();
		 iMapApp.iMapMap.locLayer.addFeatures(reader.read(features));
		 iMapApp.iMapMap.olMap.setCenter (lonLat);
	},
	clearMap: function() {
		console.log("====== ClearMap");
		iMapApp.iMapMap.locLayer.removeAllFeatures();
        iMapApp.iMapMap.olMap.removeControl(iMapApp.iMapMap.dragCtl);
        iMapApp.iMapMap.addMoveFeatureCtl();
		iMapApp.iMapMap.dragCtl.resetVertices();
	},
	getObsLocation: function () {
		var pt = new OpenLayers.LonLat(iMapApp.iMapMap.locLayer.features[0].geometry.x, iMapApp.iMapMap.locLayer.features[0].geometry.y)
				.transform(
						iMapApp.iMapMap.olMap.getProjectionObject(), // to Spherical Mercator Projection,
						new OpenLayers.Projection("EPSG:4326") // transform from WGS 1984
		        );
		return [ pt.lon, pt.lat ];
	},
	setMapType: function(typ) {
        console.log("Setting mapType: " + typ);
        var mapLay = iMapApp.iMapMap.olMap.getLayersByName(typ);
        console.log("Got layer: " + mapLay[0]);
        iMapApp.iMapMap.olMap.setBaseLayer(mapLay[0]);
        
        $('input:radio[name=radio-choice-maptype]').filter('[value='+typ+']').prop('checked', true);

        console.log("Switched to layer: " + typ);
        
        /*if (iMapApp.iMapMap.mapLayer) {
			console.log("Removing layer");
			iMapApp.iMapMap.olMap.removeLayer(iMapApp.iMapMap.mapLayer);
		}
		console.log("Setting mapType: " + typ);
		if (typ == "road") {
			iMapApp.iMapMap.mapLayer = new OpenLayers.Layer.OSM("OpenStreetMap", null, {
	                transitionEffect: 'resize'
	            });
		}
		else {
			iMapApp.iMapMap.mapLayer = new OpenLayers.Layer.OSM("OpenCycleMap",
					  ["http://otile1.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png",
					   "http://otile2.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png",
					   "http://otile3.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png"],
		            {
		                transitionEffect: "resize"
		            }
		        );
            iMapApp.iMapMap.mapLayer = new OpenLayers.Layer.Bing({
                                                            name: "bing Aerial",
                                                            key: iMapApp.iMapMap.bingAPIKey,
                                                            type: "Aerial"
                                                            });
		}
		iMapApp.iMapMap.olMap.addLayer(iMapApp.iMapMap.mapLayer);*/
    
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
                toggleGPS();
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

//setTimeout(iMapApp.iMapMap.fixSize, 700);
//setTimeout(iMapApp.iMapMap.fixSize, 1500);