angular.module('linkedtv').controller('enrichmentController', 
	function($rootScope, $scope, $modal, conf, chapterCollection, 
		entityCollection, enrichmentService, entityProxyService, enrichmentUtils) {
	

	/*-------------------------TAB FUNCTIONS---------------------------*/
	
	$scope.enrichmentUtils = enrichmentUtils;
	$scope.entities = null; //entities are passed to the informationCardModal (editing dialog)
	$scope.activeChapter = null;//holds the up-to-date active chapter
	$scope.activeLinkIndex = 0;//selected slot


	//watch for changes in the active chapter
	$scope.$watch(function () { return chapterCollection.getActiveChapter(); }, function(newValue) {
		$scope.activeChapter = newValue;
	});

	$scope.$watch(function () { return entityCollection.getChapterEntities(); }, function(newValue) {
		if(newValue) {
			$scope.updateEntities(newValue);
		}
	});
	
	//called whenever a chapter is selected
	$scope.updateEntities = function(entities) {
		$scope.entities	= entities;
	}

	$scope.editLink = function(dimension, link) {
		if(dimension.service != 'informationCards') {
			if(link) {
				enrichmentUtils.openLinkDialog(dimension, link);
			} else {
				enrichmentUtils.openMultipleLinkDialog(dimension);
			}
		} else {
			enrichmentUtils.openCardDialog(dimension, link);
		}
	}

	$scope.setActiveCard = function(index) {
		$scope.activeLinkIndex = index;
	};

	$scope.isCardSelected = function(index) {
		return $scope.activeLinkIndex == index ? 'selected' : '';
	};
	
	
});