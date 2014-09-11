angular.module('linkedtv').controller('chapterModalController', 
	['$scope', '$modalInstance', 'entityProxyService', 'shotCollection', 'chapter',
	function ($scope, $modalInstance, chapterCollection, shotCollection, chapter) {
	
	$scope.chapter = chapter || {};
	$scope.shots = shotCollection.getShots() || [];
	$scope.selectionStart = $scope.chapter.start;
	$scope.selectionEnd = $scope.chapter.end;//the start time of the last shot
	$scope.settingStart = true;

	console.debug($scope.selectionStart + ' - ' + $scope.selectionEnd);

	$scope.setSelection = function(shot) {		
		if($scope.settingStart) {
			$scope.setSelectionStart(shot);
		} else {
			$scope.setSelectionEnd(shot);
		}
	}

	$scope.setSelectionStart = function(shot) {
		$scope.selectionStart = shot.start;
		$scope.selectionEnd = -1;
		$scope.settingStart = !$scope.settingStart;
	}

	$scope.setSelectionEnd = function(shot) {
		if(shot.start > $scope.selectionStart) {
			$scope.selectionEnd = shot.start;
			$scope.settingStart = !$scope.settingStart;
			$scope.chapter.start = $scope.selectionStart;
			$scope.chapter.end = $scope.selectionEnd;
		}
	}

	$scope.withinRange = function(shot) {		
		//first check if the shot is in the selected shots
		if($scope.selectionStart == shot.start) {
			return 'starting-point';
		}
		if($scope.selectionEnd == shot.start) {
			return 'in-range';
		}
		//then check if it's within the range of two selected shots
		if($scope.selectionEnd != -1) {
			return shot.start >= $scope.selectionStart && shot.start <= $scope.selectionEnd ? 'in-range' : '';
		}
		return '';
	}

	$scope.saveChapter = function () {
		if($scope.chapter.label) {
			$modalInstance.close($scope.chapter);
		} else {
			alert('Please add a title');
		}
	};

	$scope.deleteChapter = function () {		
		$scope.chapter.remove = true;
		$modalInstance.close($scope.chapter);
		
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};		
	
}]);