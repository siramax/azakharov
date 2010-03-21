#!/bin/sh
# openbox Hardware pipe menu
# Andrey Zakharov

#Battery=$(acpi -b | grep "Battery" | sed -nr '/Battery/s/.*(\<[[:digit:]]+%).*/\1/p')
#Thermal=$(acpi --thermal --without-cooling --without-ac-adapter --without-battery | grep "Thermal" | sed -nr "s/.*(\<[[:digit:]]+\.[[:digit:]]) degrees.*/\1°C/p" )
echo "<openbox_pipe_menu>"
#echo "<item label=\"Battery: $Battery\"/>"
echo "<item label=\"$( acpi --thermal --without-cooling --without-ac-adapter --without-battery )\"/>"
echo "<item label=\"HDD: $( hddtemp /dev/sda --numeric)°C\"/>"
echo "<item label=\"GPU: $( nvidia-settings --no-config --query gpucoretemp | awk '/[0-9]+/ { printf "%d", $4 }' )°C\"/>"
echo "</openbox_pipe_menu>"
