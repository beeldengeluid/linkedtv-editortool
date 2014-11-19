angular.module('linkedtv').controller('chapterModalController',
	['$scope', '$modalInstance', 'timeUtils', 'chapter',
	function ($scope, $modalInstance, timeUtils, chapter) {

	$scope.chapter = chapter || {};

	$scope.saveChapter = function () {
		if($scope.chapter.label && $scope.chapter.prettyStart && $scope.chapter.prettyEnd) {
			$scope.chapter.start = timeUtils.toMillis($scope.chapter.prettyStart);
			$scope.chapter.end = timeUtils.toMillis($scope.chapter.prettyEnd)
			$modalInstance.close($scope.chapter);
		} else {
			alert('Please fill out the entire form');
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