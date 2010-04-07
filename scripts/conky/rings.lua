--[[
Ring Meters by londonali1010 (2009), Vaulter(2010)
 
This script draws percentage meters as rings. It is fully customisable; all options are described in the script.
 
IMPORTANT: if you are using the 'cpu' function, it will cause a segmentation fault if it tries to draw a ring straight away. The if statement on line 145 uses a delay to make sure that this doesn't happen. It calculates the length of the delay by the number of updates since Conky started. Generally, a value of 5s is long enough, so if you update Conky every 1s, use update_num > 5 in that if statement (the default). If you only update Conky every 2s, you should change it to update_num > 3; conversely if you update Conky every 0.5s, you should use update_num > 10. ALSO, if you change your Conky, is it best to use "killall conky; conky" to update it, otherwise the update_num will not be reset and you will get an error.
 
To call this script in Conky, use the following (assuming that you save this script to ~/scripts/rings.lua):
    lua_load ~/scripts/rings-v1.2.1.lua
    lua_draw_hook_pre ring_stats
 TODO color's grades
Changelog:
+ v1.2.2 -- Added reversed arcs, periods, text labels, arrays
+ v1.2.1 -- Fixed minor bug that caused script to crash if conky_parse() returns a nil value (20.10.2009)
+ v1.2 -- Added option for the ending angle of the rings (07.10.2009)
+ v1.1 -- Added options for the starting angle of the rings, and added the "max" variable, to allow for variables that output a numerical value rather than a percentage (29.09.2009)
+ v1.0 -- Original release (28.09.2009)
]]
 
