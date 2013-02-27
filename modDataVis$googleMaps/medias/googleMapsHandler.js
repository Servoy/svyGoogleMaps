svyDataVis.log('CHECK: Injecting MAPS api')

$("document").ready(function() {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = 'http://maps.googleapis.com/maps/api/js?v=3.9&key=AIzaSyD6A559b-KBYGBBM6mmDPcYYNpAzv_Rv1Y&sensor=false&callback=svyDataVisGMapCallback';
	//script.src = 'http://maps.googleapis.com/maps/api/js?key=' + apiKey + '&sensor=false&callback=svyDataVisGMapCallback';
	document.head.appendChild(script);
});
		
svyDataVis.gmaps = {
	objects: {},
	todos: {},
	
	createMarker: function(node) {
		var marker = new google.maps.Marker(node.options)
		marker.set('svyId',node.id)
		svyDataVis.gmaps.objects[node.id] = marker
		
		//Add event listeners
		var events = ['click', 'dblclick', 'dragend', 'rightclick'];
		for (var j = 0; j < events.length; j++) {
			var handler = function(id, eventType){
				return function(event) {
					svyDataVis.gmaps.callbackIntermediate("marker", id, eventType, event)
				}
			}(node.id, events[j])
			google.maps.event.addListener(marker, events[j], handler);
		}
		return marker;
	},
	
	removeMarker: function(id) {
		svyDataVis.gmaps.objects[id].setMap(null);
		delete svyDataVis.gmaps.objects[id]
	},
	
	createInfoWindow: function(node) {
		node.content = node.content;
		
		//Create infoWindow in the browser
		var infoWindow = new google.maps.InfoWindow(node)
		infoWindow.set('svyId',node.id)
		svyDataVis.gmaps.objects[node.id] = infoWindow
		
		//Add event listeners
		var events = ['closeclick'];
		for (var j = 0; j < events.length; j++) {
			var handler = function(id, eventType){
				return function(event) {
					svyDataVis.gmaps.callbackIntermediate("infoWindow", id, eventType, event)
					delete svyDataVis.gmaps.objects[id] //Removing the InfoWindow now after each close
				}
			}(node.id, events[j])
			google.maps.event.addListener(infoWindow, events[j], handler);
		}
		return infoWindow;
	},
	
	initialize: function() {
		svyDataVis.log('CHECK: initialize called for GMAPS: ' + arguments.length + ' - '+ window.google + ' - ' + (arguments.length > 0 ? arguments[0] : ''))
		
		$.each(arguments, function(key, value){
			svyDataVis.log('Adding TODO: ' + value)
			svyDataVis.gmaps.todos[value] = true
		})
	
		if (!window.google || google == undefined || !google.maps) {
			return
		}
		
		$.each(this.todos, function(value) {
		
			svyDataVis.log('Processing TODO: ' + svyDataVis.gmaps[value])
			var node = svyDataVis.JSON2Object(svyDataVis.gmaps[value])

			if (node && node.type == "map") {
				//Create new Map in the browser
				var map = new google.maps.Map(document.getElementById(node.id), node.options)
				map.set('svyId',node.id)
				svyDataVis.gmaps.objects[node.id] = map
				
				//Add event listeners
				var events = [
					'idle', //Using idle event for most events, to prevent event firing galore
//					'bounds_changed', 
//					'center_changed', 
					'click', 
					'dblclick', 
//					'heading_changed', 
//					'maptypeid_changed', 
//					'projection_changed',
//					'tilt_changed'
//					'zoom_changed',
				];
				
				for (var j = 0; j < events.length; j++) {
					var handler = function(id, eventType){
						return function(event) {
							svyDataVis.gmaps.callbackIntermediate("map", id, eventType, event)
						}
					}(node.id, events[j])
					google.maps.event.addListener(map, events[j], handler);
				}
				
			} else if (node && node.type == "marker"){
				//Create marker in the browser
//						svyDataVis.log(id);
				svyDataVis.gmaps.createMarker(node);
			} else if (node && node.type == "infoWindow") {
				//Create infoWindow in the browser
				svyDataVis.gmaps.createInfoWindow(node)
			}
			delete svyDataVis.gmaps.todos[value]
			delete svyDataVis.gmaps[value]
		})
	},
	
	callbackIntermediate: function(objectType, id, eventType, event) {
		//Intermediate function to retrieve relevant data when events occur on a map/marker/infoWindow and then send them to the server
		var data = null;
		//svyDataVis.log("CALLBACKINTERMEDIATE: " + objectType + ", " +  id + ", " +  eventType + ", " +  event);
		var object = svyDataVis.gmaps.objects[id];
		switch (objectType) {
			case 'map': 
				switch (eventType) {
//					case 'bounds_changed':
//						break;
//					case 'center_changed':
//						data = JSON.stringify({lat: map.getCenter().lat(), lng: map.getCenter().lng()})
//						break;
//					case 'click':
//						svyDataVis.log('click');
//						break;
//					case 'position_changed':
//						svyDataVis.log('click');
//						break;
//					case 'dblclick':
//						break;
//					case 'heading_changed':
//						data = map.getHeading() 
//						break;
//					case 'maptypeid_changed':
//						data = map.getMapTypeId()
//						break;
//					case 'projection_changed':
//						break;
//					case 'tilt_changed':
//						data = map.getTilt()
//						break;
//					case 'zoom_changed':
//						data = map.getZoom();
//						break;
					case 'idle':
						//Pass position and mapid to Servoy
						bounds = object.getBounds()
					
						data = JSON.stringify({
							bounds: {sw: {lat: bounds.getSouthWest().lat(), lng: bounds.getSouthWest().lng()}, ne: {lat: bounds.getNorthEast().lat(), lng: bounds.getNorthEast().lng()}},
									center: {lat: object.getCenter().lat(), lng: object.getCenter().lng()},
									heading: object.getHeading(),
									mapTypeId: object.getMapTypeId(),
									tilt: object.getTilt(),
									zoom: object.getZoom()
						})
						break;
					default:
						break;
				}
				break; //break 'map' case
			case 'marker':
				switch (eventType) {
//					case 'click': 
//				       var infowindow = new google.maps.InfoWindow({
//				            content: "hoi blabla"
//				        });
//
//				        infowindow.open(marker.getMap(),marker);
//						break;
					default:
								//Pass position and mapid to Servoy
						data = JSON.stringify({
									position: {lat: object.getPosition().lat(), lng: object.getPosition().lng()},
									mapid: object.map.svyId
						})		
						break;
				}
				break; //break 'marker' case
			
			case 'infoWindow':
				//eventType is only 'closeclick' for now
				break; //break 'infowindow' case
		}
		//Call the mapsEventHandler that will call the Servoy callback
		this.mapsEventHandler(objectType, id, eventType,data)
	}
}
	
function svyDataVisGMapCallback() {
	svyDataVis.log('CHECK: gmap API loaded, callback invoked')
	svyDataVis.gmaps.initialize()
}