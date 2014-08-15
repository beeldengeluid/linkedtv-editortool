angular.module('linkedtv').factory('entityProxyService', ['$rootScope', 'conf', function($rootScope, conf){
	

	function getEntityDBPediaInfo(dbpediaUri, callback) {
		console.debug('Getting entity info for: ' + dbpediaUri);
		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : '/entityproxy?uri=' + dbpediaUri + '&lang=' + conf.languageMap[$rootScope.provider],
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
		getEntityDBPediaInfo : getEntityDBPediaInfo
	}

}]);