settings_table = {
    {   name = 'cpu', arg = 'cpu1',
        max         = 100,
        bg_colour   = 0x707070,
        bg_alpha    = 0.025,
        fg_colour   = 0xffffff,
        fg_alpha    = 0.2,
        x = 125, y = 125,
        radius      = 123,
        thickness   = 5,
        start_angle = 0,
        end_angle   = 180,
    },
    {   name = 'cpu', arg = 'cpu2',
        max         = 100,
        bg_colour   = 0x707070,
        bg_alpha    = 0.025,
        fg_colour   = 0xffffff,
        fg_alpha    = 0.2,
        x = 125, y = 125,
        radius      = 118,
        thickness   = 5,
        start_angle = 0,
        end_angle   = 180,
    },
    {   name = 'top', arg = 'cpu', -- max top
        max         = 100,
        --bg_colour   = 0x000000,
        bg_alpha    = 0.1,
        fg_colour_end = 0x000000,
        fg_colour   = 0xffffff,
        fg_alpha    = 0.2,
        x = 125, y = 125,
        radius      = 50,
        thickness   = 100,
        start_angle = 0,
        end_angle   = 360,
        textx      = 5, texty = 18,
        font_family = "DejaVu Sans Mono",
        font_size   = 10,
        margin_top  = 0,
        text_color_begin    = 0xff0000,
        text_color_end      = 0x00ff00,
        line_color          = 0xffff00,
        line_side           = 1, -- right
    },
    {   name = 'freq', arg='1',
        max         = 2000,
        -- bg_colour   = 0x00ff00,
        bg_alpha    = 0.1,
        fg_colour   = 0xff0000,
        fg_alpha    = 0.2,
        x = 125, y = 125,
        radius      = 123,
        thickness   = 1,
        start_angle = 0,
        end_angle   = 180,
        period      = 3,
    },
    {   name = 'freq', arg='2',
        max         = 2000,
        -- bg_colour   = 0x00ff00,
        bg_alpha    = 0.1,
        fg_colour   = 0xff0000,
        fg_alpha    = 0.2,
        x = 125, y = 125,
        radius      = 118,
        thickness   = 1,
        start_angle = 0,
        end_angle   = 180,
        period      = 3,
    },
    {   name        = 'memperc', arg = '',
        max         = 100,
        bg_colour   = 0x707070,
        bg_alpha    = 0.025,
        fg_colour   = 0xffffff,
        fg_alpha    = 0.2,
        x = 125, y = 365,
        radius      = 120,
        thickness   = 10,
        start_angle = 0,
        end_angle   = -90,
        period      = 60,
    },
    {   name = 'swapperc', arg='',
        max         = 100,
        bg_colour   = 0x000000,
        bg_alpha    = 0.01,
        fg_colour   = 0xffffff,
        fg_alpha    = 0.1,
        x = 125, y = 365,
        radius      = 120,
        thickness   = 10,
        start_angle = -90,
        end_angle   = -180,
        period      = 60,
    },
    {   name = 'top_mem', arg = 'mem', -- max top
        max         = 100,
        --bg_colour   = 0x000000,
        bg_alpha    = 0.1,
        fg_colour_end = 0x000000,
        fg_colour   = 0xffffff,
        fg_alpha    = 0.1,
        x = 125, y = 365,
        radius      = 50,
        thickness   = 100,
        start_angle = 0,
        end_angle   = -360,
        textx       = 130, texty = 260,
        font_family = "DejaVu Sans Mono",
        font_size   = 10,
        line_side   = 0, --left
    },
    {   name='fs_used_perc', arg='/',
        max         = 100,
        bg_colour   = 0x000000,
        bg_alpha    = 0.1,
        fg_colour   = 0x7fff7f,
        fg_alpha    = 0.1,
        x = 125, y = 365 + 240,
        radius=80,
        thickness=40,
        start_angle = 0,
        end_angle   = 90,
        period      = 600 -- it can parsed by conky each 600 times, cache it!
    },
    {   name='fs_used_perc', arg='/media/ACER',
        max         = 100,
        bg_colour   = 0x000000,
        bg_alpha    = 0.1,
        fg_colour   = 0x7fff7f,
        fg_alpha    = 0.2,
        x = 125, y = 365 + 240,
        radius=80,
        thickness=40,
        start_angle = 90,
        end_angle   = 180,
        period      = 600 -- it can parsed by conky each 600 times, cache it!
    },
    {   name='battery_percent', arg='BAT0',
        max         = 100,
        bg_colour   = 0x000000,
        bg_alpha    = 0.01,
        fg_colour   = 0xffffff,
        fg_alpha    = 0.1,
        x = 125, y = 365 + 240,
        radius      = 120,
        thickness   = 10,
        start_angle = 0,
        end_angle   = 180,
        period      = 5 -- it can parsed by conky each 600 times, cache it!
    },    
    {   name='exec', arg='/usr/sbin/hddtemp /dev/sda --numeric',
        max         = 110,
        bg_colour   = 0x000000,
        bg_alpha    = 0.1,
        fg_colour   = 0x7fff00,
        fg_alpha    = 0.1,
        x = 125, y = 365 + 240,
        radius      = 122,
        thickness   = 6,
        start_angle = 180,
        end_angle   = 180 + 155,
        period      = 5, -- it can parsed by conky each 600 times, cache it!
        textx = 125 - 20, texty = 365 + 240 + 80,
        font_size   = 16,
        font_family = "Lucida Grande",
    },
    {   name='exec', arg='/usr/bin/nvidia-settings --no-config --query gpucoretemp | awk \'/[0-9]+/ { printf "%d", $4 }\'',
        max         = 110,
        bg_colour   = 0x000000,
        bg_alpha    = 0.1,
        fg_colour   = 0x3faf00,
        fg_alpha    = 0.1,
        x = 125, y = 365 + 240,
        radius      = 116,
        thickness   = 6,
        start_angle = 180,
        end_angle   = 180 + 155,
        period      = 5, -- it can parsed by conky each 600 times, cache it!
        textx = 125 - 20, texty = 365 + 240 + 60,
        font_size   = 16,
        font_family = "Lucida Grande",
    },
    {   name='exec', arg='acpi --without-battery --without-ac-adapter --without-cooling --hide-empty --thermal | awk \'{ printf "%d",$4 }\'',
        max         = 110,
        bg_colour   = 0x000000,
        bg_alpha    = 0.1,
        fg_colour   = 0x1f6f00,
        fg_alpha    = 0.1,
        x = 125, y = 365 + 240,
        radius      = 110,
        thickness   = 6,
        start_angle = 180,
        end_angle   = 180 + 155,
        period      = 5, -- it can parsed by conky each 600 times, cache it!
        textx = 125 - 20, texty = 365 + 240 + 40,
        font_size   = 16,
        font_family = "Lucida Grande",
    },
}
 
require 'cairo'
 
