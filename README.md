TODO:

添加不同中宫字体预览对比
完成第一批独体字的拓扑结构

#自动化的字型设计

###1.问题的定义

当我们看到汉字的时候，我们接受到了它向我们传达的三种信息，分别包括：

1. **可识别的范围**
   
   我们据这个字可以区分的特征来知道它是什么汉字。每个具体的汉字都有一个关于笔
   画长度、角度和组合方式的范围，使得在这个范围内人能够识别这是它所学习过的汉
   字，而不致无法识别或是同其他汉字混淆。
   
2. **固有美学范围**
   
   固有美学信息是某个具体汉字的特征。它指的是，以一定方式来组合这个汉字的笔画
   不会让人感到视觉上的不适的范围。例如对于大部分的汉字，都应当满足笔画疏密程
   度均匀，以及视觉上的『稳定感』（即当把汉字视作一个摆放的实体物件时，它的结
   构是稳定的）。因此所谓『固有美学信息』这一称谓更多指的是一个约束条件，在这
   个范围内的笔画组合，都能使使用和阅读汉字的人不会因为不适的原因而注意到汉字。
   
3. **风格美学特征**
   
   指的是笔画的粗细、笔画之间的关系、以及某些装饰性的细节等，它之所以是『特征』
   而不是『范围』是因为它清楚地定义了一个字体。对于每个汉字，风格美学特征应当
   满足每个汉字的固有美学信息。但当同种风格的汉字排列在一起时，应当带给人一致
   的   感觉。

自动化的字型设计能够实现的部分是前两部分，然后使得个人能够通过几个简单的参数来
控制字型设计的风格部分。对于每个汉字应当清晰定义可识别的范围和固有美学范围，并
且将风格特征定义为几个简单的参数。使得人可以通过这些参数在美学范围内设计风格化
的汉字，而不致于将大部分的时间用于验证一个汉字是否位于固有美学范围内。

###2. 当前的进展

1. 系统化的字型描述语言

我们定义了一套结构化描述语言，包括简单笔画、复杂笔画、部首及完整汉字等不同层次，
以及它们之间的关系。其中

* **简单笔画**
  
  使用不多于三个连续线段，通过一种类似极坐标的方式来定义它的形状。
  
* **复杂笔画**
  
  由简单笔画组成，可以应用其之上的操作包括旋转、拉伸和平移（ZPR）
  
* **部首**
  
  由复杂笔画组成（即使是一个简单笔画，也要转变为仅包含这个简单笔画的复杂笔画）
  可应用于部首的操作包括旋转、拉伸、平移，以及笔画交叉，即使两个复杂笔画在某个位置交叉

* **字**
  由部首组成
  
