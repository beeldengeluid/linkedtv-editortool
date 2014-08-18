var linkedtv = angular.module('linkedtv', ['ngRoute', 'ui.bootstrap', 'configuration']);

linkedtv.run(function($rootScope, conf) {

	var urlParts = window.location.pathname.split('/');

	//set the provider as a property of the rootScope
	if(urlParts && urlParts.length >= 2) {
		$rootScope.provider = urlParts[1];		
		conf.programmeConfig = programmeConfigs[$rootScope.provider];
	}

	//set the resourceUri as a property of the rootScope
	if(urlParts && urlParts.length >= 3) {
		$rootScope.resourceUri = urlParts[2];
	}

	/*
	$rootScope.$on('$viewContentLoaded', function() {
		$templateCache.removeAll();
   });*/
});