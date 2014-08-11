angular.module('linkedtv').controller('slotsController', function($rootScope, $scope, conf, slotCollection, entityService) {

	$scope.slots = null; //will be filled when chapter data has been loaded
	$scope.activeSlotIndex = 0;

	$scope.$watch(function () { return slotCollection.getSlots(); }, function(newValue) {		
		$scope.slots = newValue;
		$scope.activeSlotIndex = 0;
	});

	$scope.addEntityToSlot = function() {
		if($scope.activeEntities.length > 0) {

			//use the entity label for the slot title
			$scope.slots[$scope.activeSlotIndex].title = $scope.activeEntities[0];

			//set the loading image to the slot
			$scope.slots[$scope.activeSlotIndex].image = conf.loadingImage;

			//find the dbpedia url to fetch info from the entityProxy
			var label = $scope.entities[$scope.activeEntities[0]];
			var uri = null;
			var e = null;
			for (var i in label) {
				e = label[i];
				//only dbpedia uri's are supported
				console.debug(e);
				if (e.disambiguationURL && e.disambiguationURL.indexOf('dbpedia.org') != -1) {
					uri = e.disambiguationURL;
					break;
				}
			}
			console.debug('dbpediaUri: ' + uri);
			entityService.getEntityDBPediaInfo(uri, $scope.entityInfoLoaded);
		}
	}

	$scope.entityInfoLoaded = function(data) {
		console.debug(data);
		for (key in data) {
			if (data[key] && data[key].thumb) {
				$scope.$apply(function() {
					$scope.slots[$scope.activeSlotIndex].image = data[key].thumb[0];
				});
				break;
			} else {
				$scope.slots[$scope.activeSlotIndex].image = null;
			}
		}
		//reset the activeEntities
		$scope.activeEntities = [];
	}

	$scope.setActiveSlotIndex = function(slot) {
		$scope.activeSlotIndex = slot;
	};

	$scope.isSlotSelected = function(slot) {
		return $scope.activeSlotIndex == slot ? 'selected' : '';
	};
	
});