angular.module('linkedtv').controller('enrichmentController', 
	function($rootScope, $scope, $modal, conf, chapterCollection, 
		entityCollection, enrichmentCollection, enrichmentService, entityProxyService) {
	

	/*-------------------------TAB FUNCTIONS---------------------------*/
	
	$scope.entities = null; //entities are passed to the informationCardModal (editing dialog)
	$scope.activeChapter = null;//holds the up-to-date active chapter
	$scope.activeLinkIndex = 0;//selected slot


	//watch for changes in the active chapter
	$scope.$watch(function () { return chapterCollection.getActiveChapter(); }, function(newValue) {
		console.debug('the active chapter has changed: ');
		console.debug(newValue);
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

	$scope.createNewLink = function() {
		$scope.openLinkDialog(null);
	}

	$scope.editLink = function() {
		$scope.openLinkDialog($scope.activeChapter.enrichments[$scope.activeLinkIndex]);
	}

	$scope.openLinkDialog = function() {

		var modalInstance = $modal.open({
			templateUrl: '/site_media/js/templates/enrichmentModal.html',
			controller: 'enrichmentModalController',
			size: 'lg',
			resolve: {
				entities: function () {
					return $scope.entities;
				}
			}
		});

		//when the modal is closed (using 'ok', or 'cancel')
		modalInstance.result.then(function (card) {
			console.debug('I saved a damn card yeah!');
			console.debug(card);
			if($scope.activeChapter.cards[$scope.activeLinkIndex]) {
				$scope.activeChapter.cards[$scope.activeLinkIndex] = card;
			} else {
				$scope.activeChapter.cards.push(card);
			}
			console.debug($scope.activeChapter);

			//update the chapter collection (this triggers the $watch at the top)
			chapterCollection.saveChapter($scope.activeChapter);
		}, function () {
			console.debug('Modal dismissed at: ' + new Date());
		});
	};

	$scope.setActiveCard = function(index) {
		$scope.activeLinkIndex = index;
	};

	$scope.isCardSelected = function(index) {
		return $scope.activeLinkIndex == index ? 'selected' : '';
	};
	
	
});