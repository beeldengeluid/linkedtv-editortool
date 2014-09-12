angular.module('linkedtv').filter('prettyTime', function(timeUtils) {
	return function(input) {
		input = input || 0;
		return timeUtils.toPrettyTime(input);
    };
});