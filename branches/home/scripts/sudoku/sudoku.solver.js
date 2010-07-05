/**
 * Sudoku Solver Takes field, try to solve forward step
 */
; // prevent previous erroneous stuff
( function() {
   SudokuSolver = function( obj /* , options */) {
      if ( !( this instanceof SudokuSolver ) ) { // this is valid now
         throw ( "this != SudokuSolver" );
      }

      this.field = [ [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],

      [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],

      [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ] ];
      var opts = arguments[ 1 ];
      this.options = opts || {};// TODO
      this.options.mx = opts && opts.mx || 9;
      this.options.my = opts && opts.my || 9;
      this.options.count_diag = opts && opts.count_diag || false;
      // from GET param
      this.fromLocation();

      if ( "string" === typeof obj ) {
         this.fromString( obj );
      }

      if ( "array" === typeof obj ) {
         // TODO
         this.field = obj; // dummy copy
      }
   };
   SudokuSolver.prototype = {

      /**
       * Returns the value at matrix field TODO ancestor of .c()
       */
      at : function( x, y ) {

         if ( ( "undefined" === typeof x ) && ( "undefined" === typeof y ) ) { return this.field; }

         if ( ( 0 > x ) || ( x > this.options.mx ) ) { throw ( "m: wrong param x = " + x ); }
         if ( ( "undefined" === typeof y ) ) { return this.field[ x ]; }

         if ( ( 0 > y ) || ( y > this.options.my ) ) { throw ( "m: wrong param y = " + y ); }
         return this.field[ x ][ y ];
      },

      /**
       * Import from string
       */
      fromString : function( str ) {

         var im = [];

         try {

            var lines = str.replace( /\./mg, '0' ).replace( /[^\d]/gm, '' ).replace( /(\d{9})(?=\d)/g, "$1|||" ).split(
                     "|||" );

            lines.map( function( line, i ) {
               im.push( line.split( "" ) );
            } );
         }
         catch ( err ) {
            alert( err );
            return false;
         }

         // if imported array not like sudoku field - error
         if ( im.length !== this.options.my ) { throw ( m.errors.linesNotEqual( 0, this.options.my ) ); }

         for ( var y = 0; y < this.options.my; y++ ) {

            if ( im[ y ].length != this.options.mx ) { throw ( m.errors.columnsNotEqual( y, this.options.mx ) ); }

            for ( var x = 0; x < this.options.mx; x++ ) {
               this.set( x, y, im[ y ][ x ] );
            }
         }

         return this;
      },

      /**
       * Imports from GET param "f" or just sudoku?00000 TODO
       */
      fromLocation : function() {
         var qstr = location.search.replace( /\?/, "&" );
         var pair = qstr.split( "&" );
         for ( var i = 1; i < pair.length; i++ ) {
            var item = pair[ i ].split( "=" );

            if ( item[ 0 ] === "f" ) {
               try {
                  return this.fromString( item[ 1 ] );

               }
               catch ( err ) {
                  alert( err );
                  return false;
               }
            }
         }
      },

      /**
       * Sets the matrix value with check or not
       */
      set : function( x, y, v, withcheck ) {

         var check = withcheck || false;

         if ( ( 0 > x ) || ( x > this.options.mx ) || ( 0 > y ) || ( y > this.options.my )
                  || ( "undefined" === typeof v ) || ( null === v ) ) { throw ( "wrong params" ); }

         var d;

         if ( "undefined" === typeof this.field ) { throw ( m.errors.noField ); }

         // d = this.field.rows[ y ].cells[ x ]; // INNER DOM
         v = parseInt( v, 10 ); // AS NUMBER

         if ( !isNaN( v ) && ( 0 < v ) && ( v < 10 ) && ( !check || this.canbe( v, x, y ) ) ) {
            this.field[ x ][ y ] = v;
            return true;

         } else {
            this.field[ x ][ y ] = 0;
            return false;
         }
      },

      /**
       * Check whether the number is in the cell Ideally, testing should be only once for each cell and numbers. Caching
       * results is not applicable
       * 
       * @param x of cell
       * @param y of cell
       * @param n number to test
       */
      canbe : function( x, y, n ) { // x = 0..8, y = 0..8
         var can = true;// nothing is wrong
         // check for row compability
         for ( type = 0; type < turn.DIAG + ( this.options.count_diag ? 1 : 0 ); type++ ) {
            r = this.c( x, y, type, true ).each( function( t ) {
               if ( t === n ) { return false; }
            } );
            if ( false === r ) {
               can = false;
            }
         }

         return can;
      },

      /**
       * criteria fields Functor invoke as
       * 
       * @code DOMelement.click = sudoku.c( sx, sy, HORIZ ).each( function( el ) { Your handler here } );
       * @endcode
       * @param x - start column
       * @param y - start row
       * @param type - one of HORIZ, VERT, BLOCK, DIAG
       * @param exclude boolean count x,y
       */
      c : function( x, y, type, exclude ) {
         var ix;
         var iy;
         var sx;// skip x
      var sy;// skip y

      if ( exclude ) {
         sx = x;
         sy = y;
      }

      switch ( type ) {
         case turn.HORIZ :
            iy = y;
            break;
         case turn.VERT :
            ix = x;
            break;
         case turn.BLOCK :
            ix = Math.floor( x / 3 ) * 3;
            iy = Math.floor( y / 3 ) * 3;
            break;
         case turn.DIAG :
            ix = x;
            iy = y;
            break;
      }

      var self = this;// save context

      this.each = function( f, context ) { // iterate, return next elem in
         // criteria or false
         var xx, yy;

         switch ( type ) {
            case turn.HORIZ :
               for ( xx = 0; xx < self.options.mx; xx++ ) {

                  if ( exclude && ( sx === xx ) ) {
                     continue;
                  }

                  r = f.call( self, self.field[ xx ][ iy ], xx, iy, context );// need?

                  if ( "undefined" !== typeof r && null !== r ) {// break loop
                     return r;// to callee
                  }
               }
               break;

            case turn.VERT :

               for ( yy = 0; yy < self.options.my; yy++ ) {

                  if ( exclude && ( sy === yy ) ) {
                     continue;
                  }
                  r = f.call( self, self.field[ ix ][ yy ], ix, yy, context );

                  if ( "undefined" !== typeof r && null !== r ) { // break loop
                     return r;// to callee
                  }
               }
               break;

            case turn.BLOCK : // check for quadrant

               for ( xx = ix; xx < ( ix + 3 ); xx++ ) {

                  for ( yy = iy; yy < ( iy + 3 ); yy++ ) {

                     if ( exclude && ( yy === sy ) && ( xx === sx ) ) {
                        continue;
                     }

                     r = f.call( self, self.field[ xx ][ yy ], xx, yy, context );

                     if ( "undefined" !== typeof r && null !== r ) {// break loop
                        return r;// to callee
                     }
                  }
               }
               break;

            case turn.DIAG :

               if ( ix === iy ) {
                  for ( xx = 0; xx < self.options.mx; xx++ ) {

                     if ( exclude && ( sx === xx ) ) {
                        continue;
                     }

                     r = f.call( self, self.field[ xx ][ xx ], xx, xx, context );

                     if ( "undefined" !== typeof r && null !== r ) { return r; }
                  }
               }

               if ( ( 8 - ix ) === iy ) { // lay on diag

                  for ( xx = 0; xx < self.options.mx; xx++ ) {

                     if ( exclude && ( sx === xx ) ) {
                        continue;
                     }

                     r = f.call( self, self.field[ xx ][ ( 8 - xx ) ], xx, 8 - xx, context );

                     if ( "undefined" !== typeof r && null !== r ) { return r; }
                  }
               }

               break; // case DIAG
         } // switch
      }; // this.each

      return this;
   },

      /**
       * Step of solving 1. take statistics of the field, ie the sum of digits affixed to cols, lines and blocks 2.
       * determine the best stocked criterion, sort criteria on the number of free cells 3. looking for what figures are
       * absent and which fields are free 4. for all the free-field try to put all the free numbers. 5. if there is a field
       * with one possible option - put it. step successful 6. If there is no field with a possible - a step is not
       * successful 7. Return info for next decisions
       */
      step : function() {
         // var self = this;
         var d, i;
   
         var self = this;
   
         if ( ( "undefined" === typeof self.field ) || null === self.field ) { throw ( m.errors.noField ); }
   
         // all fail
         if (! this.singles() ) nakedSingle();//will count stats
         return true;
      },

      /**
       * some counts AND utils 1. count free cell and save this num to array of objects. 2. Snapshot of model
       */
      stats : function() {
         var rows = [];// array
         var cols = [];
         var blocks = [ [ 0, 0, 0 ], [ 0, 0, 0 ], [ 0, 0, 0 ] ];
         var diag = [];
         var max = {
            x : null,
            y : null,
            ttl : null
         };
         var free = [];
         var total = 0;
         var self = this;
         // var stats = {};//result TODO
   
         // functor outside cycle
         var ttlcounter = function( n ) {
            if ( 0 < n ) {
               ttl++;
            }
         };
   
         // get stats for lines
         this.c( 0, 0, turn.VERT ).each( function( n, cx, cy ) {
   
            ttl = 0; // total free on the row
                  rows[ cy ] = 0;
   
                  this.c( 0, cy, turn.HORIZ ).each( ttlcounter );
                  rows[ cy ] = ttl; // store for this
   
                  if ( 9 !== ttl ) { // something busy, check
                     free.unshift( {
                        ttl : ttl,
                        x : 0,
                        y : cy,
                        type : turn.HORIZ
                     } );
                     if ( ttl > max.ttl ) { // store as probe
                        max = {
                           ttl : ttl,
                           x : 0,
                           y : cy,
                           type : turn.HORIZ
                        }; // store row with most free
                     }
                  }
   
                  total += ttl;
               } );
   
         // get stats for columns
         this.c( 0, 0, turn.HORIZ ).each( function( el, cx, cy ) {
            cols[ cx ] = 0;
            ttl = 0;
   
            r = self.c( cx, 0, turn.VERT ).each( ttlcounter );
            cols[ cx ] = ttl;
   
            if ( 9 != ttl ) {
   
               free.unshift( {
                  ttl : ttl,
                  x : cx,
                  y : 0,
                  type : turn.VERT
               } );
   
               if ( ttl > max.ttl ) {// store as prob
                     max = {
                        ttl : ttl,
                        x : cx,
                        y : 0,
                        type : turn.VERT
                     };
                  }
               }
            } );
   
         for ( bx = 0; bx < this.options.mx / 3; bx++ ) {
            for ( by = 0; by < this.options.my / 3; by++ ) {
               ttl = 0;
   
               this.c( bx * 3 + 1, by * 3 + 1, turn.BLOCK ).each( ttlcounter );
               blocks[ bx ][ by ] = ttl;
   
               if ( 9 != ttl ) {
   
                  free.unshift( {
                     ttl : ttl,
                     x : bx * 3,
                     y : by * 3,
                     type : turn.BLOCK
                  } );
   
                  if ( ttl > max.ttl ) {// store as prob
                     max = {
                        ttl : ttl,
                        x : bx * 3,
                        y : by * 3,
                        type : turn.BLOCK
                     };
                  }
               }
            }
         }
   
         if ( this.options.count_diag ) {// check diags
            var ttl1 = 0, ttl2 = 0;
   
            for ( dx = 0; dx < this.options.mx; dx++ ) {
               if ( 0 < this.at( dx, dx ) ) {
                  ttl1++;
               }
               if ( 0 < this.at( 8 - dx, dx ) ) {
                  ttl2++;
               }
            }
   
            if ( 9 != ttl1 ) {
               free.unshift( {
                  ttl : ttl1,
                  x : 0,
                  y : 0,
                  type : turn.DIAG
               } );
   
               if ( ttl1 > max.ttl ) {// store as prob
                  max = {
                     ttl : ttl1,
                     x : 0,
                     y : 0,
                     type : turn.DIAG
                  };
               }
            }
   
            if ( ttl2 != 9 ) {
               free.unshift( {
                  ttl : ttl2,
                  x : 8,
                  y : 0,
                  type : turn.DIAG
               } );
   
               if ( ttl2 > max.ttl ) {// store as prob
                  max = {
                     ttl : ttl2,
                     x : 8,
                     y : 0,
                     type : turn.DIAG
                  };
               }
            }
   
            diag[ 1 ] = ttl1;
            diag[ 2 ] = ttl2;
         }
   
         free = free.sort( function( E1, E2 ) {
            return ( E2.ttl - E1.ttl );
         } );
   
         // momentary, not safe at all!!!
         this.isEmpty = function() {
            return total === 0;
         };
         this.total = total;
         this.max = max;
         this.alert = function() {
            var colsstats = "        |  " + cols.join( " " );
   
            var rowstats = "";
            for ( yy = 0; yy < rows.length; yy++ ) {
               rowstats += " " + rows[ yy ] + " ";
               if ( ( ( yy - 1 ) % 3 ) === 0 ) { //
                  rowstats += "          " + " " + blocks[ 0 ][ ( yy - 1 ) / 3 ] + " " + "     "
                           + blocks[ 1 ][ ( yy - 1 ) / 3 ] + " " + "     " + blocks[ 2 ][ ( yy - 1 ) / 3 ] + " ";
               }
               rowstats += "\r\n";
            }
   
            var ret = "Total: " + total + "\r\n" + colsstats + "\r\n" + rowstats;
   
            if ( this.options.count_diag ) {
               ret += "\r\nDiag1: " + diag[ 1 ] + " Diag2: " + diag[ 2 ];
            }
            return ret;
         };
   
         // just dummy iterate all field and remember possibilities
         var variants = [];
         this.at().map( function( row, y ) { // by columns
                     self.at( y ).map( function( cell, x ) { // by cells
   
                                 if ( cell > 0 ) {
   
                                    for ( var tocheck = 1; tocheck < 10; tocheck++ ) { // 1..9
   
                                       if ( self.canbe( x, y, tocheck ) ) {
   
                                          if ( !variants[ x ] ) {
                                             variants[ x ] = [];
                                          }
                                          if ( !variants[ x ][ y ] ) {
                                             variants[ x ][ y ] = [];
                                          }
                                          variants[ x ][ y ].push( tocheck );
                                       }
                                    }
                                 }
                              } );
                  } );
   
         return {
            variants : variants,
            rows : rows,
            cols : cols,
            free : free,
            total : total,
            max : max
         };
      },

      /**
       * Finds the singles - the only possible cell for number
       * 
       * @param stats
       * @return
       */
      singles : function( stats ) {
   
         var st = ( typeof stats === "object" && stats || this.stats() );//TODO rename VARS like "st.free[ i ].nn"
         st.changed = false; //dirty
   
         st.variants.map( function( line, y ) {
            line.map( function( cell, x ) {
               
               if ( 1 === cell.length ) {// URAAAH!
                  self.set( x, y, cell.pop() );// FOUND STEP
                  // clear verbose?
                  //console.log( "STEP by only one possible at ", x, 'x', y, cell );
                  st.changed = true;// find all singles
               }
            });
         });
         
         return st;
      },
      /**
       * Finds naked single - the only possible number in the cell
       * 
       * @param stats
       * @return
       */
      nakedSingle : function( stats ) {
         var fullCheck = ( typeof stats === "boolean" && stats ); // perform complete check
         var st = ( typeof stats === "object" && stats || this.stats() );
         st.changed = false;
         var self = this;
         var free, poss, variants = []; // store free cell here, possible values for this cell
         // functor for counting free
         var countFree = function( n, cx, cy ) {
   
            if ( n > 0 && n < 10 ) {
               delete poss[ n - 1 ];// = 0; // remove possibility
            } else { // that is free field, save position
               free.push( {
                  x : cx, y : cy,
                  n : []
               } );
            }
         };
   
         for ( var mi = 0; mi < st.free.length; mi++ ) { // for each free cell
            free = [];
            poss = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ]; // (3)
   
            this.c( st.free[ mi ].x, st.free[ mi ].y, st.free[ mi ].type ).each( countFree );
   
            var byNumbers = [];// total
   
            poss.map( function ( num, i ) {
               if ( num ) {
                  byNumbers.push( { n : num, free : [] } );
               }
            });
            

            // /Now free for all cells verify the possibility of insert-free
            // numbers (4)
            free.map( function( cell, i ) {
               byNumbers.map( function( num, j ) {
                  if ( self.canbe( cell.x, cell.y, num ) ) {
                     //free[ i ].nn.push( num );// store as possible number for position
                     byNumbers[ j ].free.push( {// store as possible position for number
                        x : cell.x, y : cell.y
                     } );
                  }
               });
            } );

                  
   
                     // overall
                     // if ( !variants[ free[ i ].y ] ) { variants[ free[ i ].y ] = []; }
                     // if ( !variants[ free[ i ].y ][ free[ i ].x ] ) { variants[ free[ i ].y ][ free[ i ].x ] = []; }
                     // console.log( nn[ j ].n );
                     // variants[ free[ i ].y ][ free[ i ].x ].push( num );
                     // variants[ free[ i ].x ][ free[ i ].y ].concat( nn[ j ].n );

               // variants[ free[ i ].y ][ free[ i ].x ] = variants[ free[ i ].y ][ free[ i ].x ].unique();
               // console.log( free[ i ].x ,free[ i ].y, variants[ free[ i ].x ][ free[ i ].y ] );
            // / So, walked through the free cells, but no obvious solutions.
            // / Then try to free all the digits from 1 to 9 to find the only
            // / Possible position in the criteria
            
            
            byNumbers.map( function ( variant, i ) {
               if ( 1 === variant.free.length ) {// URAAAH!
                  var topfree = variant.free.pop();
                  self.set( topfree.x, topfree.y, variant.n ); // clear verbose?
                  st.changed = true;//TODO combine
                  //console.log( "STEP by position only possible of ", variant, topfree );
                  
                  //return true;//exit from map function?
               }
            } );
         }

         
         return st;
      }
   };
} ) // create anon function
         (); // execute

