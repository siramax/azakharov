<?php
// $Id$

/**
 * @file
 * Contains theme override functions and preprocess functions for the theme.
 *
 * ABOUT THE TEMPLATE.PHP FILE
 *
 *   The template.php file is one of the most useful files when creating or
 *   modifying Drupal themes. You can add new regions for block content, modify
 *   or override Drupal's theme functions, intercept or make additional
 *   variables available to your theme, and create custom PHP logic. For more
 *   information, please visit the Theme Developer's Guide on Drupal.org:
 *   http://drupal.org/theme-guide
 *
 * OVERRIDING THEME FUNCTIONS
 *
 *   The Drupal theme system uses special theme functions to generate HTML
 *   output automatically. Often we wish to customize this HTML output. To do
 *   this, we have to override the theme function. You have to first find the
 *   theme function that generates the output, and then "catch" it and modify it
 *   here. The easiest way to do it is to copy the original function in its
 *   entirety and paste it here, changing the prefix from theme_ to vaultsoft_ru_.
 *   For example:
 *
 *     original: theme_breadcrumb()
 *     theme override: vaultsoft_ru_breadcrumb()
 *
 *   where vaultsoft_ru is the name of your sub-theme. For example, the
 *   zen_classic theme would define a zen_classic_breadcrumb() function.
 *
 *   If you would like to override any of the theme functions used in Zen core,
 *   you should first look at how Zen core implements those functions:
 *     theme_breadcrumbs()      in zen/template.php
 *     theme_menu_item_link()   in zen/template.php
 *     theme_menu_local_tasks() in zen/template.php
 *
 *   For more information, please visit the Theme Developer's Guide on
 *   Drupal.org: http://drupal.org/node/173880
 *
 * CREATE OR MODIFY VARIABLES FOR YOUR THEME
 *
 *   Each tpl.php template file has several variables which hold various pieces
 *   of content. You can modify those variables (or add new ones) before they
 *   are used in the template files by using preprocess functions.
 *
 *   This makes THEME_preprocess_HOOK() functions the most powerful functions
 *   available to themers.
 *
 *   It works by having one preprocess function for each template file or its
 *   derivatives (called template suggestions). For example:
 *     THEME_preprocess_page    alters the variables for page.tpl.php
 *     THEME_preprocess_node    alters the variables for node.tpl.php or
 *                              for node-forum.tpl.php
 *     THEME_preprocess_comment alters the variables for comment.tpl.php
 *     THEME_preprocess_block   alters the variables for block.tpl.php
 *
 *   For more information on preprocess functions and template suggestions,
 *   please visit the Theme Developer's Guide on Drupal.org:
 *   http://drupal.org/node/223440
 *   and http://drupal.org/node/190815#template-suggestions
 */


/*
 * Add any conditional stylesheets you will need for this sub-theme.
 *
 * To add stylesheets that ALWAYS need to be included, you should add them to
 * your .info file instead. Only use this section if you are including
 * stylesheets based on certain conditions.
 */
/* -- Delete this line if you want to use and modify this code
 // Example: optionally add a fixed width CSS file.
 if (theme_get_setting('vaultsoft_ru_fixed')) {
 drupal_add_css(path_to_theme() . '/layout-fixed.css', 'theme', 'all');
 }
 // */


/**
 * Implementation of HOOK_theme().
 */
function vaultsoft_ru_theme(&$existing, $type, $theme, $path) {
  $hooks = zen_theme($existing, $type, $theme, $path);
  // Add your theme hooks like this:
  /*$hooks['hook_name_here'] = array( // Details go here );*/
 
      $hooks[ 'user_login_block' ] = array(
        'template' => 'user-login-block',
        'arguments' => array('form' => NULL),
        ); 
  // @TODO: Needs detailed comments. Patches welcome!
  return $hooks;
}

function vaultsoft_ru_preprocess_user_login_block( &$vars ) {
// Modify the output
//$vars['form']['submit']['#value'] = "Login"
    $vars['form']['name']['#size'] = 8;
    $vars['form']['pass']['#size'] = 8;
    $vars[ 'rendered' ] = drupal_render( $vars['form'] ); // Print out in template file
}

function vaultsoft_ru_preprocess_search_block_form( &$vars, $hook ) {
    //drupal_set_message('<pre>'. print_r($vars, TRUE) .'</pre>');
    $vars[ 'form' ][ 'search_block_form' ][ '#title' ] = t( '' );
    $vars[ 'form' ][ 'search_block_form' ][ '#attributes' ][ 'placeholder' ] = t('Search this site');
    unset( $vars['form']['search_block_form']['#printed'] );
    $vars[ 'search' ][ 'search_block_form' ] = drupal_render($vars['form']['search_block_form']);
    $vars[ 'search_form' ] = implode($vars[ 'search' ]);

}
/**
 * Return a themed breadcrumb trail.
 *
 * @param $breadcrumb
 *   An array containing the breadcrumb links.
 * @return
 *   A string containing the breadcrumb output.
 */
