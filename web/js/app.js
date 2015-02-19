var linkedtv = angular.module('linkedtv', ['ui.bootstrap', 'configuration']);

linkedtv.run(function($rootScope, conf) {

	var urlParts = window.location.pathname.split('/');
	//set the provider as a property of the rootScope
	if(urlParts && urlParts.length >= 3) {
		$rootScope.provider = urlParts[2];
		conf.programmeConfig = programmeConfigs[$rootScope.provider];
		conf.templates = informationCardTemplates[$rootScope.provider];

		console.debug(conf);
	} else if(urlParts && urlParts[1] == 'trial') {
		$rootScope.provider = 'trial';
		conf.programmeConfig = programmeConfigs[$rootScope.provider];
		conf.templates = informationCardTemplates[$rootScope.provider];
	}

	//set the resourceUri as a property of the rootScope
	if(urlParts && urlParts.length >= 4 && !trialId) {
		$rootScope.resourceUri = urlParts[3];
	} else if (trialId) {
		$rootScope.resourceUri = trialId;
	}
});