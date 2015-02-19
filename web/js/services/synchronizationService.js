angular.module('linkedtv').factory('synchronizationService', ['$rootScope', 'conf', 'subtitleCollection',
	function($rootScope, conf, subtitleCollection){

	function synchronize(callback) {
		if(conf.programmeConfig.synchronization) {
			console.debug('Synchronizing with ' + conf.programmeConfig.synchronization.platform);
			var url = '/synchronize'
			url += '?uri=' + $rootScope.resourceUri;
			url += '&platform=' + conf.programmeConfig.synchronization.platform;
			url += '&p=' + $rootScope.provider;

			$.ajax({
				method: 'GET',
				dataType : 'json',
				url : url,
				success : function(json) {
					console.debug(json)
					callback(json.success ? true : false);
				},
				error : function(err) {
					console.debug(err);
					callback(false);
				}
			});
		} else {
			console.debug('Synchronization has been disabled in the config');
		}
	}

	function synchronizeChapter(chapter, callback) {
		if(conf.programmeConfig.synchronization) {
			var data = {
				'uri' : $rootScope.resourceUri,
				'provider' : $rootScope.provider,
				'subtitles' : subtitleCollection.getChapterSubtitles(),
				'chapter' : chapter,
				'platform' : conf.programmeConfig.synchronization.platform
			};
			var url = '/synchronize_chapter';
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
				},
				error: function(err) {
		    		console.debug(err);
		    		callback(null);
				},
				dataType: 'json'
			});
		} else {
			console.debug('Synchronization has been disabled in the config');
		}
	}

	function disconnectChapter(chapter) {
		if(conf.programmeConfig.synchronization) {
			if(chapter.solrId) {//FIXME SOLRID MUST BE ABSTRACTED!!!
				var data = {'id' : chapter.solrId, 'provider' : $rootScope.provider, 'platform' : conf.programmeConfig.synchronization.platform};
				$.ajax({
					type: 'POST',
					url: '/disconnect_chapter',
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
		} else {
			console.debug('Synchronization has been disabled in the config');
		}
	}

	return {
		synchronize : synchronize,
		synchronizeChapter : synchronizeChapter,
		disconnectChapter : disconnectChapter
	}

}]);