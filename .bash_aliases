#########################################################
# part of A.Zakharov's shell :)
# Andrey Zakharov <aazaharov81@gmail.com>
# see ya at http://code.google.com/p/azakharov/

##
# Lightweight replace for (The Killar of) surfraw
# Perform google search from command line
# @author Andrey Zakharov <aazaharov81 ONTO gmail com> 2010
# @code
# $ g well linux c%2b%2b engineer
# @endcode
# @TODO url decode
g() {
#http://www.google.com/search?hl=${LANG%%_*}&site=&q=sed&btnG=Поиск&lr=
    ( sensible-browser "http://www.google.com/search?hl=${LANG%%_*}&q=$*" 2>/dev/null ) &
}

##
# Manual browsing
# Konqueror can show you man pages as well html
man() {
    [ -n "$DISPLAY" ] && (
        ( konqueror "man:/$*" 2>/dev/null ) &
    ) || (
        `which man` $*
    )
}

# one of the first
# just shows list of most faulty (swap) apps
alias swap='ps -e v | sort -k 5 -g; ps -e v | head -n1'
alias mtop="ps -eo pid,size,args | sort -g -k 2"

# work
alias wSMN="watch --interval=1 'ps ax | grep -v tail | grep -v grep | grep SMN'"

##
# This will allow just "kate ~/.bash_aliases" :)
# for viewing in X editor stdout of another:
# ls | kate -i - still works!
# todo parse links like
# expr 'sourse.cpp:95' : '.*:\([0-9]\+\)$'
# and --line 95
kate() {
    {
        /usr/bin/kate --use $* 2>/dev/null &
    } < /dev/stdin
}

##
# some more ls aliases
alias ll='ls -l'
alias la='ls -A'
#alias l='ls -CF'

alias aptse='aptitude search'
