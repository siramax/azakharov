<?xml version="1.0"?>
<!DOCTYPE stylesheet [
  <!ENTITY mdash "&#8212;">
]>
<xsl:stylesheet xmlns:xsl = "http://www.w3.org/1999/XSL/Transform" xmlns:xlink = "http://www.w3.org/1999/xlink" version = "1.0">
  <xsl:output method = "html" media-type = "application/xhtml+xml" />
  <xsl:param name = "lang" >en</xsl:param>
  <xsl:template match = "*[ @xlink:role = 'locator' ]">
    <a>
      <xsl:attribute name = 'href'><xsl:value-of select = "@xlink:href" /></xsl:attribute>
      <xsl:choose>
        <xsl:when test = 'text()'><xsl:value-of select = "." /></xsl:when>
        <xsl:otherwise><xsl:value-of select = "@xlink:href" /></xsl:otherwise>
      </xsl:choose>
    </a>
  </xsl:template>
  
  <xsl:template match = "/">
<html>
  <head> 
    <xsl:apply-templates select = '/Document/Meta/Title' />
    <link href='http://fonts.googleapis.com/css?family=Judson' rel='stylesheet' type='text/css' />
    <style type = 'text/css'>
      body, table { font-family: "Judson", "Times", serif; font-size: 12pt; color: #333; }
      td { vertical-align: top }
      #personal { overflow: hidden }
      .address, .phone, .mobile, .email, .skype { float: right; margin-right:100pt; clear: right; }
      .picture { float: right;   clear: right; margin-bottom: -55pt; border: 1px solid; padding: 2px; }
      .firstname { font-size: 120% }
      .familyname { font-size: 150% }
      h1 { font-size: 140%; padding-left: 5em; border-bottom: 1px dotted }
      h2 { font-size: 120%; padding-left: 8em; }
      table.subsection td { padding-top: 0.5em; }
      table.subsection td.period,
      table.subsection td.type,
      table.languages td.name { padding-right: 2em; }
      table.subsection td.period { white-space: nowrap }
      table.subsection span.techs { font-style: italic; }
      table strong { font-size: 115%; }
      <!-- theme -->
      .picture { border-color: lime }
      h1 { color: #040; border-color: #093; /*text-shadow: 2px 2px 12px #444;*/ }
      h2 { color: #040; }
    </style>
  </head>
  <body>
  	<xsl:apply-templates select = '/Document/Meta' />
  	<xsl:apply-templates select = '/Document/Meta/following-sibling::*' />
  </body>
</html>
  </xsl:template>
  
  <xsl:template match="Period"><xsl:value-of select = "@From" />&mdash;<xsl:value-of select = "@To" /></xsl:template>
  <!-- Meta -->
  <xsl:template match = '/Document/Meta'><xsl:apply-templates select = "*[@lang=$lang]"/></xsl:template>
  <xsl:template match = '/Document/Meta/Personal'><div id='personal'><xsl:apply-templates /></div></xsl:template>
  
  <xsl:template match = '//Meta/Title'><title><xsl:value-of select = '.' /></title></xsl:template>
  
  <xsl:template match = '//Personal/FirstName'><span class='firstname'><xsl:value-of select = '.' /></span></xsl:template>
  <xsl:template match = '//Personal/FamilyName'><span class='familyname'><xsl:value-of select = '.' /></span></xsl:template>
  <xsl:template match = '//Personal/Address'><span class='address'><xsl:value-of select = '.' /></span></xsl:template>
  <xsl:template match = '//Personal/Phone'>
    <span class='phone'>
      <xsl:if test = '@type = "cell"'>
        <xsl:attribute name = 'class'>mobile</xsl:attribute>
      </xsl:if>
      <xsl:value-of select = '.' />
    </span>
  </xsl:template>
    
  <xsl:template match = '//Personal/Email'><span class='email'><a>
    <xsl:attribute name='href'>mailto:<xsl:value-of select = '.' /></xsl:attribute>
    <xsl:value-of select = '.' /></a></span></xsl:template>
  <xsl:template match = '//Personal/Extra[ @type = "skype" ]'><span class='skype'>skype: <xsl:value-of select = '.' /></span></xsl:template>
    
  <xsl:template match = '//Personal/Photo'>
    <div class = 'picture'><img>
      <xsl:attribute name = 'width'>
        <xsl:value-of select = '@width' />
      </xsl:attribute>
      <xsl:attribute name = 'src'>
        <xsl:value-of select = '.' />
      </xsl:attribute>
   </img></div>
  </xsl:template>
  
  <xsl:template match = '/Document/*'><h1><xsl:value-of select = 'name()' /></h1><xsl:apply-templates /></xsl:template>
  
  <xsl:template match = '/Document/*/*'><h2><xsl:value-of select = 'name()' /></h2>
    <table class = 'subsection'>
      <xsl:apply-templates />
    </table>
  </xsl:template>
  <xsl:template match = '/Document/Programs'></xsl:template>
  <xsl:template match = '/Document/Strengths'><h1><xsl:value-of select = 'name()' /></h1><ul><xsl:apply-templates /></ul></xsl:template>
  <xsl:template match = '//Strengths/Entry'><li><xsl:apply-templates /></li></xsl:template>
  
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
  
  <xsl:template match = '//Experience//Entry'><tr><td class='period'><xsl:apply-templates select = 'Period' /></td>
  <td><strong><xsl:value-of select = '@Job' /></strong>, <xsl:value-of select = 'Employer/Name' />, 
    <xsl:value-of select = 'Employer/City' />, <em><xsl:value-of select = 'Employer/Description' /></em>
    <ul><xsl:apply-templates select = 'Description' /></ul>
    <xsl:apply-templates select="Achievement[@lang='en']" /><br />
    <span class = 'techs'>Key technologies and languages: <xsl:value-of select = 'Techs' /></span></td></tr></xsl:template>
    
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

  <xsl:template match = '/Document/Links/Profiles'><ul class = "ProfileLinks"><xsl:apply-templates /></ul></xsl:template>
  <xsl:template match = '/Document/Links/Profiles/Entry'>
    <li>
      <a>
        <xsl:attribute name = "href">
          <xsl:value-of select = '@xlink:href' />
        </xsl:attribute>
        <strong><xsl:value-of select = '@type' /></strong>
        [
          <xsl:value-of select="@xlink:href" />
        ]
      </a>
    </li>
  </xsl:template>


  
</xsl:stylesheet>