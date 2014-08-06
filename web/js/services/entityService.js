angular.module('linkedtv').factory('entityService', [function(){
	
	function getEntitiesOfResource(resourceUri, callback) {
		console.debug('Getting entities of resource: ' + resourceUri);
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/entities?r=' + resourceUri,
			success : function(json) {
				callback(json.entities);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	function getAllEntitiesOfResource(resourceUri, callback) {
		console.debug('Getting entities of resource: ' + resourceUri);
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/allentities?r=' + resourceUri,
			success : function(json) {
				callback(json.entities);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	return {
		getEntitiesOfResource : getEntitiesOfResource
	}

}]);