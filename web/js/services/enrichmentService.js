angular.module('linkedtv').factory('enrichmentService', [function(){
	
	function search(query, provider, callback) {
		console.debug('Querying enrichments using ' + query + '['+provider+']');
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/enrichments?q=' + query.split('+').join(',') + '&p=' + provider,
			success : function(json) {				
				console.debug(json);
				callback(JSON.parse(json.enrichments));
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