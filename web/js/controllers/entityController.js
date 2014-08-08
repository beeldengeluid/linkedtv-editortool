angular.module('linkedtv').controller('entityController', function($rootScope, $scope, entityService, enrichmentService) {
	
	/*
	TODO NOTES:
		- mogelijk opgehaalde enrichments voor chapters bewaren (omdat het lang duurt om deze op te halen)
		- entityService ook weer gebruiken om via de API entities te laden?
	*/

	$scope.resourceUri = $rootScope.resourceUri;
	$scope.entities = {};
	$scope.activeChapter = $rootScope.chapter;
	$scope.activeSlotIndex = 0;
	$scope.activeEntities = [];
	$scope.popOverContent = {};//contains the HTML for each entity
	$scope.slots = null;

	//watch the rootScope that updates once the main resourceData is loaded (it contains also the playoutUrl)
	$rootScope.$watch('chapter', function(chapter) {
		if(chapter) {
			$scope.setActiveChapter(chapter);
		}
	});

	/*------------Load everything according to the selected chapter-----------------*/

	$scope.setActiveChapter = function(chapter) {
		$scope.activeChapter = chapter;
		$scope.activeSlotIndex = 0;
		$scope.activeEntities = [];

		//load the correct entities belonging to the activeChapter FIXME do this in the chapterCollection
		$scope.updateEntities();

		//populate the slots
		$scope.slots = $scope.activeChapter.slots;
	};

	$scope.updateEntities = function() {
		//first filter all the entities to be only of the selected chapter
		var entities = _.filter($rootScope.resourceData.nes, function(item) {
			if(item.start >= $scope.activeChapter.start && item.end <=  $scope.activeChapter.end) {				
				return item;
			}
		});

		//group all the entities by label
		$scope.entities = _.groupBy(entities, function(e) {
			return e.label;
		});
 	
		$.each($scope.entities, function(k, v) {
			var labels = [];
			var daUrls = [];
			for (var e in v) {
				labels.push(v[e].label);
				daUrls.push(v[e].disambiguationURL);
			}
			$scope.popOverContent[k] = labels.join(' ') + '&nbsp;' + daUrls.join(' ');
		});		
		//TODO sort the entities
	}

	/*------------Add selected entity to slot-----------------*/

	$scope.addEntityToSlot = function() {
		console.debug('Adding entity to slot');
		if($scope.activeEntities.length > 0) {
			console.debug('Getting entity info');
			var label = $scope.entities[$scope.activeEntities[0]];
			var uri = null;
			var e = null;
			for (var i in label) {
				e = label[i];
				//only dbpedia uri's are supported
				console.debug(e);
				if (e.disambiguationURL && e.disambiguationURL.indexOf('dbpedia.org') != -1) {
					uri = e.disambiguationURL;
					break;
				}
			}
			console.debug('dbpediaUri: ' + uri)
			entityService.getEntityDBPediaInfo(uri, $scope.entityInfoLoaded);
		}
	}

	$scope.entityInfoLoaded = function(data) {		
		console.debug(data);
	}

	/*------------Search for Enrichments-----------------*/

	$scope.searchEnrichments = function() {
		if($scope.activeEntities && $scope.activeEntities.length > 0) {
			enrichmentService.search($scope.activeEntities, $rootScope.provider, $scope.onSearchEnrichments);
		} else {
			alert('Please select a number of entities before triggering the enrichment search');
		}
	};

	$scope.onSearchEnrichments = function(enrichments) {
		console.debug(enrichments);
		for (var es in enrichments) {
			var entitySources = enrichments[es];
			console.debug(es);
			console.debug(entitySources);
			for (var s in entitySources) {
				console.debug(s);
				var enrichmentsOfSource = entitySources[s];
				for(var e in enrichmentsOfSource){
					var enrichment = enrichmentsOfSource[e];
					console.debug(enrichment);
				}
			}
		}

		/*
		mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Steltman.JPG"
		micropost: Object
		micropostUrl: "https://commons.wikimedia.org/wiki/File:Steltman.JPG"
		posterUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Steltman.JPG/500px-Steltman.JPG"
		publicationDate: "2010-10-01T16:05:29Z"
		socialInteractions: Object
		timestamp: "1285949129000"
		type: "photo"
		userProfileUrl: "https://commons.wikimedia.org/wiki/User:Pvt pauline"
		*/
	};

	/*------------Selecting slots-----------------*/

	$scope.setActiveSlotIndex = function(slot) {		
		$scope.activeSlotIndex = slot;
	};

	$scope.isSlotSelected = function(slot) {
		return $scope.activeSlotIndex == slot ? 'selected' : '';
	};

	/*------------Selecting entities-----------------*/

	$scope.toggleEntity = function(entityLabel) {
		if($scope.activeEntities.indexOf(entityLabel) == -1) {
			$scope.activeEntities.push(entityLabel);
		} else {
			$scope.activeEntities.splice($scope.activeEntities.indexOf(entityLabel),1);
		}
	};

	$scope.isEntitySelected = function(entityLabel) {
		return $scope.activeEntities.indexOf(entityLabel) == -1 ? '' : 'selected';
	};


	/*------------Confidence of entities-----------------*/

	$scope.getConfidenceClass = function(entityList) {
		//really ugly hack: somehow the reduce function screws up when there is one item in the list
		var confidenceSum = entityList.length == 1 ? entityList[0].confidence : _.reduce(entityList, function(memo, e) {			
			return memo ? parseFloat(memo.confidence) + parseFloat(e.confidence) : parseFloat(e.confidence);
		});		
		var c = confidenceSum / entityList.length;		
		if(c <= 0) {
			return 'verylow';
		} else if (c > 0 && c <= 0.2) {
			return 'low';
		} else if (c > 0.2 && c <= 0.4) {
			return 'fair';
		} else if (c > 0.4 && c <= 0.6) {
			return 'medium';
		} else if (c > 0.6 && c <= 0.8) {
			return 'high';
		} else if (c > 0.8) {
			return 'veryhigh';
		}
	};
	
	
});