#ION: Indented Object Notation


Related works:

* [Procyon](https://github.com/arescentral/procyon)
* [ION](https://github.com/krisnye/ion)

一个构想中的部分基于缩进的JSON简化表达方法，继承JSON本身的灵活性，同时又在语法上解决了JSON拥有太多嵌套的括号与引号，以致在裸眼读取数据时造成身心障碍。在保证语法可以无歧义地对应JSON的同时，可以依据使用的情况自由地对数据进行美化。

写文档
`

基本语法：

```
object  := literal
         | array
         | '@' (delim key-value-pair)* delim fin

array   := '\*' (delim object)* fin

kvp     := string ":"

literal := number | string

delim   := whitespace
         | (whitespace)* newline whitespace-more-than-of-line-above

fin     := (whitespace)* newline whitespace-no-more-than-of-line-above
         | eof
```

支持行注释， 

示例：


```
1.
& asd asd asd 
=> ["asd", "asd", "asd"]

2.
& asd
  asd asd asd
  => ["asd", "asd", "asd"]

& 
  asd
  asd asd asd
  => ["asd", "asd", "asd"]

3.
& asd
asd
=> Error!

4. 
@ asd: 123
  bsd: 456
=> {"asd":123, "bsd":456}

5.
@ asd: * asd bsd
         bsd: * asd bsd
=> {"asd" : ["asd", "bsd"]}

6.
@ asd: * asd bsd
bsd: * asd bsd
=> Error!

7.
* @ asd: bsd
  @ asd: bsd
=> [{"asd":"bsd"}, {"asd":"bsd"}]

8.
@ asd: bsd
  csd: @ dsd: 123
         fsd: 456
=> {"asd":"bsd", "csd":{"dsd":123, "fsd": 456}}

@ asd: bsd
  csd: @ 
         dsd: 123
         fsd: 456
=> {"asd":"bsd", "csd":{"dsd":123}, "fsd": 456}

@ asd: bsd
  csd: 
     @ dsd: 123
       fsd: 456
=> {"asd":"bsd", "csd":{"dsd":123}, "fsd": 456}

@ asd: bsd
  csd: @ dsd: 123
fsd: 456
=> Error!



```

从ION到JSON的解析方法：

首先