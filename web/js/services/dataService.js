angular.module('linkedtv').factory('dataService', ['$rootScope', 'conf', 'subtitleCollection',
	function($rootScope, conf, subtitleCollection) {

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

	//if configured, this function first updates the chapter index in the SOLR index and then update the ET storage
	function saveResource(chapters, chapter, callback) {
		if(conf.synchronization.syncOnSave && chapter) {
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
	//TODO move this to synchronizationService.js
	function updateChapterIndexAndSaveOnServer(chapters, chapter, callback) {
		var data = {
			'uri' : $rootScope.resourceUri,
			'provider' : $rootScope.provider,
			'subtitles' : subtitleCollection.getChapterSubtitles(),
			'chapter' : chapter,
			'platform' : conf.synchronization.platform
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