angular.module('linkedtv').controller('informationCardsController', function($rootScope, $scope, $modal, conf, entityProxyService, entityCollection) {

	$scope.cards = []; //TODO load the information cards from the selected chapter	
	$scope.activeCardIndex = 0;
	$scope.entities = null; //filled when selecting a chapter


	/*-------------------------DIALOG TO EDIT THE CARDS---------------------------*/

	var editCardDialog = function ($scope, $modalInstance, card, entities, entityProxyService) {

		$scope.entityProxyService = entityProxyService;
		$scope.card = card || {};		
		$scope.entities = entities;

		$scope.thumbs = null;
		$scope.thumbIndex = 0;

		$scope.fetchedTriples = null;

		//state variables
		$scope.loading = false;


		//$scope.selectedEntity = null;
		//$scope.activeEntities = [];

		$scope.initializeCard = function(card) {

		}

		$scope.addToCard = function(triple) {
			var t = {key : triple.key, value : triple.values[triple.index], uri : triple.uris[triple.index]};
			if($scope.card.triples) {
				$scope.card.triples.push(t);
			} else {
				$scope.card.triples = [t];
			}
		}

		$scope.removeFromCard = function(index) {
			$scope.card.triples.splice(index, 1);
		}

		$scope.nextTriple = function(index) {
			if($scope.fetchedTriples[index].index + 1 < $scope.fetchedTriples[index].values.length) {
				$scope.fetchedTriples[index].index++;
			} else {
				$scope.fetchedTriples[index].index = 0;
			}
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
				console.debug(triples[i]);
				if(triples[i].key == 'thumb') {
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

		$scope.fetchExtraInfo = function(entitiesOfLabel) {
			var entityUri = null;
			for(k in entitiesOfLabel) {
				var e = entitiesOfLabel[k];
				entityUri = e.disambiguationURL;
				if(entityUri) {
					break;
				}
			}
			if(entityUri) {				
				entityProxyService.getEntityDBPediaInfo(entityUri, $scope.fetchedTriplesLoaded);
				$scope.loading = true;
			}
		}

		$scope.fetchedTriplesLoaded = function(data) {
			console.debug(data);
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
						info.push({index : 0, key : k, values : values, uris : uris});
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

		$scope.ok = function () {
			$modalInstance.close($scope.selectedEntity);
		};

		$scope.cancel = function () {
			$modalInstance.dismiss('cancel');
		};		
		
	};

	/*-------------------------TAB FUNCTIONS---------------------------*/

	/*
	$scope.$watch(function () { return informationCardCollection.getCards(); }, function(newValue) {		
		$scope.updateInformationCards(newValue);
	});

	$scope.updateInformationCards = function(cards) {
		$scope.cards = cards;
		$scope.setActiveSlot(0);
	}*/

	$scope.$watch(function () { return entityCollection.getChapterEntities(); }, function(newValue) {
		if(newValue) {
			$scope.updateEntities(newValue);
		}
	});
	
	//called whenever a chapter is selected
	$scope.updateEntities = function(entities) {
		$scope.entities	= entities;
		console.debug('entities');
		console.debug($scope.entities);
	}

	$scope.createNewCard = function() {
		$scope.openCardDialog(null);
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

		modalInstance.result.then(function (selectedItem) {
			console.debug(selectedItem);
			$scope.selected = selectedItem;
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
	
});