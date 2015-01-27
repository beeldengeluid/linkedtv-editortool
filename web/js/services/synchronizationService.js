angular.module('linkedtv').factory('synchronizationService', ['$rootScope', 'conf', function($rootScope, conf){

	function synchronize(callback) {
		console.debug('Synchronizing with ' + conf.synchronization.platform);
		var url = '/synchronize'
		url += '?uri=' + $rootScope.resourceUri;
		url += '&platform=' + conf.synchronization.platform;
		url += '&p=' + $rootScope.provider;

		$.ajax({
			method: 'GET',
			dataType : 'json',
			url : url,
			success : function(json) {
				console.debug(json)
				callback(json.success ? true : false);
			},
			error : function(err) {
				console.debug(err);
				callback(false);
			}
		});
	}

	return {
		synchronize : synchronize
	}

}]);