angular.module('linkedtv').factory('chapterCollection', 
	['conf', 'timeUtils', 'imageService', 'entityCollection', function(conf, timeUtils, imageService, entityCollection) {	

	var TYPE_AUTO = 'auto';
	var TYPE_CURATED = 'curated';
	var _chapters = [];
	var _activeChapter = null;
	var observers = [];

	//load the chapter collection (this will trigger the controllers that are listening to the chapterCollection)	
	function initCollectionData(resourceUri, provider, resourceData) {
		console.debug('Initializing chapter data');
		var chapters = [];
		//FIXME do this on the server: assign auto/curated type to each chapter
		var autoChapters = resourceData.chapters;
		var curatedChapters = resourceData.curated.chapters;
		for(var c in autoChapters) {
			var chapter = autoChapters[c];
			chapter.type = TYPE_AUTO;
			chapters.push(chapter);
		}
		for(var c in curatedChapters) {
			var chapter = curatedChapters[c];
			chapter.type = TYPE_CURATED;
			chapters.push(chapter);
		}

		//convert chapters to client side friendly objects (FIXME should be done on the server!!!)	
		for(var c in chapters) {
			var chapter = chapters[c];

			//add all the posters to the chapters 
			chapter.poster = imageService.getThumbnail(resourceData.thumbBaseUrl, resourceUri, chapter.start);
			//add a default empty collection to hold information cards (TODO load this later from the server!)
			chapter.cards = [];
			//add a default empty collection for the curated enrichments (TODO load this later from the server!)
			chapter.dimensions = {};
		}
		chapters.sort(function(a, b) {
			return a.start - b.start;
		});
		setChapters(chapters);
		console.debug(_chapters);
	}

	function addObserver(observer) {
		console.debug(observer);
		observers.push(observer);
	}

	function notifyObservers() {
		for (o in observers) {
			observers[o](_chapters);
		}
	}

	function setChapters(chapters) {
		_chapters = chapters;
		notifyObservers();
	}

	function getChapters() {
		return _chapters;
	}

	function setActiveChapter(activeChapter) {
		_activeChapter = activeChapter;
		entityCollection.updateChapterEntities(_activeChapter);
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
		setChapters : setChapters,
		setActiveChapter : setActiveChapter,
		getActiveChapter : getActiveChapter,
		saveChapter : saveChapter,
		addObserver : addObserver
	}

}]);