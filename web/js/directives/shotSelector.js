angular.module('linkedtv').directive('shotSelector', [function(){
	
	return {
    	restrict : 'E',

    	replace : true,
    	/*
    	link: function ($scope, $element, $attributes) {
			$scope.shots = $scope.$eval($attributes.shots);
        },*/

        templateUrl : '/site_media/js/templates/shotSelector.html'

    };

}]);