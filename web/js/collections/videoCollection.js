angular.module('linkedtv').factory('videoCollection', ['imageService', function(imageService) {

	var _videos = [];
	var _observers = [];
	var THUMBNAIL_SECOND = 20;

	function initCollectionData(videos) {
		console.debug('Initializing video collection');
		if(videos) {
			_.each(videos, function(v){
				v.poster = imageService.getThumbnail(v.thumbBaseUrl, v.thumbUrl, THUMBNAIL_SECOND * 1000);
			});
			videos.sort(function(a, b) {
				return  parseInt(b.dateInserted) - parseInt(a.dateInserted);
			});
		}
		setVideos(videos);
	}

	function addObserver(observer) {
		_observers.push(observer);
	}

	function notifyObservers() {
		for (o in _observers) {
			_observers[o](_videos);
		}
	}

	function setVideos(videos) {
		_videos = videos;
		notifyObservers();
	}

	function getVideos() {
		return _videos;
	}

	return {
		initCollectionData : initCollectionData,
		getVideos : getVideos,
		addObserver : addObserver
	}

}]);