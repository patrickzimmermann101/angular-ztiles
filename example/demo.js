/*
 * angular-ztiles
 *
 * Copyright(c) 2014 Patrick Zimmermann <patrick@knowhere.guru>
 * MIT Licensed
 *
 */

/**
 * @author Patrick Zimmermann <patrick@knowhere.guru>
 *
 */

'use strict';

angular.module('demoApp', ['pz101.ztiles']).controller('DemoCtrl',
  function($scope, $http) {
    $http.get('https://api.imgur.com/3/gallery/t/earthporn/top/0.json',
      {headers: {Authorization: 'Client-ID 09b0999bc7f8c9e'}}).
        success(function(html) {

          var data = html.data,
            i = 0;

          $scope.tiles = data.items.filter(function(entry) {
            i++;
            return angular.isDefined(entry.width) && i < 10;
          });

          $scope.tiles2 = angular.copy($scope.tiles);

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
  }
).directive('title', function() {
  var minHeight = 0,
    helper, it = 0;

  return {
    restrict: 'A',
    link: function(scope, element) {
      it++;
      console.log(it);
      if (minHeight === 0) {
        helper = angular.element('<span class=".helper">A</span>');
        /*scope.$watch(
          function() {return helper.height();},
          function() {
            //console.log(helper.height());
            if (minHeight === 0 && helper.height() > 0) {
              minHeight = helper.height();
              //console.log(helper.height());
            }
          }
        );*/

        element.find('p').append(helper);
        //console.log(element.find('.helper').height());
      }

      /*function rerender() {
        var h = element.height();

        if (angular.isDefined(scope.minHeight) && h > scope.minHeight) {
          console.log(element.find('p').text('test'));
        }
      }
      scope.$watch('minHeight',
        function() {
          rerender();
        });
      scope.$watch(
        function() {return element.height();},
        function() {
          rerender();
        }
      );*/
    }
  };
});
