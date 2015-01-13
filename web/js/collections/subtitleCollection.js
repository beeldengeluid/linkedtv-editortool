angular.module('linkedtv').factory('subtitleCollection', ['timeUtils', function(timeUtils) {

	var _subtitles = [];
	var _chapterSubtitles = [];

	function initCollectionData(resourceData) {
		console.debug('Initializing entity data');
		_subtitles = resourceData; //no transformation necessary
	}

	function getSubtitles() {
		return _subtitles;
	}

	function getChapterSubtitles() {
		return _chapterSubtitles;
	}

	function updateChapterSubtitles(chapter) {
		if(chapter) {
			//first filter all the entities to be only of the selected chapter
			_chapterSubtitles = _.filter(_subtitles, function(item) {
				if(item.start >= chapter.start && item.end <=  chapter.end) {
					return item;
				}
			});

			_chapterSubtitles.sort(function(a, b) {
				return parseFloat(b.start) - parseFloat(a.start);
			});
		}
	}

	return {
		initCollectionData : initCollectionData,
		getSubtitles : getSubtitles,
		getChapterSubtitles : getChapterSubtitles,
		updateChapterSubtitles : updateChapterSubtitles
	}

}]);