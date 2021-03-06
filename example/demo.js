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
            return angular.isDefined(entry.width) && i < 100 && i > 11;
          });

          $scope.tiles = tiles.map(function(entry) {
            if (entry.gifv) {
              entry.thumb = entry.link;
            } else {
              var lastPoint = entry.link.lastIndexOf('.');
              entry.thumb = entry.link.substring(0, lastPoint) + 'l' +
                entry.link.substring(lastPoint, entry.link.length);
            }
            return entry;
          });

        }).error(function(e) {
          console.log(e);
        });

  }).directive('fadeing', function() {
    return {
      restrict: 'A',
      link: function(scope, element) {
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
