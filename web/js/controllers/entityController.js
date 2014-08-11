angular.module('linkedtv').controller('entityController', 
	function($rootScope, $scope, conf, entityCollection, enrichmentCollection, enrichmentService) {
	
	$scope.entities = {};
	$scope.activeEntities = [];
	$scope.popOverContent = {};//contains the HTML for each entity

	$scope.$watch(function () { return entityCollection.getChapterEntities(); }, function(newValue) {
		$scope.entities = newValue;
	});
	
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
		console.debug('got some enrichments, setting them in the enrichment collection');
		$('#fetch_enrichments').button('reset');
		enrichmentCollection.addEnrichmentsToActiveChapter(enrichments, true);
	}

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