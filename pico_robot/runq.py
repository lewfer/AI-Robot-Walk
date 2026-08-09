q = [ 
    [0,  0,  0,  0,  0, 0],
    [0,  0,  0,  0,  0, 0],
    [0,  0,  0,  0,  0, 0],
    [0,  0,  0,  0,  0, 0],
    [0,  0,  0,  0,  0, 0],
    [0,  0,  0,  0,  0, 0]
]


def loadQFromFile():
    firstRow = True
    with open("/qvalues.csv", "r") as file:
        for line in file:
            # Strip trailing newlines and whitespace
            cleaned_line = line.strip()
            
            # Skip empty lines
            if not cleaned_line:
                continue
                
            # Split the row into a list of items using the comma separator
            row = cleaned_line.split(",")
            
            # Print the resulting list
            #print(row)
            
            if not firstRow:
                fromState = int(row[0])
                toState = int(row[1])
                qValue = float(row[2])
                print(fromState, toState, qValue)
                q[fromState][toState] = qValue
                
            
            firstRow = False
            
    print(q)
    
def getBestMove(currentState):
    options = q[currentState]
    return options.index(min(options))


loadQFromFile()
print(getBestMove(0))

    
    
