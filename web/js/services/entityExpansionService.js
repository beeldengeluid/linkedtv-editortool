angular.module('linkedtv').factory('entityExpansionService', ['$rootScope', 'conf', function($rootScope, conf){

	function fetch(srtUrl, start, end, chapterId, callback) {
		if(srtUrl) {
			var url = '/entityexpand';
			url += '?url=' + srtUrl;
			url += '&start=' + start;
			url += '&end=' + end;
			console.debug(url);
			$.ajax({
				method: 'GET',
				dataType : 'json',
				url : url,
				success : function(json) {
					callback(chapterId, json.error ? null : formatResponse(json));
				},
				error : function(err) {
					callback(chapterId, null);
				}
			});
		} else {
			console.debug('This resource does not have any subtitles available!');
		}
	}

	function formatResponse(data) {
		console.debug('Got some data!!');
		console.debug(data);
		return data
	}

	return {
		fetch : fetch
	}

}]);