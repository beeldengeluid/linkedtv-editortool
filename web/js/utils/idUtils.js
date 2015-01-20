angular.module('linkedtv').factory('idUtils', ['$rootScope', function($rootScope){

	function generateMediaFragmentId(startMs, endMs) {
		var start = startMs / 1000.0;
		var end = endMs / 1000.0;
		return $rootScope.resourceUri + '#t=' + start + ',' + end;
	}

	var guid = (function() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return function() {
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	  	};
	})();

	return {
		generateMediaFragmentId : generateMediaFragmentId,
		guid : guid
	}
}]);