angular.module('linkedtv').factory('videoModel', function() {
	
	var _video = null;

	function initModelData(resourceData) {
		if(resourceData.videoMetadata) {
			_video = {
				title : resourceData.videoMetadata.mediaResource.titleName,//update this object on the server, sheesh it's ugly
				playoutUrl : resourceData.playoutUrl
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