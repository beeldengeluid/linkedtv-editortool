angular.module('linkedtv').factory('entityCollection', ['timeUtils', function(timeUtils) {
	
	var _entities = [];
	var _groupedChapterEntities = {};//stores all the entities grouped by label
	var _chapterEntities = [];//only stores the unique entities (based on labels)

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
			_groupedChapterEntities = _.groupBy(entities, function(e) {
				return e.label;
			});

			_chapterEntities = [];
			
			//generate a list of unique entities for displaying in the UI/templates
			//TODO make sure to adjust this. The proxy also supports wikipedia URLs
			for(key in _groupedChapterEntities) {
				var temp = null;
				var found = false;
				_.each(_groupedChapterEntities[key], function(entity) {
					if(temp) { //always assign the entity with the highest confidence score (for the UI)
						if(parseFloat(entity.confidence) > parseFloat(temp.confidence)) {
							temp = entity;
						}
					} else {
						temp = entity;
					}
					if(entity.disambiguationURL && entity.disambiguationURL.indexOf('dbpedia') != -1 && !found) {
						_chapterEntities.push(entity);
						found = true;						
					}
				});
				if(!found) { //in case no dbpedia version of this entity was found add the entity with the highest score
					_chapterEntities.push(temp);
				}
			}			
			_chapterEntities.sort(function(a, b) {
				return parseFloat(b.confidence) - parseFloat(a.confidence);
			});			
		}
	}

	return {
		initCollectionData : initCollectionData,
		getEntities : getEntities,		
		getChapterEntities : getChapterEntities,
		updateChapterEntities : updateChapterEntities
	}

}]);