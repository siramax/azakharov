--[[
    Top pies for conky
    @author Andrey Zakharov /Vaulter/ 2010
    TODO some declarative mechanizm to set substracts from basic top pie chart.
    this will be usefull for showing CPU's %s, or growing semicircles for each core, etc. (swap, text labels)
]]

require'cairo'
--require'print_r'

settings_table = {
    {   name = 'top', arg = 'cpu', -- max top
        items       = 5,
        max         = 100,
        x = 100, y =  100, -- 5 margin
        clip = { 5, 5, -5, .5 }, --the next level :)
        radius      = 400,
        thickness   = 798,
        start_angle = 0,
        end_angle   = -180,
        --bg          = { color = 0x000000, alpha    = 0.05, }, --TODO pie as shape
        fg          = {
            color = { 0xffffff, 0x000000 },--gradient
            alpha = { 0.1, 0.025 }
        },
        --[[text = {
            x = 5, y = 0,
            font = {
                family = "DejaVu Sans Mono",
                size   = 12,
            },
            color = { 0x8b1a1a, 0x7f7f00, }, --TODO more checkpoints :)
            --margin = { 0, 0, 0, 0 }, --as CSS: top, right, bottom, left
            mask = "${top pid %d} ${top name %d}" --REQUIRED
        },]]
        line_color          = 0x188b18,
        line_side           = 1, -- right
    },
    {   name = 'top_mem', arg = 'mem', -- max top
        items = 5,
        --bg      = { color   = 0x000000, alpha    = 0.05, },
        fg      = { color   = { 0xffffff, 0x000000 },
                    alpha   = { 0.1, 0.025 }, },
        x = 100, y =  100, -- 5 margin
        clip = { 5, 0.5, -5, -5 },
        radius      = 400,
        thickness   = 800,
        start_angle = 0,
        end_angle   = 180,
        --[[text        = {
            mask = "${top_mem pid %d} ${top_mem name %d}",
            x = 110, y = 100,
            font = {
                family = "DejaVu Sans Mono",
                size   = 12.0,
            },
            color = { 0x7f7f00, 0x007f7f },
        },]]
        line_side   = 0, --left
    },--[[
    {   name = 'top_io', arg = 'io_perc',
        items = 5,
        max     = 100,
        x = 100, y = 250,
        radius      = 25,
        thickness   = 45,
        start_angle = 0,
        end_angle   = 180,
        bg          = { color = 0x000000, alpha    = 0.1, },
        fg          = {
            color = { 0xffffff, 0x000000 },--gradient
            alpha = { 0.05, 0.025 }
        },
        text = {
            x = 5, y = 200, 
            color = { 0x007f7f, 0x00ff00 },
            mask = "${top_io pid %d} ${top_io name %d} ${top_io io_read %d} ${top_io io_write %d}",
            font = { family = "DejaVu Sans Mono", size   = 10.0, },
        },
    },]]
}

--[[     Just a shrinker    ]]
merilo = function( mini, maxi, minp, maxp )

    local empty = function()
        return minp
    end

    local mer = function( i )
        return ( ( i - mini ) * ( maxp - minp ) / ( maxi - mini ) ) + minp
    end
    --to avoid devision by zero
    if ( mini ~= maxi ) then    return mer 
    else                        return empty    end
end

--[[ 
    Relative to absolute
    @param w, h - width and height of real window 
    @return function ]]
rel2abs = function( w, h )
    --[[ abstract solver of relative in absolute ]]
    local get = function( r, a, r0 )
        if r < 0 then
            return a + r
        elseif r < 1 then
            return a * r
        else
            return r --+ r0
        end
    end

    local solve = function( x1, y1, x2, y2 )
        --print( x, y, "= ",  get( x, w ), get( y, h ) )
        return get( x1, w, 0 ), get( y1, h, 0 ), get( x2, w, x1 ), get( y2, h, y1 )
    end

    return solve
end

rgb_to_r_g_b = function ( colour,alpha )
    return ((colour / 0x10000) % 0x100) / 255., ((colour / 0x100) % 0x100) / 255., (colour % 0x100) / 255., alpha
end

--[[ just to hold path functions with angles ]]
pie = function( sa, ea )
    local self = { astart = sa, aend = ea }
        rad2grd = merilo( 0, 2 * math.pi, 0, 360 )
    --public
    bisectrix = function()
        return ( self.astart + self.aend ) / 2
    end
    
    path = function( ctx, xc, yc, ring_r, angle_0, t_arc, bounds ) --TODO as params of object

        if ( self.aend > self.astart ) then
            cairo_arc(
                ctx, xc, yc, ring_r, self.astart, self.aend )
        else -- reverse
            cairo_arc_negative(
                ctx, xc, yc, ring_r, self.astart, self.aend  )
        end
        
        if ( bounds ) then
            local x1, x2, y1, y2
            local s, e, r
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
        local gra2rad = merilo( 0, 360, 0, 2 * math.pi )
        min_angle, max_angle  = --we will rotate the surface then
            ( gra2rad( sets.start_angle ) or 0 ), -- math.pi / 2,
            ( gra2rad( sets.end_angle or 360 ) ) -- math.pi / 2
                                          --V very need this 0 as min!
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

        val = conky_parse( string.format( '${%s %d}', prep, i ) )
        --val = string.format( "%d", (iMax-i) * 19 )

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
                    local valInRad = grade( val )
                    rings[ i ].pie = pie( current_angle, current_angle + valInRad )
                    current_angle = current_angle + valInRad
                end

            end -- if valNum
        end -- if val
    end -- for i = iMin, iMax

    rings.max_angle = current_angle
    return rings
