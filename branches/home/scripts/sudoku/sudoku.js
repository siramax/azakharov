/** 
 * @package Sudoku
 * @author Vaulter <vaulter@nm.ru> http://vaulter.narod.ru/sudoku
 * @version Mon May 17 13:59:39 2010 v0.3
 * version Jan 6 22:06:55 VOLT 2009 v0.2
 * version Thursday, January 10, 2008 v0.1
 */

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
  this.options.count_diag =     opts && opts.count_diag || false;
  
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
  this.f = sudoku.create( this.wrapper, this.options.mx, this.options.my );
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
  this.toolbarButton = function( options ) {//call it like "new toolbarButton"

    var options = options || {};
    
    ( "undefined" === typeof options.type )?
      options.tag = 'button':
      options.tag = 'input';

    var btn = document.createElement( options.tag );

    ( "undefined" !== typeof options.type )?
      btn.setAttribute( "type", options.type ): 0;

    ( "undefined" !== typeof options.id )? 
      btn.setAttribute( "id", options.id ): 1;

    ( "undefined" !== typeof options.cl )? 
      btn.setAttribute( "class",options.cl + " button" ): 
      btn.setAttribute( "class"," button" );
      //old way
    if ( "undefined" !== typeof options.note ) {
      btn.setAttribute( "title", options.note );
    }

    if ( "undefined" !== typeof options.act ) {
      sudoku.ae( btn, "click", options.act );
    }
    
    if ( "undefined" !== typeof options.icon ) {
      var icon = document.createElement( 'img' );
      icon.setAttribute( 'src' , 'files/sudoku/' + options.icon );
      icon.setAttribute( 'width' , 32 );
      icon.setAttribute( 'height' , 32 );
      icon.setAttribute( 'alt' , ("undefined" !== typeof options.label)?  options.label : "x" );//hides wrong

      if ( "undefined" !== typeof options.act ) {
        sudoku.ae( icon, "click", function( e ) { alert( "click" ); } );//options.act 
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
    icon: "i/player_play.png",
    note: m.buttons.solve.note,
    id: "solve-button",
    cl:"solve",
    act: function( e ) { self.solve(); }
  } ) );
  
  this.tb.appendChild( new this.toolbarButton( { // DO step of solve
    label: m.buttons.step.label,
    icon: "i/player_end.png",
    id: "step-button",
    cl: "step",
    act: function( e ) { return self.s(); }
  } ) );
  
  var help = document.getElementById( "sudoku-help" );

  if ( ("undefined" !== typeof help) && help ) { //found help text
    //help button
    var hb = new this.toolbarButton( {
      icon: "i/help.png",
      label: m.buttons.help.label,
      act: function( e ) {
          d = window.event ? window.event.srcElement : e.target;//cross browser

          if ( "none" !=  d.tab.style.display ) {
              d.tab.style.display = "none";//hides
          } else {//show
              d.tab.style.display = "block"; 
          }
      }
    } );

    hb.tab = help;
    this.tb.appendChild( hb );
    help.style.display = "none";
  };
  
  this.tb.appendChild( new this.toolbarButton( { // Stats
    icon: "i/player_playlist.png",
    label: m.buttons.stats.label,
    act: function( e ) { alert( self.stats().toString() ); }
  } ) );

  this.tb.appendChild( new this.toolbarButton( { // Clear
    label: m.buttons.clear.label,
    act: self.cl,
    icon: "i/no.png"
  } ) );
    
  this.tb.appendChild( new this.toolbarButton( { // Import
    label: m.buttons.import.label,
    act: function( e ) { self._import(); }
    /*icon: "i/import.png"*/
  } ) );
    
  this.tb.appendChild( new this.toolbarButton( { // export
    label: m.buttons.export.label,
    act: function( e ) { self._export(); }
    /*icon: "i/export.png"*/
  } ) );
    
  this.tb.appendChild( document.createElement( "br" ) );
    //this.tb.innerHTML += "<br />";

  this.tb.appendChild( new this.toolbarButton( { // Diagonals
    type: 'checkbox',
    label: m.buttons.diag.label,
    parentNode: this.tb,
    value: 1,
    id: 'count_diag',
    act: function( e ) { self.options.count_diag = d.checked }
  } ) );

  sudoku.theme();//loads css

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

