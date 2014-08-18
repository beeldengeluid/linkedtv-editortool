angular.module('linkedtv').controller('informationCardsController', 
	function($rootScope, $scope, $modal, conf, entityProxyService, entityCollection, chapterCollection) {

	/*-------------------------TAB FUNCTIONS---------------------------*/
	
	$scope.entities = null; //entities are passed to the informationCardModal (editing dialog)
	$scope.activeChapter = null;//holds the up-to-date active chapter
	$scope.activeCardIndex = 0;


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

	$scope.createNewCard = function() {
		$scope.openCardDialog(null);
	}

	$scope.editCard = function() {
		$scope.openCardDialog($scope.activeChapter.cards[$scope.activeCardIndex]);
	}

	$scope.openCardDialog = function(card) {

		var modalInstance = $modal.open({
			templateUrl: '/site_media/js/templates/informationCardModal.html',
			controller: editCardDialog,
			size: 'lg',
			//make sure to make a nice separate controller
			resolve: {
				entities: function () {
					return $scope.entities;
				},
				card : function () {
					return card;
				},
				entityProxyService : function () {
					return entityProxyService;
				}
			}
		});

		//when the modal is closed (using 'ok', or 'cancel')
		modalInstance.result.then(function (card) {
			console.debug('I saved a damn card yeah!');
			console.debug(card);
			if($scope.activeChapter.cards[$scope.activeCardIndex]) {
				$scope.activeChapter.cards[$scope.activeCardIndex] = card;
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
		$scope.activeCardIndex = index;
	};

	$scope.isCardSelected = function(index) {
		return $scope.activeCardIndex == index ? 'selected' : '';
	};


	/*-------------------------DIALOG TO EDIT THE CARDS---------------------------*/

	var editCardDialog = function ($scope, $modalInstance, card, entities, entityProxyService) {

		$scope.entityProxyService = entityProxyService;
		$scope.card = card || {};
		$scope.entities = entities;

		$scope.POSTER = 'thumb';
		$scope.thumbs = null;
		$scope.thumbIndex = 0;

		$scope.fetchedTriples = null;

		$scope.autocompleteId = 'autocomplete_1';
		$scope.foundEntity = {};

		//state variables
		$scope.loading = false;

		/*
		$scope.$watch('foundEntity', function(newValue) {
			if(newValue) {
				console.debug(newValue);
				$scope.fetchExtraInfo(newValue.uri);
				$('#dbpedia').attr('value', '');
			}
		});*/

		$scope.initializeCard = function(card) {

		}

		$scope.addToCard = function(triple) {
			var t = null;
			if(triple) {
				//create a triple based on values/uris that are currently selected by the user
				t = {key : triple.key, value : triple.values[triple.index], uri : triple.uris[triple.index]};
				//use the key/value to add a property to a card (for convenience)
				$scope.card[t.key] = t.value;
			} else {
				t = {key : null, value : null, uri : null};
			}

			//Also add the triple to the list of triples (for convencience)
			if($scope.card.triples) {
				$scope.card.triples.push(t);
			} else {
				$scope.card.triples = [t];
			}			
		}

		$scope.removeFromCard = function(index) {
			if($scope.card.triples[index].key === 'label') {
				$scope.card.label = null;
			}
			$scope.card.triples.splice(index, 1);
		}

		$scope.nextTriple = function(index) {
			if($scope.fetchedTriples[index].index + 1 < $scope.fetchedTriples[index].values.length) {
				$scope.fetchedTriples[index].index++;
			} else {
				$scope.fetchedTriples[index].index = 0;
			}
		}

		$scope.setCardPoster = function(thumb) {
			$scope.card.poster = thumb;
		}

		$scope.nextThumb = function() {
			if($scope.thumbIndex + 1 < $scope.thumbs.length) {
				$scope.thumbIndex++;
			} else {
				$scope.thumbIndex = 0;
			}
		}

		$scope.getThumbsFromTriples = function(triples) {
			for(var i=0;i<triples.length;i++) {
				if(triples[i].key == $scope.POSTER) {
					return triples[i].values;
				}
			}
			return null;
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

		$scope.isReserved = function(key) {
			return key === $scope.POSTER;
		}

		//really ugly, but necessary for now...
		$scope.updateCardProperties = function() {
			for(t in $scope.card.triples) {
				$scope.card[$scope.card.triples[t].key] = $scope.card.triples[t].value;
			}
		}

		$scope.ok = function () {
			$scope.updateCardProperties();
			if($scope.card.label) {				
				$modalInstance.close($scope.card);
			} else {
				alert('Please add a label');
			}
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};		
		
	};
	
});