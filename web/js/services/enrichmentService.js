angular.module('linkedtv').factory('enrichmentService', [function(){
	
	function search(entities, provider, callback) {
		console.debug('Getting enrichments for: ' + entities.join(' '));
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/enrichments?q=' + entities.join(',') + '&p=' + provider,
			success : function(json) {
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