angular.module('linkedtv').factory('enrichmentService', [function(){

	function search(query, entities, dimension, callback) {
		var data = {
			'query' : query.split('+').join(','),
			'dimension' : dimension,
			'entities' : entities
		};
		$.ajax({
			method: 'POST',
			data: JSON.stringify(data),
			dataType : 'json',
			url : '/dimension',
			success : function(json) {
				var enrichments = json.error ? null : json.enrichments;
				callback(formatServiceResponse(enrichments, dimension));
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	function formatServiceResponse(data, dimension) {
		if(dimension.service.id == 'TvEnricher') {
			return formatTvEnricherResponse(data, dimension);
		} else if(dimension.service.id == 'TvNewsEnricher') {
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
						url : formatUrl(e, dimension),
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

	//really crappy bad function, later this needs to be modelled & mapped in a nice way
	function formatUrl(enrichment, dimension) {
		var url = enrichment.micropostUrl;
		if(dimension.service.id == 'RelatedChapter' && dimension.service.params && dimension.service.params.dimension == 'Solr') {
			return 'http://api.linkedtv.eu/mediaresource/' + url;
		}
		return url;
	}

	function formatTvNewsEnricherResponse(data, dimension) {
		console.debug('Formatting data from the TvNewsEnricher');
		console.debug(data);
		var temp = [];//will contain enrichments
		var sources = [];//sometimes available in the data
		var eSources = [];//always empty in this case
		if(dimension.service.params.dimension != 'tweets') { //TODO make sure that Tweets can also be shown (build another formatXXX function)
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

	return {
		search : search
	}

}]);