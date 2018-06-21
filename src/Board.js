// This file is a Backbone Model (don't worry about what that means)
// It's part of the Board Visualizer
// The only portions you need to work on are the helper functions (below)

(function() {

  window.Board = Backbone.Model.extend({
    initialize: function (params) {
      if (_.isUndefined(params) || _.isNull(params)) {
        console.log('Good guess! But to use the Board() constructor, you must pass it an argument in one of the following formats:');
        console.log('\t1. An object. To create an empty board of size n:\n\t\t{n: %c<num>%c} - Where %c<num> %cis the dimension of the (empty) board you wish to instantiate\n\t\t%cEXAMPLE: var board = new Board({n:5})', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: grey;');
        console.log('\t2. An array of arrays (a matrix). To create a populated board of size n:\n\t\t[ [%c<val>%c,%c<val>%c,%c<val>%c...], [%c<val>%c,%c<val>%c,%c<val>%c...], [%c<val>%c,%c<val>%c,%c<val>%c...] ] - Where each %c<val>%c is whatever value you want at that location on the board\n\t\t%cEXAMPLE: var board = new Board([[1,0,0],[0,1,0],[0,0,1]])', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: blue;', 'color: black;', 'color: grey;');
      } else if (params.hasOwnProperty('n')) {
        this.set(makeEmptyMatrix(this.get('n')));
      } else {
        this.set('n', params.length);
      }
    },

    rows: function() {
      return _(_.range(this.get('n'))).map(function(rowIndex) {
        return this.get(rowIndex);
      }, this);
    },

    togglePiece: function(rowIndex, colIndex) {
      this.get(rowIndex)[colIndex] = + !this.get(rowIndex)[colIndex];
      this.trigger('change');
    },

    _getFirstRowColumnIndexForMajorDiagonalOn: function(rowIndex, colIndex) {
      return colIndex - rowIndex;
    },

    _getFirstRowColumnIndexForMinorDiagonalOn: function(rowIndex, colIndex) {
      return colIndex + rowIndex;
    },

    hasAnyRooksConflicts: function() {
      return this.hasAnyRowConflicts() || this.hasAnyColConflicts();
    },

    hasAnyQueenConflictsOn: function(rowIndex, colIndex) {
      return (
        this.hasRowConflictAt(rowIndex) ||
        this.hasColConflictAt(colIndex) ||
        this.hasMajorDiagonalConflictAt(this._getFirstRowColumnIndexForMajorDiagonalOn(rowIndex, colIndex)) ||
        this.hasMinorDiagonalConflictAt(this._getFirstRowColumnIndexForMinorDiagonalOn(rowIndex, colIndex))
      );
    },

    hasAnyQueensConflicts: function() {
      return this.hasAnyRooksConflicts() || this.hasAnyMajorDiagonalConflicts() || this.hasAnyMinorDiagonalConflicts();
    },

    _isInBounds: function(rowIndex, colIndex) {
      return (
        0 <= rowIndex && rowIndex < this.get('n') &&
        0 <= colIndex && colIndex < this.get('n')
      );
    },


/*
         _             _     _
     ___| |_ __ _ _ __| |_  | |__   ___ _ __ ___ _
    / __| __/ _` | '__| __| | '_ \ / _ \ '__/ _ (_)
    \__ \ || (_| | |  | |_  | | | |  __/ | |  __/_
    |___/\__\__,_|_|   \__| |_| |_|\___|_|  \___(_)

 */
    /*=========================================================================
    =                 TODO: fill in these Helper Functions                    =
    =========================================================================*/

    // ROWS - run from left to right
    // --------------------------------------------------------------
    //
    // test if a specific row on this board contains a conflict
    
    hasRowConflictAt: function(rowIndex) {  
      var row = this.get(rowIndex);
      var sumOfAllNumbers = row.reduce(function(acc, nextItem){ return acc + nextItem; });
      return sumOfAllNumbers > 1;

      // return this.get(rowIndex).reduce(function(a, n) { return (a + n) }) > 1;
      // var board = this.rows();       
      // for (var i = 0; i < board[rowIndex].length; i++) {
      //   if (board[rowIndex][i] === 1) {
      //     return true;
      //   }
      // }
      // return false; 
    },

    // test if any rows on this board contain conflicts
    hasAnyRowConflicts: function() {       
      var board = this.rows();                   
      for (var i = 0; i < board.length; i++) {        
        if (this.hasRowConflictAt(i) === true) {
          return true;
        }
      }
      return false; 
    },

    // COLUMNS - run from top to bottom
    // --------------------------------------------------------------
    //
    // test if a specific column on this board contains a conflict
    hasColConflictAt: function(colIndex) {
      var board = this.rows();
      var column = [];      
      for (var i = 0; i < board.length; i++) {
        column.push(board[i][colIndex]);
      }      
      return (column.reduce(function(a, n) {return a + n;})) > 1;
    },

    // test if any columns on this board contain conflicts
    hasAnyColConflicts: function() {
      var board = this.rows();
      for (var i = 0; i < board.length; i++) {
        if (this.hasColConflictAt(i) === true) {
          return true;
        }
      }
      return false; 
    },

    // Major Diagonals - go from top-left to bottom-right
    // --------------------------------------------------------------
    //
    // test if a specific major diagonal on this board contains a conflict
    hasMajorDiagonalConflictAt: function(majorDiagonalColumnIndexAtFirstRow) {
      var rowIndex = 0;
      var columnIndex = 0;
      if (majorDiagonalColumnIndexAtFirstRow > 0) {
        rowIndex = 0;
        columnIndex = majorDiagonalColumnIndexAtFirstRow;
      } else {
        rowIndex = Math.abs(majorDiagonalColumnIndexAtFirstRow);
        columnIndex = 0;
      }
      var diagonal = 0;
      while (this._isInBounds(rowIndex, columnIndex)) {
        var cell = this.get(rowIndex++)[columnIndex++];
        diagonal += cell;        
      }
      return diagonal > 1; 
    },

    // test if any major diagonals on this board contain conflicts
    hasAnyMajorDiagonalConflicts: function() {
      var stoppingPoint = this.get('n') - 2; //this.get('n') gives us the length of the matrix
      if (stoppingPoint < 0) { return false; }
      for (let i = -(stoppingPoint); i <= stoppingPoint; i++) {
        if (this.hasMajorDiagonalConflictAt(i)) { return true; }
      }  
      return false; 
    },



    // Minor Diagonals - go from top-right to bottom-left
    // --------------------------------------------------------------
    //
    // test if a specific minor diagonal on this board contains a conflict
    hasMinorDiagonalConflictAt: function(minorDiagonalColumnIndexAtFirstRow) {
      // var rowIndex, colIndex;
      // var n = this.get('n');
      // var i = minorDiagonalColumnIndexAtFirstRow;      
      // if (i >= n) {
      //   rowIndex = i % 2;
      //   columnIndex = n - 1;
      // } else {
      //   rowIndex = 0;
      //   columnIndex = i;
      // }
      // var diagonal = this.get(rowIndex)[columnIndex];
      // while (this._isInBounds(rowIndex, columnIndex)) {
      //   var cell = this.get(rowIndex + 1)[columnIndex - 1];
      //   diagonal += cell;
      // }
      // return diagonal > 1;       
    },

    // test if any minor diagonals on this board contain conflicts
    hasAnyMinorDiagonalConflicts: function() {
      // var n = this.get('n');
      // var stoppingPoint = (n - 1) * 2;
      // for (let i = 0; i < stoppingPoint; i++) {
      //   if (this.hasMinorDiagonalConflictAt(i)) { return true; }
      // }
      // return false; 
    }
    /*
     hasMinorDiagonalConflictAt: function(minorDiagonalColumnIndexAtFirstRow) {

      var row, col;
      var n = this.get('n');
      var i = minorDiagonalColumnIndexAtFirstRow;

      if ( i >= n ) {
        col = n - 1;
        row = i % col;
      } else {
        row = 0;
        col = minorDiagonalColumnIndexAtFirstRow;
      }

      var minorCount = 0;

      while ( this._isInBounds( row, col ) ) {
        minorCount += this.get( row++ )[ col-- ];
      }

      return minorCount > 1;

    },

    // test if any minor diagonals on this board contain conflicts
    hasAnyMinorDiagonalConflicts: function() {
      var n = this.get('n');
      var stoppingPoint = n * 2 - 1;

      for (let i = 1; i < stoppingPoint; i++) {
        if ( this.hasMinorDiagonalConflictAt( i ) ) { return true; }
      }

      return false;
    }
    */

    /*--------------------  End of Helper Functions  ---------------------*/


  });

  var makeEmptyMatrix = function(n) {
    return _(_.range(n)).map(function() {
      return _(_.range(n)).map(function() {
        return 0;
      });
    });
  };

}());
