#!/bin/bash
##
# Takes random picture (*.jpg) from $1 or default
# and sets as wallpaper by feh
# @uses feh
# @author Andrey Zakharov /Vaulter/
DIR=${1:-~/Картинки/wallpapers}
TempLog=/tmp/random.wallpapers.log

# Create a temporary logfile of all matches
find $DIR/ -iregex ".*\.jpg" > $TempLog
#find $WritingsPath -iregex ".*.rtf" >> $TempLog
#find $WritingsPath -iregex ".*.doc" >> $TempLog

# Choose a random line number (any number from 1 to the length of the file)
LowerBound=1
RandomMax=32767
UpperBound=$(cat $TempLog | wc -l)
RandomLine=$(( $LowerBound + ($UpperBound * $RANDOM) / ($RandomMax + 1) ))

# Use sed to grab the random line
WALL="$(sed -n "$RandomLine{p;q;}" "$TempLog")"

#echo $WALL
# open the random line in TextEdit
#open -e "$Command"
feh --bg-scale "$WALL"