/**
 * Сlear field. Can be called explicit as event!
 * btn.onclick = this.cl;
 */
sudoku.constructor.prototype.cl = function ( e ) {
  var d = null;//, sudoku = null;

  if( "object" == typeof e ){
    d = window.event ? window.event.srcElement : e.target;
    //sudoku = d.parentNode.parentNode.sudoku;//hmmm/..... TODO
  } else {
    //sudoku = this;//try non event calling
  }

  if( ("undefined" === typeof sudoku.m) || 
      ("undefined" === typeof sudoku.f) ) {//this init
    //console.log( "NOT IMPL" );
    //console.log( this );
    return;//error
  }

  for( var xx = 0; xx < sudoku.options.mx; xx++ ) {
    for( var yy = 0; yy < sudoku.options.my; yy++ ) {
      sudoku.wrapper.m[ xx ][ yy ] = 0;
      sudoku.f.rows[ yy ].cells[ xx ].innerHTML='&nbsp;';
      sudoku.f.rows[ yy ].cells[ xx ].className = sudoku.f.rows[ yy ].cells[ xx ].className.replace( /debug/g, "" );

      if( sudoku.ex || ( sudoku.ex = document.getElementById( "export" ) ) )
        document.body.removeChild( sudoku.ex );

      if( sudoku.im || ( sudoku.im = document.getElementById( "import" ) ) ) 
        document.body.removeChild( sudoku.im );
    }
  }
};
  
/**
 * Create table of field here!
 * @return DOMNode of table
 */
