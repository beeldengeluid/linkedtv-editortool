angular.module('linkedtv').factory('videoSelectionService', [function(){
	
	function getVideosOfProvider(provider, callback) {
		console.debug('Getting videos of provider: ' + provider);
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/videos?p=' + provider,
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