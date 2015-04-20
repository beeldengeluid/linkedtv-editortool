angular.module('linkedtv').factory('enrichmentUtils', ['$modal', 'chapterCollection', 'timeUtils', 'enrichmentService',
	function($modal, chapterCollection, timeUtils, enrichmentService) {

	function openMultipleLinkDialog(dimension) {
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
			chapterCollection.removeObserver();//the observer was added in the modal to react to found expanded entities
			chapterCollection.saveEnrichments(
				data.dimension,
				data.savedEnrichments,
				data.freshlySavedEnrichments,
				data.allEnrichments,
				data.queries
			);
		}, function () { //when the modal is closed otherwise (e.g. using the escape button)
			enrichmentService.cancelRequest();
			chapterCollection.removeObserver();//the observer was added in the modal to react to found expanded entities
		});
	};

	function openLinkDialog(dimension, link) {
		if(link) {
			link.prettyStart = timeUtils.toPrettyTime(link.start);
			link.prettyEnd = timeUtils.toPrettyTime(link.end);
		}
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
			chapterCollection.saveEnrichment(data.dimension, data.link, false);
		}, function () {
			//
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
			chapterCollection.removeObserver();//the observer was added in the modal to react to found expanded entities
			chapterCollection.saveEnrichment(data.dimension, data.link, true);
		}, function () {
			chapterCollection.removeObserver();//the observer was added in the modal to react to found expanded entities
		});
	};

	/*------------------------formatting service specific functions (could also be done on server...)---------------------*/



	return {
		openMultipleLinkDialog : openMultipleLinkDialog,
		openLinkDialog : openLinkDialog,
		openCardDialog : openCardDialog
	}
}]);