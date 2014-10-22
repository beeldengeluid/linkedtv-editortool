angular.module('linkedtv').factory('dataService', ['$rootScope', function($rootScope) {
	
	//rename this to: loadDataFromLinkedTVPlatform or something that reflects this
	function getResourceData(loadData, callback) {		
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/load_ltv?id=' + $rootScope.resourceUri + '&ld=' + (loadData ? 'true' : 'false'),
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
			url : '/load_et?id=' + $rootScope.resourceUri,
			success : function(json) {
				callback(json.error ? null : json);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	//now this only takes chapters (which contain evertything), but maybe this needs to be changed later
	function saveResource(chapters, action) {
		console.debug('Saving resource...');
		console.debug(chapters);
		action = action == undefined ? 'save' : action; //not used on the server (yet?)
		var saveData = {'uri' : $rootScope.resourceUri, 'chapters' : chapters};
		$.ajax({
			type: 'POST',
			url: '/save_et?action=' + action,
			data: JSON.stringify(saveData),
			dataType : 'json',
			success: function(json) {
				console.debug(json);
				if(json.error) {
					alert('Could not save data');
				} else {
					//TODO animate the saved data on the screen
				}
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