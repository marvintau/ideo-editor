
f3500 = open(u"freq-3500.txt")

f3500_list = []
for line in f3500:
    f3500_list.append(line.decode("utf-8")[0])


cjk_univ = open(u"cjkvi-j.eids")

with open(u"freq-3500-structure.txt", "w") as freq_3500_s:
    for line in cjk_univ:
        line_decode = line.decode("utf-8")

        if line_decode[1] in f3500_list:
            freq_3500_s.write(line_decode.encode("utf-8"))
