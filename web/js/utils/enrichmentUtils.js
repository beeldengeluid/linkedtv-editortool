angular.module('linkedtv').factory('enrichmentUtils', ['$modal', 'chapterCollection', function($modal, chapterCollection) {

	function openMultipleLinkDialog(dimension) {
		console.debug(dimension);
		var modalInstance = $modal.open({
			templateUrl: '/site_media/js/templates/multipleLinkModal.html',
			controller: 'multipleLinkModalController',
			size: 'lg',
			resolve: {
				dimension: function () {
					return dimension;
				}
			}
		});

		//when the modal is closed (using 'ok', or 'cancel')
		modalInstance.result.then(function (data) {
			console.debug('I saved some enrichments');
			var activeChapter = chapterCollection.getActiveChapter();
			activeChapter.dimensions[data.dimension.id] = data.enrichments;
			
			//update the chapter collection
			chapterCollection.saveChapter(activeChapter);
		}, function () {
			console.debug('Modal dismissed at: ' + new Date());
		});
	};

	function openLinkDialog(dimension, link) {
		console.debug(dimension);
		var modalInstance = $modal.open({
			templateUrl: '/site_media/js/templates/linkModal.html',
			controller: 'linkModalController',
			size: 'lg',
			resolve: {
				dimension: function () {
					return dimension;
				},
				link: function() {
					return link;
				}
			}
		});

		//when the modal is closed (using 'ok', or 'cancel')
		modalInstance.result.then(function (data) {
			console.debug('I saved a link');
			console.debug(data);
			chapterCollection.saveChapterLink(data.dimension, data.link);
		}, function () {
			console.debug('Modal dismissed at: ' + new Date());
		});
	};

	function openCardDialog(dimension, link) {		
		var modalInstance = $modal.open({
			templateUrl: '/site_media/js/templates/informationCardModal.html',
			controller: 'informationCardModalController',
			size: 'lg',
			resolve: {				
				dimension : function () {
					return dimension;
				},
				link: function() {
					return link;
				}
			}
		});

		//when the modal is closed (using 'ok', or 'cancel')
		modalInstance.result.then(function (data) {
			console.debug('I saved a damn card yeah!');			
			chapterCollection.saveChapterLink(data.dimension, data.link);
		}, function () {
			console.debug('Modal dismissed at: ' + new Date());
		});
	};

	/*------------------------formatting service specific functions (could also be done on server...)---------------------*/

	

	return {
		openMultipleLinkDialog : openMultipleLinkDialog,
		openLinkDialog : openLinkDialog,
		openCardDialog : openCardDialog
	}
}]);