/*
The chapter collection contains all of the curated data:
- annotations (consisting of: 'entities' & 'enrichments' & 'information cards')
- timing information per annotation
*/

angular.module('linkedtv').factory('chapterCollection', 
	['conf', 'imageService', 'entityCollection', 'shotCollection', 'dataService',
	 function(conf, imageService, entityCollection, shotCollection, dataService) {

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
			console.debug('Loading curations stored in the ET Redis...');
			chapters = curatedData.chapters;
			_.each(chapters, function(c) {
				c.type = TYPE_CURATED;
			});
		}
		//always add the autogenerated chapters
		addAutogeneratedChapterData(chapters, resourceData);
		
		//sort the chapters by start time
		chapters.sort(function(a, b) {
			return a.start - b.start;
		});
		setChapters(chapters);
	}

	//This function loads
	function addAutogeneratedChapterData(chapters, resourceData) {		
		var autoChapters = resourceData.chapters;		
		_.each(autoChapters, function(c) {
			c.type = TYPE_AUTO;
			chapters.push(c);
		});
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
		//make sure all the basic properties are added to each chapter
		_.each(chapters, function(c) {
			setBasicProperties(c, true);
		});
		_chapters = chapters;
		notifyObservers();
	}

	function getChapters() {
		return _chapters;
	}

	function getCuratedChapters() {
		return _.filter(_chapters, function(c) {
			return c.type == TYPE_CURATED;
		})
	}

	//TODO also remove the URIs from the annotations
	function removeCuratedChapterPublicationURIs() {
		var chapters = getCuratedChapters();
		console.debug('CURATED CHAPTERS');
		console.debug(chapters);
		_.each(chapters, function(c) {
			_.each(c.dimensions, function(k, v) {
				_.each(k.annotations, function(a) {
					delete a.mfURI;
					delete a.bodyURI;
					delete a.annotationURI;
				})	
			});	
			delete c.mfURI;
			delete c.bodyURI;
			delete c.annotationURI;
			console.debug(c);
		});
		//make sure the URIs are removed from Redis as well
		saveOnServer();
	}

	function setActiveChapter(activeChapter) {
		_activeChapter = activeChapter;
		entityCollection.updateChapterEntities(_activeChapter);
		shotCollection.updateChapterShots(_activeChapter);
	}

	//TODO waarom wordt deze zo vaak aangeroepen
	function getActiveChapter() {
		//console.debug(_activeChapter);
		return _activeChapter;
	}

	function getAllEnrichmentsOfChapter(chapter) {
		if(!chapter) {
			chapter = _activeChapter;
		}
		var dimensions = chapter.dimensions;
		var all = [];
		_.each(dimensions, function(d) {
			all.push.apply(all, d.annotations);
		});
		return all;
	};

	function getSavedEnrichmentsOfDimension(dimension, chapter) {
		if(!chapter) {
			chapter = _activeChapter;
		}
		var enrichments = chapter.dimensions[dimension.id] ? chapter.dimensions[dimension.id].annotations : null;
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

	function saveChapterLinks(dimension, links) {
		_activeChapter.dimensions[dimension.id] = {
			id : dimension.id,
			label : dimension.label,
			service : dimension.service,
			annotations : links
		};
		//update the chapter collection
		saveChapter(_activeChapter);
	}

	//works for both information cards and enrichments
	function saveChapterLink(dimension, link) {
		if(link.remove) {
			for(var i=0;i<_activeChapter.dimensions[dimension.id].annotations.length;i++) {
				if(_activeChapter.dimensions[dimension.id].annotations[i].uri == link.uri) {
					_activeChapter.dimensions[dimension.id].annotations.splice(i, 1);
				}
			}
		} else if(_activeChapter.dimensions[dimension.id]) {
			var exists = false;
			for(var i=0;i<_activeChapter.dimensions[dimension.id].annotations.length;i++){
				if(_activeChapter.dimensions[dimension.id].annotations[i].uri == link.uri) {
					_activeChapter.dimensions[dimension.id].annotations[i] = link;
					exists = true;
				}
			}
			if (!exists) {
				_activeChapter.dimensions[dimension.id].annotations.push(link);
			}
		} else {
			//add a new dimension (add the config properties + a list to hold the annotations)
			console.debug('======ADDING A NEW ENRICHMENT DIMENSION!!====');
			_activeChapter.dimensions[dimension.id] = {
				id : dimension.id,
				label : dimension.label,
				service : dimension.service,
				annotations : [link]
			};
		}
		saveChapter(_activeChapter);
	}

	function saveOnServer() {
		dataService.saveResource(getChapters());
	}

	return {
		initCollectionData : initCollectionData,
		getCuratedChapters : getCuratedChapters,
		getChapters : getChapters,
		setChapters : setChapters,
		saveOnServer : saveOnServer,
		setActiveChapter : setActiveChapter,
		getActiveChapter : getActiveChapter,
		getAllEnrichmentsOfChapter : getAllEnrichmentsOfChapter,
		getSavedEnrichmentsOfDimension : getSavedEnrichmentsOfDimension,
		removeChapter : removeChapter,
		saveChapter : saveChapter,
		saveChapterLink : saveChapterLink,
		saveChapterLinks : saveChapterLinks,
		addObserver : addObserver,
		removeCuratedChapterPublicationURIs : removeCuratedChapterPublicationURIs
	}

}]);