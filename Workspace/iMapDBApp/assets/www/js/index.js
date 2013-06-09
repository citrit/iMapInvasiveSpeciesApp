/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var debugOut = true;

var iMapApp = {
    
	userParams: null,
	
	// Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
    	console.log("onDeviceReady made it here.");
    	iMapApp.loadParameters();
    },
    // load the parameters file.
    loadParameters: function() {
    	console.log('loading parameters');
    	var request = new XMLHttpRequest();
        request.open("GET", "res/parameters.json", false);
        request.onreadystatechange = function(){
        	iMapApp.debugMsg("state = " + request.readyState);
            if (request.readyState == 4) {
                if (request.status == 200 || request.status == 0) {
                	iMapApp.debugMsg('read: ' + request.responseText);
                	iMapApp.userParams = $.parseJSON(request.responseText);
                	iMapApp.debugMsg('user params read: ' + $.toJSON(iMapApp.userParams));
                }
            }
        }
        request.send();
    },
    // Output debug messages.
    debugMsg: function(msg) {
    	if (debugOut)
    		console.log( msg );
    }
};
