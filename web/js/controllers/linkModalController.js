angular.module('linkedtv').controller('linkModalController', 
	['$scope', '$modalInstance', 'dimension', 'link', function ($scope, $modalInstance, dimension, link) {
		

	$scope.link = link;	
	$scope.dimension = dimension;//currently selected dimension

	//----------------------------BUTTON PANEL------------------------------

	$scope.ok = function () {		
		$modalInstance.close({dimension: $scope.dimension, link : $scope.link});
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};	

	$scope.removeLink = function() {
		$scope.link.remove = true;
		$modalInstance.close({dimension: $scope.dimension, link : $scope.link});	
	}
	
}]);