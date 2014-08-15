angular.module('linkedtv').factory('enrichmentCollection', [function() {

	var _activeChapter = null;
	var _enrichments = {}; //contains all enrichments of all chapters

	function updateActiveChapter(chapter) {
		_activeChapter = chapter;
	}

	function getEnrichments() {
		return _enrichments;
	}

	function addEnrichmentsToActiveChapter(enrichments, replace) {
		if(replace && _activeChapter) {
			_enrichments[_activeChapter.$$hashKey] = enrichments;
		}
	}

	function getEnrichmentsOfActiveChapter() {
		if(_activeChapter && _enrichments[_activeChapter.$$hashKey]) {
			return _enrichments[_activeChapter.$$hashKey];
		}
		return null;
	}

	return {
		updateActiveChapter : updateActiveChapter,
		getEnrichmentsOfActiveChapter : getEnrichmentsOfActiveChapter,
		getEnrichments : getEnrichments,
		addEnrichmentsToActiveChapter : addEnrichmentsToActiveChapter
	}

}]);