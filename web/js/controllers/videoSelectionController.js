angular.module('linkedtv').controller('videoSelectionController', 
	function($rootScope, $scope, videoSelectionService, videoCollection) {

	$scope.videos = null;

	$scope.update = function(videos) {
		console.debug('Videos loaded');
		if(videos) {
			$scope.$apply(function(){
				$scope.videos = videos;
			});
		}
	};

	$scope.videosLoaded = function(videos) {
		videoCollection.initCollectionData(videos);
	};

	$scope.setActiveVideo = function(video) {
		window.location.assign('http://' + location.host + '/user/' + $rootScope.provider + '/' + video.id);
	};

	//add the update function as an observer to the videoCollection
	videoCollection.addObserver($scope.update);

});