angular.module('linkedtv').factory('entityUtils', ['entityCollection', 'chapterCollection', 
	function(entityCollection, chapterCollection) {


	function getConfidenceClass(entity) {
		var c = parseFloat(entity.confidence);
		if(c <= 0) {
			return 'verylow';
		} else if (c > 0 && c <= 0.2) {
			return 'low';
		} else if (c > 0.2 && c <= 0.4) {
			return 'fair';
		} else if (c > 0.4 && c <= 0.6) {
			return 'medium';
		} else if (c > 0.6 && c <= 0.8) {
			return 'high';
		} else if (c > 0.8) {
			return 'veryhigh';
		}
	};

	

	return {		
		getConfidenceClass : getConfidenceClass
	}
}]);