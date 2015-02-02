angular.module('linkedtv').factory('dataService', ['$rootScope', 'conf', function($rootScope, conf) {

	//loads (automatically generated) data from the specified platform (config.js)
	function getResourceData(loadData, callback) {
		var url = '/load?id=';
		url += $rootScope.resourceUri;
		url += '&ld=' + (loadData ? 'true' : 'false');//FIXME this is a weird/old parameter that must be removed later on
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

	//loads the curated data (always stored in the ET)
	function getCuratedData(callback) {
		var url = '/load_curated';
		url += '?id=' + $rootScope.resourceUri;
		if(conf.programmeConfig.loadGroundTruth) {
			url += '&gt=true';
		}
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : url,
			success : function(json) {
				callback(json.error ? null : json);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	function saveResource(chapters) {
		var saveData = {
			'uri' : $rootScope.resourceUri,
			'chapters' : chapters
		};
		var url = '/save';
		$.ajax({
			type: 'POST',
			url: url,
			data: JSON.stringify(saveData),
			dataType : 'json',
			success: function(json) {
				console.debug(json);
				if(json.error) {
					alert('Could not save data');
				} else {
					//todo animate some stuff
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