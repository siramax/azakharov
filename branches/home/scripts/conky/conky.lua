--[[
    Library for conky
    @author Andrey Zakharov /Vaulter/ 2010
]]

--[[ ]]
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

    --public
    bisectrix = function()
        return ( self.astart + self.aend ) / 2
    end
    
    path = function( ctx )

        if ( self.aend > self.astart ) then
            cairo_arc( ctx, xc, yc, ring_r, angle_0, angle_0 + t_arc )
        else -- reverse
            cairo_arc_negative( ctx, xc, yc, ring_r, angle_0, angle_0 + t_arc  )
        end
    end

    return {
        angle_start = astart,
        angle_end = aend,
        bisectrix = bisectrix
    }
end

local top_items = 10 -- can be overidden by rd.items

round_diagram = function( name )
    local create = function( params )
        print( "here" );
    end

    return create
end

round_diagram "top" {
    arg = cpu,
    center = { x = 125, y = 125 },
    radius      = 50,
    thickness   = 100,
    bg = { },
}
    





























