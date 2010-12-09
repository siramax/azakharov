#!/bin/sh
# Openbox pipe menu
# for personal use
# binded on <WIN>+1, Double click on desktop, Right click on title of any window
# @author Andrey Zakharov 2009-2010
# @uses
#   xdg-open
#   calendar
#   update-alternatives
#   kate
#   ~/scripts/openbox/ssh.sh
#   ~/scripts/openbox/ob-hw.sh
#   ~/bin/obmenugen
#   ~/bin/set.random.wallpaper.sh
# @todo get selection in current application (via d-bus)

IFS=
SELF="$(cd "${0%/*}" 2>/dev/null; echo "$PWD"/"${0##*/}")"
GET_MIME="xdg-mime query filetype"
OBMENUGEN="$HOME/bin/obmenugen"
#Load language
. `dirname $SELF`/ob4vaulter.$LANG.txt
##
# OpenBox menu separator
# @param $1 optional label
ob_menu_sep() {
    if [ -z "$1" ]; then
        echo "<separator />"
    else
        echo "<separator label=\"$1\" />"
    fi
}

##
# template for OpenBox sub-menu
# $1 id
# $2 label
# $3 cmd to pipe
ob_subpipe_menu() {
    [ -n "$1" ] && (
        echo "<menu id='$1' "

        [ -n "$2" ] && (
            echo "      label='$2' "

            [ -n "$3" ] && (
                echo "      execute='$3'"
            )
        )

        echo " />"
    )
}

##
# template of OpenBox menu item
# @param $1 = int = 0 type of / e.g. execute/
# @param $2 = label
# @param $3 = args goes to cmd for execute
ob_menu_item() {
# TODO valid $1?
    [ -z "$2" ] && return 0

    if [ $1 -eq 0 ]; then # TODO with notify?
        echo "<item label=\"$2\"><action name=\"execute\"><command>$3</command></action></item>"
    else
        echo "<item label=\""UNKNOWN TYPE $line"\" />"
    fi
}

##
# Creates menu for linux /etc/alternatives system
# @param $1 - groupname (x-www-browser)
getAlternatives() {
    /usr/sbin/update-alternatives --list $1 | while read line; do
        ob_menu_item 0 $line $line
    done
}

##
# Echos the name from *.desktop
# with respect to current locale TODO
# @param desktop file
desktop_get_name() {
    sed -n '/^Name=/s#^Name=##p' "$1"
}

##
# Echos the exec string from *.desktop
# @param desktop file
# Url supports TODO
desktop_get_exec() {
    sed -n '/^Exec=/s#^Exec=##p' "$1"
}

