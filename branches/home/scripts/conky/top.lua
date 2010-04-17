--[[
    Top pies for conky
    @author Andrey Zakharov /Vaulter/ 2010
    TODO some declarative mechanizm to set substracts from basic top pie chart.
    this will be usefull for showing CPU's %s, or growing semicircles for each core, etc. (swap, text labels)
]]

require'cairo'
require'print_r'

settings_table = {
    {   name = 'top', arg = 'cpu', -- max top
        items       = 5,
        max         = 100,
        x = 100, y = 50, -- 5 margin
        radius      = 25,
        thickness   = 45,
        start_angle = 0,
        end_angle   = 360,
        bg          = { color = 0x000000, alpha    = 0.05, }, --TODO pie as shape
        fg          = {
            color = { 0xffffff, 0x000000 },--gradient
            alpha = { 0.5, 0.025 }
        },
        text = {
            x = 5, y = 0,
            font = {
                family = "DejaVu Sans Mono",
                size   = 12,
            },
            color = { 0x8b1a1a, 0x7f7f00, }, --TODO more checkpoints :)
            --margin = { 0, 0, 0, 0 }, --as CSS: top, right, bottom, left
            mask = "${top pid %d} ${top name %d}" --REQUIRED
        },
        line_color          = 0x188b18,
        line_side           = 1, -- right
    },
    {   name = 'top_mem', arg = 'mem', -- max top
        items = 5,
        bg      = { color   = 0x000000, alpha    = 0.05, },
        fg      = { color   = { 0xffffff, 0x000000 },
                    alpha   = { 0.5, 0.025 }, },
        x = 100, y = 150,
        radius      = 25,
        thickness   = 45,
        start_angle = 0,
        end_angle   = -360,
        text        = {
            mask = "${top_mem pid %d} ${top_mem name %d}",
            x = 110, y = 100,
            font = {
                family = "DejaVu Sans Mono",
                size   = 12.0,
            },
            color = { 0x7f7f00, 0x007f7f },
        },
        line_side   = 0, --left
    },
    {   name = 'top_io', arg = 'io_perc',
        items = 5,
        max     = 100,
        --[[x = 100, y = 250,
        radius      = 25,
        thickness   = 45,
        start_angle = 0,
        end_angle   = 180,
        bg          = { color = 0x000000, alpha    = 0.1, },
        fg          = {
            color = { 0xffffff, 0x000000 },--gradient
            alpha = { 0.05, 0.025 }
        },]]
        text = {
            x = 5, y = 200, 
            color = { 0x007f7f, 0x00ff00 },
            mask = "${top_io pid %d} ${top_io name %d} ${top_io io_read %d} ${top_io io_write %d}",
            font = { family = "DejaVu Sans Mono", size   = 10.0, },
        },
    },
}

merilo = function( mini, maxi, minp, maxp )

    local empty = function() 
        return minp
    end

    local mer = function( i )
        return ( ( i - mini ) * ( maxp - minp ) / ( maxi - mini ) ) + minp
    end

    if ( mini ~= maxi ) then    return mer 
    else                        return empty    end
end

rgb_to_r_g_b = function ( colour,alpha )
    return ((colour / 0x10000) % 0x100) / 255., ((colour / 0x100) % 0x100) / 255., (colour % 0x100) / 255., alpha
end

pie = function( sa, ea )
    local self = { astart = sa, aend = ea }
        rad2grd = merilo( 0, 2 * math.pi, 0, 360 )
    --public
    bisectrix = function()
        return ( self.astart + self.aend ) / 2
    end
    
    path = function( ctx, xc, yc, ring_r, angle_0, t_arc ) --TODO as params of object

        if ( self.aend > self.astart ) then
            cairo_arc(
                ctx, xc, yc, ring_r, self.astart, self.aend )
        else -- reverse
            cairo_arc_negative(
                ctx, xc, yc, ring_r, self.astart, self.aend  )
        end
    end

    return {
        angle_start = astart,
        angle_end = aend,
        bisectrix = bisectrix,
        path = path
    }
end

