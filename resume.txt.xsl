<?xml version="1.0"?>
<!DOCTYPE stylesheet [
  <!ENTITY mdash "&#8212;">
]>
<xsl:stylesheet xmlns:xsl = "http://www.w3.org/1999/XSL/Transform" xmlns:xlink = "http://www.w3.org/1999/xlink" version = "1.0">
  <xsl:output method = "text" media-type = "plain/txt" />
    <xsl:param name="lang">en</xsl:param>
  
  <xsl:template match = "*[ @xlink:role = 'locator' ]"><xsl:choose>
    <xsl:when test = 'text()'><xsl:value-of select = "." /> /<xsl:value-of select = "@xlink:href" />/</xsl:when>
    <xsl:otherwise><xsl:value-of select = "@xlink:href" /></xsl:otherwise></xsl:choose>
  </xsl:template>
  
  <xsl:template match = "/">
  	<xsl:apply-templates select = '/Document/Meta/Personal' />
  	<xsl:apply-templates select = '/Document/Meta/following-sibling::*' />
  </xsl:template>
  
  <xsl:template match="Period"><xsl:value-of select = "@From" />-<xsl:value-of select = "@To" /></xsl:template>
  <!-- Meta -->
  <xsl:template match = '/Document/Meta'><xsl:apply-templates /></xsl:template>
  <xsl:template match = '/Document/Meta/Personal'>=Personal=
<xsl:apply-templates /></xsl:template>
  <xsl:template match = '//Meta/Title'><xsl:value-of select = '$lang' /> <xsl:value-of select = '.' /></xsl:template>
  <!-- TODO align -->
  <xsl:template match = '//Personal/FirstName'> <xsl:value-of select = '.' /> </xsl:template>
  <xsl:template match = '//Personal/FamilyName'> <xsl:value-of select = '.' /> </xsl:template>
  <xsl:template match = '//Personal/Address'>address: <xsl:value-of select = '.' /></xsl:template>
  <xsl:template match = '//Personal/Phone'><xsl:if test = '@type = "cell"'>cell:</xsl:if><xsl:value-of select = '.' /></xsl:template>
  <xsl:template match = '//Personal/Email'>email: <xsl:value-of select = '.' /></xsl:template>
  <xsl:template match = '//Personal/Extra[ @type = "skype" ]'>skype: <xsl:value-of select = '.' /></xsl:template>
  <!--  
  <xsl:template match = '//Personal/Photo'>
    <div class = 'picture'><img>
      <xsl:attribute name = 'width'>
        <xsl:value-of select = '@width' />
      </xsl:attribute>
      <xsl:attribute name = 'src'>
        <xsl:value-of select = '.' />
      </xsl:attribute>
   </img></div>
  </xsl:template>-->
  
  <xsl:template match = '/Document/*'> =<xsl:value-of select = 'name()' />= <xsl:apply-templates /></xsl:template>
  
  <xsl:template match = '/Document/*/*'> ==<xsl:value-of select = 'name()' />==
    <!-- TODO <table class = 'subsection'> -->
      <xsl:apply-templates />
  </xsl:template>
  
  <xsl:template match = '/Document/Strengths'> =<xsl:value-of select = 'name()' />= <!--TODO <ul>-->
        <xsl:apply-templates /></xsl:template>
  <xsl:template match = '//Strengths/Entry'>        <xsl:apply-templates />
</xsl:template>
  
  <xsl:template match = '//Education/Entry'>
    <xsl:apply-templates select = 'Period' />, <strong><xsl:value-of select = 'Degree' /></strong>,
      <xsl:value-of select = 'Institution' />, 
      <xsl:value-of select = 'City' />, 
      <em><xsl:value-of select = 'Grade' /></em>, 
      <small><xsl:value-of select = 'Description' /></small>.<br />
  </xsl:template>

  <xsl:template match = '//Education/Thesis'>
<h2>Master thesis</h2>
<table class = 'subsection'>
  <tr><td>title</td><td><em><xsl:value-of select = 'Title' /></em></td></tr>
  <tr><td>supervisors</td><td><xsl:value-of select = 'Supervisors' /></td></tr>
  <tr><td>description</td><td><small><xsl:value-of select = 'Description' />}</small></td></tr>
</table>
  </xsl:template>
  
  <xsl:template match = '//Experience//Entry'><xsl:apply-templates select = 'Period' />   '''<xsl:value-of select = '@Job' />''', /<xsl:value-of select = 'Employer/Name' />/, <xsl:value-of select = 'Employer/City' />, <xsl:value-of select = 'Employer/Description' />
    <xsl:apply-templates select = 'Description' />
    <xsl:apply-templates select="Achievement[@lang='$lang']" />
<!--
    <span class = 'techs'>Key technologies and languages: <xsl:value-of select = 'Techs' /></td></tr>--></xsl:template>
    
  <xsl:template match = '//Achievement'><li><xsl:value-of select = '.' /></li></xsl:template>
    
  <xsl:template match = '//Languages'><h1>Languages</h1><table class = 'languages'><xsl:apply-templates /></table></xsl:template>
  <xsl:template match = '//Language'><tr><td class='name'><xsl:value-of select = '@name' /></td>
  	<td class='skill'><xsl:value-of select = '@skill' /></td><td><xsl:value-of select = '.' /></td></tr></xsl:template>
    
  <xsl:template match = '/Document/Skills'><h1>Computer skills</h1><xsl:apply-templates /></xsl:template>
    <xsl:template match = '/Document/Skills/Group'><h2><xsl:value-of select = '@type' /></h2>
    <table class = 'subsection'>
    <xsl:apply-templates />
    </table>
    </xsl:template>

  <xsl:template match = '/Document/Skills//Entry'><tr>
    <xsl:choose>
        <xsl:when test = '@type'>
            <td class = 'type'><xsl:value-of select = '@type' /></td>
        </xsl:when>
        <xsl:otherwise></xsl:otherwise>
    </xsl:choose>
    <td class='entry'><xsl:value-of select = '.' /></td></tr></xsl:template>
    
    <xsl:template match = '/Document/Bibliography'><h1>Publications</h1>
      <table cellpadding = "1" cellspacing = "0" border = "0">
        <xsl:apply-templates />
      </table></xsl:template>

    <xsl:template match = '/Document/Bibliography/Entry'>
      <tr>
        <td><xsl:value-of select = '@Author' />, </td>
        <td>
          <a><xsl:attribute name = "href"><xsl:value-of select = '@Url' /></xsl:attribute><xsl:value-of select = '@Title' /></a>, 
        </td>
        <td><xsl:value-of select = '@Year' /></td>
      </tr>
    </xsl:template>
  
</xsl:stylesheet>