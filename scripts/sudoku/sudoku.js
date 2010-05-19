/** 
 * @package Sudoku
 * @author Vaulter <vaulter@nm.ru> http://vaulter.narod.ru/sudoku
 * @version Mon May 17 13:59:39 2010 v0.3
 * version Jan 6 22:06:55 VOLT 2009 v0.2
 * version Thursday, January 10, 2008 v0.1
 */
;( function() {
/**
 * @class Sudoku 
 * This will be an object that preserves the cell playing field,
 * He will know all the field (other cells) and also be able to "dare" =)
 * @param pid - string of ID or DOMNode
 * @param opts - array of options
 */
sudoku = function( pid, opts ) {

  if( "string" === typeof pid ) { this.wrapper = document.getElementById( pid ); }
  else                          { this.wrapper = pid; }

  if( !this.wrapper )           { this.wrapper = document.body; }
  
  this.options = opts || {};

  this.options.mx =             opts && opts.mx || 9;
  this.options.my =             opts && opts.my || 9;
  this.options.count_diag   = opts && opts.count_diag || false;
  this.options.human        = opts && opts.human || true;         //!< Human oriented export/import
  this.options.iconsDir     = opts && opts.iconsDir || 'files/sudoku/'; //!< Where icons for buttons lays
  this.wrapper.m = [
    [0 ,0, 0, 0, 0, 0, 0, 0, 0],
    [0 ,0, 0, 0, 0, 0, 0, 0, 0],
    [0 ,0, 0, 0, 0, 0, 0, 0, 0],

    [0 ,0, 0, 0, 0, 0, 0, 0, 0],
    [0 ,0, 0, 0, 0, 0, 0, 0, 0],
    [0 ,0, 0, 0, 0, 0, 0, 0, 0],

    [0 ,0, 0, 0, 0, 0, 0, 0, 0],
    [0 ,0, 0, 0, 0, 0, 0, 0, 0],
    [0 ,0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var self = this.wrapper.sudoku = this;//when "new sudoku()"
  //table of Field
  this.f = this.create( this.wrapper, this.options.mx, this.options.my );
  /**
   * options = {
   *    label: "",
   *    id: "",
   *    cl: "",CSS class 
   *    act: function, // on Click, here just avoid keywords "click" and "class"
   *    icon: url,
   *    note: ""
   *    parent: DOM
   *
   * @return DOM element, you need to inject it to DOM yourself
   */
  this.toolbarButton = function( conf ) {//call it like "new toolbarButton"

    var options = conf || {};
    
    ( "undefined" === typeof options.type )?
      options.tag = 'button' :
      options.tag = 'input';

    var btn = document.createElement( options.tag );

    ( "undefined" !== typeof options.type )?
      btn.setAttribute( "type", options.type ) : 0;

    ( "undefined" !== typeof options.id )? 
      btn.setAttribute( "id", options.id ) : 1;

    ( "undefined" !== typeof options.cl )? 
      btn.setAttribute( "class",options.cl + " button" ): 
      btn.setAttribute( "class"," button" );
      //old way
    if ( "undefined" !== typeof options.note ) {
      btn.setAttribute( "title", options.note );
    }

    if ( "undefined" !== typeof options.act ) {
      self.ae( btn, "click", options.act );
    }
    
    if ( "undefined" !== typeof options.icon ) {
      var icon = document.createElement( 'img' );
      icon.setAttribute( 'src' , self.options.iconsDir + options.icon );
      icon.setAttribute( 'width' , 32 );
      icon.setAttribute( 'height' , 32 );
      icon.setAttribute( 'alt' , ("undefined" !== typeof options.label)?  options.label : "x" );//hides wrong

      if ( "undefined" !== typeof options.act ) {
        self.ae( icon, "click", function( e ) { alert( "click" ); } );//options.act 
      }

      btn.appendChild( icon );
    }
      
    if ( "undefined" !== typeof options.label ){

      if ( ("undefined" !== typeof options.type) &&
        ( 'checkbox' === options.type || 'radio' === options.type ) &&
        ("undefined" !== typeof options.parentNode) ) {//there is to what append

        var lbl = options.parentNode.appendChild( document.createElement( 'label' ) );
        /* i need id of control */
        ( "undefined" !== typeof options.id )? lbl.setAttribute( 'for', options.id ): 0;
        lbl.innerHTML = options.label;

      } else {//simple label
        btn.innerHTML += "<br />" + options.label;
      }
    }

    btn.sudoku = self;

    return btn;
  };

  
  //create div for toolbar rewrite old prnt
  this.tb = document.createElement( 'div' );
  this.tb.setAttribute( 'id', "sudoku-toolbar" );
  this.tb.setAttribute( 'class', "toolbar" );
  this.tb = this.wrapper.appendChild( this.tb );
  this.tb.appendChild( new this.toolbarButton( { // Solve level
    label: m.buttons.solve.label,
    icon: "i/arrow-right-double.png",
    note: m.buttons.solve.note,
    id: "solve-button",
    cl:"solve",
    act: function( e ) { self.solve( e ); }
  } ) );
  
  this.tb.appendChild( new this.toolbarButton( { // DO step of solve
    label: m.buttons.step.label,
    icon: "i/arrow-right.png",
    id: "step-button",
    cl: "step",
    act: function( e ) { return self.s( e ); }
  } ) );
  
  var help = document.getElementById( "sudoku-help" );

  if ( ("undefined" !== typeof help) && help ) { //found help text
    //help button
    var hb = new this.toolbarButton( {
      icon: "i/help-hint.png",
      label: m.buttons.help.label,
      act: function( e ) {
        d = window.event ? window.event.srcElement : e.target;//cross browser

        if ( "none" !=  help.style.display ) {
          help.style.display = "none";
        } else {//show
          help.style.display = "block";
        }
      }
    } );

    hb.tab = help;
    this.tb.appendChild( hb );
    help.style.display = "none";
  };
  
  this.tb.appendChild( new this.toolbarButton( { // Stats
    icon: "i/table.png",
    label: m.buttons.stats.label,
    act: function( e ) { alert( self.stats().alert() ); }
  } ) );

  this.tb.appendChild( new this.toolbarButton( { // Clear
    label: m.buttons.clear.label,
    act: function( e ) { self.cl( e ) },
    icon: "i/edit-clear.png"
  } ) );
    
  this.tb.appendChild( new this.toolbarButton( { // Import
    label: m.buttons.import.label,
    act: function( e ) { self._import( e ); },
    icon: "i/document-import.png"
  } ) );
    
  this.tb.appendChild( new this.toolbarButton( { // export
    label: m.buttons.export.label,
    act: function( e ) { self._export( e ); },
    icon: "i/document-export.png"
  } ) );
    
  this.tb.appendChild( document.createElement( "br" ) );
    //this.tb.innerHTML += "<br />";

  this.tb.appendChild( new this.toolbarButton( { // Diagonals
    type: 'checkbox',
    label: m.buttons.diag.label,
    parentNode: this.tb,
    value: 1,
    id: 'count_diag',
    act: function( e ) { 
      var d = ( window.event ? window.event.srcElement : e.target ); 
      self.options.count_diag = d.checked 
    }
  } ) );

  this.theme();//loads css

  /** 
   * Returns the value at matrix field
   */
  this.m = function ( x, y ) {
  
    if ( ("undefined" === typeof x) || ("undefined" === typeof y) ) { return this.wrapper.m; }

    if( ( 0 > x ) || ( x > this.options.mx ) || 
        ( 0 > y ) || ( y > this.options.my ) ) {
      error( "m: wrong params" ); 
      //console.log( x, y );
      return false; 
    }

    return this.wrapper.m[ x ][ y ];
  };//good, now we can use solver.m( 1, 5 )
    
  this.wrapper.style.display = "block";
  return this;
}

sudoku.prototype = {

  /**
   * Create table of field here!
   * @return DOMNode of table
   */
  create : function( wrapper, mx, my ) {
    var self = this;
    var f = document.createElement( 'table' );

    if( true === arguments[ 1 ] ) {//hidden
      f.className = "hidden";
    }

    f = wrapper.appendChild( f );

    for ( var y = 0; y < my; y ++ ) {
      var r = f.insertRow( y );

      for ( var x = 0; x <  mx ; x ++ ) {
        var c = r.insertCell( x );
        c.cx = x;
        c.cy = y;
        c.m = wrapper.m;//TODO

        if( 0 === (x % 3) )       { c.className = c.className + ' lbold'; }
        if( 0 === (y % 3) )       { c.className = c.className + ' tbold'; }
        if( ( my - 1 ) === y )    { c.className = c.className + ' bBold'; }
        if( ( mx - 1 ) === x )    { c.className = c.className + ' rBold'; }

        c.innerHTML='&nbsp;';//c.cx+'x'+c.cy+
        //c.onclick = sudoku.i;//or IE
        //add events
        this.ae( c, "click", this.i );
        //this.ae( c, "mouseover" , function(e) { self.tdmouseover( e ) } );        //HM, why it just so..
        this.ae( c, "mouseover", this.tdmouseover );
        this.ae( c, "mouseout", function () {
          this.sudoku.c( this.cx,this.cy, turn.BLOCK ).each( function (el) {
            el.className = el.className.replace(/light/,"");
          } );
          this.sudoku.c( this.cx,this.cy, turn.HORIZ ).each( function (el) {
            el.className = el.className.replace(/horiz/,"");
          } );
          this.sudoku.c( this.cx,this.cy, turn.VERT ).each( function ( el ) {
            el.className = el.className.replace(/vert/,"");
          } );
          this.sudoku.c( this.cx,this.cy, turn.DIAG ).each( function ( el ) {
            el.className = el.className.replace(/diag/,"");
          } );
        } );

        /**
         * Gets the sudoku object of this td
         */
        c.sudoku = wrapper.sudoku;/*function() {
          return this.parentNode.parentNode.parentNode.sudoku;//tr.tbody.table.sudoku
        }*/
      }//for x
    }//for y
    return f;
  }, // create
  
  /**
   * Check whether the number is in the cell
   * Ideally, testing should be only once for each cell and numbers.
   * Caching results is not applicable
   * @ Param n number to test
   * @ Param x of cell
   * @ Param y of cell
   */
  canbe: function( n, x, y ) { //x = 0..8, y = 0..8
    var can = true;//nothing is wrong
    //check for row compability
    for ( type = 0; type < turn.DIAG + ( this.options.count_diag? 1 : 0 ); type++ ) {
      r = this.c( x, y, type, true ).each( function ( t ) {
//first variant - directly parse DOM element
      //console.log(  parseInt( t.innerHTML ) );
//second is from m
      //console.log( t.m[ t.cx ][ t.cy ] );
        if( parseInt( t.innerHTML ) == n ) return false;//lokk directly to DOM!
      } );

      if( false === r ) can = false;
    }

    return can;
  },
  
  /**
   * fork for UI'n'Array 
   * such we can to not have to separate model and controller
   */
  set: function( x, y, v ) {

    if (    ( 0 > x ) || ( x > this.options.mx ) || 
            ( 0 > y ) || ( y > this.options.my ) || 
            ( "undefined" === typeof v ) || ( null === v ) ) { 
        error( "wrong params" ); /*console.log( x, y, v ); */return false; 
    }

    if ( "object" === typeof v ) {//separate DOM and numbers
      d = v;//DOM
      v = parseInt( v.innerHTML );
      
    } else {                //MY FIELD VALIDATION
    
      if( "undefined" === typeof this.f ){
        this.start();
      }
      
      d = this.f.rows[ y ].cells[ x ];//INNER DOM
      v = parseInt( v );//AS NUMBER
      //alert('rows['+y+'].cells['+x+'] = '+d.cx+'x'+d.cy);
    }
    
    if ( !isNaN( parseInt( v ) ) && ( 0 < v ) && ( v < 10 ) && 
        this.canbe( v, d.cx, d.cy ) ) {
      d.innerHTML = v;
      d.style.fontWeight = '900';
      this.wrapper.m[ x ][ y ] = v;
      return true;
      
    } else {
      d.innerHTML = '&nbsp;';
      d.style.fontWeight = '100';
      this.wrapper.m[ x ][ y ] = 0;
      return false;
    }
  },
  
  /** input number */
  i: function( e ) { // This is event handler of click on td

    if ( "object" === typeof arguments[0] ) { //MouSEEVENT?
      var d, n, nn;
      d = window.event ? window.event.srcElement : e.target;

      if ( "undefined" === typeof cypher ) {
        n = parseInt( d.innerHTML );

        if ( !isNaN( n ) && 0 < n ) {
          nn = prompt( m.inputNumber + ( d.cx+1 )+'x'+( d.cy+1 ), n );
          
        } else {
          nn = prompt( m.inputEN + ( d.cx+1 )+'x'+( d.cy+1 ), "" );
        }
        return d.sudoku.set( d.cx, d.cy, nn );
      }//else
      
      nn = cypher.ask( d );//for this element. in cypher it must be saved
    }
  },
  /**
   * Loads css stylesheet into document
   */
  theme : function( csstoload ) {

    this.themeDir = "/files";//here we need cacl relative path
    this.autoCSS = this.themeDir + "/sudoku/sudoku.css";//were style lay. absolute path
    var loc = document.location.href;//e.g. http://vaulter.localhost/download.html
    loc = loc.replace(/http:\/\/[^\/]+/,"");

    if ( document.createStyleSheet ) {
      document.createStyleSheet( this.autoCSS );
    } else {
      var newSS = document.createElement( 'link' );
      newSS.rel = 'stylesheet';
      newSS.type = 'text/css';
      newSS.href = escape( this.autoCSS );
      document.getElementsByTagName( "head" )[ 0 ].appendChild( newSS );
    }
    return true;
  },
    
  /**
   * criteria fields Functor
   * invoke as 
   * @code
   * DOMelement.click = sudoku.c( sx, sy, HORIZ ).each( function( el ) { Your handler here } );
   * @endcode
   * @param x - start column
   * @param y - start row
   * @param type - one of HORIZ, VERT, BLOCK, DIAG
   * @param exclude boolean count x,y
   */
  c : function( x, y, type, exclude ) {
    var ix;//init 
    var iy;
    var sx;//skip x
    var sy;//skip y

    if ( exclude ) { sx = x; sy = y;}

    switch ( type ) {
      case turn.HORIZ:   iy = y; break;
      case turn.VERT:    ix = x; break;
      case turn.BLOCK:   { ix= Math.floor( x / 3 ) * 3; iy = Math.floor( y / 3 ) * 3; } break;
      case turn.DIAG:    ix=x; iy=y; break;
    }

    var self = this;//save context

    this.each = function ( f, context ) { // iterate, return next elem in criteria or false
      var xx,yy;

      switch ( type ) {
        case turn.HORIZ: {

          for ( var xx=0; xx < self.options.mx; xx++ ) {

            if( exclude && ( sx === xx )) { continue; }//
            //console.log( iy, self.f.rows[ iy ] );
            r = f( self.f.rows[ iy ].cells[ xx ], context );//need?

            if( null != r ) {//break loop
              return r;//to callee
            }
          }
          break; 
        }

        case turn.VERT: {

          for ( var yy=0; yy < self.options.my; yy++ ) {

            if( exclude && ( sy === yy )) { continue; }
            r = f( self.f.rows[ yy ].cells[ ix ], context );

            if( null != r ) { //break loop
              return r;//to callee
            }
          }
          break;
        }

        case turn.BLOCK: {   //check for quandrant

          for ( var xx = ix; xx < ( ix + 3 ); xx ++ ) {

            for ( var yy = iy; yy < ( iy + 3 ); yy ++ ) {

              if ( exclude && ( yy === sy ) && ( xx === sx )) { continue; }
              r = f( self.f.rows[ yy ].cells[ xx ], context );

              if ( null != r ) {//break loop
                return r;//to callee
              }
            }
          }
          break; 
        }//count_diag

        case turn.DIAG: {

          if ( ix === iy ) {
            for ( var xx = 0; xx < self.options.mx; xx ++ ) {

              if ( exclude && ( sx === xx )) { continue; }

              r = f( self.f.rows[ xx ].cells[ xx ], context );

              if(null != r ) {//break loop
                return r;//to callee
              }
            }
          }

          if ( ( 8 - ix ) === iy ) {//lay on diag

            for ( xx=0; xx < self.options.mx; xx ++ ) {

              if ( exclude && ( sx === xx )) { continue; }

              r = f( self.f.rows[ (8-xx) ].cells[ xx ], context );

              if( r != null ) { //break loop
                return r;//to callee
              }
            }
          }

          break; 
        }//case DIAG
      }//switch
    }//this.each
    return this;
  },
  
  /**
   * binds events
   * @public
   * @param o object to listen
   * @param e event string
   * @param a action function
   */
  ae : function( o, e, a ) {
    try {
      if( o.addEventListener ){
        o.addEventListener( e, a, true ); // was true--Opera 7b workaround!
      } else {
        if( o.attachEvent ) { o.attachEvent( "on" + e, a ); } else { return null; }
      }
    
      return true;
    } catch ( err ) {
      return false;//trace err
    }
  },
  
  /** 
   * Step of solving 
   * 1. take statistics of the field, ie the sum of digits affixed to verticals, horizontals and blocks 
   * 2. determine the best stocked criterion, sort criteria on the number of free cells 
   * 3. to him looking for what figures it otsutvuyut and which fields are free 
   * 4. for all the free-field try to put all the free numbers. 
   * 5. if there is a field with one possible option - put it. step successful 
   * 6. If there is no field with a possible - a step is not successful 
   */
  s : function( e ) {
    var sudoku, d, xx, yy, v, c, i;
          //
    if( "object" === typeof e ) {
      d = window.event ? window.event.srcElement : e.target;
    } 
    
    sudoku = this;

    if ( ( "undefined" === typeof sudoku.f ) || null === sudoku.f ) {
      error( m.errors.noField );
      return;
    }

    var m = sudoku.stats().free; //(1,2)

    for( var mi= 0; mi < m.length; mi++ ) { //for each free cell
      var free = [];
      var poss = [ 1,2,3,4,5,6,7,8,9 ]; //(3)

      sudoku.c( m[mi].x, m[mi].y, m[mi].type ).each( function ( e, sudoku ) {

        if ( sudoku.options.verbose ) { e.className += " debug"; }

        n = sudoku.wrapper.m[ e.cx ][ e.cy ];

        if( n > 0 && n < 10 ) {
          poss[ n - 1 ] = 0;//
        } else { // that is free field, save pos
          free.push( { x: e.cx, y: e.cy, nn:[] } );
        }
      }, sudoku );

      var nn = [];//total
      var nnn = [];

      for ( i = 0; i < poss.length; i++ ) { 
        if( 0 != poss[ i ] ) { nn.push( { n: poss[i], free: [] } ); }
      }
      ///Now free for all cells verify the possibility of insert-free numbers (4)
      for ( i= 0; i < free.length; i++ ) {

        for ( var j=0; j < nn.length; j++ ) {

          if ( sudoku.canbe( nn[ j ].n, free[ i ].x, free[ i ].y )) {
            free[ i ].nn.push( nn[ j ].n );
            nn[ j ].free.push( { x: free[ i ].x,y: free[ i ].y } );
          }
        }
      };
      
      for ( i = 0; i  <  free.length;  i++  ) {

        if( 1 === free[ i ].nn.length ) {//URAAAH!
          sudoku.set( free[ i ].x, free[ i ].y, free[ i ].nn.pop() );//FOUND STEP
          //clear verbose?
          return true;
        }
      }

      /// So, walked through the free cells, but no obvious solutions.
      /// Then try to free all the digits from 1 to 9 to find the only
      /// Possible position in the criteria
      for ( i= 0; i < nn.length; i++ ) {
        if ( 1 === nn[ i ].free.length ) {//URAAAH!
          var free = nn[ i ].free.pop();
          sudoku.set( free.x, free.y, nn[ i ].n ); //clear verbose?
          return true;
        }
      }

      /*if ( sudoku.verbose ) {
        this.c( m[mi].x, m[mi].y, m[mi].type ).each( function ( el ) {
          setTimeout( "el=f.rows["+el.cy+"].cells["+el.cx+"];el.className = el.className.replace(/debug/g,'')",300 );
        }, this );
      }*/
    }
    return false; 
  },
  
  /**
   * Just run while steps can be performed
   * Can be called as DOM event
   */
  solve: function( e ) {

    if ( "object" === typeof e ) {
      d = window.event ? window.event.srcElement : e.target;

    }
    
    var sudoku = this;//just trying
    while( sudoku.s() );//solving cycle TODO as setInterval
  },
  
  /**
   * some counts AND utils
   * 1. count free cell and save this num to array of objects
   */
  stats : function() {
    var rows = [];//array
    var cols = [];
    var blocks = [[0,0,0],[0,0,0],[0,0,0]];
    var diag = [];
    var max = { x: null, y: null, ttl: null };
    var free = [];
    var total = 0;
    var self = this;//save context
    
    this.c( 0, 0, turn.VERT ).each( function( el ) {

      ttl = 0;
      rows[ el.cy ] = 0;

      self.c( 0, el.cy, turn.HORIZ ).each( function( e ) { if( 0 < self.m( e.cx, e.cy ) ) { ttl++ } } );

      rows[ el.cy ] = ttl;

      if ( 9 != ttl ){
        free.unshift( { ttl:ttl, x: 0, y: el.cy, type: turn.HORIZ } );
        if ( ttl > max.ttl ) {//store as prob
          max = { ttl: ttl, x: 0, y: el.cy, type: turn.HORIZ };
        }
      }

      total+=ttl;
    } );

    this.c( 0, 0, turn.HORIZ ).each( function( el ) {
      cols[ el.cx ] = 0;
      ttl = 0;

      r= self.c( el.cx, 0, turn.VERT ).each( function( e ) {
        if ( 0 < self.m( e.cx, e.cy )) { ttl++; }
      } );

      cols[ el.cx ] = ttl;

      if ( 9 != ttl ){

        free.unshift( { ttl:ttl, x: el.cx,y: 0, type:turn.VERT } );

        if ( ttl > max.ttl ) {//store as prob
          max = { ttl: ttl, x: el.cx,y: 0, type:turn.VERT };
        }
      }
    } );

    for ( bx = 0; bx < this.options.mx / 3 ; bx++ ) {
      for ( by = 0; by < this.options.my / 3 ; by++ ) {
        ttl = 0;

        this.c( bx*3+1, by*3+1, turn.BLOCK ).each( function( e ) {
          if ( 0 < self.m( e.cx, e.cy )) { ttl++; }
        } );

        blocks[ bx ][ by ] = ttl;

        if ( 9!= ttl ) {

          free.unshift( { ttl:ttl, x: bx*3,y: by*3, type:turn.BLOCK } );

          if ( ttl > max.ttl ) {//store as prob
            max = { ttl: ttl, x: bx*3, y: by*3, type:turn.BLOCK };
          }
        }
      }
    };

    if ( this.options.count_diag ) {//check diags
      var ttl1 = 0, ttl2 = 0;

      for ( dx= 0; dx < this.options.mx; dx++ ) {
        if ( 0 < this.m( dx, dx )) { ttl1++; }
        if ( 0 < this.m( 8-dx, dx )) { ttl2++; }
      }

      if ( 9 != ttl1 ) {
        free.unshift( {ttl:ttl1, x: 0,y: 0, type:turn.DIAG } );

        if ( ttl1 > max.ttl ) {//store as prob
          max = { ttl: ttl1, x: 0,y: 0, type:turn.DIAG };
        }
      }

      if ( ttl2 != 9 ) {
        free.unshift( { ttl:ttl2, x: 8,y: 0, type:turn.DIAG } );

        if ( ttl2 > max.ttl ) {//store as prob
          max = { ttl: ttl2, x: 8,y: 0, type:turn.DIAG };
        }
      }

      diag[ 1 ] = ttl1; diag[ 2 ] = ttl2;
    }

    this.free = free.sort( function( E1, E2 ) { return ( E2.ttl - E1.ttl ); } );

    this.total = total;
    this.max = max;
    this.alert = function() {
      var colsstats =   "        | ";
      var header =      "____| ";
      for ( xx = 0; xx < cols.length; xx++ ) {
          colsstats += " " + cols[ xx ]; //header += " "+xx;
      }

      var rowstats = "";
      for ( yy = 0; yy < rows.length; yy++ ) {
        rowstats += " " + rows[ yy ] + " ";
        if ( ((yy - 1) % 3) == 0 ) {//
          rowstats += "          "+
            " " + blocks[0][(yy-1)/3]+" "+
            "     " + blocks[1][(yy-1)/3]+" "+
            "     " + blocks[2][(yy-1)/3]+" ";
        }
        rowstats += "\r\n";
      }

      var ret = "Total: " + total + "\r\n" + colsstats + "\r\n" + rowstats;

      if ( this.options.count_diag ) {
        ret += "\r\nDiag1: " + diag[1] + " Diag2: " + diag[2];
      }
      return ret;
    }
    return this;
  },

  /**
   * This function has been called as td's event, 
   * In mozilla - this = current element
   * But in IE - not.
   */
  tdmouseover : function( e ) {
    var d = null;

    if ( "object" === typeof e ) { d = window.event ? window.event.srcElement : e.target; } 
    else                        { d = this; }//try mozilla

    var s = this.sudoku;//must be

    window.status = ( d.cx + 1 ) + " x " + ( d.cy + 1 ) + " = "+ s.m( d.cx , d.cy );

    s.c( d.cx, d.cy, turn.BLOCK ).each(   function ( el ) { el.className += " light"; } );

    s.c( d.cx, d.cy, turn.HORIZ ).each(   function ( el ) { el.className += " horiz"; } );

    s.c( d.cx, d.cy, turn.VERT ).each(    function ( el ) { el.className += " vert"; } );

    if ( s.options.count_diag ) {
      s.c( d.cx, d.cy, turn.DIAG ).each(  function ( el ) { el.className += " diag"; } );
    }
  },

  /**
   * Сlear field. Can be called explicit as event!
   * btn.onclick = this.cl;
   */
  cl : function ( e ) {
    var d = null;//, sudoku = null;
    
    if ( "object" === typeof e ) {
      d = window.event ? window.event.srcElement : e.target;
      //sudoku = d.parentNode.parentNode.sudoku;//hmmm/..... TODO
    } else {
      //sudoku = this;//try non event calling
    }

    if( ("undefined" === typeof this.m) || 
        ("undefined" === typeof this.f) ) { //this init
      //console.log( "NOT IMPL" );
      //console.log( this );
      return;//error
    }

    for( var xx = 0; xx < this.options.mx; xx++ ) {
      for( var yy = 0; yy < this.options.my; yy++ ) {
        this.wrapper.m[ xx ][ yy ] = 0;
        this.f.rows[ yy ].cells[ xx ].innerHTML='&nbsp;';
        this.f.rows[ yy ].cells[ xx ].className = this.f.rows[ yy ].cells[ xx ].className.replace( /debug/g, "" );
      }
    }
    
    if( this.ex || ( this.ex = document.getElementById( "export-import" ) ) ) {
      document.body.removeChild( this.ex );
      this.ex = null;
    }
  },
  
  /**
   * Export to String evaluated to js Array
   * Transposition
   */
  toString: function( obj ) {
    var rep = [];//"this" should be correct. This is silly!

    obj.c( 0, 0, turn.VERT ).each( function( ve ) {
      var str = [];
      
      obj.c( 0, ve.cy, turn.HORIZ ).each( function( he ) {
        str.push( obj.wrapper.m[ he.cx ][ he.cy ] );
      } );

      if ( obj.options.human && obj.options.mx < 10 ) {
        rep.push( str.join( "" ) );
      } else {
        rep.push( "  [ " + str.join( ", " ) + " ]" );
      }
    } );
    
    if ( obj.options.human && obj.options.my < 10 ) {
      return rep.join( "\r\n" );
    } else {
      return "[\r\n" + rep.join( ",\r\n" ) + "\r\n]";
    }
  },
   
  _export: function( e ) {

    if ( !this.ex || "undefined" === typeof this.ex ) {
      this.ex = document.getElementById( "export-import" );
    }
    
    if ( !this.ex || "undefined" === typeof this.ex ) {//createElement
      this.ex = document.body.appendChild( document.createElement( "textarea" ) );
      this.ex.setAttribute( "id","export-import" );
      
      if ( this.options.human ) {
        this.ex.setAttribute( "rows", 9 );
        this.ex.setAttribute( "cols", 9 );
      }
    }
    
    var txt = this.toString( this );
    document.all? this.ex.innerText = txt: this.ex.innerHTML = txt;
    this.ex.focus();
    return true;
  },
  
  _import: function( e ) {
  
    if ( !this.ex || "undefined" === typeof this.ex ) {
      this.ex = document.getElementById( "export-import" );
    }
    
    if ( !this.ex || "undefined" === typeof this.ex ) {//createElement
      this.ex = document.body.appendChild( document.createElement( "textarea" ) );
      this.ex.setAttribute( "id","export-import" );
      if ( this.options.human ) {
        this.ex.setAttribute( "rows", 9 );
        this.ex.setAttribute( "cols", 9 );
      }
      //initial
      var txt = this.toString( this );
      document.all? this.ex.innerText = txt: this.ex.innerHTML = txt;
      this.ex.focus();
      return true;// first state?
    }
    
    var it = this.ex.value;

    if ( it.length === 0 ) {
      alert( m.errors.empty );
      return false;
    }
    
    var im = new Array();
    
    try {
      if ( this.options.human /*&& this.options.mx < 10*/ ) {
        var lines = it.replace( /\r\n|\r|\n/g, "|||" ).split( "|||" );
        for ( var line in lines ) {
          im.push( lines[ line ].split( "" ) );
        }
      } else {
        eval( "im = " + it + ";" );
      }
    } catch ( err ) {
      alert( err );
      return false;
    }
    
    //if imported array not like sudoku field - error
    if ( im.length !== this.options.my ) {
      alert( m.errors.linesNotEqual( 0, this.options.my ) );
      return false;
    }
    
    for ( var y = 0; y < this.options.my; y++ ) {

      if ( im[ y ].length != this.options.mx ) {
        alert( m.errors.columnsNotEqual( y, this.options.mx ) );
        return false;
      }

      for ( var x = 0; x < this.options.mx; x++ ) {
        this.set( x, y, im[ y ][ x ] );
      }
    }
    
    return true;
  },
}
/* criteries */
var turn = {
  HORIZ   : 0,
  VERT    : 1,
  BLOCK   : 2,
  DIAG    : 3 
};

} ) //create anon func
(); //execute