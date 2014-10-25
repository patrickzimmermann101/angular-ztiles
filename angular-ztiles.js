/*! angular-ztiles (v0.2.0) - Copyright: 2014, Patrick Zimmermann (patrick@knowhere.guru) - MIT */
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

angular.module('pz101.ztiles', []).
  controller('zTilesController', function($scope) {

    // initialize scope variables
    $scope.rows = [];
    $scope.tilesCount = 0;
    $scope.alignOffset = 0;
    $scope.countsOffset = 0;
    //$scope.templateCache = null;
    $scope.transcludeTemplate = '';
    $scope.defaultOptions = {
      padding: 4,
      heightKey: 'height',
      widthKey: 'width',
      alignment: 'lr',
      counts: [3]
    };
  }).factory('zTilesFactory', function() {
    return {
    };
  }).
  directive('zTiles', function($compile, zTilesFactory) {

    function link(scope, elem) {
      var $window;

      scope.$watch(function() {
        return elem.width();
      }, function() {
        console.log('Watch CSS WIDTH: ' + elem.css('width'));
        console.log('Watch WIDTH: ' + elem.width());
      });

      // get current created tiles
      function tileCount() {
        var i,
          num = 0;

        for (i = 0;i < scope.rows.length; i++) {
          num += scope.rows[i].na + scope.rows[i].nb + 1;
        }

        return num;
      }

      // get ratio of tile
      function ratio(tile) {
        return tile[scope.defaultOptions.widthKey] /
          tile[scope.defaultOptions.heightKey];
      }

      // update all css values
      function renderCSS() {

        var width = elem.width() - 1,
          cssWidth = parseInt(elem.css('width'), 10) - 1,
          p = scope.defaultOptions.padding,
          r = 0, row, qa, qb, c, ra, rb, hc, hb, ha, wc, elems, n, $e,
          type, indexA, tileA, indexB, tileB;

        if (cssWidth < width) {
          width = cssWidth;
        }

        elem.find('.z-tile').css('padding', '0px').css('margin', '0px');

        for (r = 0; r < scope.rows.length; r++) {

          if (scope.rows[r].na === 0 && scope.rows[r].nb === 0) {
            // 1 element in row:
            elems = elem.find('.z-tiles-row-' + r);
            for (n = 0;n < elems.length;n++) {
              hc = (width + 1) / scope.rows[r].c;
              $e = angular.element(elems[n]);
              $e.css('height', hc + 'px').css('width', (width + 1) + 'px').
                css('margin-bottom', p + 'px');
            }
          } else if (scope.rows[r].na === 1 && scope.rows[r].nb === 0) {
            // 2 elements in row:
            hc = (width - scope.defaultOptions.padding) / (scope.rows[r].c +
              scope.rows[r].ra);
            wc = (hc * scope.rows[r].c);

            elems = elem.find('.z-tiles-row-' + r);
            for (n = 0;n < elems.length;n++) {
              $e = angular.element(elems[n]);
              type = $e.attr('tile-type');

              if (type === 'c') {
                $e.css('height', hc + 'px').css('width', wc + 'px').
                  css('margin-bottom', p + 'px');

              } else if (type === 'a') {
                $e.css('height', hc + 'px').css('width', scope.rows[r].ra *
                  hc + 'px').css('margin-bottom', p + 'px').
                  css('margin-' + scope.rows[r].float, p + 'px');
              }
            }
          } else {
            // 3 and more elements in row
            row = scope.rows[r];
            qa = (row.na - 1) * p;
            qb = (row.nb - 1) * p;
            c = row.c;
            ra = row.ra;
            rb = row.rb;
            hc = (qb - qa + ra * p + (rb + ra) *
              ((p + qa - width) / ra - p)) / (-rb - (rb / ra * c) - c);
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
        }

        // Wait for compiling and linking
        scope.$evalAsync(function() {
          zTilesFactory.templateCache = elem.html();
          scope.$broadcast('rerender');
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
          scope.rows[row].float + '">' +
          scope.transcludeTemplate + '</div>',
          // create isolated scope for tile. Parent Scope
          // is available via "mother"
          isolatedScope = scope.$new(true),
          content;

        isolatedScope.tile = tile;
        isolatedScope.mother = scope.$parent;

        content = $compile(outterdiv)(isolatedScope);
        parent.append(content);
      }

      function createGrid(parent, tileSet, offset, align) {
        var lowestRatio = 0,
          n, c, pc, pa, pb, lastTime, i, ra, k, l, rb, row;

        if (tileSet.length === 1) {
          c = ratio(tileSet[0]);
          pa = [];
          pb = [];
          ra = 0;
          rb = 0;

          row = {
            c: c,
            ra: ra,
            rb: rb,
            na: pa.length,
            nb: pb.length,
            pa: pa,
            pb: pb,
            pc: 0,
            offset: offset,
            float: align
          };

          scope.rows.push(row);

          // create DOMs for row
          createRow(tileSet, row, scope.rows.length - 1, parent);

        } else if (tileSet.length === 2) {
          c = ratio(tileSet[0]);
          ra = ratio(tileSet[1]);
          row = {
            c: c,
            ra: ra,
            rb: 0,
            na: 1,
            nb: 0,
            pa: [1],
            pb: [],
            pc: 0,
            offset: offset,
            float: align
          };

          scope.rows.push(row);

          createRow(tileSet, row, scope.rows.length - 1, parent);

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
            float: align
          };

          scope.rows.push(row);

          // create DOMs for row
          createRow(tileSet, row, scope.rows.length - 1, parent);
        }
      }
      if (scope.options) {
        if (scope.options.padding) {
          scope.defaultOptions.padding = scope.options.padding;
        }
        if (scope.options.widthKey) {
          scope.defaultOptions.widthKey = scope.options.widthKey;
        }
        if (scope.options.heightKey) {
          scope.defaultOptions.heightKey = scope.options.heightKey;
        }
        if (scope.options.alignment) {
          scope.defaultOptions.alignment = scope.options.alignment;
        }
        if (scope.options.counts && angular.isArray(scope.options.counts)) {
          scope.defaultOptions.counts = scope.options.counts;
        }
      }
      // get transclude template
      if (elem.html()) {
        scope.transcludeTemplate = elem.html();

        elem.empty();
      }

      // use cached template
      if (angular.isDefined(zTilesFactory.templateCache)) {
        elem.append(zTilesFactory.templateCache);
        console.log('CACHE IS USED');
        console.log('ROWS: ' + scope.rows.length);
        // TODO Template cache has to be recompiled...
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

      if (scope.tiles && scope.templateCache !== null) {
        scope.tilesCount = scope.tiles.length;
      }

      // watch for changes in tiles. Only appending is supported now.
      scope.$watch('tiles', function() {
        var done,
          max,
          r,
          rowCount = 0,
          align;

        // add new tiles and create DOMs
        if (scope.tiles) {
          if (tileCount() !== scope.tiles.length) {
            done = tileCount();
            scope.tilesCount = scope.tiles.length;

            while (done < scope.tilesCount) {
              // max tiles
              max = scope.tilesCount - done;
              // Default Counts [3]: 3, 3, 3, 3...
              if (scope.countsOffset >= scope.defaultOptions.counts.length) {
                scope.countsOffset = 0;
              }

              r = Math.min(max,
                scope.defaultOptions.counts[scope.countsOffset]);

              // Default Alignments 'lr': left, right, left, right...
              if (scope.alignOffset >= scope.defaultOptions.alignment.length) {
                scope.alignOffset = 0;
              }
              if (scope.defaultOptions.alignment[scope.alignOffset] === 'l') {
                align = 'left';
              } else if (
                  scope.defaultOptions.alignment[scope.alignOffset] === 'r') {
                align = 'right';
              } else {
                if (Math.random() >= 0.5) {
                  align = 'right';
                } else {
                  align = 'left';
                }
              }
              scope.alignOffset++;
              scope.countsOffset++;

              createGrid(elem, scope.tiles.slice(done, done + r), done, align);
              done += r;
              rowCount++;
            }

            // recalculate styles
            scope.$evalAsync(function() {
              renderCSS();
            });
          }
        }
      });
    }

    return {
      restrict: 'A',
      scope: {
        tiles: '=',
        options: '=?'
      },
      controller: 'zTilesController',
      link: link
    };
  });