sudoku.constructor.prototype.create = function( wrapper, mx, my ) {
  var f = document.createElement( 'table' );
  f.sudoku = self;//TODO

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
      sudoku.ae( c, "click", this.i );
      sudoku.ae( c, "mouseover" , this.tdmouseover );        //HM, why it just so..

      sudoku.ae( c, "onmouseout", function () {
        sudoku.c( this.cx,this.cy, turn.BLOCK ).each( function (el) {
          el.className = el.className.replace(/light/,"");
        } );
        sudoku.c( this.cx,this.cy, turn.HORIZ ).each( function (el) {
          el.className = el.className.replace(/horiz/,"");
        } );
        sudoku.c( this.cx,this.cy, turn.VERT ).each( function ( el ) {
          el.className = el.className.replace(/vert/,"");
        } );
        sudoku.c( this.cx,this.cy, turn.DIAG ).each( function ( el ) {
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
}//this.create


/**
 * Loads css stylesheet into document
 */
sudoku.constructor.prototype.theme = function( csstoload ) {

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
};
    
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
sudoku.constructor.prototype.c = function( x, y, type, exclude ) {
console.log( sudoku.f );
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

  //var self = this;

  this.each = function ( f, context ) {//iterate, return next elem in criteria or false
    var xx,yy;

    switch ( type ) {
      case turn.HORIZ: {

        for ( var xx=0; xx < self.options.mx; xx++ ) {

          if( exclude && ( sx === xx )) { continue; }//

          r = f( self.f.rows[iy].cells[xx], context );//need?

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
            console.log( self );
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
};
  
/**
 * binds events
 * @public
 * @param o object to listen
 * @param e event string
 * @param a action function
 */
sudoku.constructor.prototype.ae = function( o, e, a ) {
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
};

/**
 * some counts AND utils
 * 1. count free cell and save this num to array of objects
 */
sudoku.constructor.prototype.stats = function() {
  var rows = [];//array
  var cols = [];
  var blocks = [[0,0,0],[0,0,0],[0,0,0]];
  var diag = [];
  var max = { x: null, y: null, ttl: null };
  var free = [];
  var total = 0;
  var self = this;//work only if "new stats()" else this = context
  
  this.c( 0, 0, turn.VERT ).each( function( el ) {

    ttl = 0;
    rows[ el.cy ] = 0;

    self.c( 0, el.cy, turn.HORIZ ).each( function( e ) { if( 0 < self.m( e.cx, e.cy ) ) ttl++ } );

    rows[ el.cy ] = ttl;

    if( 9 != ttl ){
      free.unshift( { ttl:ttl, x: 0, y: el.cy, type: turn.HORIZ } );
      if( ttl > max.ttl ) {//store as prob
        max = { ttl: ttl, x: 0, y: el.cy, type: turn.HORIZ };
      }
    }

    total+=ttl;
  } );

  this.c( 0, 0, turn.HORIZ ).each( function( el ) {
    cols[ el.cx ] = 0;
    ttl = 0;

    r= self.c( el.cx, 0, VERT ).each( function( e ) {

      if( 0 < self.m( e.cx, e.cy )) ttl++; 
    } );

    cols[ el.cx ] = ttl;

    if( 9 != ttl ){

      free.unshift( { ttl:ttl, x: el.cx,y: 0, type:VERT } );

      if( ttl > max.ttl ) {//store as prob
        max = { ttl: ttl, x: el.cx,y: 0, type:VERT };
      }
    }
  } );

  for ( bx = 0; bx < this.options.mx / 3 ; bx++ ) {
    for ( by = 0; by < this.options.my / 3 ; by++ ) {
      ttl = 0;

      this.c( bx*3+1, by*3+1, BLOCK ).each( function( e ) {
        if( 0 < self.m( e.cx, e.cy )) ttl++;
      } );

      blocks[ bx ][ by ] = ttl;

      if( 9!= ttl ){

        free.unshift( { ttl:ttl, x: bx*3,y: by*3, type:BLOCK } );

        if( ttl > max.ttl ){//store as prob
          max = { ttl: ttl, x: bx*3, y: by*3, type:BLOCK };
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
      free.unshift( {ttl:ttl1, x: 0,y: 0, type:DIAG } );

      if ( ttl1 > max.ttl ) {//store as prob
        max = { ttl: ttl1, x: 0,y: 0, type:DIAG };
      }
    }

    if ( ttl2 != 9 ) {
      free.unshift( { ttl:ttl2, x: 8,y: 0, type:DIAG } );

      if ( ttl2 > max.ttl ) {//store as prob
        max = { ttl: ttl2, x: 8,y: 0, type:DIAG };
      }
    }

    diag[ 1 ] = ttl1; diag[ 2 ] = ttl2;
  }

  this.free = free.sort( function( E1, E2 ) { return ( E2.ttl - E1.ttl ); } );

  this.total = total;
  this.max = max;
  this.toString = function() {
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
};

/**
 * This function has been called as td's event, 
 * In mozilla - this = current element
 * But in IE - not.
 */
sudoku.constructor.prototype.tdmouseover = function( e ) {
  var d = null;

  if ( "object" === typeof e ) { d = window.event ? window.event.srcElement : e.target; } 
  else                        { d = this; }//try mozilla

  var s = sudoku;//must be

  window.status = ( d.cx + 1 ) + " x " + ( d.cy + 1 ) + " = "+ s.m( d.cx , d.cy );

  s.c( d.cx, d.cy, turn.BLOCK ).each(   function ( el ) { el.className += " light"; } );

  s.c( d.cx, d.cy, turn.HORIZ ).each(   function ( el ) { el.className += " horiz"; } );

  s.c( d.cx, d.cy, turn.VERT ).each(    function ( el ) { el.className += " vert"; } );

  if ( s.options.count_diag ) {
    s.c( d.cx, d.cy, turn.DIAG ).each(  function ( el ) { el.className += " diag"; } );
  }
}
  
/* criteries */
var turn = {
  HORIZ   : 0,
  VERT    : 1,
  BLOCK   : 2,
  DIAG    : 3 
};

