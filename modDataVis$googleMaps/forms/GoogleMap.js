/**
 * @private
 * @properties={typeid:24,uuid:"74BE588A-8009-4633-A7D9-1D0AA80174B0"}
 */
function getDataVisualizationId() {
	return 'gmaps'
}

/**
 * Internal API: DO NOT CALL
 * @param o
 * 
 * @properties={typeid:24,uuid:"3B85D8EA-C07D-44BB-B59B-7D12275AA988"}
 */
function serializeObject(o) {
	return _super.serializeObject(o, [
		scopes.modDataVis$googleMaps.LatLng, 
		scopes.modDataVis$googleMaps.MapTypeId, 
		scopes.modDataVis$googleMaps.Marker, 
		scopes.modDataVis$googleMaps.InfoWindow, 
		scopes.modDataVis$googleMaps.Map
		])
}

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"AEFB97E7-2D29-49CB-80AA-64A0D403835B"}
 */
var apiKey

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"452C9C51-39D9-4E2D-A76A-FDBB50EF4147"}
 */
var apiClientId

/**
 * @param {String} [key]
 * @param {String} [clientId]
 *
 * @properties={typeid:24,uuid:"6447BAC0-791A-460D-888D-4B615EA70292"}
 */
function setAPICredentials(key, clientId) {
	apiKey = key
	apiClientId = clientId
}
/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"F6C82FAF-C9EB-43A0-BE0E-7F8FF802A15B"}
 */
function onShow(firstShow, event) {
	_super.onShow(firstShow, event)
	executeClientsideScript('svyDataVis.gmaps.loadApi(' + (apiClientId ? 'null' : '\'' + apiKey + '\'') + ',\'' + apiClientId + '\',false)')
}