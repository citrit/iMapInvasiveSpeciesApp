var iMapApp = iMapApp || {};

iMapApp.iMapMap = {
    olMap: null,
    locSource: null,
    baseLayers: [],
    selectControl: null,
    mapLayer: null,
    timerVar: null,
    timerOn: false,
    olView: null,
    tileCache: null,
    tileCacheWrite: null,
    bingAPIKey: "AifZwUylySDsGAx5jp3QHunKxJ6Z0AkPa2-ZGFwb3-gtlIouPGBzI9H5DA-xUiPV",
    init: function(mapDiv) {
        iMapApp.iMapMap.olView = new ol.View({
            center: [-73.4689, 42.7187],
            zoom: 12
        });

        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon( /** @type {olx.style.IconOptions} */ ({
                anchor: [0.5, 0.0],
                anchorOrigin: 'bottom-left',
                opacity: 1.0,
                scale: 1.5,
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

        for (i = 0, ii = mapStyles.length; i < ii; ++i) {
            iMapApp.iMapMap.baseLayers.push(new ol.layer.Tile({
                visible: false,
                preload: Infinity,
                source: new ol.source.BingMaps({
                    key: iMapApp.iMapMap.bingAPIKey,
                    imagerySet: mapStyles[i]
                        // use maxZoom 19 to see stretched tiles instead of the BingMaps
                        // "no photos at this zoom level" tiles
                        // maxZoom: 19
                })
            }));
        }

        var selectLocation = new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({
                    color: '#ff00ff'
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffccff'
                }),
                radius: 10
            })
        });
        var select = new ol.interaction.Select({
            wrapX: false,
            style: [selectLocation]
        });

        var modify = new ol.interaction.Modify({
            features: select.getFeatures(),
            style: [selectLocation]
        });
        modify.on('modifyend', function(e) {
            var features = e.features.getArray();
            features.forEach(function(el, idx, arr) {
                console.log("feature [" + idx + "] changed is ", el.getGeometryName());
                iMapApp.uiUtils.setObsPosition(ol.proj.transform(el.getGeometry().getFirstCoordinate(),
                    iMapApp.iMapMap.olView.getProjection(), 'EPSG:4326'));
            });
        });

        iMapApp.iMapMap.olMap = new ol.Map({
            interactions: ol.interaction.defaults().extend([select, modify]),
            layers: iMapApp.iMapMap.baseLayers,
            target: mapDiv,
            view: iMapApp.iMapMap.olView
                //tileManager: OpenLayers.TileManager()
        });
        iMapApp.iMapMap.selectControl = select;
        iMapApp.iMapMap.olMap.addLayer(vectorLayer);

        /*// Add a tile cache and cache writer, later we add configuration
        iMapApp.iMapMap.tileCache = new ol.Control.CacheRead();
        iMapApp.iMapMap.tileCacheWrite = new ol.Control.CacheWrite({
            imageFormat: "image/jpeg",
        });
        iMapApp.iMapMap.olMap.addControls([iMapApp.iMapMap.tileCache, iMapApp.iMapMap.tileCacheWrite]);*/
    },

    // resize div
    fixSize: function(wid, hei) {
        console.log("MapResize W:" + wid + " H:" + hei);
        $("#iMapMapdiv").width(wid).height(hei);
        iMapApp.iMapMap.olMap.updateSize();
        iMapApp.iMapMap.selectControl.getFeatures().clear();
    },

    // Set the position pin in the map
    setPosition: function(pos) {
        iMapApp.iMapMap.locSource.clear();
        var vPos = ol.proj.transform(pos, 'EPSG:4326', iMapApp.iMapMap.olView.getProjection());
        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(vPos),
            name: 'You are Here'
        });
        iMapApp.iMapMap.locSource.addFeature(iconFeature);
        iMapApp.iMapMap.olView.setCenter(vPos);
    },

    clearMap: function() {
        console.log("====== ClearMap");
        iMapApp.iMapMap.locSource.clear();
    },

    getObsLocation: function() {
        /*var pt = new OpenLayers.LonLat(iMapApp.iMapMap.locLayer.features[0].geometry.x, iMapApp.iMapMap.locLayer.features[0].geometry.y)
        		.transform(
        				iMapApp.iMapMap.olMap.getProjectionObject(), // to Spherical Mercator Projection,
        				new OpenLayers.Projection("EPSG:4326") // transform from WGS 1984
                );
        return [ pt.lon, pt.lat ];*/
    },

    setMapType: function(typ) {
        for (var i = 0, ii = iMapApp.iMapMap.baseLayers.length; i < ii; ++i) {
            iMapApp.iMapMap.baseLayers[i].setVisible(mapStyles[i] == typ);
        }
        console.log("Switched to layer: " + typ);
    },

    setMapZoom: function(z) {
        iMapApp.iMapMap.olView.setZoom(z);
        console.log("zoomTo: " + z);
    },

    startGPSTimer: function() {
        if (getDElem('input[name="toggleGPS"]').is(':checked')) {
            iMapApp.iMapMap.timerOn = true;
            console.log("Start the timer");
            iMapApp.iMapMap.timerVar = navigator.geolocation.watchPosition(iMapApp.iMapMap.getCurrentLocation, iMapApp.iMapMap.onError, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
        }
    },

    stopGPSTimer: function() {
        console.log("Stop the timer");
        navigator.geolocation.clearWatch(iMapApp.iMapMap.timerVar);
        iMapApp.iMapMap.timerVar = null;
        iMapApp.iMapMap.timerOn = false;
    },

    /*alert('Latitude: '          + position.coords.latitude          + '\n' +
          'Longitude: '         + position.coords.longitude         + '\n' +
          'Altitude: '          + position.coords.altitude          + '\n' +
          'Accuracy: '          + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '           + position.coords.heading           + '\n' +
          'Speed: '             + position.coords.speed             + '\n' +
          'Timestamp: '         + position.timestamp                + '\n');*/
    getCurrentLocation: function(position) {
        //curobs.Where = [ position.coords.longitude, position.coords.latitude];
        console.log("Position: " + JSON.stringify(position.coords));
        //alert('found location: ' + $.toJSON(curobs.Where));
        iMapApp.iMapMap.setPosition([position.coords.longitude, position.coords.latitude]);
        iMapApp.uiUtils.setObsPosition([position.coords.longitude, position.coords.latitude]);
        iMapApp.uiUtils.setObsAccuracy(position.coords.accuracy);
    },
    // onSuccess Callback
    //   This method accepts a `Position` object, which contains
    //   the current GPS coordinates
    //
    onSuccess: function(position) {
        $('#geolocation').val('Latitude: ' + position.coords.latitude + '<br />' +
            'Longitude: ' + position.coords.longitude + '<br />' +
            '<hr />' + element.innerHTML);
    },

    // onError Callback receives a PositionError object
    //
    onError: function(error) {
        //iMapApp.iMapMap.setPosition([ -98.583333, 39.833333 ]);
        //console.log('Setting default position: iMapApp.iMapMap.setPosition([-98.583333, 39.833333]);');

        console.log('OnError: ' + error.code);
        switch (error.code) {
            case 1:
            case 2:
                try {
                    navigator.notification.alert(
                        'GPS error, please enable location.\n' + error.message, // message
                        null, // callback
                        'code: ' + error.code, // title
                        'Ok' // buttonName
                    );
                } catch (e) {}
                iMapApp.iMapMap.stopGPSTimer();
                break;
            case 3:
                if (iMapApp.iMapMap.timerOn == true) {
                    // if geolocation returns timeout error code, restart geolocation
                    iMapApp.iMapMap.stopGPSTimer();
                    iMapApp.iMapMap.startGPSTimer();
                }
                break;
            default:
                break;
        }
    }

};

var mapStyles = [
    'Road',
    'Aerial',
    'AerialWithLabels',
];
//setTimeout(iMapApp.iMapMap.fixSize, 700);
//setTimeout(iMapApp.iMapMap.fixSize, 1500);