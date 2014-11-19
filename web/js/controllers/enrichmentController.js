angular.module('linkedtv').controller('enrichmentController',
	function($rootScope, $scope, $modal, conf, chapterCollection,
		entityCollection, enrichmentService, entityProxyService, enrichmentUtils) {

	$scope.enrichmentUtils = enrichmentUtils;
	$scope.activeChapter = null;//holds the up-to-date active chapter
	$scope.activeLinkIndex = 0;//selected slot


	//watch for changes in the active chapter
	$scope.$watch(function () { return chapterCollection.getActiveChapter(); }, function(newValue) {
		$scope.activeChapter = newValue;
	});

	$scope.editSingleEnrichment = function(dimension, enrichment) {
		if(dimension.service.id == 'informationCards') {
			enrichmentUtils.openCardDialog(dimension, enrichment);
		} else {
			enrichmentUtils.openLinkDialog(dimension, enrichment);
		}
	}

	$scope.editMultipleEnrichments = function(dimension) {
		if(dimension.service.id != 'informationCards') {
			enrichmentUtils.openMultipleLinkDialog(dimension);
		}
	}

	$scope.setActiveCard = function(index) {
		$scope.activeLinkIndex = index;
	};

	$scope.isCardSelected = function(index) {
		return $scope.activeLinkIndex == index ? 'selected' : '';
	};


});