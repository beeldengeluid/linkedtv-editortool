angular.module('linkedtv').factory('entityCollection', ['timeUtils', function(timeUtils) {
	
	var _entities = [];
	var _chapterEntities = [];

	function initCollectionData(resourceData) {
		console.debug('Initializing entity data');
		_entities = resourceData; //no transformation necessary
	}

	function getEntities() {
		return _entities;
	}

	function getChapterEntities() {
		return _chapterEntities;
	}

	function updateChapterEntities(chapter) {
		if(chapter) {
			//first filter all the entities to be only of the selected chapter
			var entities = _.filter(_entities, function(item) {
				if(item.start >= chapter.start && item.end <=  chapter.end) {				
					return item;
				}
			});

			//group all the entities by label
			_chapterEntities = _.groupBy(entities, function(e) {
				return e.label;
			});
			//TODO sort the entities
		}
	}

	return {
		initCollectionData : initCollectionData,
		getEntities : getEntities,		
		getChapterEntities : getChapterEntities,
		updateChapterEntities : updateChapterEntities
	}

}]);