angular.module('linkedtv').controller('multipleLinkModalController', 
	['$scope', '$modalInstance', '$rootScope', 'entityProxyService', 'enrichmentService', 'chapterCollection', 
	'entityCollection', 'enrichmentUtils', 'entityUtils', 'dimension', 
	function ($scope, $modalInstance, $rootScope, entityProxyService, enrichmentService, chapterCollection,
	 entityCollection, enrichmentUtils, entityUtils, dimension) {
	
	//collapse states
	$scope.enrichmentsCollapsed = false;
	$scope.savedEnrichmentsCollapsed = false;
	$scope.entitiesCollapsed = false;
	
	$scope.nothingFound = false;
	$scope.fetchButtonText = 'Find links'

	//main variables
	$scope.enrichmentUtils = enrichmentUtils;
	$scope.entityUtils = entityUtils;
	$scope.dimension = dimension;//currently selected dimension

	//populate the 3 levels of entities
	$scope.combinedEnrichments =  chapterCollection.getAllEnrichmentsOfChapter() || []; //get the combined enrichments from all dimensions
	$scope.autogeneratedEntities = entityCollection.getChapterEntities();//fetch the correct entities from the entityCollection	
	$scope.expandedEntities = chapterCollection.getActiveChapter().expandedEntities || [];

	$scope.savedEnrichments = chapterCollection.getSavedEnrichmentsOfDimension(dimension) || null;

	//used to formulate the enrichment query for the TVenricher (or another service)
	$scope.enrichmentQuery = '';//the query that will be sent to the enrichmentService
	$scope.activeEntities = [];//selected entities
	

	$scope.allEnrichments = null; //all fetched enrichments (unfiltered)
	$scope.enrichments = [];//fetched & filtered enrichment
	$scope.enrichmentSources = null; //allEnrichments filtered by link source
	$scope.enrichmentEntitySources = null;//allEnrichments filtered by the entities they are based on
	
	$scope.activeEnrichmentSource = null; //current source filter
	$scope.activeEnrichmentEntitySource = null; //current entity source filter


	//the actual enrichments will be shown in the enrichment tab
	$scope.fetchEnrichments = function() {
		$scope.fetchButtonText = 'Loading...';
		$scope.enrichmentQuery = $('#e_query').val();//FIXME ugly hack, somehow the ng-model does not work in this form!!!
		if ($scope.enrichmentQuery) {
			enrichmentService.search($scope.enrichmentQuery, $rootScope.provider, $scope.dimension, $scope.onSearchEnrichments);		
		}
	};

	$scope.onSearchEnrichments = function(enrichments) {
		//reset the button and the selected entities
		$scope.fetchButtonText = 'Find links';
		$scope.activeEntities = [];
		$('#e_query').attr('value', '');
		$scope.enrichmentQuery = '';
		$scope.enrichmentsCollapsed = false;		
		if(enrichments) {
			//apply the enrichments to the scope
			$scope.$apply(function() {
				$scope.enrichmentsCollapsed = false;
				$scope.nothingFound = false;
				$scope.enrichmentSources = enrichments.enrichmentSources;
				$scope.enrichmentEntitySources = enrichments.enrichmentEntitySources;
				$scope.allEnrichments = enrichments.allEnrichments;
				//when calling filterEnrichmentsBySource() the view is not updated properly, so had to copy the code here...
				$scope.activeEnrichmentSource = $scope.enrichmentSources[0];
				$scope.enrichments = _.filter($scope.allEnrichments, function(e) {
					if(e.source === $scope.activeEnrichmentSource) {
						return e;
				}
		});
			});			
		} else {
			alert('No enrichments found');
			$scope.$apply(function() {
				$scope.enrichmentsCollapsed = true;
				$scope.nothingFound = true;
			});
		}
	}

	$scope.addEnrichment = function(enrichment) {		
		$scope.savedEnrichments.push(enrichment);
	}

	$scope.removeEnrichment = function(index) {
		$scope.savedEnrichments.splice(index, 1);
	}

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

	//----------------------------SELECTING ENRICHMENTS & ENTITIES------------------------------

	$scope.addQueryEntity = function(entity) {
		console.debug(entity);
		if($scope.activeEntities.indexOf(entity.label) == -1) {
			$scope.activeEntities.push(entity.label);
		}
		$scope.updateEnrichmentQuery();
	}

	$scope.removeQueryEntity = function(entityLabel) {
		var len = $scope.activeEntities.length;
		var e = null;
		while(len--) {
			e = $scope.activeEntities[len];
			if(e === entityLabel) {
				$scope.activeEntities.splice(len, 1);
			}
		}
		$scope.updateEnrichmentQuery();
	}

	$scope.updateEnrichmentQuery = function() {
		$('#e_query').attr('value', $scope.activeEntities.join('+'));
	}

	//----------------------------BUTTON PANEL------------------------------

	$scope.ok = function () {
		if($scope.savedEnrichments) {
			$modalInstance.close({dimension: $scope.dimension, enrichments : $scope.savedEnrichments});
		} else {
			alert('Please add a label');
		}
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};	
	
}]);