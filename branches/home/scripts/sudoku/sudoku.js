/** 
 * @package Sudoku
 * @author Vaulter <vaulter@nm.ru> http://vaulter.narod.ru/sudoku
 * @version Jan 6 22:06:55 VOLT 2009 v0.2
 * version Thursday, January 10, 2008 v0.1
 * @todo EXPORT IMPORT
 */

/**
 * @class Sudoku 
 * This will be an object that preserves the cell playing field,
 * He will know all the field (other cells) and also be able to "dare" =)
 */
sudoku = {
  options: {
    mx: 9,
    my: 9,
    count_diag: false
  },

  /**
   * Сlear field. Can be called explicit as event!
   * btn.onclick = this.cl;
   */
  cl: function ( e ){
    var d = null, sudoku = null;

    if( "object" == typeof( e ) ){
      d = window.event ? window.event.srcElement : e.target;
      sudoku = d.parentNode.parentNode.sudoku;//hmmm/..... TODO
    } else {
      sudoku = this;//try non event calling
    }

    if( "undefined" == typeof( sudoku.m ) || 
        "undefined" == typeof( sudoku.f )){//this init
      //console.log( "NOT IMPL" );
      //console.log( this );
      return;//error
    }

    for( var xx = 0; xx < sudoku.options.mx; xx++ ) for( var yy = 0; yy < sudoku.options.my; yy++ ){
      sudoku.wrapper.m[ xx ][ yy ] = 0;
      sudoku.f.rows[ yy ].cells[ xx ].innerHTML='&nbsp;';
      sudoku.f.rows[ yy ].cells[ xx ].className = sudoku.f.rows[ yy ].cells[ xx ].className.replace( /debug/g, "" );

      if( sudoku.ex || ( sudoku.ex = document.getElementById( "export" ) ) )
        document.body.removeChild( sudoku.ex );

      if( sudoku.im || ( sudoku.im = document.getElementById( "import" ) ) ) 
        document.body.removeChild( sudoku.im );
    }
  },
  
  /**
   * Check whether the number is in the cell
   * Ideally, testing should be only once for each cell and numbers.
   * Caching results is not applicable
   * @ Param n number to test
   * @ Param x of cell
   * @ Param y of cell
   */
  canbe: function( n, x, y ) {//x = 0..8, y = 0..8
      var can = true;//nothing is wrong
      //check for row compability
      for( type = 0; type < DIAG + ( this.options.count_diag? 1: 0 ); type++ ){
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

  //tdclick: is i()
  //tdclick

  self: this,
  f: null,
  /**
   * fork for UI'n'Array 
   * such we can to not have to separate model and controller
   */
  set: function( x, y, v ){

    if(     ( 0 > x ) || ( x > this.options.mx ) || 
            ( 0 > y ) || ( y > this.options.my ) || 
            ( "undefined" == typeof( v )) || ( null == v ) ) { 
        error( "wrong params" ); console.log( x, y, v ); return false; 
    }

    if( "object" == typeof( v )){//separate DOM and numbers
      d = v;//DOM
      v = parseInt( v.innerHTML );
      
    } else {                //MY FIELD VALIDATION
    
      if( "undefined" == typeof( this.f )){
          this.start();
      }
      
      d = this.f.rows[ y ].cells[ x ];//INNER DOM
      v = parseInt( v );//AS NUMBER
      //alert('rows['+y+'].cells['+x+'] = '+d.cx+'x'+d.cy);
    }
    
    if( !isNaN( parseInt( v ) ) && ( 0 < v ) && ( v < 10 ) && 
            this.canbe( v, d.cx, d.cy )) {
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
//set

  /**
   * This function has been called as td's event, 
   * In mozilla - this = current element
   * But in IE - not.
   */
  tdmouseover: function( e ){
    var d = null;

    if( "object" == typeof( e ) ){
      d = window.event ? window.event.srcElement : e.target;
      
    } else {
      d = this;//try mozilla
    }

    var s = d.sudoku();//must be

    window.status = ( d.cx + 1 ) + " x " + ( d.cy + 1 ) + " = "+ s.m( d.cx , d.cy );

    s.c( d.cx, d.cy, BLOCK ).each( function ( el ) {
        el.className += " light";
    } );

    s.c( d.cx, d.cy, HORIZ ).each( function ( el ) {
        el.className += " horiz";
    } );

    s.c( d.cx, d.cy, VERT ).each( function ( el ) {
      el.className += " vert";
    } );

    if ( s.options.count_diag ) {
      s.c( d.cx, d.cy, DIAG ).each( function ( el ) {
        el.className += " diag";
      } );
    }
  }
,//onmouseover :)

  /**
   * sudoku can be initiated by DOM element
   * which is parent DOM to inject inner created table 
   * or by string of ID of parent DOM element :)
   */
  start: function( pid ) {
    if( this.f ) return true;//double init. remove if need some of me on page at the same time

    if( "string" == typeof( pid ))
      this.wrapper = document.getElementById( pid );
    else
      this.wrapper = pid;

    if( null == this.wrapper ) this.wrapper = document.body;

    this.wrapper.m= [
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
    this.wrapper.sudoku = this;

    /** 
     * Returns the value at matrix field
     */
    this.m = function( x, y ){
    
      if(  "undefined" == typeof( x ) || "undefined" == typeof( y ) ) {
        return this.wrapper.m;// :)
      }

      if( ( 0 > x ) || ( x > this.options.mx ) || 
          ( 0 > y ) || ( y > this.options.my ) ) {
        error( "m: wrong params" ); 
        //console.log( x, y );
        return false; 
      }

      return this.wrapper.m[ x ][ y ];

    };//good, now we can use solver.m( 1, 5 )

    //SOME ARGUMENT OVERLOAD BUT
    options = this.options; //+...
    options.mx = 9;
    options.my = 9;//0..9
    //AAAAAND create table of field here!
    this.f = document.createElement( 'table' );
    this.f.sudoku = this;//COPy? how to check...
    
    if( true == arguments[ 1 ] ) {//hidden
      this.f.className = "hidden";
    }

    this.f = this.wrapper.appendChild( this.f );

    for( var y = 0; y < options.my; y++ ){
      var r = this.f.insertRow( y );

      for( var x = 0; x <  options.mx ; x++ ){
        var c = r.insertCell( x );
        c.cx = x;
        c.cy = y;
        c.m = this.wrapper.m;//TODO

        if( 0 == (x % 3) ) c.className = c.className + ' lbold';
        if( 0 == (y % 3) ) c.className = c.className + ' tbold';
        if( ( options.my - 1 ) == y ) c.className = c.className + ' bBold';
        if( ( options.mx - 1 ) == x ) c.className = c.className + ' rBold';

        c.innerHTML='&nbsp;';//c.cx+'x'+c.cy+
        //c.onclick = sudoku.i;//or IE
        //add event
        sudoku.ae( c, "click", this.i );
        //HM, why it just so..
        sudoku.ae( c, "mouseover" , this.tdmouseover );
        //TODO
        c.onmouseout = function (){
          sudoku.c( this.cx,this.cy, BLOCK).each( function (el) {
            el.className = el.className.replace(/light/,"");
          });
          sudoku.c( this.cx,this.cy, HORIZ).each( function (el) {
            el.className = el.className.replace(/horiz/,"");
          });
          sudoku.c( this.cx,this.cy, VERT).each( function ( el ) {
            el.className = el.className.replace(/vert/,"");
          });
          sudoku.c( this.cx,this.cy, DIAG).each( function ( el ) {
            el.className = el.className.replace(/diag/,"");
          });
        };

        /** 
         * Gets the sudoku object of this td
         */
        c.sudoku = function() {
          return this.parentNode.parentNode.parentNode.sudoku;//tr.tbody.table.sudoku
        }

      }//for x
    }//for y

            //create div for toolbar rewrite old prnt
    this.tb = document.createElement( 'div' );
    this.tb.setAttribute( "id","sudoku-toolbar" );
    this.tb.setAttribute( "class","toolbar" );
    this.tb = this.wrapper.appendChild( this.tb );
              //MAIN BUTTON "MAKE ALL"
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
    createToolbarButton = function( options ){

        ( "undefined" == typeof( options.type ))?
            options.tag = 'button':
            options.tag = 'input';

        var btn = document.createElement( options.tag );

        ( "undefined" != typeof( options.type ))?
            btn.setAttribute( "type", options.type ): 0;

        ( "undefined" != typeof( options.id ))? 
            btn.setAttribute( "id", options.id ): 1;

        ( "undefined" != typeof( options.cl ))? 
            btn.setAttribute( "class",options.cl + " button" ): 
            btn.setAttribute( "class"," button" );
        //old way
        if ( "undefined" != typeof( options.note )) {
            btn.setAttribute( "title", options.note );
        }

        if ( "undefined" != typeof( options.act )) {
            sudoku.ae( btn, "click", options.act );
        }
        
        if( "undefined" != typeof( options.icon )) {
            var icon = document.createElement( 'img' );
            icon.setAttribute( 'src' , 'files/sudoku/' + options.icon );
            icon.setAttribute( 'width' , 32 );
            icon.setAttribute( 'height' , 32 );
            icon.setAttribute( 'alt' , "undefined" != typeof( options.label )?  options.label : "x" );//hides wrong

            if( "undefined" != typeof( options.act )) {
                sudoku.ae( icon, "click", function( e ) { 
                  alert( "click" );//options.act
                } );
            }

            btn.appendChild( icon );

        }
        
        if( "undefined" != typeof( options.label )){

            if( "undefined" != typeof( options.type )  && 
                ( 'checkbox' == options.type || 'radio' == options.type ) && 
                "undefined" != typeof( options.parentNode ) ) {//there is to what append

                var lbl = options.parentNode.appendChild( document.createElement( 'label' ) );
                /* i need id of control */
                ( "undefined" != typeof( options.id ) )? lbl.setAttribute( 'for', options.id ):0;
                lbl.innerHTML = options.label;

            } else {//simple label 
                btn.innerHTML += "<br />" + options.label;
            }
        }

        btn.sudoku = function() {
            return this.parentNode.parentNode.sudoku;//if DOM struct changed? TODO
        }

        return btn;
    };


    this.btnSolve = createToolbarButton( {
        label: m.buttons.solve.label,
        icon: "i/player_play.png",
        note: m.buttons.solve.note,
        id: "solve-button",
        cl:"solve",

        act: function( e ) {
            return ( window.event ? window.event.srcElement : e.target ).sudoku().solve();
        }
    } );
    this.tb.appendChild( this.btnSolve );

    this.tb.appendChild( createToolbarButton( {
        label: m.buttons.step.label,
        icon: "i/player_end.png",
        id: "step-button",
        cl: "step",

        act: function( e ) {
            return ( window.event ? window.event.srcElement : e.target ).sudoku().s();
        }
    } ) );
    
    var help = document.getElementById( "sudoku-help" );

    if ( "undefined" != typeof( help ) && null != help ) {//found help text

        var hb = //help button

        createToolbarButton( {
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
    }

    this.tb.appendChild( createToolbarButton( {
      icon: "i/player_playlist.png",
      label: m.buttons.stats.label,
      
      act: function( e ) { 
        alert( (window.event ? window.event.srcElement : e.target).
            sudoku().stats().toString() );
      }
    } ) );

    this.tb.appendChild( createToolbarButton( {
      label: m.buttons.clear.label,
      act: this.cl,
      icon: "i/no.png"
    } ) );
    
    this.tb.appendChild( createToolbarButton( {
      label: m.buttons.import.label,
      act: function( e ) { 
        (window.event ? window.event.srcElement : e.target).
            sudoku()._import();
      }
      /*icon: "i/import.png"*/
    } ) );
    
    this.tb.appendChild( createToolbarButton( {
      label: m.buttons.export.label,
      act: function( e ) { 
        (window.event ? window.event.srcElement : e.target).
            sudoku()._export();
      }
      /*icon: "i/export.png"*/
    } ) );
    
    this.tb.appendChild( document.createElement( "br" ) );
    //this.tb.innerHTML += "<br />";

    this.tb.appendChild( createToolbarButton( {
      type: 'checkbox',
      label: m.buttons.diag.label,
      parentNode: this.tb,
      value: 1,
      id: 'count_diag',
      
      act: function( e ) {
        var d = ( window.event ? window.event.srcElement : e.target ); 
        d.sudoku().options.count_diag = d.checked 
      }
    } ) );

/*
    b =  document.createElement('input');
    b.type='checkbox';
    b.value = '1';
    b.setAttribute("id","verbose");
    b.sudoku = this;//copy this???
    b.onclick = function( e ) { e.target.sudoku.verbose = this.checked };
    this.tb.appendChild( b );

    lbl = this.tb.appendChild( document.createElement('label'));
    lbl.setAttribute("for","verbose");
    lbl.innerHTML = "verbose";	*/

    this.theme();//loads css

    this.wrapper.style.display = "block";
    return this; 
  },
//start

  /** input number */
  i: function( e ) {//This is event handler of click on td

    if ( "object" == typeof( arguments[0] )) {//MouSEEVENT?
      var d, n, nn;
      d = window.event ? window.event.srcElement : e.target;

      if ( "undefined" == typeof( cypher )) {
        n = parseInt(d.innerHTML);

        if ( !isNaN( n ) && 0 < n ) {
          nn = prompt( m.inputNumber + (d.cx+1)+'x'+(d.cy+1), n );
          
        } else {
          nn = prompt( m.inputEN + (d.cx+1)+'x'+(d.cy+1), "" );
        }

        return sudoku.set( d.cx, d.cy, nn );
      }//else
      nn = cypher.ask( d );//for this element. in cypher it must be saved

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
  s: function( e ) {
    var sudoku, d,xx, yy, v, c, i;
          //
    if( "object" == typeof( e ) ) {
      d = window.event ? window.event.srcElement : e.target;
      sudoku = d.parentNode.parentNode.sudoku;

    } else {
      sudoku = this;//just trying
    }

    if ( "undefined" == typeof( sudoku.f ) || null == sudoku.f ) {
      error( m.errors.noField );
      return;
    }

    var m = sudoku.stats().free;//(1,2)

    for( var mi= 0; mi < m.length; mi++ ) {//for each free cell
      var free = [];
      var poss = [ 1,2,3,4,5,6,7,8,9 ];//(3)

      sudoku.c( m[mi].x, m[mi].y, m[mi].type ).each( function ( e, sudoku ) {

        if( sudoku.options.verbose ){ e.className+=" debug"; }

        n = sudoku.wrapper.m[ e.cx ][ e.cy ];

        if( n > 0 && n < 10 ) 
          poss[ n - 1 ] = 0;//

        else// that is free field, save pos
          free.push( { x: e.cx, y: e.cy, nn:[] } );
      }, sudoku );

      var nn = [];//total
      var nnn = [];

      for( i= 0; i < poss.length; i++ ){ 

        if( 0 != poss[ i ] ) nn.push( { n: poss[i], free: [] } );
      }
      ///Now free for all cells verify the possibility of insert-free numbers (4)
      for( i= 0; i <  free.length; i++ ){

        for( var j=0; j < nn.length; j++ ){

          if( sudoku.canbe( nn[ j ].n, free[ i ].x, free[ i ].y )) {
            free[ i ].nn.push( nn[ j ].n );
            nn[ j ].free.push( { x: free[ i ].x,y: free[ i ].y } );
          }

        }

      };
      
      for( i= 0; i  <  free.length;  i++  ){

        if( 1 == free[ i ].nn.length ) {//URAAAH!
          sudoku.set( free[ i ].x, free[ i ].y, free[ i ].nn.pop() );//FOUND STEP
          //clear verbose?
          return true;
        }

      }

      /// So, walked through the free cells, but no obvious solutions.
      /// Then try to free all the digits from 1 to 9 to find the only
      /// Possible position in the criteria
      for( i= 0; i < nn.length; i++ ){

        if( 1 == nn[ i ].free.length ){//URAAAH!
          var free = nn[ i ].free.pop();
          sudoku.set( free.x, free.y, nn[ i ].n ); //clear verbose?
          return true;
        }

      }

      if( sudoku.verbose ){
        //this.c( m[mi].x, m[mi].y, m[mi].type ).each( function ( el ) {
          //setTimeout( "el=f.rows["+el.cy+"].cells["+el.cx+"];el.className = el.className.replace(/debug/g,'')",300 );
        //}, this );
      }
    }
    return false; 
  },
  
  /**
   * Just run while steps can be performed
   * Can be called as DOM event
   */
  solve: function( e ){

    if ( "object" == typeof( e ) ) {
      d = window.event ? window.event.srcElement : e.target;
      sudoku = d.parentNode.parentNode.sudoku;
      
    } else {
      sudoku = this;//just trying
    }

    while( sudoku.s() );//solving cycle
  },

  /**
   * criteria fields Functor
   * invoke as 
   * @code
   * DOMelement.click = sudoku.c( this )
   * @endcode
   */
  c: function( x, y, type, exclude ) {
    var ix;//init 
    var iy;
    var sx;//skip x
    var sy;//skip y

    if( exclude ){ sx = x; sy = y;}

    switch( type ){
      case HORIZ: iy = y; break;
      case VERT: ix = x; break;
      case BLOCK: { ix=	Math.floor( x / 3 ) * 3; iy = Math.floor( y / 3 ) * 3;}break;
      case DIAG: ix=x; iy=y; break;
    }

    var self = this;

    this.each = function( f, context ){
    //iterate, return next elem in criteria or false
      var xx,yy;

      switch( type ){
        case HORIZ: {

          for( var xx=0; xx < self.options.mx; xx++ ) {

            if( exclude && ( sx == xx )) continue;//

            r = f( self.f.rows[iy].cells[xx], context );//need?

            if( null != r )//break loop
              return r;//to callee
          }

          break; 
        }

        case VERT: {

          for( var yy=0; yy < self.options.my; yy++ ){

            if( exclude && ( sy == yy ))continue;//
            r = f( self.f.rows[ yy ].cells[ ix ], context );//need?

            if( null != r )//break loop
              return r;//to callee
          }

          break;
        }

        case BLOCK: {   //check for quandrant

          for( var xx = ix; xx < ( ix + 3 ); xx++ ){

            for( var yy = iy; yy < ( iy + 3 ); yy++ ){

              if( exclude && ( yy == sy ) && ( xx == sx )) continue;
                r = f( self.f.rows[ yy ].cells[ xx ], context );//need?

              if( null != r )//break loop
                return r;//to callee
            }
          }

          break; 
        }//count_diag

        case DIAG: {

          if( ix == iy ) {
            for( var xx = 0; xx < self.options.mx; xx++ ){

              if( exclude && ( sx == xx ))continue;

              r = f( self.f.rows[ xx ].cells[ xx ], context );//need?

              if(null != r )//break loop
                return r;//to callee
            }
          }

          if( ( 8-ix ) == iy ) {//lay on diag

            for( xx=0; xx < self.options.mx; xx++ ){

              if( exclude && ( sx == xx ))continue;

              r = f( self.f.rows[ (8-xx) ].cells[ xx ], context );//need?

              if( r != null )//break loop
                return r;//to callee
            }
          }

          break; 
        }//case DIAG
      }//switch
    }//this.each

    return this;
  },//c

  /**
   * some counts AND utils
   * 1. count free cell and save this num to array of objects
   */
  stats: function() {
    var rows = [];//array
    var cols = [];
    var blocks = [[0,0,0],[0,0,0],[0,0,0]];
    var diag = [];
    var max = { x: null, y: null, ttl: null };
    var free = [];
    var total = 0;
    var self = this;//work only if "new stats()"
    
    this.c( 0, 0, VERT ).each( function( el ) {

      ttl = 0;
      rows[ el.cy ] = 0;

      self.c( 0, el.cy, HORIZ ).each( function( e ) { if( 0 < self.m( e.cx, e.cy ) ) ttl++ } );

      rows[ el.cy ] = ttl;

      if( 9 != ttl ){
        free.unshift( { ttl:ttl, x: 0, y: el.cy, type:HORIZ } );
        if( ttl > max.ttl ) {//store as prob
          max = { ttl: ttl, x: 0, y: el.cy, type:HORIZ };
        }
      }

      total+=ttl;
    } );

    this.c( 0, 0, HORIZ ).each( function( el ) {
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

    for( bx = 0; bx < this.options.mx / 3 ; bx++ ){

      for( by = 0; by < this.options.my / 3 ; by++ ){
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

    if( this.options.count_diag ) {//check diags
      var ttl1 = 0, ttl2 = 0;

      for( dx= 0; dx < this.options.mx; dx++ ){
        if( 0 < this.m( dx, dx )) ttl1++;
        if( 0 < this.m( 8-dx, dx )) ttl2++;
      }

      if( 9 != ttl1 ){
        free.unshift( {ttl:ttl1, x: 0,y: 0, type:DIAG } );

        if( ttl1 > max.ttl ) {//store as prob
          max = { ttl: ttl1, x: 0,y: 0, type:DIAG };
        }
      }

      if( ttl2 != 9 ){
        free.unshift( { ttl:ttl2, x: 8,y: 0, type:DIAG } );

        if( ttl2 > max.ttl ){//store as prob
          max = { ttl: ttl2, x: 8,y: 0, type:DIAG };
        }
      }

      diag[1] = ttl1; diag[2] = ttl2;
    }

    this.free = free.sort( function( E1, E2 ) {
      return ( E2.ttl - E1.ttl );
    } );

    this.total = total;
    this.max = max;
    this.toString = function() {
      var colsstats =	"        | ";
      var header =		"____| ";
      for( xx = 0; xx < cols.length; xx++ ){
          colsstats += " " + cols[ xx ];
          //header += " "+xx;
      }

      var rowstats = "";
      for( yy = 0; yy < rows.length; yy++ ) {
        rowstats += " " + rows[ yy ] + " ";
        if( ((yy - 1) % 3) == 0 ) {//
          rowstats += "          "+
            " " + blocks[0][(yy-1)/3]+" "+
            "     " + blocks[1][(yy-1)/3]+" "+
            "     " + blocks[2][(yy-1)/3]+" ";
        }
        rowstats += "\r\n";
      }

      var ret = "Total: " + total + "\r\n" + colsstats + "\r\n" + rowstats;

      if( this.options.count_diag ){
        ret += "\r\nDiag1: " + diag[1] + " Diag2: " + diag[2];
      }

      return ret;
    }

    return this;

  },
  
  /**
   * Export to String evaluated to js Array
   * Transposition
   */
  toString: function() {
    var rep = [];//"this" should be correct. This is silly!

      sudoku.c( 0, 0, VERT ).each( function( ve ) {
        var str = [];
        
        sudoku.c( 0, ve.cy, HORIZ ).each( function( he ) {
          str.push( sudoku.wrapper.m[ he.cx ][ he.cy ] );
        } );

        rep.push( "  [ " + str.join( ", " ) + " ]" );
      } );
      
      return "[\r\n" + rep.join( ",\r\n" ) + "\r\n]";
   },

  _export: function() {

    if( !this.ex || "undefined" == typeof this.ex ){//createElement
      this.ex = document.body.appendChild( document.createElement( "textarea" ) );
      this.ex.setAttribute( "id","export" );
    }
    
    var txt = sudoku.toString();
    document.all? this.ex.innerText = txt: this.ex.innerHTML = txt;
    this.ex.focus();
    return true;
  },

  _import: function() {
  
    if ( !this.imt || "undefined" == typeof( this.imt ) ) {
        this.imt = document.getElementById( "import" );
    }
    
    if ( !this.imt || "undefined" == typeof( this.imt ) ) {//createElement
      this.imt = document.body.appendChild( document.createElement( "textarea" ) );
      this.imt.setAttribute( "id","import" );
      //initial
      var txt = sudoku.toString();
      document.all? this.imt.innerText = txt: this.imt.innerHTML = txt;
      this.imt.focus();
      return true;// first state?
    }
    
    var it = this.imt.value;
    
    if ( it.length == 0 ) {
      alert( m.errors.empty );
      return false;
    }
    
    var im = new Array();
    
    try {
      eval( "im = " + it + ";" );
    } catch ( err ) {
      alert( err );
      return false;
    }
    
    //if imported array not like sudoku field - error
    if ( im.length != sudoku.options.my ) {
      alert( m.errors.linesNotEqual( 0, sudoku.options.my ) );
      return false;
    }
    
    for ( var y = 0; y < sudoku.options.my; y++ ) {

      if ( im[ y ].length != sudoku.options.mx ) {
        alert( m.errors.columnsNotEqual( y, options.sudoku.mx ) );
        return false;
      }

      for ( var x = 0; x < sudoku.options.mx; x++ ) {
        sudoku.set( x, y, im[ y ][ x ] );
      }
    }
    
    return true;
  },

  /**
   * binds events
   * @public
   * @param o object to listen
   * @param e event string
   * @param a action function
   */
  ae: function( o, e, a ) {

    if( o.addEventListener ){
      o.addEventListener( e, a, true ); // was true--Opera 7b workaround!

    } else {

      if( o.attachEvent ) {
        o.attachEvent( "on" + e, a );

      } else {
        return null;
      }
    }

    return true;
  },

  /**
   * Loads css stylesheet into document
   */
  theme: function( csstoload ) {

    this.themeDir = "/files";//here we need cacl relative path
    this.autoCSS = this.themeDir + "/sudoku/sudoku.css";//were style lay. absolute path
    var loc = document.location.href;//e.g. http://vaulter.localhost/download.html
    loc = loc.replace(/http:\/\/[^\/]+/,"");

    if( document.createStyleSheet ){
      document.createStyleSheet(  this.autoCSS );

    } else {
        var newSS = document.createElement( 'link' );
        newSS.rel = 'stylesheet';
        newSS.type = 'text/css';
        newSS.href = escape( this.autoCSS );
        document.getElementsByTagName( "head" )[ 0 ].appendChild( newSS );
    }
    return true;
  }
};

if( 'undefined' == typeof( document ) ){
    alert("Please, run me via your browser :) thank you! [ just drag me to it ]");
}


/** 
 * wrapper around console

if( "undefined" == typeof( console )){
  console = document.createElement( "div" );
}

if( "undefined" == typeof( console.log )){
  console.log = function( str ){
    console.innerHTML += str;
  }
}

error = function( str ){//just to log
  alert( document.body );
  console.log( str );//error!!!!
} */


//NEED DOCUMENT I CREATE BUT IS THIS POSSIBLE ???
//	var WshShell = WScript.CreateObject("WScript.Shell");
//	WshShell.Run("notepad.exe");


cypher = {

  /**
   * Create common form of cypher and hides it
   * Call by some event? :)
   */
  init: function( parent ){

    if( "undefined" != typeof( this.cypher ) ){ return ; }//already done

    //inject to DOM
    // in IE it hangs
    //this.cypher = document.body.appendChild( this.cypher );

    this.cypher =  document.createElement( "form" );

    if( "undefined" != typeof( parent )) { 
      parent.appendChild( this.cypher );

    } else {
      if( document.body.appendChild ) document.body.appendChild( this.cypher );
      else document.appendChild( this.cypher );
    }

    this.cypher.setAttribute( "id", "cypher" );
    this.cypher.className = "cypher";
    this.cypher.style.display = "none";
    this.cypher.style.position = "absolute";
    //to speed up 
    // we dont need now this 
    this.cypher.buttons = [];
    
    for( var i = 1; i < 10; i++ ){
      var b = document.createElement( "input" );
      b.cypher = this;//how about mem... TODO bench
      b.setAttribute( "type", "button" );
      sudoku.ae( b, "click", this.onclick );//callbaack 
      b.setAttribute( "value", i );
      this.cypher.buttons[ i ] =  //need this for cycle through cypher buttons
      this.cypher.appendChild( b );

      if( 0 == ( i % 3 ) ){
        this.cypher.appendChild( document.createElement( "div" ) ).className = "clear-right";
      }
    }
//CLEAR BUTTON
    b = document.createElement( "input" );
    b.cypher = this;
    b.setAttribute( "type", "button" );
    b.setAttribute( "value", "0" );
    b.className= "fit";
    sudoku.ae( b, "click", this.onclick );
    this.cypher.buttons['clear'] = //need this for cycle through cypher buttons
    this.cypher.appendChild( b );
//CLOSE BUTTON
    b =  document.createElement( "input" );
    b.cypher = this;
    b.setAttribute( "type", "button" );
    b.setAttribute( "value", "X" );
    b.className =  "bold" ;
    sudoku.ae( b, "click" , this.close );
    this.cypher.buttons['close'] = 
    this.cypher.appendChild( b );

  },

/**
 * @param obj TD invoker of ask
 */
  ask: function( obj ){//TODO method of DOM #cypher. which cloning if this is needed 
/// different fields of page, END TODO

/// here we have egg and mother dillema
    if( "undefined" == typeof( this.cypher ) ){ this.init( obj.sudoku().wrapper ); }//error
    this.invoker = obj;
    this.f = this.invoker.sudoku();
    
    this.f.f.className += " asking";////HMMMMMMMMMMMMMMMMMMM
    
//HERE MUST BE
///check for avalaibility of numbers
    var buttons = this.cypher.buttons;

// loop thru all child nodes
    for( var i = 1; i < buttons.length; i++ )
    {
      buttons[ i ].disabled = !this.f.canbe( i , obj.cx, obj.cy );
            // do something with node here
    }

/// MOVING TO POS

    //console.log( obj, getPos( obj ) );
    // below works for absolute poss, but in TD :)
    var p = getPos( obj );//position of left top corner of cell
    
    var od = [ obj.offsetWidth, obj.offsetHeight ];//cell dimensions

    /// the most silly thing - coords and positioning of cypher panel
    this.cypher.style.display = "block";
    var cd = [ this.cypher.offsetWidth , this.cypher.offsetHeight ];//cypher dimen
    
    if ( 'absolute' == this.cypher.style.position ) {
      this.cypher.style.left = p[0] + ( od[ 0 ] / 2 ) - ( cd[0] / 2 ) + "px";
      this.cypher.style.top =  p[1] + ( od[ 1 ] / 2 ) - ( cd[1] / 2 ) + "px";

    } else {
      this.cypher.style.marginLeft =  p[0] + ( od[ 0 ] / 2 ) - ( cd[ 0 ] / 2 ) + "px";
      this.cypher.style.marginTop =   p[1] - ( od[ 1 ] / 2 ) - ( cd[ 1 ] / 2 ) -  this.f.wrapper.offsetHeight + "px" ;
    }
    console.log( p, cd, od );//anim? TODO

  },

  onclick: function( e ){
//SOLVING AROUND e and this TODO

// REMOVE disable flag TODO


    d = window.event ? window.event.srcElement : e.target;
    var n = parseInt( d.getAttribute( "value" ) );

    if( !isNaN( n ) && ( "undefined" != typeof( this.cypher ) ) ) {// here invoke chyper client NOW

      if( "undefined" == typeof( this.cypher.invoker )){
        error( "Cannot find target field" );
        return false;
      }
      var td = this.cypher.invoker;

      td.sudoku().set( td.cx, td.cy, n );
      this.cypher.close( e );
    } else {
      error( "Sorry. Smthg wrong with me" );
    }
  },//onclick

  close: function( e ){//close dialog

    if( "object" == typeof( arguments[0] )) {//MouSEEVENT?
      d = window.event ? window.event.srcElement : e.target;
    } else {

      d = this;//i dont know :)

    }

    d.parentNode.style.display = "none";

    d.cypher.invoker.sudoku().f.className=
    d.cypher.invoker.sudoku().f.className.replace(/\basking\b/g, "" );


  }
};

getPos = function( obj ){

  if( obj.offsetParent 
/// avoid empty calls to this revursive, 
/// so no getPos( null ) will be
/// bitty but pleasure :)
    && "undefined" != typeof( obj.offsetParent.offsetLeft )
    && "undefined" != typeof( obj.offsetParent.offsetTop ) ){
    pp = getPos( obj.offsetParent );

    //console.log( "parent: ", pp );
    //console.log( "this: x,y: ", obj, obj.offsetLeft + pp[0]- obj.scrollLeft, obj.offsetTop + pp[1] - obj.scrollTop );
    return [ obj.offsetLeft + pp[0], obj.offsetTop + pp[1] ];

  } else {//dummy
    //console.log( "no parent" , obj );
    return [ obj.offsetLeft, obj.offsetTop ];
  }
};
/* criteries */
var HORIZ = 0;
var VERT = 1;
var BLOCK = 2;
var DIAG = 3;//count_diag
