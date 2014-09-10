angular.module('linkedtv').controller('chapterModalController', 
	['$scope', '$modalInstance', 'entityProxyService', 'chapter',
	function ($scope, $modalInstance, chapterCollection, chapter) {
	
	$scope.chapter = chapter || {};

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