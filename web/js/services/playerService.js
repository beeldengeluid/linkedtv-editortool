angular.module('linkedtv').factory('playerService', [function() {
	
	var _mediaPlaying = false;
	var _videoPlayer = null;

	function playFragment(playoutUrl, start) {
		if(playoutUrl == 'none') {
			return false;
		}
		console.debug('Playing video: ' + playoutUrl);
		_mediaPlaying = false;
		_videoPlayer = document.getElementById('html5player');
		$('#videoSource').attr('src', playoutUrl + '?' + new Date().getTime());
		_videoPlayer.addEventListener('play', onPlay, false);
		_videoPlayer.addEventListener('pause', onPause, false);
		_videoPlayer.addEventListener('loadeddata', onLoadedData, false);
		_videoPlayer.addEventListener('loadstart', onLoadStart, false);
		_videoPlayer.addEventListener('error', onError, true);
		_videoPlayer.addEventListener('stalled', onStalled, false);
		var canPlayMP3 = (typeof _videoPlayer.canPlayType === "function" && _videoPlayer.canPlayType("video/mp4") !== "");
		if (canPlayMP3) {
		    _videoPlayer.pause();
		    _videoPlayer.load();
		    return true;
		} else {
			alert('Your browser does not support mp3...');
			return false;
		}
	}
		
	function getPlayerTime () {		
		if(_videoPlayer) {
			return _videoPlayer.currentTime * 1000;
		}
		return 0;
	};

	function seek(millis) {
		if(_videoPlayer) {
			_videoPlayer.currentTime = millis / 1000;
		}
	}

	/*----------------PLAYER EVENTS----------------*/

		
	function onLoadedData(e) {
		console.debug('loaded data...');
	}

	function onLoadStart(e) {
		console.debug('loading...');
	}
	
	function onStalled(e) {
		console.debug('stalled...');
	}
	
	function onError(e) {
		console.debug('An unknown error occurred.');
	}
	
	function onPlay(e) {
		_mediaPlaying = true;
		console.debug('play');
	}
	
	function onPause(e) {		
		_mediaPlaying = false;
		console.debug('pause');
	}

	return {
		playFragment : playFragment,
		getPlayerTime : getPlayerTime,
		seek : seek
	}

}]);