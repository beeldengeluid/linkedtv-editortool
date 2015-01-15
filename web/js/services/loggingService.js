angular.module('linkedtv').factory('loggingService', ['$rootScope',
	function($rootScope) {

	/**
	* Log the following:
	* - timestamp the user saved enrichments
	* - chapter title (+ video id)
	* - content provider
	* - URL
	* - query
	* - list of all enrichments
	* - list of saved enrichments
	*/
	function logUserAction(allEnrichments, savedEnrichments, urls, chapterTitle) {
		//only log when the user searched for enrichments
		if(savedEnrichments && savedEnrichments.length > 0) {
			var logData = {
				timeCreated : new Date().getTime(),
				videoId : $rootScope.resourceUri,
				chapterTitle : chapterTitle,
				user : $rootScope.provider,
				urls : urls,
				queries : [],//TODO
				allEnrichments : _.pluck(allEnrichments, 'url'),
				savedEnrichments : _.pluck(savedEnrichments, 'url')
			};
			$.ajax({
				type: 'POST',
				url: '/log',
				data: JSON.stringify(logData),
				dataType : 'json',
				success: function(json) {
					console.debug(json);
					if(json.error) {
						//alert('Could not log data');
					} else {
						//alert('Logging was a succes!!');
					}
				},
				error: function(err) {
		    		console.debug(err);
				},
				dataType: 'json'
			});
		}
	}

	return {
		logUserAction : logUserAction
	}

}]);