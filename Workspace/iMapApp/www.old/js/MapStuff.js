var iMapMap = {
	olMap: null,
	locLayer: null,
	dragCtl: null,
	mapLayer: null,
	timerVar: null,
    bingAPIKey: "AifZwUylySDsGAx5jp3QHunKxJ6Z0AkPa2-ZGFwb3-gtlIouPGBzI9H5DA-xUiPV",
	init: function() {
	    // create map
		var lay1 = new OpenLayers.Layer.OSM("road", null, {
            transitionEffect: 'resize'
        });
        var lay2 = new OpenLayers.Layer.Bing({
                                             name: "aerial",
                                             key: iMapMap.bingAPIKey,
                                             type: "Aerial"
                                             });
		iMapMap.olMap = new OpenLayers.Map({
	        div: "iMapMapdiv",
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
        //iMapMap.olMap.addControl(new OpenLayers.Control.MobileLayerSwitcher());
		iMapMap.olMap.setCenter( new OpenLayers.LonLat( -73.75, 42.68 )
		  		.transform(
		          new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
		          iMapMap.olMap.getProjectionObject() // to Spherical Mercator Projection
		        ), 13);
		//var markers = new OpenLayers.Layer.Markers( "Markers" );
	    //map.addLayer(markers);
		iMapMap.locLayer = new OpenLayers.Layer.Vector("locLayer", {
	        styleMap: new OpenLayers.StyleMap({
	            externalGraphic: "img/mobile-loc.png",
	            graphicOpacity: 1.0,
	            graphicWidth: 16,
	            graphicHeight: 26,
	            graphicYOffset: -26,
                displayInLayerSwitcher: 0
	        })
	    });
		iMapMap.olMap.addLayer(iMapMap.locLayer);
        iMapMap.addMoveFeatureCtl();
	},
    addMoveFeatureCtl: function() {
        iMapMap.dragCtl = new OpenLayers.Control.ModifyFeature(iMapMap.locLayer); //dragComplete: function(	vertex	)
        iMapMap.olMap.addControl(iMapMap.dragCtl);
        iMapMap.dragCtl.activate();
    },
	// resize div
	fixSize: function(wid, hei) {
		console.log("MapResize W:"+wid+" H:"+hei);
		$("#iMapMapdiv").width(wid).height(hei);
		iMapMap.olMap.updateSize();
	},
	// Set the position pin in the map
	setPosition: function(pos) {
		var lonLat = new OpenLayers.LonLat( pos[0], pos[1] )
	        .transform(
	          new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
	          iMapMap.olMap.getProjectionObject() // to Spherical Mercator Projection
	        );
		 var features = {
            "type": "FeatureCollection",
            "features": [
                { "type": "Feature", "geometry": {"type": "Point", "coordinates": [lonLat.lon, lonLat.lat]},
                    "properties": {"Name": "Current Location"}}
            ]
		 };
		 iMapMap.locLayer.removeAllFeatures();
		 var reader = new OpenLayers.Format.GeoJSON();
		 iMapMap.locLayer.addFeatures(reader.read(features));
		 iMapMap.olMap.setCenter (lonLat);
	},
	clearMap: function() {
		console.log("====== ClearMap");
		iMapMap.locLayer.removeAllFeatures();
        iMapMap.olMap.removeControl(iMapMap.dragCtl);
        iMapMap.addMoveFeatureCtl();
		iMapMap.dragCtl.resetVertices();
	},
	getObsLocation: function () {
		var pt = new OpenLayers.LonLat(iMapMap.locLayer.features[0].geometry.x, iMapMap.locLayer.features[0].geometry.y)
				.transform(
						iMapMap.olMap.getProjectionObject(), // to Spherical Mercator Projection,
						new OpenLayers.Projection("EPSG:4326") // transform from WGS 1984
		        );
		return [ pt.lon, pt.lat ];
	},
	setMapType: function(typ) {
        console.log("Setting mapType: " + typ);
        var mapLay = iMapMap.olMap.getLayersByName(typ);
        console.log("Got layer: " + mapLay[0]);
        iMapMap.olMap.setBaseLayer(mapLay[0]);
        
        $('input:radio[name=radio-choice-maptype]').filter('[value='+typ+']').prop('checked', true);

        console.log("Switched to layer: " + typ);
        
        /*if (iMapMap.mapLayer) {
			console.log("Removing layer");
			iMapMap.olMap.removeLayer(iMapMap.mapLayer);
		}
		console.log("Setting mapType: " + typ);
		if (typ == "road") {
			iMapMap.mapLayer = new OpenLayers.Layer.OSM("OpenStreetMap", null, {
	                transitionEffect: 'resize'
	            });
		}
		else {
			iMapMap.mapLayer = new OpenLayers.Layer.OSM("OpenCycleMap",
					  ["http://otile1.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png",
					   "http://otile2.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png",
					   "http://otile3.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png"],
		            {
		                transitionEffect: "resize"
		            }
		        );
            iMapMap.mapLayer = new OpenLayers.Layer.Bing({
                                                            name: "bing Aerial",
                                                            key: iMapMap.bingAPIKey,
                                                            type: "Aerial"
                                                            });
		}
		iMapMap.olMap.addLayer(iMapMap.mapLayer);*/
    
	},
	startGPSTimer: function() {
		console.log("Start the timer");
		if (iMapMap.timerVar == null)
			iMapMap.timerVar = navigator.geolocation.watchPosition(iMapMap.getCurrentLocation, iMapMap.onError,
                { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
	},
	stopGPSTimer: function() {
		console.log("Stop the timer");
		navigator.geolocation.clearWatch(iMapMap.timerVar);
		iMapMap.timerVar = null;
	},
	getCurrentLocation: function(position) {
		//curobs.Where = [ position.coords.longitude, position.coords.latitude];
		console.log("Position: " + $.toJSON([ position.coords.longitude, position.coords.latitude]));
		//alert('found location: ' + $.toJSON(curobs.Where));
		iMapMap.setPosition([ position.coords.longitude, position.coords.latitude]);
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
    	//iMapMap.setPosition([ -98.583333, 39.833333 ]);
    	//console.log('Setting default position: iMapMap.setPosition([-98.583333, 39.833333]);');
        
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
                iMapMap.stopGPSTimer();
                iMapMap.startGPSTimer();
                break;
            default:
                break;
        }
    }

}

//setTimeout(iMapMap.fixSize, 700);
//setTimeout(iMapMap.fixSize, 1500);