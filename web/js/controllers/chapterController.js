angular.module('linkedtv').controller('chapterController',
	function($scope, $modal, chapterCollection, playerService) {

	$scope.allChapters = [];
	$scope.chapters = [];
	$scope.showCuratedOnly = false;
	$scope.shotsCollapsed = true;

	//needed since the $watch function on the chapterCollection no longer works
	$scope.update = function(chapters) {
		$scope.safeApply(function() {
			$scope.allChapters = chapters;
			$scope.chapters = chapters;
			$scope.applyChapterFilter();
		});
	};

	$scope.safeApply = function(fn) {
		var phase = this.$root.$$phase;
		if(phase == '$apply' || phase == '$digest') {
			if(fn && (typeof(fn) === 'function')) {
				fn();
			}
	  	} else {
			this.$apply(fn);
		}
	};

	$scope.toggleShowCuratedOnly = function() {
		$scope.showCuratedOnly = !$scope.showCuratedOnly;
		$scope.applyChapterFilter();
	};

	$scope.applyChapterFilter = function() {
		if($scope.showCuratedOnly) {
			$scope.chapters = _.filter($scope.allChapters, function(c) {
				return c.type == 'curated';
			})
		} else {
			$scope.chapters = $scope.allChapters;
		}
	}

	$scope.setActiveChapter = function(chapter) {
		chapterCollection.setActiveChapter(chapter);
		playerService.seek(chapter.start);
	};

	$scope.isChapterSelected = function(chapter) {
		if(chapterCollection.getActiveChapter()) {
			return chapterCollection.getActiveChapter().guid == chapter.guid ? 'selected' : '';
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
		if(chapter) {
			//copy the chapter (FIXME this is a very nasty bit! It's easy to overlook this when you extend your chapter object!!)
			chapter = {
				annotationURI: chapter.annotationURI,
				mediaFragmentId : chapter.mediaFragmentId,
				solrId : chapter.solrId,
				bodyURI: chapter.bodyURI,
				confidence: chapter.confidence,
				dimensions: chapter.dimensions,
				end: chapter.end,
				prettyEnd: chapter.prettyEnd,
				guid: chapter.guid,
				label: chapter.label,
				mfURI: chapter.mfURI,
				poster: chapter.poster,
				relevance: chapter.relevance,
				start: chapter.start,
				prettyStart: chapter.prettyStart,
				type: chapter.type
			}
		}
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
			console.debug(chapter);
			if(chapter.remove) {
				chapterCollection.removeChapter(chapter);
			} else {
				//update the chapter collection
				chapterCollection.saveChapter(chapter, true);
			}

		}, function () {
			console.debug('Modal dismissed at: ' + new Date());
		});
	};

	//add the update function as an observer to the chapterCollection
	chapterCollection.addObserver($scope.update);

});