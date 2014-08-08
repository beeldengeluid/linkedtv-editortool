angular.module('linkedtv').factory('entityService', ['$rootScope', 'conf', function($rootScope, conf){
	

	function getEntityDBPediaInfo(dbpediaUri, callback) {
		console.debug('Getting entity info for: ' + dbpediaUri);		
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/entityproxy?uri=' + dbpediaUri + '&lang=' + conf.languageMap[$rootScope.provider],
			success : function(json) {				
				callback(json);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	//this function is currently unused (instead the dataService is used to load all data in one go)
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

	//this function is currently unused (instead the dataService is used to load all data in one go)
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
		getEntitiesOfResource : getEntitiesOfResource,
		getAllEntitiesOfResource : getAllEntitiesOfResource,
		getEntityDBPediaInfo : getEntityDBPediaInfo
	}

}]);