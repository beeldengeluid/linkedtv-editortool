/*
The chapter collection contains all of the curated data:
- annotations (consisting of: 'entities' & 'enrichments' & 'information cards')
- timing information per annotation
*/

angular.module('linkedtv').factory('chapterCollection', 
	['conf', 'timeUtils', 'imageService', 'entityCollection', 'dataService',
	 function(conf, timeUtils, imageService, entityCollection, dataService) {

	var TYPE_AUTO = 'auto';
	var TYPE_CURATED = 'curated';
	var _chapters = [];
	var _activeChapter = null;
	var observers = [];

	//load the chapter collection (this will trigger the controllers that are listening to the chapterCollection)	
	function initCollectionData(provider, resourceData, curatedData) {
		console.debug('Initializing chapter data');
		var chapters = [];
		//old curations take precedence over v2.0 curations (for now)		
		if(resourceData.curated.chapters && resourceData.curated.chapters.length > 0) {
			console.debug('Loading v1.0 curations...');
			chapters = initCollectionWithRDFData(resourceData);
		} else if(curatedData) {
			console.debug('Loading v2.0 curations...');
			chapters = curatedData.chapters;
			var autoChapters = resourceData.chapters;
			for(var c in autoChapters) {
				var chapter = autoChapters[c];
				chapter.type = TYPE_AUTO;
				chapter.poster = imageService.getThumbnail(resourceData.thumbBaseUrl, chapter.start);
				chapter.dimensions = {};
				chapters.push(chapter);
			}
		} else {
			console.debug('No curations found...');
			chapters = initCollectionWithRDFData(resourceData);
		}
		
		setChapters(chapters);
		console.debug(_chapters);
	}

	//This function must be used once all the curated data is saved in the LinkedTV graph
	function initCollectionWithRDFData(resourceData) {
		var chapters = [];
		var autoChapters = resourceData.chapters;
		var curatedChapters = resourceData.curated.chapters;
		for(var c in autoChapters) {
			var chapter = autoChapters[c];
			chapter.type = TYPE_AUTO;
			chapters.push(chapter);
		}
		//TODO test if this works good enough for the ET sources that are actually saved in the old way!
		for(var c in curatedChapters) {
			var chapter = curatedChapters[c];
			chapter.type = TYPE_CURATED;
			chapters.push(chapter);
		}

		//convert chapters to client side friendly objects (FIXME should be done on the server!!!)	
		for(var c in chapters) {
			var chapter = chapters[c];

			//add all the posters to the chapters 
			chapter.poster = imageService.getThumbnail(resourceData.thumbBaseUrl, chapter.start);			
			//add a default empty collection for the curated enrichments (TODO load this later from the server!)
			chapter.dimensions = {};
		}
		chapters.sort(function(a, b) {
			return a.start - b.start;
		});
		return chapters;
	}

	function addObserver(observer) {
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
		_activeChapter.type = TYPE_CURATED; //if a user saves anything to a chapter, it means it approves of the whole chapter
		for(c in _chapters) {
			if(_chapters[c].$$hashKey == _activeChapter.$$hashKey) {
				_chapters[c] = _activeChapter;
			}
		}
		dataService.saveResource(_.filter(_chapters, function(c) {
			return c.type == TYPE_CURATED;
		}));//save the entire resource on the server
	}

	function saveChapterLink(dimension, link) {
		if(_activeChapter.dimensions[dimension.id]) {
			var exists = false;
			for(var i=0;i<_activeChapter.dimensions[dimension.id].length;i++){
				if(_activeChapter.dimensions[dimension.id][i].uri == link.uri) {
					_activeChapter.dimensions[dimension.id][i] = link;
					exists = true;
				}
			}
			if (!exists) {
				_activeChapter.dimensions[dimension.id].push(link);
			}
		} else {
			_activeChapter.dimensions[dimension.id] = [link];
		}
		saveChapter(_activeChapter);
	}

	return {
		initCollectionData : initCollectionData,
		getChapters : getChapters,
		setChapters : setChapters,
		setActiveChapter : setActiveChapter,
		getActiveChapter : getActiveChapter,
		saveChapter : saveChapter,
		saveChapterLink : saveChapterLink,
		addObserver : addObserver
	}

}]);