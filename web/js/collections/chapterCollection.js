angular.module('linkedtv').factory('chapterCollection', [function() {
	
	var chapters = [];

	function getChapters() {
		return chapters;
	}

    function setChapters(newChapters) {
		chapters = newChapters;
	}

	function setChapterData(chapterData) {

	}

	return {
		getChapters : getChapters,
		setChapters : setChapters
	}

}]);