angular.module('linkedtv').controller('playerController', function($sce, $rootScope, $scope){
	
	$scope.playoutUrl = null;
	$scope.videoPlayer = null;
	//$scope.activeChapter = null;

	//watch the rootScope that updates once the main resourceData is loaded (it contains also the playoutUrl)
	$rootScope.$watch('resourceData', function(resourceData){
		if(resourceData) {			
			$scope.playoutUrl = $sce.trustAsResourceUrl(resourceData.locator);
			$scope.playFragment($scope.playoutUrl, 0);
		}
	});

	$scope.playFragment = function(playoutUrl, start) {
		console.debug('Playing video: ' + playoutUrl);
		$scope.mediaPlaying = false;
		$scope.videoPlayer = document.getElementById('html5player');
		$('#videoSource').attr('src', playoutUrl);
		$scope.videoPlayer.addEventListener('play', $scope.onPlay, false);
		$scope.videoPlayer.addEventListener('pause', $scope.onPause, false);
		$scope.videoPlayer.addEventListener('loadeddata', $scope.onLoadedData, false);
		$scope.videoPlayer.addEventListener('loadstart', $scope.onLoadStart, false);
		$scope.videoPlayer.addEventListener('error', $scope.onError, true);
		$scope.videoPlayer.addEventListener('stalled', $scope.onStalled, false);
		var canPlayMP3 = (typeof $scope.videoPlayer.canPlayType === "function" && $scope.videoPlayer.canPlayType("video/mp4") !== "");
		if (canPlayMP3) {
		    $scope.videoPlayer.pause();
		    $scope.videoPlayer.load();			
		} else {
			alert('Your browser does not support mp3...');
		}
	}

	/*
	$scope.playChapter = function () {		
		this.seek($scope.activeChapter.start);
	};*/
		
	$scope.getPlayerTime = function () {
		var v = document.getElementById("html5player");
		return v.currentTime * 1000;
	};

	$scope.seek = function(millis) {
		$scope.audioPlayer.currentTime = millis / 1000;
	}

	/*----------------PLAYER EVENTS----------------*/

		
	$scope.onLoadStart = function(e) {
		console.debug('loading...');
	}
	
	$scope.onStalled = function(e) {
		console.debug('stalled...');
	}
	
	$scope.onError = function(e) {
		console.debug('An unknown error occurred.');
	}
	
	$scope.onPlay = function(e) {
		$scope.safeApply(function() {
			$scope.mediaPlaying = true;
		});
		console.debug('play');
	}
	
	$scope.onPause = function(e) {
		$scope.safeApply(function() {
			$scope.mediaPlaying = false;
		});
		console.debug('pause');
	}

	/*----------------HELPER FUNCTION----------------*/

	$scope.safeApply = function(fn) {
		var phase = this.$root.$$phase;
		if(phase == '$apply' || phase == '$digest') {
			if(fn && (typeof(fn) === 'function')) {
				fn();
			}
		} else {
			this.$apply(fn);
		}
	};
	
	

});