angular.module('linkedtv').controller('enrichmentModalController', 
	['$scope', '$modalInstance', '$rootScope', 'entityProxyService', 'enrichmentService', 'chapterCollection', 
	'entityCollection', 'enrichmentUtils', 'dimension', function ($scope, $modalInstance, $rootScope, entityProxyService, 
		enrichmentService, chapterCollection, entityCollection, enrichmentUtils, dimension) {
	
	$scope.enrichmentUtils = enrichmentUtils;
	$scope.dimension = dimension;//currently selected dimension
	$scope.entities = entityCollection.getChapterEntities();//fetch the entities from the chaptercollection

	$scope.enrichmentQuery = '';//the query that will be sent to the enrichmentService
	$scope.activeEntities = [];//selected entities
	

	$scope.allEnrichments = null; //all fetched enrichments (unfiltered)
	$scope.enrichments = [];//fetched & filtered enrichment
	$scope.enrichmentSources = null; //allEnrichments filtered by link source
	$scope.enrichmentEntitySources = null;//allEnrichments filtered by the entities they are based on
	
	$scope.activeEnrichmentSource = null; //current source filter
	$scope.activeEnrichmentEntitySource = null; //current entity source filter

	$scope.selectedEnrichments = [] //this is eventually going to be filled and returned to the dimensionTab	


	$scope.toggleEntity = function(entityLabel) {
		var index = $scope.activeEntities.indexOf(entityLabel);
		if(index == -1) {
			$scope.activeEntities.push(entityLabel);
		} else {
			$scope.activeEntities.splice(index, 1);
		}
		$scope.enrichmentQuery = $scope.activeEntities.join('+');
	}

	$scope.isEntitySelected = function(entityLabel) {
		return $scope.activeEntities.indexOf(entityLabel) == -1 ? '' : 'selected';
	}


	//the actual enrichments will be shown in the enrichment tab
	$scope.fetchEnrichments = function() {
		if ($scope.enrichmentQuery) {
			enrichmentService.search($scope.enrichmentQuery, $rootScope.provider, $scope.onSearchEnrichments);		
		}
	};

	$scope.onSearchEnrichments = function(enrichments) {
		//reset the button and the selected entities
		//$('#fetch_enrichments').button('reset');
		$scope.activeEntities = [];
		$scope.enrichmentQuery = '';
		$scope.enrichmentsCollapsed = false;
		console.debug(enrichments);
		$scope.updateEnrichments(enrichments);//maybe later offer an option to save the enrichments to the chapter
	}

	/*this part is only relevant for the tvenrichment service*/

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
				var enrichmentsOfSource = entitySources[s];
				//if not added already, add the source to the list of possible sources
				if(sources.indexOf(s) == -1 && enrichmentsOfSource.length > 0) {
					sources.push(s);
				}
				//loop through the eventual enrichments and add them to temp				
				for(var e in enrichmentsOfSource) {
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

	$scope.addEnrichment = function(enrichment) {		
		$scope.selectedEnrichments.push(enrichment);
	}

	$scope.removeEnrichment = function(index) {
		$scope.selectedEnrichments.splice(index, 1);
	}

	$scope.ok = function () {			
		if($scope.selectedEnrichments) {			
			$modalInstance.close({dimension: $scope.dimension, enrichments : $scope.selectedEnrichments});
		} else {
			alert('Please add a label');
		}
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
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


	//********************************THIS SHOULD BE MOVED!!!!!****************************************************	
	//********************************THIS SHOULD BE MOVED!!!!!****************************************************
	//********************************THIS SHOULD BE MOVED!!!!!****************************************************

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


	$scope.fetchExtraInfoForEntityLabel = function(entitiesOfLabel) {
		var entityUri = null;
		for(k in entitiesOfLabel) {
			var e = entitiesOfLabel[k];
			entityUri = e.disambiguationURL;
			if(entityUri) {
				break;
			}
		}
		$scope.fetchExtraInfo(entityUri);
	}

	$scope.fetchExtraInfo = function(entityUri) {
		if(entityUri) {				
			entityProxyService.getEntityDBPediaInfo(entityUri, $scope.fetchedTriplesLoaded);
			$scope.loading = true;
		}
	}

	$scope.fetchedTriplesLoaded = function(data) {			
		$scope.fetchedTriples = [];
		var info = [];
		for (key in data) {
			var prop = null;
			for(k in data[key]) {
				prop = data[key][k];
				var values = [];
				var uris = [];
				if(prop.length > 0) {
					for(p in prop) {
						values.push(prop[p].value || prop[p]);
						uris.push(prop[p].uri);
					}
					if(key !== $scope.POSTER) {
						info.push({index : 0, key : k, values : values, uris : uris});
					}
				}
			}
		}
		info.sort();
		$scope.$apply(function() {
			$scope.loading = false;
			$scope.thumbIndex = 0;
			$scope.thumbs = $scope.getThumbsFromTriples(info);
			$scope.fetchedTriples = info;
		})
	}

	$scope.getThumbsFromTriples = function(triples) {
		for(var i=0;i<triples.length;i++) {
			if(triples[i].key == $scope.POSTER) {
				return triples[i].values;
			}
		}
		return null;
	}
	
}]);