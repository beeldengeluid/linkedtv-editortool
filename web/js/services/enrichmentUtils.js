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
			activeChapter.dimensions[data.dimension.id] = data.enrichments;
			
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

	/*------------------------formatting service specific functions (could also be done on server...)---------------------*/

	function toETLink (link, service) {
		if(service == 'TvEnricher') {
			return formatTvEnricherLink(link);
		} else if (service == 'TvNewsEnricher') {
			return formatTvNewsEnricherLink(link);
		}
		return null;
	}

	function formatTvEnricherLink(link) {
		var l = {label : 'No title'}
		l.uri = link.micropostUrl;
		l.poster = getPosterUrl(link);
		l.label = 'No title';
		if(link.micropost && link.micropost.plainText) {
			l.label = link.micropost.plainText;
		}
		//TODO fill the link.triples with the rest of the properties
		return l;
	}

	function formatTvNewsEnricherLink(link) {
		return null;
	}

	function formatServiceResponse(data, dimension) {		
		if(dimension.service == 'TvEnricher') {
			return formatTvEnricherResponse(data, dimension);
		} else if(dimension.service == 'TvNewsEnricher') {
			return formatTvNewsEnricherResponse(data, dimension);
		}
		return null;
	}

	function formatTvEnricherResponse(data, dimension) {
		var temp = [];//will contain enrichments
		var sources = [];
		var eSources = [];		
		for (var es in data) {
			//if not added already, add the entity source to the list of possible sources
			if(eSources.indexOf(es) == -1) {
				eSources.push(es);
			}
			var entitySources = data[es];
			for (var s in entitySources) {
				var enrichmentsOfSource = entitySources[s];
				//if not added already, add the source to the list of possible sources
				if(sources.indexOf(s) == -1 && enrichmentsOfSource.length > 0) {
					sources.push(s);
				}
				//loop through the eventual enrichments and add them to temp				
				_.each(enrichmentsOfSource, function(e) {
					//set what you can right away
					var enrichment = {
						label : 'No title',
						description : 'No description',//TODO if it's there fetch it from the data
						uri : e.micropostUrl,
						source : s, //add the source to each enrichment (for filtering)
						entitySource : es //add the source entities to each enrichment (for filtering)
					};
					//find the right poster
					if(e.posterUrl && isValidPosterFormat(e.posterUrl)) {
						enrichment.poster = e.posterUrl;
					} else if(e.mediaUrl && isValidPosterFormat(e.mediaUrl)) {
						enrichment.poster = e.mediaUrl;						
					}					
					//set the correct label
					if(e.micropost && e.micropost.plainText) {
						enrichment.label = e.micropost.plainText;
					}
					temp.push(enrichment);
				});
			}
		}
		if(temp.length == 0) {
			return null;
		}
		return {enrichmentSources : sources, enrichmentEntitySources : eSources, allEnrichments : temp}
	}

	function formatTvNewsEnricherResponse(data, dimension) {
		console.debug('Formatting data from the TvNewsEnricher');
		console.debug(data);
		var temp = [];//will contain enrichments
		var sources = [];//sometimes available in the data
		var eSources = [];//always empty in this case
		if(dimension.id != 'tweets') { //TODO make sure that Tweets can also be shown (build another formatXXX function)
			_.each(data, function(e){
				var enrichment = {
					label : e.title,
					uri : e.url,
					description : e.text
				}
				//add the source to the list of possible sources and attach it to the retrieved enrichment
				if(e.source && e.source.name && sources.indexOf(e.source.name) == -1) {
					sources.push(e.source.name);
					enrichment.source = e.source.name;
				}
				if (e.media) {
					enrichment.poster = e.media.thumbnail;
					enrichment.mediaType = e.media.type;
					enrichment.mediaUrl = e.media.url;
				}
				temp.push(enrichment);
				//TODO add  more data to the enrichment
			});
		}
		if(temp.length == 0) {
			return null;
		}
		return {enrichmentSources : sources, enrichmentEntitySources : eSources, allEnrichments : temp};
	}

	return {
		getPosterUrl : getPosterUrl,
		openLinkDialog : openLinkDialog,
		openCardDialog : openCardDialog,
		formatServiceResponse : formatServiceResponse,
		toETLink : toETLink
	}
}]);