angular.module('linkedtv').controller('playerController', function($sce, $scope, videoModel, playerService){
	
	$scope.canPlayVideo = false;
	
	//watch the rootScope that updates once the main resourceData is loaded (it contains also the playoutUrl)
	$scope.$watch(function () { return videoModel.getVideo(); }, function(video) {
		if(video) {			
			var playoutUrl = $sce.trustAsResourceUrl(video.playoutUrl);
			$scope.title = video.title;
			$scope.canPlayVideo = playerService.playFragment(playoutUrl, 0);
		}
	});

});