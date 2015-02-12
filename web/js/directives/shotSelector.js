angular.module('linkedtv').directive('shotSelector',
    ['shotCollection', 'timeUtils', function(shotCollection, timeUtils) {

	return {
    	restrict : 'E',

    	replace : true,

        scope : {
            start : '=',
            end : '=',
            prettyStart : '=prettystart',
            prettyEnd : '=prettyend',
            poster : '=',
            chapter : '@', //true or false
            collapsed : '@', //doesn't work properly yet
            title : '@'
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
                if($scope.start != -1) {
                    if (parseInt(shot.start) >= parseInt($scope.start) && parseInt(shot.end) <= parseInt($scope.end)) {
                        return 'in-range';
                    } else {
                        return '';
                    }

                }
                return '';
            }

            $scope.setSelection = function(shot) {
                if($attributes.poster) {
                    $scope.poster = shot.poster;
                }
                if($attributes.start && $attributes.end) {
                    if($scope.settingStart) {
                        $scope.setSelectionStart(shot);
                    } else {
                        $scope.setSelectionEnd(shot);
                    }
                }
            }

            $scope.updatePrettyTimes = function() {
                $scope.prettyStart = timeUtils.toPrettyTime($scope.start);
                $scope.prettyEnd = timeUtils.toPrettyTime($scope.end);
            }

            $scope.setSelectionStart = function(shot) {
                $scope.start = shot.start;
                $scope.end = -1;
                $scope.settingStart = !$scope.settingStart;
                $scope.updatePrettyTimes();
            }

            $scope.setSelectionEnd = function(shot) {
                if(shot.start > $scope.start) {
                    $scope.end = shot.end;
                    $scope.settingStart = !$scope.settingStart;
                    $scope.updatePrettyTimes();
                }
            }
        },

        templateUrl : '/site_media/js/templates/shotSelector.html'

    };

}]);