function rgb_to_r_g_b(colour,alpha)
    return ((colour / 0x10000) % 0x100) / 255., ((colour / 0x100) % 0x100) / 255., (colour % 0x100) / 255., alpha
end

function draw_text( cr, t, pt, sx, sy )

    local family = pt[ 'font_family' ] or "Sans"
    local fontsize = pt[ 'font_size' ] or 12.0

    local te = cairo_text_extents_t:create()

    cairo_select_font_face ( cr, family, 
        CAIRO_FONT_SLANT_NORMAL,
        CAIRO_FONT_WEIGHT_NORMAL );

    cairo_set_font_size( cr, fontsize );
    cairo_text_extents( cr, t, te );

    local x, y = 
        sx or pt[ 'textx' ] - ( te.width / 2 + te.x_bearing ),
        sy or pt[ 'texty' ] - ( te.height / 2 + te.y_bearing );

    cairo_move_to ( cr, x, y );
    cairo_show_text ( cr, t );
    cairo_stroke( cr )
    -- print( fontsize / te.height ) 1.3 max
--     cairo_move_to (cr, 70.0, 165.0);
--     cairo_text_path (cr, "void");
--     cairo_set_source_rgb (cr, 0.5, 0.5, 1);
--     cairo_fill_preserve (cr);
--     cairo_set_source_rgb (cr, 0, 0, 0);
--     cairo_set_line_width (cr, 2.56);
--    cairo_stroke (cr);
    return te
end

--[[ draw sliced rings by top values 
    I DONT LIKE PERFOMANCE HERE!
]]
function draw_top_ring( cr, pt )

    local val, ring = 0, {}
    --shallow copy
    for k, v in pairs( pt ) do ring[ k ] = v; end
    local min_angle, max_angle  = pt[ 'start_angle' ], pt[ 'end_angle' ]
    local min_alpha, max_alpha  = pt[ 'fg_alpha' ], 0.025
    local min, max              = 1, 10 -- TODO
    local textext
    local texty             = pt[ 'texty' ]
    
    --ring[ 'in_radians' ] = true

    for i = min, max  do
        ring[ 'fg_alpha' ] =
            ( ( i - min ) * ( max_alpha - min_alpha ) / ( max - min ) ) + min_alpha
        ring[ 'start_angle' ] = min_angle
        ring[ 'end_angle' ] = max_angle + min_angle
        val = conky_parse(
                string.format( '${%s %s %d}', ring['name'], ring['arg'], i ) 
        )

        if ( val ) then
            val = tonumber( val )

            if ( val ) then -- TODO max, TODO bunch of arcs
                min_angle = draw_ring( cr, val / 100, ring )  * ( 360 / 2 / math.pi)

                if ( ring[ 'textx' ] ) then --get text pos

                    texty = pt[ 'texty' ] + i * ( 1.3 * pt[ 'font_size' ] + (pt[ 'margin_top' ] or 0) )
                    textext = draw_text( cr,
                        conky_parse( string.format( "${%s pid %d} ${%s name %d}", ring['name'], i, ring['name'], i ) ),
                        ring, pt[ 'textx' ], texty )

                    -- threshhold

                    if ( math.abs( min_angle - ring[ 'start_angle' ] ) > 5 ) then
                        draw_note_line( cr,
                            ( ring[ 'line_side' ] == 1 ) and ( --right side
                                ring[ 'textx' ] + textext.width + (--[[last letter]]ring[ 'font_size' ] / 1.3) 
                            ) or ( --left side
                                ring[ 'textx' ]
                            ),
                            texty, ring,
                            ( min_angle + ring[ 'start_angle' ] ) / 2  -- bisectrix
                        )
                    end
                end
            end
        end
        --[[print( i,  
            ring[ 'start_angle' ], -- * ( 360 / 2 / math.pi),
tonumber( conky_parse( string.format( '${%s cpu %d}', ring['name'], i ) ) ),
            ring[ 'end_angle' ]-- * ( 360 / 2 / math.pi) 
        )]]
    end
    --print( pt[ 'fg_alpha' ] )
end

