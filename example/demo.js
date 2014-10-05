'use strict';

angular
  .module('demoApp', [
    'pz101.ztiles'
]).controller('DemoCtrl', function($scope, $http) {

	$http.get('https://api.imgur.com/3/gallery/t/earthporn/top/0.json', {headers : {Authorization : 'Client-ID 09b0999bc7f8c9e'}}).success(function(html) {
		var data = html.data;
		var i = 0;
		$scope.tiles = data.items.filter(function(entry) {
			i++;
			return angular.isDefined(entry.width) && i < 2000;
		});
		
	}).error(function(e) {
		console.log(e);
	});
}).directive('fadeing', function() {
	return {
		restrict: 'A',
		link: function(scope, element) {
			element.bind('mouseenter', function() {
				element.find('.fadeing').fadeIn('slow');
			});
			element.bind('mouseleave', function() {
				element.find('.fadeing').hide();
			});
		}
    };
});