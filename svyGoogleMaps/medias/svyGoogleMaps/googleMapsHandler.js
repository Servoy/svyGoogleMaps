svyComp.gmaps = {
	loadApi: function(key, clientId, sensor) {
		if (this.apiInserted /*document.getElementById('gmapsAPI')*/) {
			return //workaround to prevent adding the Maps API multiple times
		}
		svyComp.log('Injecting Google Maps API')
		var url = 'http://maps.googleapis.com/maps/api/js?v=3.11&callback=svyCompGMapCallback&sensor='
		url += sensor ? 'true' : 'false' 
		if (key) url += '&key=' + key
		if (clientId) url += '&client=' + clientId
		
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = url
		script.id = 'gmapsAPI'
		document.head.appendChild(script);
		this.apiInserted = true
	},
	apiInserted: false,
	apiLoaded: false,
	
	todos: [],
	
	createMarker: function(node) {
		var marker = new google.maps.Marker(node.options)
		marker.set('svyId',node.id) //TODO: is this needed? Are they read anywhere?
		svyComp.objects[node.id] = marker
		
		//Add event listeners
		var events = ['click', 'dblclick', 'rightclick', 'dragend'];
		for (var j = 0; j < events.length; j++) {
			var handler = function(objectId, mapId, eventType){
				return function(event) {
					svyComp.gmaps.callbackIntermediate("marker", objectId, mapId, eventType, event)
				}
			}(node.id, marker.getMap().get('svyId'), events[j])
			google.maps.event.addListener(marker, events[j], handler);
		}
		return marker;
	},
	
	removeMarker: function(id) {
		svyComp.objects[id].setMap(null);
		delete svyComp.objects[id]
	},
	
	createInfoWindow: function(node) {
		//Create infoWindow in the browser
		var infoWindow = new google.maps.InfoWindow(node)
		infoWindow.set('svyMapId',node.mapId)
		svyComp.objects[node.id] = infoWindow
		
		//Add event listeners
		var events = ['closeclick'];
		for (var j = 0; j < events.length; j++) {
			var handler = function(objectId, mapId, eventType){
				return function(event) {
					svyComp.gmaps.callbackIntermediate("infoWindow", objectId, mapId, eventType, event)
					delete svyComp.objects[objectId] //Removing the InfoWindow now after each close
				}
			}(node.id, node.mapId, events[j])
			google.maps.event.addListener(infoWindow, events[j], handler);
		}
		return infoWindow;
	},
	
	initialize: function() {
		svyComp.log('initialize called for GMAPS: ' + (arguments.length > 0 ? Array.prototype.slice.call(arguments).join() : ' -none-'))
		
		 //Storing the ID's to initialize for later processing in case initialize is called before the Maps API is loaded
		for (var l = 0; l < arguments.length; l++) {
			svyComp.gmaps.todos.push(arguments[l])
		}
		if (!svyComp.gmaps.apiLoaded) {
			return
		}
		
		//Loop through todo's as long as todo's is not empty and the previous loop managed to process one of the todo's (so the order of items in todo's and their dependencies don't matter
		var loopProcessed = true
		
		var i = arguments.length ? this.todos.length - arguments.length : 0 //Offsetting i used in for loop over this.todos to first process entries for which initialize was called specifically
		while (this.todos.length && loopProcessed) { 
			loopProcessed = false
			
			for (; i < this.todos.length; i++) {
				var value = this.todos[i]
				svyComp.log('Processing TODO: ' + svyComp.gmaps[value])
				var node = svyComp.JSON2Object(svyComp.gmaps[value])
				if (node === null) continue; //explicit null is returned when JSON2Object failed because of references to other objects that aren't there yet
				
				svyComp.gmaps.todos.splice(i,1) //Remove TODO
				i-- //Correct i index for removed entry in this.todos
				delete svyComp.gmaps[value] //Remove intermediate storage 
				
				if (node === undefined) continue; //Undefined can be returned by JSON2Object when the json parsed was containing a call
				
				loopProcessed = true
				switch (node.type) {
					case "map":
						//Create new Map in the browser
						var map = new google.maps.Map(document.getElementById(node.id), node.options)
						map.set('svyId',node.id) //Used by Markers to retrieve the ID of the Map their on
						svyComp.objects[node.id] = map
						
						//Add event listeners
						var events = [
							'idle', //Using idle event instead of bounds/center/zoom_changed, to prevent event firing galore
		//					'bounds_changed', 
		//					'center_changed', 
							'click', 
							'dblclick',
							'rightclick',
							'heading_changed', 
							'maptypeid_changed', 
		//					'projection_changed',
							'tilt_changed'
		//					'zoom_changed',
						];
						
						for (var j = 0; j < events.length; j++) {
							var handler = function(id, eventType){
								return function(event) {
									svyComp.gmaps.callbackIntermediate("map", id, id, eventType, event)
								}
							}(node.id, events[j])
							google.maps.event.addListener(map, events[j], handler);
						}
						
						//TODO: finish this code to listen to streetview becoming active and send that to the server for persisting
						//http://stackoverflow.com/questions/7251738/detecting-google-maps-streetview-mode
						//http://stackoverflow.com/questions/6529459/implement-google-maps-v3-street-view
//						var panorama = map.getStreetView();
//
//						google.maps.event.addListener(panorama, 'visible_changed', function() {
//
//						    if (thePanorama.getVisible()) {
//
//						        // Display your street view visible UI
//
//						    } else {
//
//						        // Display your original UI
//
//						    }
//
//						});
						break
					case "marker":
						//Create marker in the browser
					svyComp.gmaps.createMarker(node);
						break;
					case "infoWindow":
						//Create infoWindow in the browser
					svyComp.gmaps.createInfoWindow(node)
						break
					default:
					svyComp.log('Unknown node type: ' + node.type)
				}
			}
			i = 0
		}
	},
	
	callbackIntermediate: function(objectType, objectId, mapId, eventType, event) {
		//Intermediate function to retrieve relevant data when events occur on a map/marker/infoWindow and then send them to the server
		var data = null;
		//svyComp.log("CALLBACKINTERMEDIATE: " + objectType + ", " +  id + ", " +  eventType + ", " +  event);
		var object = svyComp.objects[objectId];
		switch (objectType) {
			case 'map': 
				//TODO: the heading/tilt_changed events ought to be throttled
				switch (eventType) {
//					case 'bounds_changed':
//						break;
//					case 'center_changed':
//						break;
					case 'click':
					case 'dblclick':
					case 'rightclick':
						data = {position: {lat: event.latLng.lat(), lng: event.latLng.lng()}}
						break;
//					case 'position_changed':
//						break;
					case 'heading_changed':
						data = object.getHeading() 
						break;
					case 'maptypeid_changed':
						data = object.getMapTypeId()
						break;
//					case 'projection_changed':
//						break;
					case 'tilt_changed':
						data = object.getTilt()
						break;
//					case 'zoom_changed':
//						break;
					case 'idle': //Used to handle zoom, tilt and bounds change 
						bounds = object.getBounds()
						data = {
							bounds: {sw: {lat: bounds.getSouthWest().lat(), lng: bounds.getSouthWest().lng()}, ne: {lat: bounds.getNorthEast().lat(), lng: bounds.getNorthEast().lng()}},
							center: {lat: object.getCenter().lat(), lng: object.getCenter().lng()},
							zoom: object.getZoom()
						}
						break;
					default:
						break;
				}
				break
			case 'marker':
				if (eventType == 'dragend') { //Using dragend instead of positionChanged to prevent event firing galore
					eventType = 'position_changed'
				}
			
				data = {
					position: {lat: object.getPosition().lat(), lng: object.getPosition().lng()},
				}	
				break; 
			case 'infoWindow':
				//eventType is only 'closeclick' for now
				break; //break 'infowindow' case
		}
		//Call the mapsEventHandler that will call the Servoy callback
		svyComp.callbackHandler(objectType, objectId, mapId, eventType, JSON.stringify(data))
	}
}
	
function svyCompGMapCallback() {
	svyComp.log('gmap API loaded, callback invoked')
	svyComp.gmaps.apiLoaded = true
	svyComp.gmaps.initialize()
}