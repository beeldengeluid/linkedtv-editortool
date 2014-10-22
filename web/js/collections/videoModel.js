angular.module('linkedtv').factory('videoModel', function() {
	
	var _video = null;

	function initModelData(resourceData) {
		if(resourceData.videoMetadata) {
			_video = {
				title : resourceData.videoMetadata.mediaResource.titleName,
				playoutUrl : resourceData.locator
			}
			console.debug('Loaded the video data');
		} else {
			console.error('No videometadata found!');
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