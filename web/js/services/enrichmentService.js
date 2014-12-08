angular.module('linkedtv').factory('enrichmentService', ['videoModel', function(videoModel) {

	function search(query, entities, dimension, callback) {
		fillInDynamicProperties(dimension);
		var data = {
			'query' : query, //query.split('+').join(','),
			'dimension' : dimension,
			'entities' : entities
		};
		$.ajax({
			method: 'POST',
			data: JSON.stringify(data),
			dataType : 'json',
			url : '/dimension',
			success : function(json) {
				console.debug(json);
				var enrichments = json.error ? null : json.enrichments;
				callback(formatServiceResponse(enrichments, dimension));
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	/*Should be moved to another place, this is not nice*/
	function fillInDynamicProperties(dimension) {
		_.each(dimension.service.params, function(value, key){
			if (value == '$VIDEO_DATE') {
				dimension.service.params[key] = videoModel.getVideo().date;
			}
		});
	}

	//TODO in the future possibly service specific things could be done by reading the 'additionalProperties' field,
	//which is service specific
	function formatServiceResponse(data, dimension) {
		if(dimension.service.id == 'TvEnricher') {
			return formatGenericResponse(data, dimension);
		} else if(dimension.service.id == 'TvNewsEnricher') {
			return formatGenericResponse(data, dimension);
		} else if(dimension.service.id == 'EuropeanaAPI') {
			return formatGenericResponse(data, dimension);
		} else if(dimension.service.id == 'AnefoAPI') {
			return formatGenericResponse(data, dimension);
		}
		return null;
	}

	function formatGenericResponse(data, dimension) {
		var temp = [];//will contain enrichments
		var sources = [];//sometimes available in the data
		var eSources = [];//always empty in this case
		_.each(data, function(e) {
			var enrichment = {
				label : e.label ? e.label : 'No label',
				url : e.url,
				description : e.description,
				poster : e.poster,
				entities : e.entities,
				date : e.date ? e.date : 'No date',
				creator : e.creator ? e.creator : 'unknown'
			}
			//add the source to the list of possible sources and attach it to the retrieved enrichment
			if(sources.indexOf(e.source) == -1) {
				sources.push(e.source);
			}
			enrichment.source = e.source;

			//TODO there is no derived entity yet
			if(e.entities) {
				_.each(e.entities, function(entity){
					if(eSources.indexOf(entity) == -1) {
						eSources.push(entity);
					}
				});
			}

			temp.push(enrichment);
		});
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