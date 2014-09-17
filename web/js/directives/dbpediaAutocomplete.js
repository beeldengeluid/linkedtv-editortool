//userful to read: 
// - http://jasonmore.net/angular-js-directives-difference-controller-link/
// - http://www.jvandemo.com/the-nitty-gritty-of-compile-and-link-functions-inside-angularjs-directives/

angular.module('linkedtv').directive('dbpediaAutocomplete', function(){

	return {
		restrict : 'E',

		replace : true,

		scope : {
			entity : '=',//the selected entity will be communicated via this variable
			target : '@' //this is the id of the html element that holds the autocomplete widget
		},

		//templates are actually rendered after the linking function, so it's not possible 
		//to refer to the outcome of angular expressions
		templateUrl : '/site_media/js/templates/dbpediaAutocomplete.html',

		controller : function($scope, $element) {
			$scope.BUTTON_MAPPINGS = {'who' : 'orange', 'unknown' : 'red', 'where' : 'blue', 
				'what' : 'yellow', 'Freebase' : 'pink', 'DBpedia' : 'green', 'NERD' : 'yellow'
			};

			$scope.RENDER_OPTIONS = {
				ORIGINAL :  $.ui.autocomplete.prototype._renderItem,
				
				DBPEDIA : function(ul, item) {
					$(ul).css('z-index', '999999'); // needed when displayed within an Angular modal
					var v_arr = item.label.split('\|');
					var l = v_arr[0];
					var t = v_arr[1];
					var c = v_arr[2];
					t = '<button class="button button-primary">' + t + '</button>';
					c = '<button class="button button-primary ' + $scope.BUTTON_MAPPINGS[c] + '">' + c + '</button>';
					var row = l + '&nbsp;' + t + '&nbsp;' + c;
					return $("<li></li>").data("item.autocomplete", item).append("<a>" + row + "</a>").appendTo(ul);
				}
			};

			$scope.setAutocompleteRendering = function(type) {
				if(type == 'dbpedia') {
					$.ui.autocomplete.prototype._renderItem = $scope.RENDER_OPTIONS.DBPEDIA;
				} else {				
					$.ui.autocomplete.prototype._renderItem = $scope.RENDER_OPTIONS.ORIGINAL;
				}
			};
			
			$scope.setAutocompleteRendering('dbpedia');
			$element.attr('id', $scope.target); //needed to be able to bind the autocomplete
			if($scope.entity) {
				$element.attr('value', $scope.entity.label);
			}
			$('#' + $scope.target).autocomplete({
				source: '/autocomplete',
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