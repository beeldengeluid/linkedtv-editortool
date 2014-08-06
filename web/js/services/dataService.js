angular.module('linkedtv').factory('dataService', [function(){
	
	function getResourceData(resourceUri, loadData, callback) {
		console.debug('Getting combined data of resource: ' + resourceUri);
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/resource?id=' + resourceUri + '&ld=' + (loadData ? 'true' : 'false'),
			success : function(json) {
				callback(json);
			},
			error : function(err) {
				console.debug(err);
				callback(null);
			}
		});
	}

	return {
		getResourceData : getResourceData
	}

}]);