--[[ low level draw ring ]]
function draw_ring( cr, t, pt )
    local w, h = conky_window.width, conky_window.height
 
    local xc,yc,ring_r,ring_w, sa, ea = 
        pt['x'], pt['y'],
        pt['radius'], pt['thickness'],
        pt['start_angle'], pt['end_angle']

    local bgc, bga, fgc, fga = pt['bg_colour'], pt['bg_alpha'], pt['fg_colour'], pt['fg_alpha']
 
    local angle_0 = ( 2 * math.pi * sa / 360 ) - math.pi / 2
    local angle_f = ( 2 * math.pi * ea / 360 ) - math.pi / 2
    local t_arc = t * ( angle_f - angle_0 )

    --print( angle_0, angle_f, t, t_arc )
    cairo_set_line_width( cr,ring_w )

    if ( bgc ) then
        -- Draw background ring
        if ( angle_f > angle_0 ) then
            cairo_arc( cr, xc, yc, ring_r, angle_0, angle_f )
        else -- reverse angles
            cairo_arc_negative( cr, xc, yc, ring_r, angle_0, angle_f )
        end


        cairo_set_source_rgba(cr,rgb_to_r_g_b(bgc,bga))

        cairo_stroke( cr )
    end
 
    -- Draw indicator ring
 
    if ( angle_f > angle_0 ) then
        cairo_arc(cr, xc, yc, ring_r, angle_0, angle_0 + t_arc )
    else -- reverse
        cairo_arc_negative(cr, xc, yc, ring_r, angle_0, angle_0 + t_arc  )
    end

    cairo_set_source_rgba( cr, rgb_to_r_g_b( fgc, fga ) )
    cairo_stroke( cr )

    return angle_0 + t_arc + ( math.pi / 2 )
end

--[[ with small circle at the top
    @param sx/sy - start coordinats
    @param pt - ring
    @param an - bisectrix ]]
function draw_note_line( cr, sx, sy, pt, an )
    local sets = {
        circle_radius = 2,
        offset_from_edge = 0.95,
    }

    local angle = ( 2 * math.pi * an / 360 ) - math.pi / 2
    local r = ( pt[ 'thickness' ] /2 + pt[ 'radius' ] ) * sets[ 'offset_from_edge' ]
    local ex, ey = r * math.cos( angle ) + pt[ 'x' ], r * math.sin( angle ) + pt[ 'y' ]

    cairo_move_to           ( cr, sx, sy );
    cairo_set_line_width    ( cr, 1.0 );
    cairo_line_to           ( cr, ex, ey );
    cairo_arc               ( cr, ex, ey, 2.0, 0, 2 * math.pi );
    cairo_stroke            ( cr );
    --cairo_set_source_rgba (cr, 1, 0.2, 0.2, 0.6);

    
end


function trim (s)
    return ( string.gsub( s, "^%s*(.-)%s*$", "%1" ) )
end

function conky_ring_stats()

    local function setup_rings( cr, pt, update_num )
        local str=''
        local value = 0
        local end_arc = 0

        if ( pt[ 'name' ]:sub( 1, 3 ) == 'top' ) then
            draw_top_ring( cr, pt )
        -- old simple cool rings
        else
            -- cached?
            if ( pt[ 'period' ] == nil ) or
                ( update_num % pt[ 'period' ] == 0 ) or
                ( pt[ 'cached' ] == nil ) then

                str=string.format( '${%s %s}', pt['name'], pt['arg'] )
                pt[ 'cached' ] = tonumber( conky_parse( str ) )
    --print( str, conky_parse( str ), pt[ 'cached' ] )
                if pt[ 'cached' ] == nil then pt[ 'cached' ] = 0 end
            end

            end_arc = draw_ring( cr, pt[ 'cached' ] / pt[ 'max' ], pt )

            if ( pt[ 'textx' ] ) and ( pt[ 'texty' ] ) then
                draw_text( cr, pt[ 'cached' ], pt )
            end
        end
    end

    if conky_window == nil then return end

    local cs = cairo_xlib_surface_create(
        conky_window.display,
        conky_window.drawable,
        conky_window.visual, 
        conky_window.width,
        conky_window.height 
    )
 
    local cr = cairo_create( cs )
    
    local updates = conky_parse( '${updates}' )
    update_num = tonumber( updates )
 
    -- if update_num > 1 then -- HERE you MUST use in your conkyrc ${cpu} var to init cpu nums
    for i in pairs( settings_table ) do
        setup_rings( cr, settings_table[ i ], update_num )
    end
    --end
end