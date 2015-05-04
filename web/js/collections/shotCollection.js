angular.module('linkedtv').factory('shotCollection', ['imageService', 'timeUtils',
	function(imageService, timeUtils) {

	var _shots = [];
	var _groupedChapterShots = {};//stores all the entities grouped by label
	var _chapterShots = [];//only stores the unique entities (based on labels)
	var _thumbBaseUrl = null;
	var _thumbUrl = null;

	function initCollectionData(resourceData) {
		console.debug('Initializing shot data');
		_thumbBaseUrl = resourceData.thumbBaseUrl;
		_thumbUrl = resourceData.thumbUrl;
		_shots = resourceData.shots; //no transformation necessary
		_.each(_shots, function(s){
			s.poster = imageService.getThumbnail(_thumbBaseUrl, _thumbUrl, s.start);
			s.prettyStart = timeUtils.toPrettyTime(s.start);
			s.prettyEnd = timeUtils.toPrettyTime(s.end);
		});
		_shots.sort(function(a, b) {
			return parseInt(a.start) - parseInt(b.start);
		});
	}

	function getShots() {
		return _shots;
	}

	function getChapterShots() {
		return _chapterShots;
	}

	function updateChapterShots(chapter) {
		if(chapter) {
			//first filter all the entities to be only of the selected chapter
			_chapterShots = _.filter(_shots, function(item) {
				if(parseInt(item.start) >= parseInt(chapter.start) && parseInt(item.end) <=  parseInt(chapter.end)) {
					return item;
				}
			});
			_chapterShots.sort(function(a, b) {
				return parseInt(a.start) - parseInt(b.start);
			});
		}
	}

	return {
		initCollectionData : initCollectionData,
		getShots : getShots,
		getChapterShots : getChapterShots,
		updateChapterShots : updateChapterShots
	}

}]);