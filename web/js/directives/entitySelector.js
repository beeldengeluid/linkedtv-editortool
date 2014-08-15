angular.module('linkedtv').directive('entitySelector', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/entitySelector.html',

    };

}]);