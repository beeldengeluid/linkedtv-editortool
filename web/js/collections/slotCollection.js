angular.module('linkedtv').factory('slotCollection', [function() {
		
	var _slots = [];
	
	function getSlots() {
		return _slots;
	}

	function updateChapterSlots(chapter) {
		_slots = chapter.slots;
	}

	return {
		getSlots : getSlots,
		updateChapterSlots : updateChapterSlots
	}

}]);