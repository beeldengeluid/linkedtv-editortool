angular.module('linkedtv').factory('imageService', [function(){

	function getThumbnail(thumbBaseUrl, thumbUrl, millis, useImageProxy) {
		if (thumbBaseUrl == undefined || thumbBaseUrl == null) {
			return null;
		}
		if (useImageProxy) {
			return '/image?ms=' + millis + '&baseUrl=' + thumbBaseUrl;
		}
		if(thumbBaseUrl.indexOf('noterik') != -1) {
			var h = m = s = 0;
			//round up to full seconds
			if (millis % 1000 != 0) {
				millis += 1000 - millis % 1000;
			}
			while (millis >= 3600000) {
				h ++;
	            millis -= 3600000;
			}
	        while (millis >= 60000) {
	            m ++;
	            millis -= 60000;
	        }
	        while (millis >= 1000) {
	            s++;
	            millis -= 1000;
	        }
	        return thumbBaseUrl + 'h/' + h + '/m/' + m + '/sec' + s + '.jpg';
		} else {
			return thumbBaseUrl + thumbUrl;
		}
        return null;
	}

	return {
		getThumbnail : getThumbnail
	}

}]);