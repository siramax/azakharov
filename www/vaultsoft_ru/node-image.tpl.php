<?php //if(in_array($tags,'Портфолио')) echo 'Оно!'; 
print_r( $tags );
  $year = '';
//we need to separate tags from diff dics
$terms = array();//replace
$aterms = array();
foreach($node->taxonomy as $tid=> $nt/*NodeTags*/) {
  $aterms[$nt->vid][$tid] = &$node->taxonomy[$tid];
  if($nt->name == 'Портфолио') $isportfolio = true;//hmmmmmmm
}
$dn = new stdClass();
$dn->taxonomy = & $tt;
foreach($aterms as $vid => $tt) {
  $linksbydic[$vid] =  taxonomy_link('taxonomy terms', $dn);//['taxonomy']
  $terms[$vid] = theme('links', $linksbydic[$vid], array('class' => 'links inline'));
}
if($isportfolio)
  $year = format_date($node->created,'custom','Y'); ?>


<div class="node<?php if ($sticky) { print " sticky"; } if (!$status) { print " node-unpublished"; } ?> node-<?php print $node->type;print ($teaser?'-teaser':''); if($isportfolio) print ' portfolio' ?>">
<?php if($teaser): ?>
<h3 class="title"><a href="<?php print $node_url?>"><?php print $title?></a> <?php print $year ?></h3>
<?php else: ?>
<h1 class="title node-title"><?php print $title?> (<?php print format_date($node->created,'custom','F Y') ?>)</h1>
<div class='tags'><?php print ($terms[1] )?></div>
<?php endif; ?>
<?php print $content?>
<?php if ($links) { ?><div class="links">&raquo; <?php print $links?></div><?php }; ?>
</div>
<?php if(($id % 2) == 0):?>
<div class="clear_block"></div>
<?php endif; ?>