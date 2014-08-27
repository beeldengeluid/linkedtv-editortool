angular.module('linkedtv').controller('informationCardsController', 
	function($rootScope, $scope, $modal, conf, entityProxyService, chapterCollection) {

	/*-------------------------TAB FUNCTIONS---------------------------*/
	
	$scope.activeChapter = null;//holds the up-to-date active chapter
	$scope.activeCardIndex = 0;


	//watch for changes in the active chapter
	$scope.$watch(function () { return chapterCollection.getActiveChapter(); }, function(newValue) {
		console.debug('the active chapter has changed: ');
		console.debug(newValue);
		$scope.activeChapter = newValue;
	});

	$scope.createNewCard = function() {
		$scope.openCardDialog(null);
	}

	$scope.editCard = function() {
		$scope.openCardDialog($scope.activeChapter.cards[$scope.activeCardIndex]);
	}

	//TODO make sure the modal is removed after closing
	$scope.openCardDialog = function(card) {

		var modalInstance = $modal.open({
			templateUrl: '/site_media/js/templates/informationCardModal.html',
			controller: 'informationCardModalController',
			size: 'lg',
			resolve: {				
				card : function () {
					return card;
				}
			}
		});

		//when the modal is closed (using 'ok', or 'cancel')
		modalInstance.result.then(function (card) {
			console.debug('I saved a damn card yeah!');
			console.debug(card);
			if($scope.activeChapter.cards[$scope.activeCardIndex]) {
				$scope.activeChapter.cards[$scope.activeCardIndex] = card;
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
		$scope.activeCardIndex = index;
	};

	$scope.isCardSelected = function(index) {
		return $scope.activeCardIndex == index ? 'selected' : '';
	};
	
});