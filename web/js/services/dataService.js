angular.module('linkedtv').factory('dataService', ['$rootScope', 'conf', function($rootScope, conf) {

	//rename this to: loadDataFromLinkedTVPlatform or something that reflects this
	function getResourceData(loadData, callback) {
		var url = '/load?id=';
		url += $rootScope.resourceUri;
		url += '&ld=' + (loadData ? 'true' : 'false');
		url += '&p=' + conf.platform;
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : url,
			success : function(json) {
				callback(json);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	//TODO create a new function for loading curated data from the platform!
	function getCuratedData(callback) {
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/load_curated?id=' + $rootScope.resourceUri,
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
		action = action == undefined ? 'save' : action; //not used on the server (yet?)
		var saveData = {'uri' : $rootScope.resourceUri, 'chapters' : chapters};
		$.ajax({
			type: 'POST',
			url: '/save?action=' + action,
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

	function publishResource(chapters, unpublish, callback) {
		var saveData = {uri : $rootScope.resourceUri, chapters : chapters};
		var url = '/publish?pp=LinkedTV'; //currently no other publishing points are supported
		if(unpublish)  {
			url += '&del=true';
		}
		$.ajax({
			type: 'POST',
			url: url,
			data: JSON.stringify(saveData),
			dataType : 'json',
			success: function(json) {
				if(json.error) {
					callback(null);
				} else {
					callback(json);
				}
			},
			error: function(err) {
	    		callback(null);
			},
			dataType: 'json'
		});
	}

	return {
		getResourceData : getResourceData,
		getCuratedData : getCuratedData,
		saveResource : saveResource,
		publishResource : publishResource
	}

}]);