angular.module('linkedtv').factory('enrichmentService', [function(){
	
	function search(query, provider, dimension, callback) {
		console.debug('Querying enrichments using ' + query + '['+provider+']');
		console.debug(dimension);
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/enrichments?q=' + query.split('+').join(',') + '&p=' + provider + '&d=' + dimension.id,
			success : function(json) {
				console.debug(json);
				//callback(JSON.parse(json.enrichments));
				callback(json.enrichments);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}	

	return {
		search : search
	}

}]);