angular.module('linkedtv').factory('enrichmentUtils', ['$modal', 'chapterCollection', function($modal, chapterCollection) {

	function getPosterUrl(enrichment) {
		if(enrichment.posterUrl && isValidPosterFormat(enrichment.posterUrl)) {
			return enrichment.posterUrl;
		} else if(enrichment.mediaUrl && isValidPosterFormat(enrichment.mediaUrl)) {
			return enrichment.mediaUrl;
		}
		return null;
	}

	function isValidPosterFormat(img) {
		if(img == null) {
			return false;
		}
		var formats = ['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'gif', 'GIF', 'JPEG', 'bmp', 'BMP'];
		for(i in formats) {
			if(img.indexOf(formats[i]) != -1) {
				return true;
			}
		}
		return false;
	}

	function toETLinks(tveLinks) {
		var links = [];
		for(var i=0;i<tveLinks.length;i++) {
			links.push(tvEnricherToETLink(tveLinks[i]));
		}
		return links;
	}

	function tvEnricherToETLink (tveLink) {
		var link = {label : 'No title'}
		link.uri = tveLink.micropostUrl;
		link.poster = getPosterUrl(tveLink);
		if(tveLink.micropost.plainText) {
			link.label = tveLink.micropost.plainText;
		}
		//TODO fill the link.triples with the rest of the properties
		return link;
	}

	function openLinkDialog(dimension, link) {
		console.debug(dimension);
		var modalInstance = $modal.open({
			templateUrl: '/site_media/js/templates/enrichmentModal.html',
			controller: 'enrichmentModalController',
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
			console.debug('I saved some enrichments');
			var activeChapter = chapterCollection.getActiveChapter();
			activeChapter.dimensions[data.dimension.id] = toETLinks(data.enrichments);
			
			//update the chapter collection (this triggers the $watch at the top)
			chapterCollection.saveChapter(activeChapter);
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
			console.debug(data);
			chapterCollection.saveChapterLink(data.dimension, data.link);
		}, function () {
			console.debug('Modal dismissed at: ' + new Date());
		});
	};

	return {		
		getPosterUrl : getPosterUrl,
		openLinkDialog : openLinkDialog,
		openCardDialog : openCardDialog
	}
}]);