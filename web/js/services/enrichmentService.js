angular.module('linkedtv').factory('enrichmentService', [function(){
	
	function search(entities, provider, callback) {
		console.debug('Getting enrichments for: ' + entities.join(' ') + '['+provider+']');
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/enrichments?q=' + entities.join(',') + '&p=' + provider,
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