angular.module('linkedtv').controller('appController',
	function($rootScope, $scope, conf, dataService, chapterCollection, entityCollection, videoModel) {	
	
	$scope.resourceData = null;

	//fetch all of this resource's data from the server
	$rootScope.$watch('resourceUri', function(resourceUri) {
		if(resourceUri) {
			dataService.getResourceData(true, $scope.dataLoaded);
		}
	});	

	//when the resource data has been loaded, start populating the application data
	$scope.dataLoaded = function(resourceData) {
		console.debug('Loaded the SPARQL data from the server');
		console.debug(resourceData);
		$scope.resourceData = resourceData;
		dataService.getCuratedData($scope.curatedDataLoaded);
	};

	//TODO finish testing this!!!
	$scope.curatedDataLoaded = function(curatedData) {					
		console.debug('Loaded the curated/Redis data from the server');
		console.debug(curatedData);

		//load the videoModel with metadata
		videoModel.initModelData($scope.resourceData);
					
		//load the chapterCollection with chapter data
		chapterCollection.initCollectionData($rootScope.provider, $scope.resourceData, curatedData);

		//load the entityCollection with entity data
		entityCollection.initCollectionData($scope.resourceData.nes);		
	}

});