--[[ 
    @param cr
    @param t - TODO
    @param sets -  table with fields x, y, label, font
]]
draw_text = function ( cr, t, sets, sx, sy )

    local family = "Sans"
    local fontsize = 12.0

    local x, y = sx, sy

    if ( sets.text and sets.text.font ) then
        if ( sets.text.font.family ) then family = sets.text.font.family end
        if ( sets.text.font.size ) then fontsize = sets.text.font.size end
    end

    cairo_select_font_face ( cr, family, 
            CAIRO_FONT_SLANT_NORMAL,
            CAIRO_FONT_WEIGHT_NORMAL );

    cairo_set_font_size( cr, fontsize );

    if ( not sx or not sy ) then
        local te = cairo_text_extents_t:create()
        cairo_text_extents( cr, t, te );

        if ( not x ) then
            x = sets.text.x - ( te.width / 2 + te.x_bearing )
        end
        
        if ( not y ) then
            y = sets.text.y - ( te.height / 2 + te.y_bearing )
        end
    end

--print( table.show( sets, "sets" ) )

    if ( sets.text.color ) then
            cairo_set_source_rgba( cr, sets.text.color.r, sets.text.color.g, sets.text.color.b, (sets.text.alpha or 1) ) 
    end
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
--[[input: sets,
    output: sets[ rings ][ 0..max ] ]]
function calculate_top( sets )

    local iMin, iMax              = 1, sets.items or top_items or 4;
    local rings = {}
    local gra2rad, grade, grade_alpha, grade_color, min_angle, max_angle, current_angle

    if ( sets.start_angle ) then --will calc and draw ring
        gra2rad = merilo( 0, 360, 0, 2 * math.pi )
        min_angle, max_angle  =
            ( gra2rad( sets.start_angle ) or 0 ) - math.pi / 2,
            ( gra2rad( sets.end_angle or 360 ) ) - math.pi / 2
