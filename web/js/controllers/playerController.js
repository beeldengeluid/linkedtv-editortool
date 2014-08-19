angular.module('linkedtv').controller('playerController', function($sce, $rootScope, $scope, playerService){
	
	$scope.canPlayVideo = false;
	
	//watch the rootScope that updates once the main resourceData is loaded (it contains also the playoutUrl)
	$rootScope.$watch('resourceData', function(resourceData){
		if(resourceData) {			
			var playoutUrl = $sce.trustAsResourceUrl(resourceData.locator);			
			$scope.canPlayVideo = playerService.playFragment(playoutUrl, 0);
		}
	});

});