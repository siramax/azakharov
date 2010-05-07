#!/bin/bash
# RSS Display Script by Andrey Zakharov (admin@vaultsoft.ru) v0.1
#
# This script is designed to output story BODIES for most any RSS Feed.
#
# This script depends on wget, xsltproc, sed.  Please ensure it is installed and in your $PATH
# Debian: apt-get install wget xsltproc sed
#
# Usage:
# .conkyrc:	${execpi [time] /path/to/script/conky-rss.sh URI LIMIT}
#   URI = Location of feed, ex. http://bash.org.ru/rss/
#   LINES = How many items to display (default 5)
#
# Usage Example
#   ${execi 300 /home/youruser/scripts/conky-rss.sh http://www.foxnews.com/xmlfeed/rss/0,4313,1,00.rss 4}

# TODO quotes with quote symbols - respect LOCALE
rssxslt=`dirname $0`/rss.xslt
cat > $rssxslt <<XML
<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="text" indent="no"/>
    <xsl:param name = "limit" select = "20" />
    <xsl:template match="rss"><xsl:apply-templates  select = "channel" /></xsl:template>

    <xsl:template match="channel"><xsl:text>\${color1}</xsl:text><xsl:value-of select="description/text()" />\${color}
<xsl:text>
</xsl:text>
<xsl:apply-templates select = "item[ position() &lt; \$limit ]" />
    </xsl:template>

    <xsl:template match="item">
<xsl:value-of select="description/text()" />
<xsl:text> \${color1}\${hr 1}\${color}

</xsl:text>
    </xsl:template>
</xsl:stylesheet>
XML
#RSS Setup - Don't change unless you want these values hard-coded!
uri=$1                          # URI of RSS Feed
lines=${2:-5}                   # Number of headlines
titlenum=${3:-2}                # Number of extra titles
timeout=50                      # Timeout for wget in secs
#
#Script start
#Require a uri, as a minimum
if [ -z "$uri" ]; then
	echo "No URI specified, cannot continue!" >&2
	echo "Please read script for more information" >&2
else
	#The actual work
    wget --timeout=$timeout --quiet --output-document - $uri |\
#        iconv --from-code cp1251 --to-code UTF-8 |\
    xsltproc --nonet --novalid --param limit $( expr 1 + $lines ) $rssxslt - |\
    sed 's!<br/\?>!\n!g
s!&quot\;!"!g
s!&lt\;!<!g
s!&gt\;!>!g
s!&amp\;!\&!g
'
fi
