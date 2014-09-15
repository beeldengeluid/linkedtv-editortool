angular.module('linkedtv').controller('appController',
	function($rootScope, $scope, conf, dataService, chapterCollection, entityCollection, 
		shotCollection, videoModel, videoCollection, videoSelectionService) {	
	
	$scope.resourceData = null;
	$scope.loading = true;

	//fetch all of this resource's data from the server
	$rootScope.$watch('resourceUri', function(resourceUri) {
		if(resourceUri) {
			dataService.getResourceData(true, $scope.dataLoaded);
		}
	});

	//fetch the video collection as soon as the provider is added to the rootScope
	$rootScope.$watch('provider', function(provider) {
		videoSelectionService.getVideosOfProvider(provider, $scope.videosLoaded);
	});

	$scope.videosLoaded = function(videos) {
		videoCollection.initCollectionData(videos);
	};

	//when the resource data has been loaded, start populating the application data
	$scope.dataLoaded = function(resourceData) {
		console.debug('Loaded the SPARQL data from the server');
		console.debug(resourceData);
		$scope.resourceData = resourceData;
		dataService.getCuratedData($scope.curatedDataLoaded);
	};

	$scope.curatedDataLoaded = function(curatedData) {					
		console.debug('Loaded the curated/Redis data from the server');
		console.debug(curatedData);

		//load the videoModel with metadata
		videoModel.initModelData($scope.resourceData);
					
		//load the chapterCollection with chapter data
		chapterCollection.initCollectionData($rootScope.provider, $scope.resourceData, curatedData);

		//load the entityCollection with entity data
		entityCollection.initCollectionData($scope.resourceData.nes);		

		//load the shotCollection with shot data
		shotCollection.initCollectionData($scope.resourceData);

		
		$scope.$apply(function() {
			$scope.loading = false;
		});
	}

});