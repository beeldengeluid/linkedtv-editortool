angular.module('linkedtv').directive('navigationBar', function() {
	
	return {
		restrict : 'E',

		replace : true,

		scope : {
			user : '@'
		},

		templateUrl : '/site_media/js/templates/navigationBar.html'
	};

});