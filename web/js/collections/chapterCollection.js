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
		//add all the posters to the chapters (FIXME this should be done on the server!!)
		for(var c in chapters) {
			var chapter = chapters[c];
			chapter.poster = imageService.getThumbnail(resourceData.thumbBaseUrl, resourceUri, timeUtils.toMillis(chapter.start));			
		}
		_chapters = chapters;
	}

	function getChapters() {
		return _chapters;
	}

	function setActiveChapter(activeChapter) {
		_activeChapter = activeChapter;
		entityCollection.updateChapterEntities(_activeChapter);


		//enrichmentCollection.updateActiveChapter(_activeChapter);

	}

	function setChapterCard(index, card) {
		for(c in _chapters) {
			if(_chapters[c].$$hashKey == _activeChapter.$$hashKey) {
				if(_chapters[c].cards) {
					_chapters[c].cards[index] = card;
				} else {
					_chapters[c].cards = [card]
				}
			}
		}
	}

	function getActiveChapter() {
		return _activeChapter;
	}

	return {
		initCollectionData : initCollectionData,
		getChapters : getChapters,
		setActiveChapter : setActiveChapter,
		getActiveChapter : getActiveChapter
	}

}]);