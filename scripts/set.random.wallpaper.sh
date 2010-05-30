#!/bin/bash

##
# Takes random picture (*.jpg) from $1 or default
# and sets as wallpaper by feh
# Also can upload to your site by scp
# @uses feh, [scp]
# @author Andrey Zakharov /Vaulter/
DIR=${1:-~/Картинки/wallpapers}             # source dir
TempList=/tmp/random.wallpapers.log         # temp list store
RFILE=www/htdocs/vaultsoft.ru/sites/all/themes/vaultsoft_ru/i/wallpaper.jpg     # remote file
RHOST=vs                                                                        # remote host for sftp [user@host], I have an alias "vs"
# Create a temporary logfile of all matches
find $DIR/ -iregex ".*\.jpe?g" > $TempList
#find $WritingsPath -iregex ".*.rtf" >> $TempLog
#find $WritingsPath -iregex ".*.doc" >> $TempLog

# Choose a random line number (any number from 1 to the length of the file)
LowerBound=1
RandomMax=32767
UpperBound=$(cat $TempList | wc -l)
RandomLine=$(( $LowerBound + ($UpperBound * $RANDOM) / ($RandomMax + 1) ))

# Use sed to grab the random line
WALL="$(sed -n "$RandomLine{p;q;}" "$TempList")"

#echo $WALL
# open the random line in TextEdit
#open -e "$Command"
feh --bg-scale "$WALL"
# done if no params
[ -z "$2" -o -z "$RFILE" -o -z "$RHOST" ] && exit 0

SCP=`which scp 2>/dev/null` || exit 255
# else upload
$SCP "$WALL" "$RHOST":"$RFILE" && echo "Done" # or kdialog
