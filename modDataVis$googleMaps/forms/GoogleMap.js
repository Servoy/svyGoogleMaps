/**
 * @private
 * @properties={typeid:24,uuid:"74BE588A-8009-4633-A7D9-1D0AA80174B0"}
 */
function getComponentId() {
	return 'gmaps'
}

/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"6EF88A4D-CF85-41A2-9343-D9B3F765EFDC"}
 */
var apiKey

/**
 * @private 
 * @type {String}
 *
 * @properties={typeid:35,uuid:"D221A5C4-26C8-4BB3-8FE4-292ABA27C91F"}
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
 * TODO push this into (Abstract)Component and allow multiple add's
 * @param code
 *
 * @properties={typeid:24,uuid:"ACF8D4D7-FC02-4849-AF7F-6EA5D40EC445"}
 */
function addInitScript(code) {
	if (scopes.utils.system.isWebClient()) {
		scopes.modUtils$webClient.addOnLoadScript(code, forms[controller.getName()])
	} else {
		executeClientsideScript('svyComp.gmaps.loadApi(' + (apiClientId ? 'null' : '\'' + apiKey + '\'') + ',\'' + apiClientId + '\',false)')
	}
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
	//FIXME: This doens't get called on refresh (F5), thus the map doesn't load
	//executeClientsideScript('svyComp.gmaps.loadApi(' + (apiClientId ? 'null' : '\'' + apiKey + '\'') + ',\'' + apiClientId + '\',false)')
	/* solution could be to attach a a Wicket AbstractBehavior in the WC to add something to the head in renderHead, which gets added everytime the component is rendered, also on refresh
	 * Another approach could be to offer a method on AbstractComponent like add(Clientside)OnRenderScript
	 * 
	 */
	addInitScript('svyComp.gmaps.loadApi(' + (apiClientId ? 'null' : '\'' + apiKey + '\'') + ',\'' + apiClientId + '\',false)')
}