function vaultsoft_ru_breadcrumb($breadcrumb) {

  // Determine if we are to display the breadcrumb.
  $show_breadcrumb = theme_get_setting('zen_breadcrumb');

  if ( $show_breadcrumb == 'yes' ||
        ( $show_breadcrumb == 'admin' && arg(0) == 'admin' ) ) {

    // Optionally get rid of the homepage link.
    $show_breadcrumb_home = theme_get_setting('zen_breadcrumb_home');
    
    if ( !$show_breadcrumb_home ) {
        array_shift( $breadcrumb );
        
    //} else { //add css class
        //$breadcrumb[ 0 ] = l( t( "Home" ), "<front>", 
        //    array( "attributes" => 
         //       array( "class" => 'home' ) ) );
        //print_r( $breadcrumb );
    }

    // Return the breadcrumb with separators.
    // as <ul><li /></ul>
    if ( !empty($breadcrumb) ) {
      $breadcrumb_separator = "</li><li>";/*"<span class='breadcrumb_separator'>" .
        theme_get_setting('zen_breadcrumb_separator') . "</span>";*/
      $output = '<div id="breadcrumb"><ul class = "breadcrumb"><li class = "first">' . 
            implode( $breadcrumb_separator, $breadcrumb) . "</li>";
            
            
      $trailing_separator = $title = '';
      
      if (theme_get_setting('zen_breadcrumb_title')) {
        
        if ($title = drupal_get_title()) {
          $output .= "<li class = 'title'>$title</li>";//TODO as link?
        }
        
      } elseif (theme_get_setting('zen_breadcrumb_trailing')) {
        //$output .= $breadcrumb_separator; TODO
      }
      
      return $output . "</ul></div>";
    }
  }
  // Otherwise, return an empty string.
  return '';
}

/**
 * Override or insert variables into all templates.
 *
 * @param $vars
 *   An array of variables to pass to the theme template.
 * @param $hook
 *   The name of the template being rendered (name of the .tpl.php file.)
 */
/*
 function vaultsoft_ru_preprocess( &$vars, $hook ) {
    //$vars['sample_variable'] = t('Lorem ipsum.');

 }
 // */

/**
 * Override or insert variables into the page templates.
 *
 * @param $vars
 *   An array of variables to pass to the theme template.
 * @param $hook
 *   The name of the template being rendered ("page" in this case.)
 */
 function vaultsoft_ru_preprocess_page(&$vars, $hook) {
    //$vars['sample_variable'] = t('Lorem ipsum.');
    drupal_add_css( path_to_theme() . '/c/tr.css', 'theme', 'screen', FALSE );
    $vars[ 'styles' ] = drupal_get_css();
    //drupal_set_message('<pre>'. print_r( $hook , TRUE) .'</pre>');
 }
 // */

/**
 * Override or insert variables into the node templates.
 *
 * @param $vars
 *   An array of variables to pass to the theme template.
 * @param $hook
 *   The name of the template being rendered ("node" in this case.)
 */

 function vaultsoft_ru_preprocess_node(&$vars, $hook) {
 //$vars['sample_variable'] = t('Lorem ipsum.');
  //  print_r( $vars );
//print_r( $hook );
    
/* SLOW but right way to iterate terms,
fast - examine path portfolio(/*)? */
    if ( preg_match( '/^portfolio(\/*)?/i', $vars[ 'path' ] ) ) {
        $vars[ 'classes' ] .= ' portfolio ';
    }
    //drupal_set_message('<pre>'. print_r($vars, TRUE) .'</pre>');
 }
 

/**
 * Override or insert variables into the comment templates.
 *
 * @param $vars
 *   An array of variables to pass to the theme template.
 * @param $hook
 *   The name of the template being rendered ("comment" in this case.)
 */
/* -- Delete this line if you want to use this function
 function vaultsoft_ru_preprocess_comment(&$vars, $hook) {

 //$vars['sample_variable'] = t('Lorem ipsum.');
 }
// */

/**
 * Override or insert variables into the block templates.
 *
 * @param $vars
 *   An array of variables to pass to the theme template.
 * @param $hook
 *   The name of the template being rendered ("block" in this case.)
 */
/* -- Delete this line if you want to use this function
 function vaultsoft_ru_preprocess_block(&$vars, $hook) {
 $vars['sample_variable'] = t('Lorem ipsum.');
 }
 // */
