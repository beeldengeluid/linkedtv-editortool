angular.module('linkedtv').factory('enrichmentUtils', [function(){

	function getPosterUrl(enrichment) {
		if(enrichment.posterUrl && isValidPosterFormat(enrichment.posterUrl)) {
			return enrichment.posterUrl;
		} else if(enrichment.mediaUrl && isValidPosterFormat(enrichment.mediaUrl)) {
			return enrichment.mediaUrl;
		}
		return null;
	}

	function isValidPosterFormat(img) {
		if(img == null) {
			return false;
		}
		var formats = ['jpg', 'png', 'jpeg', 'JPG', 'PNG', 'gif', 'GIF', 'JPEG', 'bmp', 'BMP'];
		for(i in formats) {
			if(img.indexOf(formats[i]) != -1) {
				return true;
			}
		}
		return false;
	}	

	return {
		getPosterUrl : getPosterUrl
	}
}]);