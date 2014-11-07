angular.module('linkedtv').controller('editorPanelController', 
	function($rootScope, $scope, conf, chapterCollection, dataService) {
	
	$scope.activeChapter = null;
	$scope.activeDimension = conf.programmeConfig.dimensions[0];
	$scope.conf = conf;	

	//watch the chapterCollection to see what chapter has been selected
	$scope.$watch(function () { return chapterCollection.getActiveChapter(); }, function(newValue) {
		if(newValue) {
			$scope.activeChapter = newValue;
		}
	});

	$scope.setActiveDimension = function(dimension) {
		$scope.activeDimension = dimension;
	}

	$scope.publishResource = function() {
		dataService.publishResource(chapterCollection.getCuratedChapters(), false, $scope.resourcePublished);
	}

	$scope.resourcePublished = function(mediaResource) {
		//TODO animate some stuff
		alert('The data was published in the LinkedTV platform');		
	}

	$scope.unpublishResource = function() {
		dataService.publishResource(chapterCollection.getCuratedChapters(), true, $scope.resourceUnpublished);
	}

	$scope.resourceUnpublished = function(mediaResource) {
		//TODO animate some stuff
		alert('The data was removed from the LinkedTV platform');
	}
	
});