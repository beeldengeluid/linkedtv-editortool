angular.module('linkedtv').factory('imageService', [function(){

	function getThumbnail(thumbBaseUrl, millis, useImageProxy) {
		if (!thumbBaseUrl) {
			return null;
		}
		if (useImageProxy) {
			return '/image?ms=' + millis + '&baseUrl=' + thumbBaseUrl;
		}
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
        var url = thumbBaseUrl;
        url += 'h/' + h + '/m/' + m + '/sec' + s + '.jpg';
        return url;
	}

	return {
		getThumbnail : getThumbnail
	}

}]);