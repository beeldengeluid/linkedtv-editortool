angular.module('linkedtv').directive('entityTab', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/entityTab.html',

    };

}]);