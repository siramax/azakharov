#
# Andrey Zakharov 2010-03-04
# Average the columns
# input text template:
# <code>
# Any string that non all of numbers (cmd)
# #, column2 name, column3 name, ..., columnN name ( note # at the front - required )
# num11, num12, ..., num1N
# num21, num22, ..., num2N
# num31, num32, ..., num3N
# ...
# numM1, numM2, ..., numMN
# </code>
# Output:
# <code>
# #, column2 name, column3 name, ..., columnN name
# CMD, avg1, avg2, ..., avgN
# </code>
# 
# Note: if awk fail to sum value from column, no avg for this will be print, and newline inserted, SORRY
# Used for prepare bench results to csv format


/^#/ {
# let's count number of columns
    if ( header != 1 ) {
        print $0; header = 1;
        columns = NF
    }

    next
}
$1 !~ /^[0-9.]+/ {

    # print just ended CMD section, if exist
    if ( cmd ) {
        printf "%s,\t", cmd
    }

    #save this new one
    cmd = $0

    # init array of sums, and print previous
    for ( i = 2; i < columns; i++ ) {

        if ( sum[ i ] ) {
            printf "%f,\t", sum[ i ] / lines;
            if ( ! sum[ i + 1 ] ) printf "\n";
        }

        sum[ i ] = 0.0;
    }

    lines = 0;

}

# for any row with stat numbers
/^[0-9,.\s\t%]+$/ { 

    for ( i = 2; i < columns; i++ ) {
        sum[ i ] = sum[ i ] + $i;
    }

    lines++; 
}

# flush remaining averages
END {
    # print just ended CMD section, if exist
    if ( cmd ) {
        printf "%s,\t", cmd
    }

    # print averages
    for ( i = 2; i < columns; i++ ) {

#        if ( sum[ i ] ) {
        printf "%f,\t", sum[ i ] / lines;
#            if ( ! sum[ i + 1 ] ) printf "\n";
#        }
    }

    printf "\n"
}