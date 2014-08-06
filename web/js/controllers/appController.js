angular.module('linkedtv').controller('appController', function($rootScope, $scope, dataService) {
		

	$scope.init = function() {
		$rootScope.$watch('resourceUri', function(resourceUri){
			dataService.getResourceData(resourceUri, true, $scope.dataLoaded);
		});
	};

	$scope.dataLoaded = function(resourceData) {
		if(resourceData != null) {
			console.debug('Adding fetched data to rootScope');
			$rootScope.resourceData = resourceData;
		} else {
			// TODO error
		}
	};

	$scope.init();
});