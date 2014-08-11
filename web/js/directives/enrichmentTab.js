angular.module('linkedtv').directive('enrichmentTab', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

        templateUrl : '/site_media/js/templates/enrichmentTab.html',

    };

}]);