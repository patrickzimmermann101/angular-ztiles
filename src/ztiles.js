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

angular.module('pz101.angular-ztiles', []);
angular.module('pz101.angular-ztiles')
  .directive('zTiles', function ($compile) {
    
    // Input Objects
    // [{width: 100px, height: 100px, ...}, {width: 200px, height : 200px, ...}, ...]

    var cardsCount = 0;
    var rows = [];
    var templateCache = null;
    var padding = 4;
    var widthKey = 'width';
    var heightKey = 'height';
    var transcludeTemplate = '';
    var maxCards = 5;

    function link(scope,elem) {

        // get ratio of card
        function ratio(card) {
            return card[widthKey] / card[heightKey];
        }

        function renderCSS() {

            var width = elem.width()-1;
            var p = padding;

            elem.find('.z-grid').css('padding', '0px').css('margin','0px');

            for (var r = 0; r < rows.length; r++) {
              
                var row = rows[r];
                var qa = (row.na-1)*p;
                var qb = (row.nb-1)*p;
                var c = row.c;
                var ra = row.ra;
                var rb = row.rb;
                var hc = (qb-qa+ra*p+(rb+ra)*((p+qa-width)/ra-p))/(-rb-(rb/ra*c)-c);
                var hb = (p+qa-width)/ra-p+(1+c/ra)*hc;
                var ha = -p+hc-hb;
                var wc = c*hc;
                //var wab = qa+ra*ha;
           
                var elems = elem.find('.z-grid-row-'+ r);
          
                for (var n=0;n<elems.length;n++) {
                    var $e = angular.element(elems[n]);
                    var type = $e.attr('grid-type');
                    
                    // 2 Row Element
                    if (type === 'c') {
                        $e.css('height', hc+'px').css('width', wc+'px').css('margin-bottom', p+'px');

                    // 1. Row
                    } else if (type === 'a') {
              
                        var indexA = (row.offset + row.pa[$e.attr('grid-col')]);
                        var cardA = scope.cards[indexA];
                        $e.css('height', ha+'px').css('width', ratio(cardA)*ha+'px').css('margin-'+row.float, p+'px');
                     
                    // 2. Row
                    } else if (type === 'b') {

                        var indexB = (row.offset + row.pb[$e.attr('grid-col')]);
                        var cardB = scope.cards[indexB];
                        $e.css('width', ratio(cardB)*hb+'px').css('margin-top', p+'px').css('margin-bottom', p+'px')
                          .css('height', hb+'px').css('margin-'+row.float, p+'px');
                    }
                }
            }
            
            // Wait for compiling
            scope.$evalAsync(function() {
                templateCache = elem.html();
            });
      
        }
    
        function createRow(cardSet, row, num, parent) {

            createDOM('c', num, 0, cardSet[row.pc], parent);
          
            for (var a = 0; a<row.na;a++) {
                createDOM('a', num, a, cardSet[parseInt(row.pa[a],10)], parent);
            }

            for (var b = 0; b<row.nb;b++) {
                createDOM('b', num, b, cardSet[parseInt(row.pb[b],10)], parent);
            }
                
            parent.append('<div class="z-grid-clear" style="clear:both" />');
        }
     
        function createDOM(type, row, col, card, parent) {
        
            var outterdiv = '<div class="z-grid z-grid-row-'+
                row+'" grid-col="'+
                col+'" grid-type="'+
                type+'" style="float:'+
                rows[row].float+'">'+
                transcludeTemplate+'</div>';
            
            // create isolated scope for card. Parent Scope is available via "mother"
            var isolatedScope = scope.$new(true);
            isolatedScope.card = card;
            isolatedScope.mother = scope.$parent;

            var content = $compile(outterdiv)(isolatedScope);
            parent.append(content);
        }

        function createGrid(parent, cardSet, offset) {
            // TODO for count 1 and 2

            if (cardSet.length >= 3) {

                var lowestRatio = 0;
                
                for (var n = 0;n<cardSet.length;n++) {
                    if (ratio(cardSet[n]) < ratio(cardSet[lowestRatio])) {
                        lowestRatio = n;
                    }
                }

                var c = ratio(cardSet[lowestRatio]);
                var pc = lowestRatio;
                var pa = [];
                var pb = [];

                var lastTime = null;

                for (var i = 0;i<cardSet.length;i++) {
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
                var ra = 0;
                for (var k = 0; k < pa.length; k++) {
                    ra += ratio(cardSet[pa[k]]);
                }
                var rb = 0;
                for (var l = 0; l < pb.length; l++) {
                    rb += ratio(cardSet[pb[l]]);
                }

                var row = {
                    c : c,
                    ra : ra,
                    rb : rb,
                    na : pa.length,
                    nb : pb.length,
                    pa : pa,
                    pb : pb,
                    pc: pc,
                    offset : offset,
                    float : 'left'
                };

                rows.push(row);

                // create DOMs for row
                createRow(cardSet, row, rows.length-1, parent);
            }
        }

        // Defaults Values
        if (scope.widthKey) {
            widthKey = scope.widthKey;
        }
        if (scope.heightKey) {
            heightKey = scope.heightKey;
        }
        if (scope.cardPadding) {
            padding = parseInt(scope.cardPadding);
        }
        if (scope.maxCards) {
            maxCards = parseInt(scope.maxCards);
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
         
        var $window = angular.element(window);
        
        // recalculate sizes afer window resize event 
        $window.resize(function(){
            renderCSS();
        });

        // recalculate sizes after parent resize event
        elem.resize(function() {
            renderCSS();
        });

        if (scope.cards) {
            cardsCount = scope.cards.length;
        }

        // watch for changes in cards. Only appending is supported now.
        scope.$watch('cards', function() {
       
            // add new cards and create DOMs
            if (scope.cards) {
                if (cardsCount !== scope.cards.length) {
                
                    var done = cardsCount;
                    cardsCount = scope.cards.length;
                    
                    while (done < cardsCount) {
                        // max cards 
                        var max = Math.min(maxCards+1, cardsCount - done);
                        // standard value is set to 3
                        var r = Math.min(max, 3);
                        if (max > 3) {
                            r = Math.floor((Math.random() * (max-3)) + 3);
                        }
                       
                        createGrid(elem, scope.cards.slice(done, done+r), done);
                        done+=r;
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
            cards : '=cards',
            widthKey : '@',
            heightKey : '@',
            cardPadding : '@',
            maxCards : '@'
        },
        link : link
    };
});
