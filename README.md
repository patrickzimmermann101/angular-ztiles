angular-ztiles
==============

Self adaptive tiles in AngularJS like www.yahoo.com/food.

Demo: http://patrickzimmermann101.github.io/angular-ztiles
Demo Screenshot:

![Demo Screenshot](https://raw.github.com/patrickzimmermann101/angular-ztiles/master/demo.jpg)

## Technique

Example of a layout with four tiles in a row. 

![Layout](https://raw.github.com/patrickzimmermann101/angular-ztiles/master/layout.jpg)

The algorithm has two alignment modes `left`and `right`. The arrangement is always separating a row in an element from `tile-type=c` spanning over two sub rows. In alignment mode `left`this element is on the left. The others are building two sub rows (`tile-type=a`and `tile-type=b`). Each tile has an margin of the padding value (Default is 4px).

## Installation

1. `bower install --save angular-ztiles`
2. Include `angular-ztiles` in your HTML.

    ```html
    <script src="<your-bower-components>/angular-ztiles/angular-ztiles.js"></script>
    ```

3. Inject the `angular-ztiles` module in your application.

   ```js
    angular.module('your.module', [
        'pz101.ztiles'
    ]);
 ```

## How To

### Minimal use as a directive in your HTML

1. You need an array of elements which represents your tiles. Each element need a  width and height key.
2. Mark your tiles section with the attribute `z-tiles`.
3. Bind your array to the element. `tiles=[...]`.
	
	```html
    <div z-tiles tiles="tiles">
	    <p>Your Tile</p>
    </div>
    ```
Example for a controller class

	```js
	...
	$scope.tiles = [{
		width: 200,
		height: 200,
		body: 'Hello Tile A'
	},{
		width: 300,
		height: 100,
		body: 'Hello Tile B'
	},{
		width: 150,
		height: 300,
		body: 'Hello Tile C'}];
	...
	```

4. You can now access to all data of an element in your array inside your tile definition.

	```html
    <div z-tiles tiles="tiles">
	    <p>{{tile.body}}</p>
    </div>
   ```

5. Example for accessing the mother scope of the controller.

	```html
    <div z-tiles tiles="tiles">
	    <p>{{tile.body}}</p>
	    <button ng-click="mother.click(tile)">Click</button>
    </div>
   ```

	```js
	...
	$scope.click = function(tile) {
		console.log('Clicked Button: ' + tile.body);
	};
	
	$scope.tiles = [{
		width: 200,
		height: 200,
		body: 'Hello Tile A'
	},{
		width: 300,
		height: 100,
		body: 'Hello Tile B'
	},{
		width: 150,
		height: 300,
		body: 'Hello Tile C'}];
	...
	```

### Options

#### Padding

tbd