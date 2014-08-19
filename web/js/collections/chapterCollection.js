angular.module('linkedtv').factory('chapterCollection', 
	['conf', 'timeUtils', 'imageService', 'entityCollection', 'enrichmentCollection',
	function(conf, timeUtils, imageService, entityCollection, enrichmentCollection) {
	
	var _chapters = [];
	var _activeChapter = null;

	//load the chapter collection (this will trigger the controllers that are listening to the chapterCollection)	
	function initCollectionData(resourceUri, provider, resourceData) {
		console.debug('Initializing chapter data');
		var chapters = null;
		if(resourceData.chapters.length == 0) {
			chapters = resourceData.curated.chapters;
		} else {
			chapters = resourceData.chapters;
		}	
		//convert chapters to client side friendly objects (FIXME should be done on the server!!!)	
		for(var c in chapters) {
			var chapter = chapters[c];
			//convert the start and end to ms
			//chapter.start = timeUtils.toMillis(chapter.start);
			//chapter.end = timeUtils.toMillis(chapter.end);

			//add all the posters to the chapters 
			chapter.poster = imageService.getThumbnail(resourceData.thumbBaseUrl, resourceUri, chapter.start);
			//add a default empty collection to hold information cards (TODO load this later from the server!)
			chapter.cards = [];
			//add a default empty collection for the curated enrichments (TODO load this later from the server!)
			chapter.enrichments = [];
		}
		chapters.sort(function(a, b) {
			return a.start - b.start;
		});
		_chapters = chapters;
	}

	function getChapters() {
		return _chapters;
	}

	function setActiveChapter(activeChapter) {
		_activeChapter = activeChapter;
		entityCollection.updateChapterEntities(_activeChapter);
		enrichmentCollection.updateActiveChapter(_activeChapter);
	}

	function getActiveChapter() {
		return _activeChapter;
	}

	function saveChapter(chapter) {
		console.debug('Saving chapter');
		console.debug(chapter);
		_activeChapter = chapter;
		for(c in _chapters) {
			if(_chapters[c].$$hashKey == _activeChapter.$$hashKey) {
				_chapters[c] = _activeChapter;
			}
		}
	}

	return {
		initCollectionData : initCollectionData,
		getChapters : getChapters,
		setActiveChapter : setActiveChapter,
		getActiveChapter : getActiveChapter,
		saveChapter : saveChapter
	}

}]);