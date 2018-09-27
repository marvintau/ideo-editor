import json

stroke_dict = {}
stroke_dict_final = {}

with open("stroke_orders.txt") as stroke_file:
    for line in stroke_file:
        key, strokes = line.decode("utf-8").split(" ")
        stroke_dict[key] = strokes

with open("stroke-complemented-3500.txt", "w") as dest:
    with open("freq-3500-structure.txt") as structure:
        for line in structure:
            if "uni" in line:
                key, _ = line.decode("utf-8").split(",")
                if key in stroke_dict:
                    write_line = key+", "+stroke_dict[key]
            else:
                write_line = line.decode("utf-8")
            
            dest.write(write_line.encode("utf-8"))
