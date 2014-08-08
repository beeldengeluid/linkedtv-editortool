angular.module('linkedtv').controller('appController',
	function($rootScope, $scope, dataService, timeUtils, imageService, chapterCollection, chapterSlotsMap) {
		
	//wait for the resourceUri to have been extracted from the application URL
	$scope.init = function() {
		//fetch all of this resource's data from the server
		$rootScope.$watch('resourceUri', function(resourceUri){
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
			$scope.loadChapterCollection(resourceData);

		} else {
			// TODO error
		}
	};

	//load the chapter collection (this will trigger the controllers that are listening to the chapterCollection)
	$scope.loadChapterCollection = function(resourceData) {
		var chapters = null;
		if(resourceData.chapters.length == 0) {
			chapters = resourceData.curated.chapters;
		} else {
			chapters = resourceData.chapters;
		}
		//add all the posters to the chapters (FIXME this should be done on the server!!)
		for(var c in chapters) {
			var chapter = chapters[c];
			chapter.poster = imageService.getThumbnail(resourceData.thumbBaseUrl, $rootScope.resourceUri, timeUtils.toMillis(chapter.start));

			//set the default slots based on the provider config
			var slots = [];
			for(var i=0;i<chapterSlotsMap[$rootScope.provider];i++) {
				slots.push({'title' : 'Slot ' + (i+1)});
			}
			chapter.slots = slots;
		}
		chapterCollection.setChapters(chapters);
	}

	$scope.init();
});