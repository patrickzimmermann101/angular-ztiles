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

angular.module('pz101.ztiles', []);
angular.module('pz101.ztiles')
  .directive('zTiles', function($compile) {

    // Input Objects
    // [{width: 100, height: 100, ...}, {width: 200, height : 200, ...}, ...]

    var tilesCount = 0,
        rows = [],
        templateCache = null,
        padding = 4,
        widthKey = 'width',
        heightKey = 'height',
        transcludeTemplate = '',
        maxTiles = 5;

    function link(scope, elem) {

      var $window;

      // get ratio of tile
      function ratio(tile) {
        return tile[widthKey] / tile[heightKey];
      }

      function renderCSS() {

        var width = elem.width() - 1,
          p = padding,
          r = 0,
          row,
          qa,
          qb,
          c,
          ra,
          rb,
          hc,
          hb,
          ha,
          wc,
          elems,
          n,
          $e,
          type,
          indexA,
          tileA,
          indexB,
          tileB;

        console.log(rows);

        elem.find('.z-tile').css('padding', '0px').css('margin', '0px');

        for (r = 0; r < rows.length; r++) {

          row = rows[r];
          qa = (row.na - 1) * p;
          qb = (row.nb - 1) * p;
          c = row.c;
          ra = row.ra;
          rb = row.rb;
          hc = (qb - qa + ra * p + (rb + ra) * ((p + qa - width) / ra - p)) /
            (-rb - (rb / ra * c) - c);
          hb = (p + qa - width) / ra - p + (1 + c / ra) * hc;
          ha = -p + hc - hb;
          wc = c * hc;
          //var wab = qa+ra*ha;
          elems = elem.find('.z-tiles-row-' + r);

          for (n = 0;n < elems.length;n++) {
            $e = angular.element(elems[n]);
            type = $e.attr('tile-type');

            // 2 Row Element
            if (type === 'c') {
              $e.css('height', hc + 'px').css('width', wc + 'px').
                css('margin-bottom', p + 'px');

            // 1. Row
            } else if (type === 'a') {

              indexA = (row.offset +
                row.pa[$e.attr('tiles-col')]);
              tileA = scope.tiles[indexA];
              $e.css('height', ha + 'px').
                css('width', ratio(tileA) * ha + 'px').
                css('margin-' + row.float, p + 'px');

            // 2. Row
            } else if (type === 'b') {

              indexB = (row.offset +
                row.pb[$e.attr('tiles-col')]);
              tileB = scope.tiles[indexB];
              $e.
                css('width', ratio(tileB) * hb + 'px').
                css('margin-top', p + 'px').
                css('margin-bottom', p + 'px').
                css('height', hb + 'px').
                css('margin-' + row.float, p + 'px');
            }
          }
        }

        // Wait for compiling
        scope.$evalAsync(function() {
          templateCache = elem.html();
        });
      }

      function createRow(tileSet, row, num, parent) {

        var a, b;

        createDOM('c', num, 0, tileSet[row.pc], parent);

        for (a = 0; a < row.na; a++) {
          createDOM('a', num, a, tileSet[parseInt(row.pa[a], 10)], parent);
        }

        for (b = 0; b < row.nb; b++) {
          createDOM('b', num, b, tileSet[parseInt(row.pb[b], 10)], parent);
        }

        parent.append('<div class="z-tiles-clear" style="clear:both" />');
      }

      function createDOM(type, row, col, tile, parent) {

        var outterdiv = '<div class="z-tile z-tiles-row-' +
          row + '" tiles-col="' +
          col + '" tile-type="' +
          type + '" style="float:' +
          rows[row].float + '">' +
          transcludeTemplate + '</div>',

          // create isolated scope for card. Parent Scope
          // is available via "mother"
          isolatedScope = scope.$new(true),
          content;

        isolatedScope.tile = tile;
        isolatedScope.mother = scope.$parent;

        content = $compile(outterdiv)(isolatedScope);
        parent.append(content);
      }

      function createGrid(parent, tileSet, offset) {
        var lowestRatio = 0,
          n,
          c,
          pc,
          pa,
          pb,
          lastTime,
          i,
          ra,
          k,
          l,
          rb,
          row;

        // TODO for count 1 and 2
        if (tileSet.length < 3) {
          console.log('Not implemented yet!');
        } else if (tileSet.length >= 3) {

          for (n = 0; n < tileSet.length; n++) {
            if (ratio(tileSet[n]) < ratio(tileSet[lowestRatio])) {
              lowestRatio = n;
            }
          }

          c = ratio(tileSet[lowestRatio]);
          pc = lowestRatio;
          pa = [];
          pb = [];

          lastTime = null;

          for (i = 0; i < tileSet.length; i++) {
            if (i !== pc) {

              if (lastTime === null) {
                lastTime = true;
              }

              if (lastTime) {
                pa.push(i);
              } else {
                pb.push(i);
              }

              lastTime = !lastTime;
            }
          }
          ra = 0;
          for (k = 0; k < pa.length; k++) {
            ra += ratio(tileSet[pa[k]]);
          }
          rb = 0;
          for (l = 0; l < pb.length; l++) {
            rb += ratio(tileSet[pb[l]]);
          }

          row = {
            c: c,
            ra: ra,
            rb: rb,
            na: pa.length,
            nb: pb.length,
            pa: pa,
            pb: pb,
            pc: pc,
            offset: offset,
            float: 'left'
          };

          rows.push(row);

          // create DOMs for row
          createRow(tileSet, row, rows.length - 1, parent);
        }
      }

      // Defaults Values
      if (scope.widthKey) {
        widthKey = scope.widthKey;
      }
      if (scope.heightKey) {
        heightKey = scope.heightKey;
      }
      if (scope.tilesPadding) {
        padding = parseInt(scope.tilesPadding);
      }
      if (scope.maxTiles) {
        maxTiles = parseInt(scope.maxTiles);
      }
      // get transclude template
      if (elem.html()) {
        transcludeTemplate = elem.html();

        elem.empty();
      }

      // use cached template
      if (templateCache !== null) {
        elem.append(templateCache);
        // TODO Template Chach muss neu kompiliert werden..
      }

      $window = angular.element(window);

      // recalculate sizes afer window resize event
      $window.resize(function() {
        renderCSS();
      });

      // recalculate sizes after parent resize event
      elem.resize(function() {
        renderCSS();
      });

      if (scope.tiles && templateCache !== null) {
        tilesCount = scope.tiles.length;
      }

      // watch for changes in cards. Only appending is supported now.
      scope.$watch('tiles', function() {

        var done,
          max,
          r;

        // add new cards and create DOMs
        if (scope.tiles) {
          if (tilesCount !== scope.tiles.length) {
            done = tilesCount;
            tilesCount = scope.tiles.length;

            while (done < tilesCount) {
              // max cards
              max = Math.min(maxTiles + 1, tilesCount - done);
              // standard value is set to 3
              r = Math.min(max, 3);
              if (max > 3) {
                r = Math.floor((Math.random() * (max - 3)) + 3);
              }

              createGrid(elem, scope.tiles.slice(done, done + r), done);
              done += r;
            }

            // recalculate styles
            renderCSS();
          }
        }
      });
    }

    return {
      restrict: 'A',
      scope: {
        tiles: '=tiles',
        widthKey: '@',
        heightKey: '@',
        tilesPadding: '@',
        maxTiles: '@'
      },
      link: link
    };
  });
