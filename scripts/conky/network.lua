--! Network 4 conky
--! @author Andrey Zakharov 2010
--! Trivalue bar
require'cairo'
--require'rex_posix'
--require'print_r'

--!     Just a shrinker
--! Usage: local m = merilo( 0, 100, -2000, 2000 ); print( m( 50 ) ) -- 0
merilo = function( mini, maxi, minp, maxp )

    local empty = function()
        return minp
    end

    local mer = function( i )
        --print( i,  mini, maxi, minp, maxp )
        return ( ( i - mini ) * ( maxp - minp ) / ( maxi - mini ) ) + minp
    end
    --to avoid devision by zero
    if ( mini ~= maxi ) then    return mer 
    else                        return empty    end
end

--global
sets = {
  x     = 5,     -- offset x
  y     = -10,   -- offset y
  h     = 30     -- height
}
-- lua_startup_hook
conky_startup = function( iface )
  --print( table.show( conky_window, "sets" ) )
  sets.iface = iface
end

--lua_draw_hook_pre
get_hardware_max = function( aiface )
    local iface = aiface or sets.iface or 'eth0'
    
--getting max HARDWARE now (powersave? offline?)
-- bad design here - some logic is inside awk 
    local tf = io.popen( [=[iwlist wlan0 rate| awk 'BEGIN {FS="[ :]+"} /Current/ {byps = $5 / 8; print byps,$6}']=], 'r' )
    local max = tf:read( '*a' )--all
    --some parse to get in BYTES
    return max
end

conky_tribar = function( aiface, sp_max, sp_in, sp_out )

  if conky_window == nil then return end

  local iface = aiface or sets.iface or 'eth0'
  local speed_in, speed_out, max    = 
    sp_in or conky_parse( "${downspeed "..iface.."}" ) or "1M", -- in bytes!
    sp_out or conky_parse( "${upspeed "..iface.."}" ) or "1M",
    get_hardware_max( iface )
  max = sp_max or "2.5M" -- in bits
  max, speed_in, speed_out = 
    get_in_bytes( max ) / 8, get_in_bytes( speed_in ), get_in_bytes( speed_out )

  
  -- print( table.show( conky_window ) )
  -- print (iface, max, speed_in, speed_out)
  sets.ww = conky_window.width or conky_window.text_width
  sets.wh = conky_window.height or conky_window.text_height

  local cs = cairo_xlib_surface_create(
    conky_window.display,
    conky_window.drawable,
    conky_window.visual, 
    conky_window.width,
    conky_window.height 
  )
  local cr = cairo_create( cs )
  draw_tribar( cr, { speed_in, speed_out, max } );
  cairo_destroy( cr )
  return ''
end

get_in_bytes = function( str )
  local b, m = string.match( str, "([0-9.]+)%s*(.)" )
  m = string.lower( m )
  if ( m == "g" ) then return b * 1024 * 1024 * 1024 end
  if ( m == "m" ) then return b * 1024 * 1024 end
  if ( m == "k" ) then return b * 1024 end
  return b
  --print( b, m );
end

--! Draws tribar for max, num1, num2...
--! TODO for any other values
--! Chart lib :)
draw_tribar = function( cr, m )
  --print( sets.w, sets.h )
  local y = sets.y

  if ( sets.y < 0 ) then
    y = sets.wh - sets.h + sets.y
  end
  -- background, frame
  cairo_set_source_rgba ( cr, 0, 0, 0, 1 );
  cairo_rectangle ( cr, sets.x, y, sets.ww - sets.x, sets.h );
  cairo_set_line_width( cr, 0.5 )
  cairo_stroke( cr );

  local gr = merilo( 0, m[ 3 ], 0, sets.ww - sets.x) -- for horiz layout
  --input
  local in_x, out_x = gr( m[ 1 ] ), gr( m[ 2 ] )
  cairo_set_source_rgba ( cr, 0, 1, 0, 0.7 );
  cairo_rectangle( cr, sets.x, y, in_x, sets.h )
  cairo_fill( cr )

  --output
  cairo_set_source_rgba ( cr, 1, 1, 0, 0.7 );
  cairo_rectangle( cr, sets.x + in_x, y, out_x, sets.h )
  cairo_fill( cr )
  
  --print(  in_x, out_x, sets.ww );
end

