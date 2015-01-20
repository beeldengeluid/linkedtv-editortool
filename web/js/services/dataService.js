angular.module('linkedtv').factory('dataService', ['$rootScope', 'conf', 'subtitleCollection',
	function($rootScope, conf, subtitleCollection) {

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
	function saveResource(chapters, chapter, callback) {
		if(conf.syncLinkedTVChapters && chapter) {
			updateChapterIndexAndSaveOnServer(chapters, chapter, callback);//this will subsequently call saveDataOnServer()
		} else {
			saveDataOnServer(chapters);
		}
	}

	function saveDataOnServer(chapters) {
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

	//now this only takes chapters (which contain evertything), but maybe this needs to be changed later
	function updateChapterIndexAndSaveOnServer(chapters, chapter, callback) {
		var data = {
			'uri' : $rootScope.resourceUri,
			'provider' : $rootScope.provider,
			'subtitles' : subtitleCollection.getChapterSubtitles(),
			'chapter' : chapter
		};
		var url = '/updatesolr';
		$.ajax({
			type: 'POST',
			url: url,
			data: JSON.stringify(data),
			dataType : 'json',
			success: function(json) {
				console.debug(json);
				if(json.error) {
					console.debug('Could not update the chapter index');
					callback(null);
				} else {
					callback(json);//makes sure the client side also is updated with the new solrId
				}
				saveDataOnServer(chapters);
			},
			error: function(err) {
	    		console.debug(err);
	    		callback(null);
	    		saveDataOnServer(chapters);
			},
			dataType: 'json'
		});
	}

	function deleteChapterFromIndex(chapter) {
		if(chapter.solrId) {
			var data = {'id' : chapter.solrId, 'provider' : $rootScope.provider};
			$.ajax({
				type: 'POST',
				url: '/deletesolr',
				data : JSON.stringify(data),
				dataType : 'json',
				success: function(json) {
					if(json.error) {
						console.debug('Could not delete the chapter from the index');
					}
				},
				error: function(err) {
		    		console.debug(err);
				},
				dataType: 'json'
			});
		}
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
		publishResource : publishResource,
		deleteChapterFromIndex : deleteChapterFromIndex
	}

}]);