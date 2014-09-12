/*
The chapter collection contains all of the curated data:
- annotations (consisting of: 'entities' & 'enrichments' & 'information cards')
- timing information per annotation
*/

angular.module('linkedtv').factory('chapterCollection', 
	['conf', 'imageService', 'entityCollection', 'dataService',
	 function(conf, imageService, entityCollection, dataService) {

	var TYPE_AUTO = 'auto';
	var TYPE_CURATED = 'curated';
	var _chapters = [];
	var _activeChapter = null;
	var _thumbBaseUrl = null;
	var _observers = [];

	//load the chapter collection (this will trigger the controllers that are listening to the chapterCollection)	
	function initCollectionData(provider, resourceData, curatedData) {
		console.debug('Initializing chapter data');
		_thumbBaseUrl = resourceData.thumbBaseUrl;
		var chapters = [];
		//old curations take precedence over v2.0 curations (for now)		
		if (curatedData) {
			console.debug('Loading v2.0 curations...');
			chapters = curatedData.chapters;
			var autoChapters = resourceData.chapters;
			_.each(autoChapters, function(c) {	
				c.type = TYPE_AUTO;
				chapters.push(c);
			});
		} else if(resourceData.curated.chapters && resourceData.curated.chapters.length > 0) {
			console.debug('Loading v1.0 curations...');		
			chapters = initCollectionWithRDFData(resourceData);
		} else {
			console.debug('No curations found...');
			chapters = initCollectionWithRDFData(resourceData);
		}
		//sort the chapters by start time
		chapters.sort(function(a, b) {
			return a.start - b.start;
		});

		//make sure all the basic properties are added to each chapter
		_.each(chapters, function(c){
			setBasicProperties(c, true);
		});

		setChapters(chapters);
	}

	//This function must be used once all the curated data is saved in the LinkedTV graph
	function initCollectionWithRDFData(resourceData) {		
		var chapters = [];
		var autoChapters = resourceData.chapters;
		var curatedChapters = resourceData.curated.chapters;
		_.each(autoChapters, function(c) {
			c.type = TYPE_AUTO;
			chapters.push(c);
		});
		//TODO test if this works good enough for the ET sources that are actually saved in the old way!
		_.each(curatedChapters, function(c) {
			c.type = TYPE_CURATED;
			chapters.push(c);
		});
		return chapters;
	}

	function setBasicProperties(chapter, updateGuid) {
		if(updateGuid) {
			chapter.guid = _.uniqueId('chapter_');
			//chapter.label = chapter.label.replace(/ /g,'');
		}
		chapter.poster = imageService.getThumbnail(_thumbBaseUrl, chapter.start);
		if(!chapter.dimensions) {
			chapter.dimensions = {};
		}
	}

	function addObserver(observer) {
		_observers.push(observer);
	}

	function notifyObservers() {
		for (o in _observers) {
			_observers[o](_chapters);
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

	function getAllEnrichmentsOfChapter(chapter) {
		if(!chapter) {
			chapter = _activeChapter;
		}
		var dimensions = chapter.dimensions;
		var all = [];
		_.each(dimensions, function(d) {
			all.push.apply(all, d);
		});
		return all;
	};

	function getSavedEnrichmentsOfDimension(dimension, chapter) {
		if(!chapter) {
			chapter = _activeChapter;
		}
		var enrichments = chapter.dimensions[dimension.id];
		return enrichments ? enrichments.slice(0) : [];
	}

	function removeChapter(chapter) {
		_.each(_chapters, function(c, index){
			if(c.guid == chapter.guid) {
				_chapters.splice(index, 1);
			}
		});
		saveOnServer();	
	}

	function saveChapter(chapter) {
		var exists = false;
		chapter.type = TYPE_CURATED;
		/*
		if(chapter.type == TYPE_AUTO) {
			chapter.type = TYPE_CURATED;	
		} */
		for(c in _chapters) {
			if(_chapters[c].guid == chapter.guid) {
				setBasicProperties(chapter, false);
				_chapters[c] = chapter;
				exists = true;
			}
		}
		if(!exists) { //if it's a new chapter add it
			setBasicProperties(chapter, true);
			_chapters.push(chapter);
		}
		//sort the chapters again
		_chapters.sort(function(a, b) {
			return a.start - b.start;
		});
		//update the entire resource on the server
		saveOnServer();
	}

	//works for both information cards and enrichments
	function saveChapterLink(dimension, link) {
		if(link.remove) {
			for(var i=0;i<_activeChapter.dimensions[dimension.id].length;i++){
				if(_activeChapter.dimensions[dimension.id][i].uri == link.uri) {
					_activeChapter.dimensions[dimension.id].splice(i, 1);
				}
			}
		} else if(_activeChapter.dimensions[dimension.id]) {
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

	function saveOnServer() {
		dataService.saveResource(_.filter(_chapters, function(c) {
			return c.type == TYPE_CURATED;
		}));
	}

	return {
		initCollectionData : initCollectionData,
		getChapters : getChapters,
		setChapters : setChapters,
		setActiveChapter : setActiveChapter,
		getActiveChapter : getActiveChapter,
		getAllEnrichmentsOfChapter : getAllEnrichmentsOfChapter,
		getSavedEnrichmentsOfDimension : getSavedEnrichmentsOfDimension,
		removeChapter : removeChapter,
		saveChapter : saveChapter,
		saveChapterLink : saveChapterLink,
		addObserver : addObserver
	}

}]);