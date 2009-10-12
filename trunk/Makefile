#
#
#

#Q = @
RM = rm -f
SED = sed
VIEW = okular

LATEX2PDF = pdflatex -interaction=batchmode
XSLTPROC = xsltproc
PROJ = resume

TARGET_TEX = $(PROJ).gen.tex
TARGET_HTML = $(PROJ).html
TARGET_PDF = $(PROJ).gen.pdf
TARGET_XML = $(PROJ).gen.xml

XML2TEX_XSLT = $(PROJ).tex.xsl
XML2HTML_XSLT = $(PROJ).html.xsl

.PHONY: all pdf xml

pdf:
	$(Q)$(LATEX2PDF) $(TARGET_TEX)

tex:
	$(Q)( $(SED) 's!C#!C\\#!' $(PROJ).xml | $(XSLTPROC) --output $(TARGET_TEX) $(XML2TEX_XSLT) -)

ttex:
	$(Q)$(XSLTPROC) $(XML2TEX_XSLT) $(PROJ).xml

html:
	$(Q)$(XSLTPROC) --output $(TARGET_HTML) $(XML2HTML_XSLT) $(PROJ).xml

all: tex pdf html
	$(VIEW) $(TARGET_PDF) &

clean:
	$(RM) *.log *.out *~ *.aux \
	*.4ct *.4tc *.bbl *.blg *.dvi *.idv *.lg *.tmp *.xref \
	$(TARGET_HTML) $(TARGET_PDF)
