angular.module('linkedtv').directive('dimensionTab', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

    	scope : {    		
    		dimension : '='
    	},

        templateUrl : '/site_media/js/templates/dimensionTab.html',

    };

}]);