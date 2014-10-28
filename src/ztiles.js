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
      rows: [],
      alignOffset: 0,
      countsOffset: 0,
      cachedScopes: [],
      reset: function() {
        this.rows = [];
        this.alignOffset = 0;
        this.countsOffset = 0;
        this.templateCache = '';

        for (var i = 0; i < this.cachedScopes.length; i++) {
          this.cachedScopes[i].$destroy();
        }
      }
    };
  }).
  directive('zTiles', function($compile, $timeout, zTilesFactory) {

    function link(scope, elem) {
      var $window, watcher, onDestroy;

      // get current created tiles
      function getTilesCount() {
        var i,
          num = 0;

        for (i = 0;i < zTilesFactory.rows.length; i++) {
          num += zTilesFactory.rows[i].na + zTilesFactory.rows[i].nb + 1;
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

        var width = elem.innerWidth() - 1,
          cssWidth = parseInt(elem.css('width'), 10) - 1,
          p = scope.defaultOptions.padding,
          r = 0, row, qa, qb, c, ra, rb, hc, hb, ha, wc, elems, n, $e,
          type, indexA, tileA, indexB, tileB;

        if (cssWidth < width) {
          width = cssWidth;
        }

        elem.find('.z-tile').css('padding', '0px').css('margin', '0px');

        for (r = 0; r < zTilesFactory.rows.length; r++) {

          if (zTilesFactory.rows[r].na === 0 &&
            zTilesFactory.rows[r].nb === 0) {
            // 1 element in row:
            elems = elem.find('.z-tiles-row-' + r);
            for (n = 0;n < elems.length;n++) {
              hc = (width + 1) / zTilesFactory.rows[r].c;
              $e = angular.element(elems[n]);
              $e.css('height', hc + 'px').css('width', (width + 1) + 'px').
                css('margin-bottom', p + 'px');
            }
          } else if (zTilesFactory.rows[r].na === 1 &&
            zTilesFactory.rows[r].nb === 0) {
            // 2 elements in row:
            hc = (width - scope.defaultOptions.padding) /
              (zTilesFactory.rows[r].c +
              zTilesFactory.rows[r].ra);
            wc = (hc * zTilesFactory.rows[r].c);

            elems = elem.find('.z-tiles-row-' + r);
            for (n = 0;n < elems.length;n++) {
              $e = angular.element(elems[n]);
              type = $e.attr('tile-type');

              if (type === 'c') {
                $e.css('height', hc + 'px').css('width', wc + 'px').
                  css('margin-bottom', p + 'px');

              } else if (type === 'a') {
                $e.css('height', hc + 'px').css('width',
                  zTilesFactory.rows[r].ra *
                  hc + 'px').css('margin-bottom', p + 'px').
                  css('margin-' + zTilesFactory.rows[r].float, p + 'px');
              }
            }
          } else {
            // 3 and more elements in row
            row = zTilesFactory.rows[r];
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
          zTilesFactory.rows[row].float + '">' +
          scope.transcludeTemplate + '</div>',
          // create isolated scope for tile. Parent Scope
          // is available via "mother"
          isolatedScope = scope.$new(true),
          content;

        isolatedScope.tile = tile;
        isolatedScope.mother = scope.$parent;
        zTilesFactory.cachedScopes.push(isolatedScope);
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

          zTilesFactory.rows.push(row);

          // create DOMs for row
          createRow(tileSet, row, zTilesFactory.rows.length - 1, parent);

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

          zTilesFactory.rows.push(row);

          createRow(tileSet, row, zTilesFactory.rows.length - 1, parent);

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

          zTilesFactory.rows.push(row);

          // create DOMs for row
          createRow(tileSet, row, zTilesFactory.rows.length - 1, parent);
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
      if (zTilesFactory.templateCache) {
        elem.empty();
        elem.append(zTilesFactory.templateCache);
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

      onDestroy = scope.$on('$destroy', function() {
        watcher();
        onDestroy();
      });
      // watch for changes in tiles. Only appending is supported now.
      watcher = scope.$watch('tiles', function() {
        var done,
          max,
          r,
          rowCount = 0,
          align, tilesCount;

        if (scope.tiles.length > 0 &&
          scope.tiles.length < getTilesCount()) {
          zTilesFactory.reset();
          elem.empty();
        }

        if (getTilesCount() === 0 && scope.tiles.length === 0) {
          elem.empty();
        }

        // add new tiles and create DOMs
        if (scope.tiles) {

          if (getTilesCount() !== scope.tiles.length) {
            done = getTilesCount();
            tilesCount = scope.tiles.length;
            while (done < tilesCount) {
              // max tiles
              max = tilesCount - done;
              // Default Counts [3]: 3, 3, 3, 3...
              if (zTilesFactory.countsOffset >=
                scope.defaultOptions.counts.length) {
                zTilesFactory.countsOffset = 0;
              }

              r = Math.min(max,
                scope.defaultOptions.counts[zTilesFactory.countsOffset]);

              // Default Alignments 'lr': left, right, left, right...
              if (zTilesFactory.alignOffset >=
                scope.defaultOptions.alignment.length) {
                zTilesFactory.alignOffset = 0;
              }
              if (scope.defaultOptions.alignment[zTilesFactory.alignOffset] ===
                'l') {
                align = 'left';
              } else if (
                  scope.defaultOptions.alignment[zTilesFactory.alignOffset] ===
                  'r') {
                align = 'right';
              } else {
                if (Math.random() >= 0.5) {
                  align = 'right';
                } else {
                  align = 'left';
                }
              }
              zTilesFactory.alignOffset++;
              zTilesFactory.countsOffset++;

              createGrid(elem, scope.tiles.slice(done, done + r), done, align);
              done += r;
              rowCount++;
            }

            // recalculate styles
            scope.$evalAsync(function() {
              renderCSS();
            });

            $timeout(function() {
              renderCSS();
            }, 100);
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
