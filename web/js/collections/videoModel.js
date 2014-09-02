angular.module('linkedtv').factory('videoModel', function() {
	
	var _video = null;

	function initModelData(resourceData) {
		_video = {
			title : resourceData.videoMetadata.mediaResource.titleName,
			playoutUrl : resourceData.locator
		}
		console.debug('Loaded the video data');
	}

	function getVideo() {
		return _video;
	}

	return {
		initModelData : initModelData,
		getVideo : getVideo
	}

});