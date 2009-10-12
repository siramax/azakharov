<?xml version="1.0"?>
<xsl:stylesheet 
  xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:output method="text" media-type="text/x-tex" />
  
  <xsl:template match = "*[ @xlink:role = 'locator' ]">
    <xsl:choose>
      <xsl:when test = 'text()'> \href{<xsl:value-of select = "@xlink:href" />}{<xsl:value-of select = "." />} </xsl:when>
      <xsl:otherwise>   \url{<xsl:value-of select = "@xlink:href" />}      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template match = "/">
%
\documentclass[11pt,a4paper]{moderncv}
\moderncvtheme[green]{classic}
\usepackage[utf8]{inputenc}
\usepackage[scale=0.9]{geometry}
\usepackage{url}
\AtBeginDocument{\recomputelengths}
  <xsl:apply-templates select = '/Document/Meta' />
  \begin{document}\maketitle
    <xsl:apply-templates select = '/Document/Meta/following-sibling::*' />
  \end{document}
  </xsl:template>
  <!-- Meta -->
  <xsl:template match="Period"><xsl:value-of select = "@From" />---<xsl:value-of select = "@To" /></xsl:template>
  <xsl:template match = '/Document/Meta'><xsl:apply-templates /></xsl:template>
  <xsl:template match = '/Document/Meta/Personal'><xsl:apply-templates /></xsl:template>
  <xsl:template match = '//Meta/Title'>\title{<xsl:value-of select = '.' />}</xsl:template>
  <xsl:template match = '//Personal/FirstName'>\firstname{<xsl:value-of select = '.' />}</xsl:template>
  <xsl:template match = '//Personal/FamilyName'>\familyname{<xsl:value-of select = '.' />}</xsl:template>
  <xsl:template match = '//Personal/Address'>\address{}{\color{black}<xsl:value-of select = '.' />\color{addresscolor}}</xsl:template>
  <xsl:template match = '//Personal/Phone'>
    <xsl:if test = '@type = "cell"'>\mobile</xsl:if>{\color{black}<xsl:value-of select = '.' />\color{addresscolor}}</xsl:template>
  <xsl:template match = '//Personal/Email'>\email{<xsl:value-of select = '.' />}</xsl:template>
  <xsl:template match = '//Personal/Extra[ @type = "skype" ]'>
    \extrainfo{skype: \color{black}<xsl:value-of select = '.' />}</xsl:template>
  <xsl:template match = '//Personal/Photo'>\photo[<xsl:value-of select = '@width' />]{<xsl:value-of select = '.' />}</xsl:template>
  

  <xsl:template match = '/Document/*'>\section{<xsl:value-of select = 'name()' />}<xsl:apply-templates /></xsl:template>
  <xsl:template match = '/Document/*/*'>\subsection{<xsl:value-of select = 'name()' />}<xsl:apply-templates /></xsl:template>
  
  <xsl:template match = '//Education/Entry'>\cventry{<xsl:apply-templates select = 'Period' />}{<xsl:value-of select = 'Degree' />}{<xsl:value-of select = 'Institution' />}{<xsl:value-of select = 'City' />}{\textit{<xsl:value-of select = 'Grade' />}}{<xsl:value-of select = 'Description' />}</xsl:template>
  
  <xsl:template match = '//Education/Thesis'>
\subsection{Master thesis}
\cvline{title}{\emph{<xsl:value-of select = 'Title' />}}
\cvline{supervisors}{<xsl:value-of select = 'Supervisors' />}
\cvline{description}{\small <xsl:value-of select = 'Description' />}
  </xsl:template>
  
  <xsl:template match = '//Experience//Entry'>\cventry{<xsl:apply-templates select = 'Period' />}{<xsl:value-of select = '@Job' />}{<xsl:value-of select = 'Employer/Name' />}%
    {<xsl:value-of select = 'Employer/City' />}{<xsl:copy-of select = 'Employer/Description' />}{<xsl:apply-templates select = 'Description' />\newline{}Key technologies and languages: <xsl:value-of select = 'Techs' />}</xsl:template>
    
  <xsl:template match = '//Language'>\cvlanguage{<xsl:value-of select = '@name' />}%
    {<xsl:value-of select = '@skill' />}{<xsl:value-of select = '.' />}</xsl:template>
    
  <xsl:template match = '/Document/Skills'>\section{Computer skills}<xsl:apply-templates /></xsl:template>
  <xsl:template match = '/Document/Skills/Group'>\subsection{<xsl:value-of select = '@type' />}<xsl:apply-templates /></xsl:template>
  
  <xsl:template match = '/Document/Skills//Entry'><xsl:choose><xsl:when test = '@type'>\cvline{<xsl:value-of select = '@type' />}</xsl:when><xsl:otherwise>\cvlistitem</xsl:otherwise></xsl:choose>{<xsl:value-of select = '.' />}</xsl:template>
  
  <xsl:template match = '/Document/Bibliography'>\begin{thebibliography}{9}
    <xsl:apply-templates />
  \end{thebibliography}</xsl:template>
  <xsl:template match = '/Document/Bibliography/Entry'>\bibitem{}
    <xsl:value-of select = '@Author' />, 
    \href{<xsl:value-of select = '@Url' />}{<xsl:value-of select = '@Title' />}. <xsl:value-of select = '@Year' />
  </xsl:template>
  
</xsl:stylesheet>