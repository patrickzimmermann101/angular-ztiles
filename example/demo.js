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
            i = 0, tiles;

          tiles = data.items.filter(function(entry) {
            i++;
            return angular.isDefined(entry.width) && i < 50 && i > 10;
          });

          $scope.tiles = tiles.map(function(entry) {
            var lastPoint = entry.link.lastIndexOf('.');
            entry.thumb = entry.link.substring(0, lastPoint) + 'l' +
              entry.link.substring(lastPoint, entry.link.length);
            return entry;
          });

        }).error(function(e) {
          console.log(e);
        });

  }).directive('fadeing', function(zTilesScope) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        // Cut down to one single line
        if (zTilesScope.$s) {
          zTilesScope.$s.$on('rerender', function() {

            var title = element.find('p'),
              oneline = 0,
              titleText;
            title.empty();
            title.text(scope.title);
            title.append('<span>A</span>');

            element.find('.fadeing').show();
            oneline = element.find('span').height();
            element.find('span').empty();

            while (title.height() > oneline) {
              titleText = element.find('p').text();
              element.find('p').text(titleText.substring(0,
                titleText.length - 5) + ' ...');
            }
            element.find('.fadeing').hide();
          });
        }

        scope.$evalAsync(function() {
          scope.title = element.find('p').text();
        });

        element.bind('mouseenter', function() {
          element.find('.fadeing').show();
        });
        element.bind('mouseleave', function() {
          element.find('.fadeing').hide();
        });
      }
    };
  }
);