end

function draw_top( cr, pt, rings )

    cairo_save( cr )
    if ( pt.fg ) then
        cairo_set_line_width( cr, pt.thickness )
    end

    if ( pt.clip ) then --set up transform
        local gra2rad = merilo( 0, 360, 0, 2 * math.pi )
        local rad2gra = merilo( 0, 2 * math.pi, 0, 360 )
        local radius = pt.radius + (pt.thickness / 2)

        local x1, y1, x2, y2, dx, dy = --top, left, right, bottom
            radius , radius, -radius , -radius, 
            radius * math.cos(rings.max_angle),
            radius * math.sin(rings.max_angle)

        --pessimistic

-- in 0based coordinates

    -- for angles from 0 to 180

        x1, y1 = 0, 0
        local inGrad = rad2gra( rings.max_angle )
        --cairo_translate( cr, radius, radius)
        --print( inGrad, math.cos( rings.max_angle ), math.cos( math.pi/2 ) )
    --print( conky_window, inGrad, conky_parse( '${updates}' ) )
        x1 = dx
        x2 = radius--[[ ( r*(1-cos) )]]

        if ( inGrad < 90 ) then
            y2 = dy
        elseif ( inGrad < 180 ) then
            y2 = radius
        elseif ( inGrad < 270 ) then --more than 180
            y1 = dy
            x1 = -radius
            y2 = radius
        else -- about 360
            y1 = -radius
            x1 = -radius
            y2 = radius
        end

        if ( rings.max_angle < 0 ) then
            y1, y2 = y2, y1
        end
--[[
        cairo_save( cr )
        cairo_set_line_width( cr, 1 )
        cairo_set_source_rgba( cr, 1,1,1,1 )
        cairo_rectangle( cr, x1, y1, x2 - x1 , y2 - y1 )
        cairo_stroke( cr )
        cairo_restore( cr )
        print( x1, y1, " x ", x2, y2 )]]
        -- TODO this one time when loading (in production time).
        local r2a = rel2abs( conky_window.height, conky_window.width )
        local clip = {}
        clip[ 1 ], clip[ 2 ], clip[ 3 ], clip[ 4 ] = r2a( pt.clip[ 1 ], pt.clip[ 2 ], pt.clip[ 3 ], pt.clip[ 4 ] )
        --print( unpack( clip ) )
--[[
        cairo_save( cr )
        cairo_set_line_width( cr, 1 )
        cairo_set_source_rgba( cr, 1,1,1,1 )
        cairo_rectangle(  cr, clip[2], clip[1], clip[4]-clip[2],  clip[3]-clip[1] )
        cairo_stroke( cr )
        cairo_restore( cr )]]
        cairo_rectangle( cr, clip[2], clip[1], clip[4]-clip[2],  clip[3]-clip[1] )
        cairo_clip( cr )
        

        clip = { clip[2], clip[1], clip[ 4 ], clip[ 3 ] } -- due to rotate -pi/2
        if( rings.max_angle < 0 ) then
            clip[ 1 ],clip[ 4 ] = 
                clip[ 3 ] - (clip[4]-clip[2]),--ex - dy
                clip[ 2 ] + (clip[3]-clip[1])--y + dx
        else
            clip[ 3 ],clip[ 4 ] = 
                clip[ 1 ] + (clip[4]-clip[2]),--x + dy
                clip[ 2 ] + (clip[3]-clip[1])--y + dx
        end

        local magnX, magnY, magn = 
            (clip[ 3 ] - clip[ 1 ]) / (x2 - x1),
            (clip[ 4 ] - clip[ 2 ]) / (y2 - y1),
            1 --zoom
        --print( (x2 - x1), (y2 - y1), clip[ 3 ] - clip[ 1 ], clip[ 4 ] - clip[ 2 ], magnX, magnY )
        magn = math.min( magnX, magnY )

        --cairo_translate( cr, pt.x , pt.y)
        if ( rings.max_angle < 0 ) then
            cairo_translate( cr, clip[ 3 ] , clip[ 2 ] + (x2)*magn )
        else
            cairo_translate( cr, clip[ 1 ] - (y1)*magn, clip[ 2 ] + (x2)*magn )
        end

        cairo_scale( cr, magn, magn )
        cairo_rotate( cr, -math.pi/2 )

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
                ring.pie.path( cr, 0, 0, pt.radius ) --pt.x, pt.y, 
                cairo_stroke( cr )
            end

            if ( ring.text and ring.text.label and #ring.text.label ) then
                draw_text( cr, ring.text.label, ring, ring.text.x, ring.text.y )
            end
        end
    end
    --print( pt.thickness, rings.bg, pt.bg.color, pt.bg.alpha )
    cairo_restore( cr )
    
end


function conky_main()

    local function setup_rings( cr, pt, update_num )
        local str=''
        local value = 0
        local end_arc = 0

        if ( pt[ 'name' ]:sub( 1, 3 ) == 'top' ) then
-- print(cr, "found TOP ", pt[ 'name' ], conky_parse( '${updates}' ) );
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
 --print(         conky_window.width, conky_window.height )
    local cr = cairo_create( cs )
 
    if tonumber( conky_parse( '${updates}' ) ) > 2 then -- HERE you MUST use in your conkyrc ${cpu} var to init cpu nums
--
        for i in pairs( settings_table ) do

            setup_rings( cr, settings_table[ i ], update_num )
        end
    end
end