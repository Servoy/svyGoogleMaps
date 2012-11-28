console.log('CHECK: Injecting MAPS api')

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
	
	createInfoWindow: function(node) {
		//The content was escaped because of possible html -> unescape
		node.content = unescape(node.content);
		
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
				}
			}(node.id, events[j])
			google.maps.event.addListener(infoWindow, events[j], handler);
		}
		//infoWindow.open(node.map, node.anchor);
		return infoWindow;
	},
	
	removeMarker: function(id) {
		svyDataVis.gmaps.objects[id].setMap(null);
		svyDataVis.gmaps.objects[id] = null;
	},
	
	initialize: function() {
		console.log('CHECK: initialize called for GMAPS: ' + arguments.length + ' - '+ window.google)
		
		$.each(arguments, function(key, value){
			svyDataVis.gmaps.todos[value] = true
		})
		//for (var i = 0; i <= arguments.length; i++) {
		//	this.todos[arguments[i] ] = true
		//}
	
		if (!window.google || google == undefined || !google.maps) {
			return
		}
		
		$.each(this.todos, function(value) {
		
			console.log(svyDataVis.gmaps[value])
			var node = JSON.parse(svyDataVis.gmaps[value], svyDataVis.reviver)

			if (node && node.type == "map") {
				//Create new Map in the browser
				var map = new google.maps.Map(document.getElementById(node.id), node.options)
				map.set('svyId',node.id)
				svyDataVis.gmaps.objects[node.id] = map
				
				//Add event listeners
				var events = [
					'idle',
//					'bounds_changed', 
//					'center_changed', 
//					'click', 
//					'dblclick', 
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
//						console.log(id);
				svyDataVis.gmaps.createMarker(node);
			} else if (node && node.type == "infoWindow") {
				//Create infoWindow in the browser
				svyDataVis.gmaps.createInfoWindow(node)
			}
		})
	},
	
	callbackIntermediate: function(objectType, id, eventType, event) {
		//Intermediate function to retrieve relevant data when events occur on a map/marker/infoWindow and then send them to the server
		var data;
		//console.log("CALLBACKINTERMEDIATE: " + objectType + ", " +  id + ", " +  eventType + ", " +  event);
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
//						console.log('click');
//						break;
//					case 'position_changed':
//						console.log('click');
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
	console.log('CHECK: gmap API loaded, callback invoked')
	svyDataVis.gmaps.initialize()
}