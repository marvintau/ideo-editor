import json
import os

f3500 = open(u"freq-3500.txt")

f3500_list = []
for line in f3500:
    f3500_list.append(line.decode("utf-8")[0])


cjk_univ = open(u"cjkvi-j.eids")

stroke_graphics = open(u"graphics.txt")

print "writing into structure..."

if not os.path.exists("freq-3500-structure.txt"):
    with open(u"freq-3500-structure.txt", "w") as freq_3500_s:
        for line in cjk_univ:
            line_decode = line.decode("utf-8")

            if line_decode[1] in f3500_list:
                freq_3500_s.write(line_decode.encode("utf-8"))
else:
    print "structure file is out there"

print "writing into graphics..."

with open(u"freq-3500-graphics.txt", "w") as freq_3500_g:
    for line in stroke_graphics:
        line_decode = line.decode("utf-8")
        json_decode = json.loads(line_decode)

        medians = json_decode[u'medians']
        for median_list in medians:
            median_list = [[a, -b+900] for [a, b] in median_list]

        if json_decode[u'character'] in f3500_list:
            string = json_decode[u'character'] + " " + json.dumps(medians) + "\n"
            freq_3500_g.write(string.encode('utf-8'))

freq_2500_s = open(u'freq-2500-under5-list.txt').readlines()
freq_3500_g = open(u'freq-3500-graphics.txt')

freq_2500_list = []
for s in freq_2500_s:
    freq_2500_list.append(s.decode('utf-8').strip('\n'))
    print s.strip('\n')

print "writing into uni character graphics"
with open(u'freq-2500-graphics-under5.txt', 'w') as freq_2500_g:
    for line in freq_3500_g:
        line_decoded = line.decode("utf-8")
        if line_decoded[0] in freq_2500_list:
            print line_decoded[0]
            freq_2500_g.write(line)
