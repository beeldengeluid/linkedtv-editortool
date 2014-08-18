angular.module('linkedtv').controller('enrichmentController', 
	function($rootScope, $scope, $modal, conf, chapterCollection, 
		entityCollection, enrichmentCollection, enrichmentService, entityProxyService) {
	

	/*-------------------------TAB FUNCTIONS---------------------------*/
	
	$scope.entities = null; //entities are passed to the informationCardModal (editing dialog)
	$scope.activeChapter = null;//holds the up-to-date active chapter
	$scope.activeLinkIndex = 0;//selected slot


	//watch for changes in the active chapter
	$scope.$watch(function () { return chapterCollection.getActiveChapter(); }, function(newValue) {
		console.debug('the active chapter has changed: ');
		console.debug(newValue);
		$scope.activeChapter = newValue;
	});

	$scope.$watch(function () { return entityCollection.getChapterEntities(); }, function(newValue) {
		if(newValue) {
			$scope.updateEntities(newValue);
		}
	});
	
	//called whenever a chapter is selected
	$scope.updateEntities = function(entities) {
		$scope.entities	= entities;
	}

	$scope.createNewLink = function() {
		$scope.openLinkDialog(null);
	}

	$scope.editLink = function() {
		$scope.openLinkDialog($scope.activeChapter.enrichments[$scope.activeLinkIndex]);
	}

	$scope.openLinkDialog = function() {

		var modalInstance = $modal.open({
			templateUrl: '/site_media/js/templates/enrichmentModal.html',
			controller: editLinkDialog,
			size: 'lg',
			//make sure to make a nice separate controller
			resolve: {
				entities: function () {
					return $scope.entities;
				},
				entityProxyService : function () {
					return entityProxyService;
				},
				entityProxyService : function () {
					return entityProxyService;
				},
				enrichmentCollection : function () {
					return enrichmentCollection;
				}
			}
		});

		//when the modal is closed (using 'ok', or 'cancel')
		modalInstance.result.then(function (card) {
			console.debug('I saved a damn card yeah!');
			console.debug(card);
			if($scope.activeChapter.cards[$scope.activeLinkIndex]) {
				$scope.activeChapter.cards[$scope.activeLinkIndex] = card;
			} else {
				$scope.activeChapter.cards.push(card);
			}
			console.debug($scope.activeChapter);

			//update the chapter collection (this triggers the $watch at the top)
			chapterCollection.saveChapter($scope.activeChapter);
		}, function () {
			console.debug('Modal dismissed at: ' + new Date());
		});
	};

	$scope.setActiveCard = function(index) {
		$scope.activeLinkIndex = index;
	};

	$scope.isCardSelected = function(index) {
		return $scope.activeLinkIndex == index ? 'selected' : '';
	};

	/*-------------------- SHOULD BE PUT MOSTLY IN THE MODAL*/


	var editLinkDialog = function ($scope, $modalInstance, $rootScope, entities, entityProxyService, enrichmentCollection, enrichmentService) {

		$scope.entities = entities;
		$scope.entityProxyService = entityProxyService;
		$scope.enrichmentService = enrichmentService;

		$scope.activeEntities = [];//selected entities
		$scope.enrichments = [];//fetched & filtered enrichment

		$scope.allEnrichments = null;
		$scope.enrichmentSources = null; //allEnrichments filtered by link source
		$scope.enrichmentEntitySources = null;//allEnrichments filtered by the entities they are based on

		$scope.selectedEnrichments = [] //this is eventually going to be filled and returned to the dimensionTab

		$scope.activeEnrichmentSource = null; //current source filter
		$scope.activeEnrichmentEntitySource = null; //current entity source filter

		
		$scope.$watch(function () { return enrichmentCollection.getEnrichmentsOfActiveChapter(); }, function(newValue) {		
			console.debug('Updating enrichments');
			if(newValue) {
				$scope.updateEnrichments(newValue);
			}
		});


		//the actual enrichments will be shown in the enrichment tab
		$scope.fetchEnrichments = function() {
			if($scope.activeEntities && $scope.activeEntities.length > 0) {
				//$('#fetch_enrichments').button('loading');
				enrichmentService.search($scope.activeEntities, $rootScope.provider, $scope.onSearchEnrichments);
			} else {
				alert('Please select a number of entities before triggering the enrichment search');
			}
		};

		$scope.onSearchEnrichments = function(enrichments) {
			//reset the button and the selected entities
			//$('#fetch_enrichments').button('reset');
			$scope.activeEntities = [];
			console.debug(enrichments);
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

		$scope.ok = function () {			
			if($scope.selectedEnrichments) {				
				$modalInstance.close($scope.selectedEnrichments);
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


		//----------------------this should be COPIED TO ANOTHER FILE-----------------


		$scope.toggleEntity = function(entityLabel) {
			var index = $scope.activeEntities.indexOf(entityLabel);
			if(index == -1) {
				$scope.activeEntities.push(entityLabel);
			} else {
				$scope.activeEntities.splice(index, 1);
			}
		}

		$scope.isEntitySelected = function(entityLabel) {
			return $scope.activeEntities.indexOf(entityLabel) == -1 ? '' : 'selected';
		}

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


	}
	
});