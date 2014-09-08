angular.module('linkedtv').factory('dataService', ['$rootScope', function($rootScope) {
	
	//rename this to: loadDataFromLinkedTVPlatform or something that reflects this
	function getResourceData(loadData, callback) {		
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/resource?id=' + $rootScope.resourceUri + '&ld=' + (loadData ? 'true' : 'false'),
			success : function(json) {
				console.debug(json);
				callback(json);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	function getCuratedData(callback) {
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/curatedresource?id=' + $rootScope.resourceUri,
			success : function(json) {
				callback(json.error ? null : json);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	function saveResource(chapters, action) {
		console.debug('Saving resource...');
		action = action == undefined ? 'save' : action; //not used on the server (yet?)
		var saveData = {'uri' : $rootScope.resourceUri, 'chapters' : chapters};
		$.ajax({
			type: 'POST',
			url: '/saveresource?action=' + action,
			data: JSON.stringify(saveData),
			dataType : 'json',
			success: function(json) {
				//TODO check for errors
				console.debug(json);
			},
			error: function(err) {
	    		console.debug(err);	    		
			},
			dataType: 'json'
		});
	}

	return {
		getResourceData : getResourceData,
		getCuratedData : getCuratedData,
		saveResource : saveResource
	}

}]);