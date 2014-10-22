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

describe('z-tiles directive', function() {

  var $elem,
    $scope,
    tiles = [
      {width: 100, height: 454, body: 'tile1'},
      {width: 250, height: 200, body: 'tile2'},
      {width: 250, height: 250, body: 'tile3'},
      {width: 200, height: 908, body: 'tile4'},
      {width: 500, height: 400, body: 'tile5'},
      {width: 500, height: 500, body: 'tile6'},
      {width: 355, height: 100, body: 'tile7'}
    ];

  beforeEach(angular.mock.module('pz101.ztiles'));
  beforeEach(inject(function($rootScope) {
    $scope = $rootScope.$new();
    $scope.tiles = tiles;
  }));

  function compileDirective(options) {
    var tpl = '<div z-tiles tiles="tiles"' +
     'options="options" style="width:355px"></div>',
      elem;

    $scope.options = options;

    inject(function($compile) {
      elem = $compile(tpl)($scope);
      $elem = elem;
    });

    $scope.$digest();
  }

  describe('with default options', function() {
    // before each test in this block, generates a fresh directive
    beforeEach(function() {
      compileDirective();
    });

    it('should have three tiles in the first row', function() {
      expect($elem.find('.z-tiles-row-0').length).toBe(3);
    });

    it('should have seven tiles', function() {
      expect($elem.find('.z-tile').length).toBe(7);
    });

    it('should have left alignment in the first row', function() {
      var $row0 = $elem.find('.z-tiles-row-0');
      expect($($row0[0]).css('float')).toBe('left');
      expect($($row0[1]).css('float')).toBe('left');
      expect($($row0[2]).css('float')).toBe('left');
    });

    it('should have right alignment in the second row', function() {
      var $row1 = $elem.find('.z-tiles-row-1');
      expect($($row1[0]).css('float')).toBe('right');
      expect($($row1[1]).css('float')).toBe('right');
      expect($($row1[2]).css('float')).toBe('right');
    });

    it('should have the right arrangements', function() {
      var $row0 = $elem.find('.z-tiles-row-0');
      expect($($row0[0]).css('width')).toBe('100px');
      expect($($row0[1]).css('width')).toBe('250px');
      expect($($row0[2]).css('width')).toBe('250px');
      expect($($row0[0]).css('height')).toBe('454px');
      expect($($row0[1]).css('height')).toBe('200px');
      expect($($row0[2]).css('height')).toBe('250px');
      expect($($row0[0]).attr('tiles-col')).toBe('0');
      expect($($row0[1]).attr('tiles-col')).toBe('0');
      expect($($row0[2]).attr('tiles-col')).toBe('0');
      expect($($row0[0]).attr('tile-type')).toBe('c');
      expect($($row0[1]).attr('tile-type')).toBe('a');
      expect($($row0[2]).attr('tile-type')).toBe('b');
    });

    it('should have 8 elements', function() {
      var tmp = angular.copy(tiles);
      tmp.push({width: 100, height: 200, body: 'tile8'});
      $scope.tiles = tmp;
      $scope.$digest();
      expect($elem.find('.z-tile').length).toBe(8);
    });

    it('should have 1 element in third and fourth row', function() {
      var $row3 = $elem.find('.z-tiles-row-2'),
        tmp = angular.copy(tiles),
        $row4;
      expect($row3.length).toBe(1);

      tmp.push({width: 100, height: 200, body: 'tile8'});
      tmp.push({width: 200, height: 150, body: 'tile9'});
      $scope.tiles = tmp;
      $scope.$digest();
      $row4 = $elem.find('.z-tiles-row-3');
      expect($row4.length).toBe(2);
    });
  });
});
