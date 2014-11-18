//TODO http://stackoverflow.com/questions/20791639/pseudo-element-hover-on-before

angular.module('linkedtv').controller('informationCardModalController', 
	['$scope', '$modalInstance', 'conf', 'entityProxyService', 'entityCollection', 'chapterCollection', 'entityUtils',
	 'dimension', 'link', function ($scope, $modalInstance, conf, entityProxyService, entityCollection, chapterCollection,
	 entityUtils, dimension, link) {
	
	$scope.dimension = dimension;
	$scope.card = link || {};
	$scope.templates = conf.templates;
	$scope.entityUtils = entityUtils;

	//copy the poster, so it won't be immediately bound to the chapter before saving
	$scope.poster = $scope.card.poster; 

	//copy the card template, so it won't be immediately bound to the chapter before saving
	$scope.activeTemplate = entityUtils.copyInformationCardTemplate($scope.card.template);

	$scope.autogeneratedEntities = entityCollection.getChapterEntities();//fetch the correct entities from the entityCollection	
	$scope.expandedEntities = chapterCollection.getActiveChapter().expandedEntities || [];//TODO
	
	$scope.thumbs = null;
	$scope.thumbIndex = 0;

	$scope.fetchedTriples = null;
	$scope.foundEntity = null;//for the autocomplete box
	$scope.selectedUri = null;

	$scope.loading = false;	

	$scope.useTemplate = $scope.activeTemplate != null;	

	$scope.clearTemplate = function() {
		$scope.useTemplate = !$scope.useTemplate;
		var uri = $scope.card.uri;
		$scope.card = {};
		$scope.card.uri = uri;
		$scope.poster = null;
		$scope.activeTemplate = null;
	}

	$scope.generateUri = function() {
		return 'http://linkedtv.eu/' + new Date().getTime();
	}

	//TODO this function formats the stored triples in the form of the user friendly template
	$scope.setTemplate = function(template) {
		$scope.activeTemplate = template;
		$scope.card.uri = $scope.generateUri();//always assign a custom ID to a card based on a template
	};

	$scope.addToTemplate = function(triple) {
		var t = null;
		if(triple) {
			var val = {};
			val.label = triple.values[triple.index];
			val.uri = triple.uris[triple.index];
			t = {
				key : triple.key,
				type : val.uri ? 'entity' : 'literal',
				optional : triple.key == 'label' ? false : true
			};
			if (t.type == 'literal') {
				t.value = val.label;
			} else {
				t.value = val;
			}
		} else {
			t = {key : null, type : 'literal', value : null, optional : true};
		}

		//Also add the triple to the list of triples (for convencience)
		if(!$scope.activeTemplate) {
			$scope.activeTemplate = {};
		}
		if($scope.activeTemplate.properties) {
			$scope.activeTemplate.properties.push(t);
		} else {
			$scope.activeTemplate.properties = [t];
		}
	};

	$scope.removeFromCard = function(index) {
		$scope.activeTemplate.properties.splice(index, 1);
	};

	$scope.nextTriple = function(index) {
		if($scope.fetchedTriples[index].index + 1 < $scope.fetchedTriples[index].values.length) {
			$scope.fetchedTriples[index].index++;
		} else {
			$scope.fetchedTriples[index].index = 0;
		}
	};

	$scope.setCardPoster = function(thumb) {
		$scope.poster = thumb;
	};

	$scope.nextThumb = function() {
		if($scope.thumbIndex + 1 < $scope.thumbs.length) {
			$scope.thumbIndex++;
		} else {
			$scope.thumbIndex = 0;
		}
	};	

	$scope.isReserved = function(key) {
		return key === 'thumb';
	};

	$scope.DBpediaPropertyClass = function(triple) {
		return triple.uri ? 'dbpedia' : '';
	};

	$scope.useAsTemplate = function() {
		$scope.useTemplate = false;
		$scope.card.uri = $scope.selectedUri;
		$scope.activeTemplate = {properties : []};
		_.each($scope.fetchedTriples, function(triple) {
			$scope.addToTemplate(triple);
		});
		//set the poster, if any
		if($scope.thumbs) {
			$scope.poster = $scope.thumbs[$scope.thumbIndex];
		}
	}


	//----------------------------FETCH INFO FROM THE ENTITY PROXY------------------------------

	$scope.fetchExtraInfo = function(entity) {		
		var uri = entity.disambiguationURL ? entity.disambiguationURL : entity.uri;	
		if(uri) {
			if(!$scope.useTemplate) {
				$scope.selectedUri = uri;
			}
			entityProxyService.fetch(uri, $scope.entityInfoFetched);
			$scope.loading = true;
		}
	};

	$scope.entityInfoFetched = function(data) {
		$scope.fetchedTriples = [];
		$scope.$apply(function() {
			$scope.loading = false;
			$scope.thumbIndex = 0;
			$scope.thumbs = data.thumbs;
			$scope.fetchedTriples = data.info;
		})
	};

	//----------------------------VALIDATION AND DATA FORMATTING------------------------------

	$scope.isProperlyFilledOut = function() {
		if(!$scope.card.label || $scope.card.label == '') {
			return false;
		}
		return true;
	};

	$scope.updateCardProperties = function() {
		//make sure to copy the poster to the card
		$scope.card.poster = $scope.poster;

		if(!$scope.card.uri) {
			$scope.card.uri = $scope.generateUri();
		}

		//use the template properties to fill the enrichment's properties and entity list
		if($scope.activeTemplate) {
			var entities = [];
			_.each($scope.activeTemplate.properties, function(p) {
				if(p.value != undefined) {
					if(p.type == 'literal') {
						$scope.card[p.key] = p.value;
					} else if (p.type == 'entity') {
						entities.push(p.value);
					}
				}
			});
			$scope.card.entities = entities;
		}
	};


	//----------------------------BUTTON PANEL------------------------------

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};

	$scope.ok = function () {
		//set the active template as the card's template (so it will be saved)		
		$scope.card.template = entityUtils.copyInformationCardTemplate($scope.activeTemplate);
		$scope.updateCardProperties();
		if($scope.isProperlyFilledOut()) {			
			$modalInstance.close({dimension : $scope.dimension, link : $scope.card});
		} else {
			alert('Please add a label');
		}
	};

	$scope.removeCard = function() {
		$scope.card.remove = true;
		$modalInstance.close({dimension : $scope.dimension, link : $scope.card});
	};
	
}]);