angular.module('linkedtv').factory('videoSelectionService', ['conf', function(conf){

	function getVideosOfProvider(provider, callback) {
		console.debug('Getting videos of provider: ' + provider);
		var url = '/videos?cp=' + provider;
		url += '&p=' + conf.platform;
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : url,
			success : function(json) {
				callback(json.videos);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	return {
		getVideosOfProvider : getVideosOfProvider
	}

}]);