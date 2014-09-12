angular.module('linkedtv').directive('foldable', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,

    	scope : {
    		collapsed : '=collapsed',
    		title : '@'
    	},

        templateUrl : '/site_media/js/templates/foldable.html',

    };

}]);