angular.module('linkedtv').controller('editorPanelController', 
	function($rootScope, $scope, conf, chapterCollection) {
	
	$scope.activeChapter = null;
	//TODO add variable for active slots

	//watch the chapterCollection to see what chapter has been selected
	$scope.$watch(function () { return chapterCollection.getActiveChapter(); }, function(newValue) {
		if(newValue) {
			$scope.activeChapter = newValue;
		}
	});

	//TODO listen to changes in the slots
	
});