##
# Create openbox menu from ~/Desktop
# @param $1 folder to start. ~/Desktop default
m_desktop() {
    local _exec
    local _name
    DESKDIR=${1:-"$HOME/Desktop"}

    ob_menu_sep "$txtDesktop"
    # *.desktop files goes first
    for d in $DESKDIR/*.desktop; do
        _exec=$( desktop_get_exec "$d" ) ##########################
        _name=$( desktop_get_name "$d" )
        ob_menu_item 0 "$_name" "$_exec"
    done

    # ordinary files and dirs
    file_as_menu_item() { ob_menu_item 0 "`basename $1`" "xdg-open \"$1\""; }
    dir_as_menu_item() { ob_subpipe_menu "$1" "`basename $1`" "$SELF desktop $1"; }

    local _filesLabel=0;
    local _dirsLabel=0;

    find "$DESKDIR/" -maxdepth 1 -type f -not -iname "*.desktop" -not -iname ".*" | while read f; do
        if [ $_filesLabel -eq 0 ]; then ob_menu_sep "Files"; _filesLabel=1; fi
        file_as_menu_item "$f"
    done

    find "$DESKDIR/" -maxdepth 1 -type d -not -wholename "$DESKDIR/" -not -iname ".*" | while read f; do
        if [ $_dirsLabel -eq 0 ]; then ob_menu_sep "Folders"; _dirsLabel=1; fi
        dir_as_menu_item "$f"
    done    
    # TODO links stuff
}

##
# simple check of service
# TODO improve
# @param $1 bin to find
# @param $2 cmd to start program
# @param $3 cmd to kill program
# @param $4 optional label
simple_check() {
    DE=$1
    DSTART=$2
    DKILL=$3
    DLABEL=${4:-"$DE"}
#simple check
    if pgrep -u $UID $DE >/dev/null; then
        DEACT="$txtQuit"
        DEEXE="$DKILL"
    else
        DEACT="$txtStart"
        DEEXE="$DSTART"
    fi
    echo "<item label=\"$DEACT $DLABEL\">"
        echo "  <action name=\"execute\"><command>$DEEXE</command></action>"
    echo "</item>"
}

#
#
#
# start output here...
echo "<openbox_pipe_menu>"

case "$1" in
    a | getAlternatives)
        if [ -n "$2" ]; then
            getAlternatives $2
        fi
        ;;
    c | cal | calendar) #calendar
        calendar | while read line; do
            ob_menu_item 0 "$line"
        done
        ;;
    d | desk | desktop)
        shift
        m_desktop $* #shift
        ;;
    t | tools)
        shift
        
        #UID=$USER 
        simple_check "ktorrent" "/usr/bin/ktorrent" "kquitapp --service org.ktorrent.ktorrent ktorrent" "KTorrent"
        simple_check "skype" "/usr/bin/skype" "pkill -SIGINT skype" "Skype"
        simple_check "plasma" "/usr/bin/plasma" "kquitapp plasma"
        #UID=$USER 
        simple_check "openvpn" "lxterm -title \"Sperasoft VPN\" -e '/bin/sh -c \"cd /home/vaulter/.openvpn/config/; cat /home/vaulter/Desktop/vpn.txt; sudo openvpn client.ovpn\"'" \
        "pkill openvpn" "Sperasoft VPN"
        ;;
    *)
#openttd 
# ratings
# land area
        ob_menu_sep "`pwd`"
        ob_subpipe_menu Desktop "$txtDesktop" "$SELF desktop"
        #use open box built-in menu
        ob_subpipe_menu client-list-combined-menu "❖ "
        #ob_subpipe_menu ssh "$txtSSH" "$HOME/scripts/openbox/ssh.sh"
        ob_subpipe_menu Tools "$txtTools" "$SELF tools"
        ob_subpipe_menu time `date` "$SELF cal"
        ob_menu_item 0 "$txtWallpaper" "$HOME/scripts/set.random.wallpaper.sh ~/pics/wallpapers remote"


        ob_menu_sep
        ob_subpipe_menu hardware "$txtHardware" '/home/vaulter/scripts/openbox/ob-hw.sh'
        # FILE BROWSER
        # TODO human editors (MIME)
        #echo "<menu id='filebrowser' label='~' execute='/home/vaulter/.config/openbox/usr/bin/obfilebrowser --no-hidden ~' />"
        ob_subpipe_menu browsers "$txtBrowsers" "$SELF getAlternatives x-www-browser"
        # TODO bookmarks (google?)
        ob_subpipe_menu mainmenu "$txtMainMenu" "$OBMENUGEN --pipe"

        ob_menu_item 0 "CS 1.6 /todo move to desktop/" "x-terminal-emulator -e \"~/scripts/cs.sh\""
        ob_menu_item 0 "Sleeeeep" "powersave --suspend-to-ram"
        ob_menu_sep
        ob_menu_item 0 "$txtEditThisMenu" "kate $SELF"
        ob_menu_item 0 "$txtEditWidgets" "kate `eval echo $HOME/.conkyrc*`"
        ;;
esac

echo "</openbox_pipe_menu>"
# end of output
#
#
#