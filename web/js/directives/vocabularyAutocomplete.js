//userful to read:
// - http://jasonmore.net/angular-js-directives-difference-controller-link/
// - http://www.jvandemo.com/the-nitty-gritty-of-compile-and-link-functions-inside-angularjs-directives/

angular.module('linkedtv').directive('vocabularyAutocomplete', function(){

	return {
		restrict : 'E',

		replace : true,

		scope : {
			entity : '=',//the selected entity will be communicated via this variable
			target : '@', //this is the id of the html element that holds the autocomplete widget
			vocabulary : '@' //this is the vocabulary that the user wants to search in
		},

		//templates are actually rendered after the linking function, so it's not possible
		//to refer to the outcome of angular expressions
		templateUrl : '/site_media/js/templates/vocabularyAutocomplete.html',

		controller : function($scope, $element) {
			$scope.DBPEDIA_BUTTON_MAPPINGS = {'who' : 'orange', 'unknown' : 'red', 'where' : 'blue',
				'what' : 'yellow', 'Freebase' : 'pink', 'DBpedia' : 'green', 'NERD' : 'yellow'
			};

			$scope.GTAA_BUTTON_MAPPINGS = {'Geografisch' : 'brown', 'Naam' : 'green',
                'Persoon' : 'wheat', 'B&G Onderwerp' : 'grey', 'Onderwerp' : 'orange', 'Maker' : 'wheat',
                'Genre' : 'yellow', '' : 'white'};

			$scope.RENDER_OPTIONS = {
				ORIGINAL :  $.ui.autocomplete.prototype._renderItem,

				DBPEDIA : function(ul, item) {
					$(ul).css('z-index', '999999'); // needed when displayed within an Angular modal
					var v_arr = item.label.split('\|');
					var l = v_arr[0];
					var t = v_arr[1];
					var c = v_arr[2];
					var te = '<button class="button button-primary">' + t + '</button>';
					var ce = '<button class="button button-primary"';
					ce += ' style="background-color:' + $scope.DBPEDIA_BUTTON_MAPPINGS[c] + ';">' + c + '</button>';
					var row = l + '&nbsp;' + te + '&nbsp;' + ce;
					return $("<li></li>").data("item.autocomplete", item).append("<a>" + row + "</a>").appendTo(ul);
				},

				GTAA : function(ul, item) {
					$(ul).css('z-index', '999999'); // needed when displayed within an Angular modal
					var v_arr = item.label.split('\|');
					var l = v_arr[0]; //prefLabel
					var t = v_arr[1]; //inScheme
					var c = v_arr[2]; //scopeNotes
					console.debug($scope.GTAA_BUTTON_MAPPINGS[t]);
					var te = '<button class="button button-primary" ';
					te += 'style="background-color:' + $scope.GTAA_BUTTON_MAPPINGS[t] + ';">' + t + '</button>';
					var ce = '<button class="button button-primary">' + c + '</button>';
					var row = l + '&nbsp;' + te// + '&nbsp;' + ce;
					return $("<li></li>").data("item.autocomplete", item).append("<a>" + row + "</a>").appendTo(ul);
				}
			};

			$scope.setAutocompleteRendering = function(type) {
				if(type == 'DBpedia') {
					$.ui.autocomplete.prototype._renderItem = $scope.RENDER_OPTIONS.DBPEDIA;
				} else if(type == 'GTAA') {
					$.ui.autocomplete.prototype._renderItem = $scope.RENDER_OPTIONS.GTAA;
				}
			};

			$scope.setAutocompleteRendering($scope.vocabulary);

			$element.attr('id', $scope.target); //needed to be able to bind the autocomplete
			if($scope.entity) {
				$element.attr('value', $scope.entity.label);
			}
			$('#' + $scope.target).autocomplete({
				source: '/autocomplete?vocab=' + $scope.vocabulary,
				minLength: 3,
				select: function(event, ui) {
					if(ui.item) {
						var v_arr = ui.item.label.split('\|');
						var l = v_arr[0];
						var t = v_arr[1];
						var c = v_arr[2];
						var dbpediaURL = ui.item.value;

						//stores the selected DBpedia entry
						$scope.$apply(function() {
							$scope.entity = {label : l, type : t, category : c, uri : dbpediaURL};
						});
						this.value = '';
						return false;
					}
				}
			});
		}

	}

})