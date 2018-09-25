
stroke_orders = open("stroke_orders.csv")

char_dict = {}

for line in stroke_orders:
    line_decoded = line.decode("utf-8")

    key, stroke_name = line_decoded.split(",")

    if key not in char_dict:
        char_dict[key] = [stroke_name]
    else:
        char_dict[key].append(stroke_name)

for key in char_dict:
    print key, char_dict[key]
