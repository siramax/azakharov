--[[
    Library for conky
    @author Andrey Zakharov /Vaulter/ 2010
]]

--[[ ]]
merilo = function( mini, maxi, minp, maxp )

    local mer = function( i )
--[[        if type( mini ) == "table" then
            return function()
                if next]]
        return ( ( i - mini ) * ( maxp - minp ) / ( maxi - mini ) ) + minp
    end

    return mer
end


function rgb_to_r_g_b(colour,alpha)
    return ((colour / 0x10000) % 0x100) / 255., ((colour / 0x100) % 0x100) / 255., (colour % 0x100) / 255., alpha
end