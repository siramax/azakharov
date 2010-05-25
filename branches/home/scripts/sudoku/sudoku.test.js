// JScript File
//Assert.isNotUndefined(solver.m,"NO MATRIX IN solver.OBJECT");

///////////////////////// Case Constructor ///////////////////////////////
( function(){
      if ( "undefined" === typeof Assert ) { return; };
      
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
solver.set( 0, 2, 7 );solver.set( 1, 2, 8 );/* RESOLVE :)  BY TEST */
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
*/
solver.set( 3, 2, 1 );
solver.set( 6, 1, 1 );
solver.set( 2, 3, 1 );
solver.set( 1, 6, 1 )
Assert.isTrue( solver.s(), "Третий Шаг не прошел!" ); //step
Assert.isEqual( 1, solver.m( 0, 0 ), "Не решается" );

cypher.init( solver );

solver.cl();
//try to resolve
}() );

