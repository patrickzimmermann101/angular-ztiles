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
            return angular.isDefined(entry.width) && i < 30;
          });

        }).error(function(e) {
          console.log(e);
        });

  }).directive('fadeing', function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element) {

        // Cut down to one single line
        $timeout(function() {
          var title = element.find('p').append('<span>A</span>'),
            oneline = 0,
            titleText;

          element.find('.fadeing').show();
          oneline = element.find('span').height();
          element.find('span').empty();

          while (title.height() > oneline) {

            titleText = element.find('p').text();
            element.find('p').text(titleText.substring(0,
              titleText.length - 5) + ' ...');
          }
          element.find('.fadeing').hide();

        }, 100);

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
