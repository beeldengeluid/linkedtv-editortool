angular.module('linkedtv').controller('appController',
	function($rootScope, $scope, conf, dataService, chapterCollection, entityCollection) {
		
	//wait for the resourceUri to have been extracted from the application URL
	$scope.init = function() {
		//fetch all of this resource's data from the server
		$rootScope.$watch('resourceUri', function(resourceUri) {
			dataService.getResourceData(resourceUri, true, $scope.dataLoaded);
		});
	};

	//when the resource data has been loaded, start populating the application data
	$scope.dataLoaded = function(resourceData) {
		if(resourceData != null) {
			console.debug('Loaded data from the server');
			
			//FIXME get rid of the resourceData on the rootscope!!
			$rootScope.resourceData = resourceData;

			
			//load the chapterCollection with chapter data
			chapterCollection.initCollectionData($rootScope.resourceUri, $rootScope.provider, resourceData);

			//load the entityCollection with entity data
			entityCollection.initCollectionData($rootScope.resourceData.nes);

			//TODO load other stuff (slotCollection & enrichmentCollection)

		} else {
			// TODO error
		}
	};

	$scope.init();
});