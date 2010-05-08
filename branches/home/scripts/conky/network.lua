--[[ Network 4 conky

]]
require'cairo'
--global
sets = {
    0,
}
-- lua_startup_hook
conky_startup = function( iface )
    sets.iface = iface
end

--lua_draw_hook_pre
get_hardware_max = function( aiface )
    local iface = aiface or sets.iface or 'eth0'
    
--getting max HARDWARE now (powersave? offline?)
-- bas design here - some logic is inside awk 
    local tf = io.popen( [=[iwlist wlan0 rate| awk 'BEGIN {FS="[ :]+"} /Current/ {byps = $5 / 8; print byps,$6}']=], 'r' )
    local max = tf:read( '*a' )--all
    --some parse to get in BYTES
    return max
end

-- too many responsibility here
conky_tribar = function( aiface, sp_in, sp_out )
--strings
print ("${upspeed "..aiface.."} = ",conky_parse( "${upspeed "..aiface.."}" ) )
    local iface = aiface or sets.iface or 'eth0'
    local speed_in, speed_out, max    = 
        sp_in or conky_parse( "${downspeed "..iface.."}" ) or "1M",
        sp_out or conky_parse( "${upspeed "..iface.."}" ) or "1M",
        get_hardware_max( iface )

    print (iface, max, speed_in, speed_out)
    return ''
end
