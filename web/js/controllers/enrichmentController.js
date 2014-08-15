angular.module('linkedtv').controller('enrichmentController', function($rootScope, $scope, conf, enrichmentCollection) {
	
	$scope.activeEntities = [];


	$scope.allEnrichments = null;
	$scope.enrichmentSources = null; //allEnrichments filtered by link source
	$scope.enrichmentEntitySources = null;//allEnrichments filtered by the entities they are based on

	$scope.activeEnrichmentSource = null; //current source filter
	$scope.activeEnrichmentEntitySource = null; //current entity source filter

	$scope.$watch(function () { return enrichmentCollection.getEnrichmentsOfActiveChapter(); }, function(newValue) {		
		console.debug('Updating enrichments');
		if(newValue) {
			$scope.updateEnrichments(newValue);
		}
	});


	/*This part should be the generic part that calls the correct enrichments services (based on the dimension)*/

	//the actual enrichments will be shown in the enrichment tab
	$scope.fetchEnrichments = function() {
		if($scope.activeEntities && $scope.activeEntities.length > 0) {
			$('#fetch_enrichments').button('loading');
			enrichmentService.search($scope.activeEntities, $rootScope.provider, $scope.onSearchEnrichments);
		} else {
			alert('Please select a number of entities before triggering the enrichment search');
		}
	};

	$scope.onSearchEnrichments = function(enrichments) {
		//reset the button and the selected entities
		$('#fetch_enrichments').button('reset');
		$scope.activeEntities = [];

		//add the enrichments to the enrichmentCollection
		enrichmentCollection.addEnrichmentsToActiveChapter(enrichments, true);
	}

	/*this part is only relevant for the tvenrichment service*/

	//TODO make sure this function is called by listening to the enrichmentCollection!
	$scope.updateEnrichments = function(enrichments) {
		console.debug(enrichments);
		var temp = [];//will contain enrichments
		var sources = [];
		var eSources = [];
		for (var es in enrichments) {
			//if not added already, add the entity source to the list of possible sources
			if(eSources.indexOf(es) == -1) {
				eSources.push(es);
			}
			var entitySources = enrichments[es];
			for (var s in entitySources) {
				//if not added already, add the source to the list of possible sources
				if(sources.indexOf(s) == -1) {
					sources.push(s);
				}
				//loop through the eventual enrichments and add them to temp
				var enrichmentsOfSource = entitySources[s];
				for(var e in enrichmentsOfSource){
					var enrichment = enrichmentsOfSource[e];
					//add the source to each enrichment (for filtering)
					enrichment.source = s;
					//add the source entities to each enrichment (for filtering)
					enrichment.entitySource = es;

					temp.push(enrichment);
				}
			}
		}
		//apply the enrichments to the scope
		
		$scope.enrichmentSources = sources;
		$scope.enrichmentEntitySources = eSources;
		$scope.allEnrichments = temp;
		
		console.debug($scope.enrichmentEntitySources)

		//by default filter by the first source in the list
		$scope.filterEnrichmentsBySource(sources[0]);		
	};


	//filters the enrichments by source
	$scope.filterEnrichmentsBySource = function(source) {
		$scope.activeEnrichmentSource = source;
		$scope.enrichments = _.filter($scope.allEnrichments, function(e) {
			if(e.source === source) {
				return e;
			}
		});
	}

	//filters the enrichments by source
	$scope.filterEnrichmentsByEntitySource = function(entitySource) {
		$scope.activeEnrichmentEntitySource = entitySource;
		$scope.enrichments = _.filter($scope.allEnrichments, function(e) {
			if(e.entitySource === entitySource) {
				return e;
			}
		});
	}
	
});