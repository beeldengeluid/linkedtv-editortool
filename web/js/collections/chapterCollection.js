angular.module('linkedtv').factory('chapterCollection', 
	['conf', 'timeUtils', 'imageService', 'slotCollection', 'entityCollection', 'enrichmentCollection',
	function(conf, timeUtils, imageService, slotCollection, entityCollection, enrichmentCollection) {
	
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

			//set the default slots based on the provider conf
			var slots = [];
			for(var i=0;i<conf.chapterSlotsMap[provider];i++) {
				slots.push({'title' : 'Slot ' + (i+1)});
			}
			chapter.slots = slots;
		}
		_chapters = chapters;
	}

	function getChapters() {
		return _chapters;
	}

	function setActiveChapter(activeChapter) {
		_activeChapter = activeChapter;
		entityCollection.updateChapterEntities(_activeChapter);
		slotCollection.updateChapterSlots(_activeChapter);
		enrichmentCollection.updateActiveChapter(_activeChapter);

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