-------------------------------------V very need this 0 as min!
        grade = merilo( 0, sets.max or 100, 0, max_angle - min_angle )
        rings.bg = pie( min_angle, max_angle )
        current_angle = min_angle
    end

    if ( sets.fg ) then

        if ( sets.fg.alpha and "table" == type( sets.fg.alpha ) ) then --will calc and draw gradient alpha
            grade_alpha = merilo( iMin, iMax, sets.fg.alpha[ 1 ], sets.fg.alpha[ 2 ] )
        else
            grade_alpha = merilo( iMin, iMin, sets.fg.alpha ) --TODO
        end

        if ( sets.fg.color and "table" == type( sets.fg.color ) ) then
            local bc, ec                = {}, {}
            bc.r, bc.g, bc.b = rgb_to_r_g_b( sets.fg.color[ 1 ] )
            ec.r, ec.g, ec.b = rgb_to_r_g_b( sets.fg.color[ 2 ] )

            grade_color = { 
                r = merilo( iMin, iMax, bc.r, ec.r ), 
                g = merilo( iMin, iMax, bc.g, ec.g ), 
                b = merilo( iMin, iMax, bc.b, ec.b ),
            }
        end
    end

    if ( sets.text ) then

        if ( sets.text.color and "table" == type( sets.text.color ) ) then

            local bc, ec                = {}, {}
            bc.r, bc.g, bc.b = rgb_to_r_g_b( sets.text.color[ 1 ] )
            ec.r, ec.g, ec.b = rgb_to_r_g_b( sets.text.color[ 2 ] )

            grade_text_color = { 
                r = merilo( iMin, iMax, bc.r, ec.r ), 
                g = merilo( iMin, iMax, bc.g, ec.g ), 
                b = merilo( iMin, iMax, bc.b, ec.b ),
            }
        end
    end

    --shallow copy
    --for k, v in pairs( sets ) do rings[ k ] = v; end
    --prepare
    local prep = string.format( '%s %s', sets.name, sets.arg )
    --local family = (sets.text and sets.text.font and sets.text.font.family) or "Sans"
    local fontsize = (sets.text and sets.text.font and sets.text.font.size) or 12.0

    for i = iMin, iMax do
        rings[ i ] = {}

        val = conky_parse(
                string.format( '${%s %d}', prep, i )
        )

        if ( val and #val ) then
            val = tonumber( val )

                if ( val ) then --not nil
                rings[ i ].val = val

                if ( grade_alpha ) then
                    rings[ i ].alpha = grade_alpha( i )
                end

                if ( grade_color ) then
                    rings[ i ].color = {
                        r = grade_color.r( i ),
                        g = grade_color.g( i ),
                        b = grade_color.b( i )
                    }

                elseif ( text_color ) then
                    rings[ i ].color = text_color
                end

                if ( sets.text ) then -- show some text

                    rings[ i ].text = {
                        label = conky_parse( string.format( sets.text.mask, i, i, i, i ) ), --unsafe
                        x = sets.text.x, -- top
                        y = sets.text.y + i * ( 1.3 * fontsize + (sets.text.margin and sets.text.margin.top or 0) ),
                        font = sets.text.font,
                    }

                    if ( grade_text_color ) then
                        rings[ i ].text.color = {
                            r = grade_text_color.r( i ),
                            g = grade_text_color.g( i ),
                            b = grade_text_color.b( i )
                        }

                    elseif ( text_color ) then
                        rings[ i ].text.color = text_color
                    end

                end

                if ( grade ) then-- calc angles
                    rings[ i ].pie = pie( current_angle, current_angle + grade( val ) )
                    current_angle = current_angle + grade( val )
                end

            end -- if valNum
        end -- if val
    end -- for i = iMin, iMax

    return rings
end

function draw_top( cr, pt, rings )
    if ( pt.fg ) then
        cairo_set_line_width( cr, pt.thickness )
    end
    --draw bg
    if ( pt.bg ) then
        -- Draw background ring
        cairo_set_source_rgba( cr, rgb_to_r_g_b( pt.bg.color, pt.bg.alpha ) )
        rings.bg.path( cr, pt.x, pt.y, pt.radius )
        cairo_stroke( cr )
    end

    if ( rings.text ) then --not in use
        local family = rings.text.font.family or "Sans"
        local fontsize = rings.text.font.size or 12.0
        rings.text.fontext = cairo_font_extents_t:create()
            --- hope no override below
        cairo_select_font_face ( cr, family, CAIRO_FONT_SLANT_NORMAL, CAIRO_FONT_WEIGHT_NORMAL );
        cairo_set_font_size( cr, fontsize );
        cairo_font_extents( cr, rings.text.fontext )
    end

    for i, ring in ipairs( rings ) do
        if ( #ring ) then
            --print( i, ring, ring.text.label )--, rings[ i ].text.y, ring.text.y )
            --print( string.format( "%d - %02x%02x%02x", i, unpack( ring.color ) ) )
            --ring.color and  cairo_set_source_rgba( cr, ring.color.r, ring.color.g, ring.color.b, (ring.alpha or 1) )
            local fgc,fga = ring.color, ring.alpha

            if ( not fgc or not #fgc ) then
                fgc = {}
                fgc.r, fgc.g, fgc.b, fga = rgb_to_r_g_b( 0xffffff, 1 ) 
            end

            cairo_set_source_rgba( cr, fgc.r, fgc.g, fgc.b, fga )

            if ( ring.pie ) then
                ring.pie.path( cr, pt.x, pt.y, pt.radius ) 
                cairo_stroke( cr )
            end

            if ( ring.text and ring.text.label and #ring.text.label ) then
                draw_text( cr, ring.text.label, ring, ring.text.x, ring.text.y )
            end
        end
    end
    --print( pt.thickness, rings.bg, pt.bg.color, pt.bg.alpha )
    
end


function conky_main()

    local function setup_rings( cr, pt, update_num )
        local str=''
        local value = 0
        local end_arc = 0

        if ( pt[ 'name' ]:sub( 1, 3 ) == 'top' ) then
--print( "found TOP ", pt[ 'name' ], conky_parse( '${updates}' ) );
            draw_top( cr, pt, calculate_top( pt ) )
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
    
 
    if tonumber( conky_parse( '${updates}' ) ) > 2 then -- HERE you MUST use in your conkyrc ${cpu} var to init cpu nums
        for i in pairs( settings_table ) do
            setup_rings( cr, settings_table[ i ], update_num )
        end
    end
end
