angular.module('linkedtv').factory('videoModel', function() {

	var _video = null;

	function initModelData(resourceData) {
		if(resourceData.videoMetadata) {
			_video = {
				title : resourceData.title,
				date : resourceData.date,
				playoutUrl : resourceData.playoutUrl
			}
			console.debug('Loaded the video data');
		} else {
			alert('No video metadata could be loaded from the platform');
		}
	}

	function getVideo() {
		return _video;
	}

	return {
		initModelData : initModelData,
		getVideo : getVideo
	}

});