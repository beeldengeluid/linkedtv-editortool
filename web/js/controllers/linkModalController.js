angular.module('linkedtv').controller('linkModalController',
	['$scope', '$modalInstance', 'timeUtils', 'dimension', 'link',
	function ($scope, $modalInstance, timeUtils, dimension, link) {


	$scope.link = link || {};
	$scope.dimension = dimension;//currently selected dimension

	//----------------------------BUTTON PANEL------------------------------

	$scope.ok = function () {
		if($scope.link.url && $scope.link.label) {
			$scope.link.start = timeUtils.toMillis($scope.link.prettyStart);
			$scope.link.end = timeUtils.toMillis($scope.link.prettyEnd);
			$modalInstance.close({dimension: $scope.dimension, link : $scope.link});
		} else {
			alert('Please enter a URL and a label');
		}
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.removeLink = function() {
		$scope.link.remove = true;
		$modalInstance.close({dimension: $scope.dimension, link : $scope.link});
	}

}]);