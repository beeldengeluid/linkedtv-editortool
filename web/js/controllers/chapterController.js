angular.module('linkedtv').controller('chapterController', 
	function($rootScope, $scope, $modal, chapterCollection, chapterService, playerService) {
	
	$scope.resourceUri = $rootScope.resourceUri;	
	$scope.chapters = [];	

	//watch the chapterCollection to see when it is loaded
	/*
	$scope.$watch(function () { return chapterCollection.getChapters(); }, function(newValue) {
		console.debug('loaded the chapters');
		console.debug(newValue);
		$scope.chapters = newValue;
	});*/

	$scope.update = function(chapters) {
		$scope.$apply(function() {			
			$scope.chapters = chapters;
			console.debug($scope.chapters);
		});
	}

	$scope.setActiveChapter = function(chapter) {
		chapterCollection.setActiveChapter(chapter);
		playerService.seek(chapter.start);
	};

	$scope.isChapterSelected = function(chapter) {
		if($rootScope.chapter) {
			return $rootScope.chapter.$$hashKey == chapter.$$hashKey ? 'selected' : '';
		}
		return '';
	};

	$scope.editChapter = function(chapter) {
		$scope.openChapterDialog(chapter)
	}

	$scope.createNewChapter = function() {
		$scope.openChapterDialog(null);
	}

	$scope.openChapterDialog = function(chapter) {

		var modalInstance = $modal.open({
			templateUrl: '/site_media/js/templates/chapterModal.html',
			controller: 'chapterModalController',
			size: 'lg',
			resolve: {				
				chapter : function () {
					return chapter;
				}
			}
		});

		//when the modal is closed (using 'ok', or 'cancel')
		modalInstance.result.then(function (chapter) {
			console.debug('I saved a damn chapter yeah!');
			console.debug(chapter);

			//update the chapter collection (this triggers the $watch at the top)
			chapterCollection.saveChapter(chapter);
		}, function () {
			console.debug('Modal dismissed at: ' + new Date());
		});
	};

	//add the update function as an observer to the chapterCollection
	chapterCollection.addObserver($scope.update);

});