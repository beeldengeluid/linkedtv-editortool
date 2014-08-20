angular.module('linkedtv').controller('chapterModalController', 
	['$scope', '$modalInstance', 'entityProxyService', 'chapter',
	function ($scope, $modalInstance, chapterCollection, chapter) {
	
	$scope.chapter = chapter || {};

	$scope.ok = function () {
		if($scope.chapter.label) {
			$modalInstance.close($scope.chapter);
		} else {
			alert('Please add a title');
		}
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};		
	
}]);