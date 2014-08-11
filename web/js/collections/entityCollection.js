angular.module('linkedtv').factory('entityCollection', [function() {
	
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

 		/*
		$.each(this.entities, function(k, v) {
			var labels = [];
			var daUrls = [];
			for (var e in v) {
				labels.push(v[e].label);
				daUrls.push(v[e].disambiguationURL);
			}
			$scope.popOverContent[k] = labels.join(' ') + '&nbsp;' + daUrls.join(' ');
		});*/	
		//TODO sort the entities
	}

	return {
		initCollectionData : initCollectionData,
		getEntities : getEntities,		
		getChapterEntities : getChapterEntities,
		updateChapterEntities : updateChapterEntities
	}

}]);