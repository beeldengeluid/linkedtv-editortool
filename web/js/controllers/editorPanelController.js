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
		if(mediaResource.chapters) {
			console.debug('RESOURCE WAS PUBLISHED');
			chapterCollection.setChapters(mediaResource.chapters);
			//chapterCollection.setActiveChapter(chapterCollection.getChapters()[0]);
			chapterCollection.saveOnServer();
		} else {
			alert('The data could not be published');
		}
	}

	$scope.unpublishResource = function() {
		dataService.publishResource(chapterCollection.getCuratedChapters(), true, $scope.resourceUnpublished);
	}

	$scope.resourceUnpublished = function(mediaResource) {
		chapterCollection.removeCuratedChapterPublicationURIs();
		alert('The data was removed from the LinkedTV platform');
	}
	
});