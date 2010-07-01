// JScript File
//Assert.isNotUndefined(solver.m,"NO MATRIX IN solver.OBJECT");

///////////////////////// Case Constructor ///////////////////////////////
( function() {
   if ( "undefined" === typeof Assert ) { return; };
      
   if ( "undefined" !== typeof SudokuSolver ) {
      /*
?,0,0, 0,0,0, 0,0,0,
0,0,0, 0,0,0, 1,0,0,
0,0,0, 1,0,0, 0,0,0,

0,0,1, 0,0,0, 0,0,0,
0,0,0, 0,0,0, 0,0,0,
0,0,0, 0,0,0, 0,0,0,

0,1,0, 0,0,0, 0,0,0,
0,0,0, 0,0,0, 0,0,0,
0,0,0, 0,0,0, 0,0,0,
       */
      solver = new SudokuSolver( 
            "... 000 000" +
      		"050 000 100" +
      		"000 100 000" +
      		
      		"001 000 0,0,0," +
      		"0,0,0, 0,0,0, 0,0,0," +
      		"0,0,0, 0,0,0, 0,0,0," +
      		
      		"0,1,0, 0,0,0, 0,0,0," +
      		"0,0,0, 0,0,0, 0,0,0," +
      		"5,0,0, 0,0,0, 0,0,0, " );
      Assert.isEqual( 0, solver.field[ 0 ][ 1 ] );//direct access
      Assert.isEqual( 0, solver.at( 1, 0 ) );// x, y - getter

      Assert.isEqual( 5, solver.field[ 0 ][ 8 ] );//direct access
      Assert.isEqual( 5, solver.at( 0, 8 ) );// x, y - getter

      
      Assert.isEqual( 1, solver.field[ 2 ][ 3 ] );
      Assert.isEqual( 1, solver.at( 2, 3 ) );
      
      var test = [];
      solver.c( 0, 2, turn.HORIZ ).each( function(a) {test.push(a);} );
      Assert.isEqual( 1, test[ 3 ], "sliced by HORIZ criteria" );//see origin at x=3, y=2 (3-1=2)
      
      test = [];
      solver.c( 2, 0, turn.VERT ).each( function(a) {test.push(a);} );
      Assert.isEqual( 1, test[ 3 ], "sliced by VERT criteria" );//see origin
      
      test = [];
      solver.c( 3, 0, turn.BLOCK ).each( function(a) {test.push(a);} );
      Assert.isEqual( 1, test[ 2 ], "sliced by BLOCK criteria" );//see origin   
      
      test = [];
      solver.c( 3, 3, turn.DIAG ).each( function(a) {test.push(a);} );
      Assert.isEqual( 5, test[ 1 ], "sliced by DIAG criteria" );//see origin
      
      test = [];
      solver.c( 3, 5, turn.DIAG ).each( function(a) {test.push(a);} );
      Assert.isEqual( 5, test[ 0 ], "sliced by DIAG criteria" );//see origin
      
      Assert.isTrue( solver.set( 1, 0, 1 ), "Set withOUT possibility check" );
      Assert.isFalse( solver.set( 1, 0, 1, true ), "Set with possibility check" );
      
      Assert.isEqual( 6, solver.stats().total, "Total set was 6 cells" );
      
      Assert.isTrue( solver.step(), "Obvious step failed" );
      Assert.isEqual( 6+1, solver.stats().total, "Total set was 6 cells. One should be filled" );
      
      solver2 = new SudokuSolver( 
               "123 000 000" +
               "456 000 000" +
               "78. 000 000" +
               
               "214 356 78." +
               "300, 0,0,0, 0,0,0," +
               "500, 0,0,0, 0,0,0," +
               
               "600, 0,0,0, 0,0,0," +
               "800, 0,0,0, 0,0,0," +
               ".00 000 000" );
      //perform 3 steps and then assert
      Assert.isTrueAssert( solver2.step(), "#1 obvious step failed" );
      Assert.isTrueAssert( solver2.step(), "#2 obvious step failed" );
      Assert.isTrueAssert( solver2.step(), "#3 obvious step failed" );
      
      Assert.isEqual( 9, solver2.at( 2, 2 ), "remain number in block" );
      Assert.isEqual( 9, solver2.at( 8, 3 ), "remain number in horiz line" );
      Assert.isEqual( 9, solver2.at( 0, 8 ), "remain number in vert col" );
      
      window.location.href; 
   }
   
   if ( "undefined" !== typeof sudoku ) {/* 
Assert.isEqual( new sudoku( 'something-non-existent' ).wrapper, document.body, "wrapper not fallback to body" );

var testDOMNode = document.createElement( 'div' );
testDOMNode.setAttribute( 'id',"sudoku-test-wrapper" );
testDOMNode = document.body.appendChild( testDOMNode );
Assert.isEqual( new sudoku( "sudoku-test-wrapper" ).wrapper, testDOMNode, "wrapper not passed by string ID" );

Assert.isEqual( new sudoku( testDOMNode ).wrapper, testDOMNode, "wrapper not passed by DOMNode ref" );

///////////////////////// Case Table creation /////////////////////////////
Assert.isTrue( new sudoku().f, "Failed to create table" );

var toolbarTest = new sudoku();
Assert.isEqual( typeof( new toolbarTest.toolbarButton() ), "object", "Failed to create toolbar button" );

var solver = new sudoku( 'test-field' );

Assert.isTrue( solver.set( 0, 0, 1 ), "test #1 Чтото не ставится .set failed" );

Assert.isFalse( solver.set( -2, 11, 1 ), "Чтото ставится в координаты -2х11" );

solver.set( 0, 0, 1 );solver.set( 1, 0, 2 );solver.set( 2, 0, 3 );
solver.set( 0, 1, 4 );solver.set( 1, 1, 5 );solver.set( 2, 1, 6 );
solver.set( 0, 2, 7 );solver.set( 1, 2, 8 );// RESOLVE :)  BY TEST 
//CORRECT INPUT? 

Assert.isEqual( 1, solver.m( 0, 0 ), "Ой" );
Assert.isEqual( 2, solver.m( 1, 0 ),"Ой" );
Assert.isEqual( 3, solver.m( 2, 0 ),"Ой" );

//canbe tests
Assert.isFalse(solver.canbe(1,2,2), "1 уже была в этом блоке" );//al
Assert.isFalse(solver.canbe(2,2,2),"2 уже была в этом блоке");
Assert.isFalse(solver.canbe(3,2,2),"3 уже была в этом блоке");
Assert.isFalse(solver.canbe(4,2,2),"4 уже была в этом блоке");
Assert.isFalse(solver.canbe(5,2,2),"5 уже была в этом блоке");
Assert.isFalse(solver.canbe(6,2,2),"6 уже была в этом блоке");
Assert.isFalse(solver.canbe(7,2,2),"7 уже была в этом блоке");
Assert.isFalse(solver.canbe(8,2,2),"8 уже была в этом блоке");
Assert.isTrue(solver.canbe(9,2,2),"9 не было в блоке ж!");
Assert.isTrue( solver.s(), "Шаг не прошел!" );

Assert.isEqual( 9, solver.m( 2, 2 ), "Не решается" );

Assert.isTrue(solver.set(3,3,2),"Чтото не ставится");
Assert.isTrue(solver.set(4,4,3),"Чтото не ставится");
Assert.isTrue(solver.set(5,5,4),"Чтото не ставится");
Assert.isTrue(solver.set(6,6,6),"Чтото не ставится");
Assert.isTrue(solver.set(7,7,7),"Чтото не ставится");
//учтем диагональ
solver.options.count_diag = true;
Assert.isTrue( solver.s(), "Второй Шаг не прошел!" );
Assert.isEqual( 8, solver.m( 8, 8 ), "Не решается" );
solver.cl(); //clear
solver.options.count_diag = false;


/**
 * Попробуем такой вариант
 * let's try this variant

?,0,0, 0,0,0, 0,0,0,
0,0,0, 0,0,0, 1,0,0,
0,0,0, 1,0,0, 0,0,0,

0,0,1, 0,0,0, 0,0,0,
0,0,0, 0,0,0, 0,0,0,
0,0,0, 0,0,0, 0,0,0,

0,1,0, 0,0,0, 0,0,0,
0,0,0, 0,0,0, 0,0,0,
0,0,0, 0,0,0, 0,0,0, 
//
solver.set( 3, 2, 1 );
solver.set( 6, 1, 1 );
solver.set( 2, 3, 1 );
solver.set( 1, 6, 1 )
Assert.isTrue( solver.s(), "Третий Шаг не прошел!" ); //step
Assert.isEqual( 1, solver.m( 0, 0 ), "Не решается" );
*/
/**
 * The most difficult sudoku in the world
 850 002 400
 720 000 009
 004 000 000
 
 000 107 002
 305 000 900
 040 000 000
 
 000 080 070
 017 000 000
 000 036 040
 */

/*solver.cl();

console.log( "START" );
solver.fromStr( "850002400\n720000009\n004000000\n000107002\n305000900\n040000000\n000080070\n017000000\n000036040" );
var snum = 0;
Assert.isTrue( solver.s(), "Шаг на самой сложной не удался!" + snum++ );
Assert.isTrue( solver.s(), "Шаг на самой сложной не удался!" + snum++ );
Assert.isTrue( solver.s(), "Шаг на самой сложной не удался!" + snum++ );
Assert.isTrue( solver.s(), "Шаг на самой сложной не удался!" + snum++ );
Assert.isTrue( solver.s(), "Шаг на самой сложной не удался!" + snum++ );
Assert.isTrue( solver.s(), "Шаг на самой сложной не удался!" + snum++ );
Assert.isTrue( solver.s(), "Шаг на самой сложной не удался!" + snum++ );
Assert.isTrue( solver.s(), "Шаг на самой сложной не удался!" + snum++ );
Assert.isTrue( solver.s(), "Шаг на самой сложной не удался!" + snum++ );
Assert.isTrue( solver.s(), "Шаг на самой сложной не удался!" + snum++ );
Assert.isTrue( solver.s(), "Шаг на самой сложной не удался!" + snum++ );
Assert.isTrue( solver.s(), "Шаг на самой сложной не удался!" + snum++ );

console.log( "SOLVE" );
Assert.isTrue( solver.solve(), "Ты должен решить ёё!" );

//solver.cl();*/
}


  if ( "undefined" !== typeof cypher && "undefined" !== typeof solver ) {
    cypher.init( solver );
  }

//try to resolve
}() );

