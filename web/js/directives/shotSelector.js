angular.module('linkedtv').directive('shotSelector', ['shotCollection', function(shotCollection){
	
	return {
    	restrict : 'E',

    	replace : true,
    	
        scope : {
            start : '=start',
            end : '=end',
            chapter : '@', //true or false
            collapsed : '@' //doesn't work properly yet
        },

    	link: function ($scope, $element, $attributes) {
            if($scope.chapter == 'true') {
                $scope.shots = shotCollection.getChapterShots();
            } else {
                $scope.shots = shotCollection.getShots() || [];
            }
            $scope.settingStart = true;

            $scope.withinRange = function(shot) {       
                //first check if the shot is in the selected shots
                if($scope.start === shot.start) {
                    return 'starting-point';
                }
                if($scope.start === shot.start) {
                    return 'in-range';
                }
                //then check if it's within the range of two selected shots
                if($scope.start !== -1) {
                    return shot.start >= $scope.start && shot.start <= $scope.end ? 'in-range' : '';
                }
                return '';
            }

            $scope.setSelection = function(shot) {
                if($scope.settingStart) {
                    $scope.setSelectionStart(shot);
                } else {
                    $scope.setSelectionEnd(shot);
                }
            }

            $scope.setSelectionStart = function(shot) {
                $scope.start = shot.start;
                $scope.end = -1;
                $scope.settingStart = !$scope.settingStart;
            }

            $scope.setSelectionEnd = function(shot) {
                if(shot.start > $scope.start) {
                    $scope.end = shot.start;
                    $scope.settingStart = !$scope.settingStart;
                    //$scope.start = $scope.selectionStart;
                    //$scope.end = $scope.selectionEnd;
                }
            }
        },

        templateUrl : '/site_media/js/templates/shotSelector.html'

    };

}]);