!function(t){var e={};function i(s){if(e[s])return e[s].exports;var r=e[s]={i:s,l:!1,exports:{}};return t[s].call(r.exports,r,r.exports,i),r.l=!0,r.exports}i.m=t,i.c=e,i.d=function(t,e,s){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:s})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var s=Object.create(null);if(i.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)i.d(s,r,function(e){return t[e]}.bind(null,r));return s},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=2)}([function(t,e,i){t.exports=i(1)()},function(t,e){function i(t){return[t[0],t[1]]}function s(t,e){return[t,e]}t.exports=function(t){var e="number"==typeof(t=t||{}).recursion?t.recursion:8,r="number"==typeof t.epsilon?t.epsilon:1.1920929e-7,n="number"==typeof t.pathEpsilon?t.pathEpsilon:1,o="number"==typeof t.angleEpsilon?t.angleEpsilon:.01,h=t.angleTolerance||0,a=t.cuspLimit||0;return function(t,l,d,c,u,p){p||(p=[]);var f=n/(u="number"==typeof u?u:1);return function(t,n,l,d,c,u){c.push(i(t));var p=t[0],f=t[1],y=n[0],g=n[1],m=l[0],v=l[1],b=d[0],x=d[1];(function t(i,n,l,d,c,u,p,f,y,g,m){if(m>e)return;var v=Math.PI;var b=(i+l)/2;var x=(n+d)/2;var w=(l+c)/2;var S=(d+u)/2;var M=(c+p)/2;var k=(u+f)/2;var E=(b+w)/2;var A=(x+S)/2;var P=(w+M)/2;var I=(S+k)/2;var j=(E+P)/2;var O=(A+I)/2;if(m>0){var T,C,N=p-i,z=f-n,L=Math.abs((l-p)*z-(d-f)*N),R=Math.abs((c-p)*z-(u-f)*N);if(L>r&&R>r){if((L+R)*(L+R)<=g*(N*N+z*z)){if(h<o)return void y.push(s(j,O));var F=Math.atan2(u-d,c-l);if(T=Math.abs(F-Math.atan2(d-n,l-i)),C=Math.abs(Math.atan2(f-u,p-c)-F),T>=v&&(T=2*v-T),C>=v&&(C=2*v-C),T+C<h)return void y.push(s(j,O));if(0!==a){if(T>a)return void y.push(s(l,d));if(C>a)return void y.push(s(c,u))}}}else if(L>r){if(L*L<=g*(N*N+z*z)){if(h<o)return void y.push(s(j,O));if((T=Math.abs(Math.atan2(u-d,c-l)-Math.atan2(d-n,l-i)))>=v&&(T=2*v-T),T<h)return y.push(s(l,d)),void y.push(s(c,u));if(0!==a&&T>a)return void y.push(s(l,d))}}else if(R>r){if(R*R<=g*(N*N+z*z)){if(h<o)return void y.push(s(j,O));if((T=Math.abs(Math.atan2(f-u,p-c)-Math.atan2(u-d,c-l)))>=v&&(T=2*v-T),T<h)return y.push(s(l,d)),void y.push(s(c,u));if(0!==a&&T>a)return void y.push(s(c,u))}}else if((N=j-(i+p)/2)*N+(z=O-(n+f)/2)*z<=g)return void y.push(s(j,O))}t(i,n,b,x,E,A,j,O,y,g,m+1);t(j,O,P,I,M,k,p,f,y,g,m+1)})(p,f,y,g,m,v,b,x,c,u,0),c.push(i(d))}(t,l,d,c,p,f*=f),p}}},function(t,e,i){"use strict";function s(t){return t.match(/[ @]/)?'"'+t+'"':t}function r(t,e){return(0==e?"@ ":"  ")+t}function n(t,e){return(0==e?"# ":"  ")+t}function o(t,e,i,r){var o=Object.keys(t),h=o.map(s=>({key:s,val:e(t[s],i-s.length,r)})),a=h.map(t=>t.val.some(t=>t.includes("@")||t.includes("#"))).some(t=>t),l=h.map(t=>s(t.key)+": "+t.val[0]).join(" "),d=a||l.length>i,c=h.map(t=>t.val.map((e,i)=>(function(t,e,i){var r=s(i);return(0==e?r+": ":" ".repeat(r.length+2))+t})(e,i,t.key))).flat(),u=c.some(t=>t.length>r),p=o.map(s=>({key:s,val:e(t[s],i-2,r)})).map(t=>(function(t,e){return[e+":"].concat(t.map(t=>" "+t))})(t.val,t.key)).flat();return u?p.map(n):d?c.map(n):["# "+l]}function h(t,e,i){switch(typeof t){case"string":return[s(t)];case"number":return[t%1==0?t.toString():t.toFixed(3)];case"object":return Array.isArray(t)?function(t,e,i){var s=t.map(t=>e(t,i-2)).flat(),n=s.join(" ");return s.some(t=>t.includes("@")||t.includes("#"))||n.length>i?s.map(r):["@ "+n]}(t,h,e):o(t,h,e,i)}}function a(t){return{"{":"}","[":"]",":":""}[t[t.length-1].type]}function l(t,e,i){return t.split("\n").map(t=>t.replace(/(\S+\s*)(?=:)/g,'<b class="'+e+'">$1</b>').replace(/([#@:])/g,'<b class="'+i+'">$1</b>')).join("\n")}i.r(e);class d{constructor(t,e,i){void 0===i?(this.attr={},void 0===e?void 0===t?(this.x=0,this.y=0):void 0!==t.x&&void 0!==t.y?(this.x=t.x,this.y=t.y):void 0!==t.len&&void 0!==t.ang?(this.x=t.len*Math.cos(t.ang*Math.PI/180),this.y=t.len*Math.sin(t.ang*Math.PI/180)):"number"==typeof t&&(this.x=Math.cos(t*Math.PI/180),this.y=Math.sin(t*Math.PI/180)):(this.x=t,this.y=e)):(this.attr=i,this.x=t,this.y=e)}add(t){return new d(this.x+t.x,this.y+t.y)}iadd(t){this.x+=t.x,this.y+=t.y}sub(t){return new d(this.x-t.x,this.y-t.y)}isub(t){this.x-=t.x,this.y-=t.y}mult(t){return void 0===t.x?new d(this.x*t,this.y*t):new d(this.x*t.x,this.y*t.y)}imult(t){void 0===t.x?(this.y*=t,this.x*=t):(this.x*=t.x,this.y*=t.y)}polar(t){return new d(this.x+t.len*Math.cos(t.ang*Math.PI/180),this.y+t.len*Math.sin(t.ang*Math.PI/180))}ipolar(t){this.x+=t.len*Math.cos(t.ang*Math.PI/180),this.y+=t.len*Math.sin(t.ang*Math.PI/180)}iscale(t,e){this.isub(e),this.imult(t),this.iadd(e)}rotate(t){switch(t){case 90:return new d(-this.y,this.x);case-90:return new d(this.y,-this.x);case 180:case-180:return new d(-this.x,-this.y);default:let e=t/180*Math.PI,i=Math.sin(e),s=Math.cos(e);return new d(this.x*s-this.y*i,this.x*i+this.y*s)}}irotate(t){let e=this.rotate(t);this.x=e.x,this.y=e.y}neg(){return new d(-this.x,-this.y)}cross(t){return this.x*t.y-t.x*this.y}mag(){return Math.hypot(this.x,this.y)}norm(){return this.mult(1/this.mag())}angle(){return Math.atan2(this.y,this.x)/Math.PI*180}isNaN(){return isNaN(this.x)||isNaN(this.y)}addAttr(t){this.attr.push(t)}setAttr(t){return Object.assign(this.attr,t)}removeAttr(t){this.attr[t]=void 0}copy(){return new d(this.x,this.y,JSON.parse(JSON.stringify(this.attr)))}toArray(){return[this.x,this.y]}}class c{constructor(t,e,i,s){this.type="Color";const r={plum:[[-.0399966,.0271153,-484974e-9,308273e-10],[-.00588486,.00511731,-405736e-10,7.75887*1e-6],[.00402332,.0015165,220422e-9,1e-5*-1.92692]]};if(void 0!==e&&void 0!==i)this.r=t,this.g=e,this.b=i,this.a=s;else{const e=void 0!==t?r[t.scheme]:r.plum,i=void 0!==t?t.t:50*Math.random();console.log(i),this.r=255*(e[0][0]+e[0][1]*i+e[0][2]*i*i+e[0][3]*i*i*i),this.g=255*(e[1][0]+e[1][1]*i+e[1][2]*i*i+e[1][3]*i*i*i),this.b=255*(e[2][0]+e[2][1]*i+e[2][2]*i*i+e[2][3]*i*i*i),this.a=.7}}toString(){return"rgba("+this.r.toFixed(4)+", "+this.g.toFixed(4)+", "+this.b.toFixed(4)+", "+this.a.toFixed(4)+")"}darken(t){this.r*=t,this.g*=t,this.b*=t}lighten(t){this.r=1-(1-this.r)*t,this.g=1-(1-this.g)*t,this.b=1-(1-this.b)*t}copy(){return new c(this.r,this.g,this.b,this.a)}}function u(t,e){for(let i=0;i<t.length-1;i++)e(i,t[i],t[i+1])}function p(t){let e=0;return t.length>3&&u(t,function(t,i,s){e+=i.cross(s)/2}),e}function f(t,e){let i=0;return u(t,function(t,s,r){i+=(s[e]+r[e])*s.cross(r)/6}),i}Array.prototype.last=function(){return this[this.length-1]};var y=i(0),g=i.n(y);class m extends Array{constructor(t,e){if(super(),Array.isArray(t))super.push(...t),this[0].setAttr({head:!0}),this.last().setAttr({tail:!0});else{let i=e.diameter(t.angle);this.appendStrokeSeg(t,i)}this.color=new c,this.color.darken(.1)}appendStrokeSeg(t,e){let i=t.offset?t.offset:0,s=t.arcRatio?t.arcRatio:1/6,r=(t.arcOffset,t.headAttached),n=t.tailAttached;if(isNaN(i))throw TypeError("addStroke: offset is not a number");if(i>.5||i<-.5)throw TypeError("addStroke: offset should be within [-0.5, 0.5]");if(isNaN(s))throw TypeError("addStroke: arcRatio is not a number");let o=e.head.mult(r?1:.8).add(e.cent),h=e.tail.mult(n?1:.8).add(e.cent);o.setAttr({curveStart:!0});let a=h.sub(o).mult(.5).rotate(90),l=h.sub(o).mult(.5-s).add(o).add(a.mult(i)),d=h.sub(o).mult(.5+s).add(o).add(a.mult(i));this.push(...[o,l,d,h])}scale(t){for(let e=0;e<this.length;e++)this[e].imult(t)}draw(t){t.strokeStyle=this.color.toString(),t.beginPath(),t.moveTo(this[0].x,this[0].y);for(let e=0;e<this.length;e++)t.lineTo(this[e].x,this[e].y);t.stroke(),t.fillStyle="rgb(0, 0, 0, 0.5)";for(let e=0;e<this.length;e++)t.fillRect(this[e].x-2,this[e].y-2,4,4)}bezierize(t){let e=[];for(let i=0;i<this.length;)if(this[i].attr.curveStart&&i+3<this.length){let s=Array.from(this).slice(i,i+4).map(t=>t.toArray());s=(s=g()(...s,t)).map(t=>new d(t[0],t[1])),e=e.concat(s),i+=4}else e.push(this[i]),i+=1;this.length=0;for(let t=0;t<e.length;t++)this.push(e[t]);this[0].setAttr({head:!0}),this[this.length-1].setAttr({tail:!0})}copy(){let t=Array.from(this).map(t=>t.copy()),e=new m(t);return e.color=this.color.copy(),e}}function v(t,e){let i=void 0,s=void 0;if(u(e,function(e,r,n){u(t,function(t,o,h){var a=function(t,e,i,s){let r=t.sub(i).cross(i.sub(s)),n=-t.sub(e).cross(t.sub(i)),o=t.sub(e).cross(i.sub(s)),h=r/o,a=n/o;return{p:t.add(e.sub(t).mult(h)),s:h,t:a}}(r,n,o,h);let l=a.t>=0&&a.t<1,d=a.s>=0&&a.s<1,c=a.s<=1&&r.attr.head,u=a.s>=0&&n.attr.tail;if(l&&(c||d||u)){let r={inter:a,stroEdge:e,polyEdge:t};if(i){if(s)return;s=r}else i=r}})}),void 0===i&&void 0===s)throw TypeError("splitStrokeIntersection: Stroke doesn't intersect with polygon.");let r=[];if(void 0!==i&&void 0!==s){r.push(i.inter.p);for(let t=i.stroEdge+1;t<=s.stroEdge;t++)r.push(e[t]);r.push(s.inter.p)}return{enter:i,exit:s,strokeIntersection:r}}class b extends Array{constructor(t){super(...t),this.push(this[0]),this.color=new c,this.area=p(this),this.centroid=function(t){if(t.length>2){let e=f(t,"x"),i=f(t,"y"),s=p(t);return new d(e/s,i/s)}console.error("centroid needs at least two points over the curve")}(this),this.type="Polygon"}diameter(t,e){e=void 0===e?this.centroid:e;let i=new m([this.centroid.sub(new d(t)),this.centroid.add(new d(t))]);console.log(i,"diameter");let{enter:s,exit:r}=v(this,i);return console.log(s.inter.p,r.inter.p),{head:s.inter.p.sub(e),tail:r.inter.p.sub(e),cent:e}}scale(t){for(let e=0;e<this.length-1;e++)this[e].imult(t)}trans(t){for(let e=0;e<this.length-1;e++)this[e].iadd(t)}draw(t){t.fillStyle=this.color.toString(),t.beginPath(),t.moveTo(this[0].x,this[0].y);for(let e=0;e<this.length;e++)t.lineTo(this[e].x,this[e].y);t.closePath(),t.fill(),t.strokeStyle="black",t.beginPath(),t.arc(this.centroid.x,this.centroid.y,3,0,2*Math.PI),t.stroke()}splitBy(t){const{enter:e,exit:i,strokeIntersection:s}=v(this,t);let r,n;e.polyEdge<i.polyEdge?(r=e.polyEdge,n=i.polyEdge,s.reverse()):(r=i.polyEdge,n=e.polyEdge);let o=Array.from(this);return{innerSide:o.slice(r,n+1).concat(s),outerSide:o.slice(1,r+1).concat(s.reverse()).concat(o.slice(n))}}area(){return this.body.length>3?this.body.concat(this.body[0].copy()).part(2,1).map(t=>t[0].cross(t[1])/2).sum():0}}class x{constructor(t,e){this.original=t,this.strokes=[],this.parent=e,this.children={},this.mass=this.original.area()}density(){return this.mass/this.original.area()}addSimpleStroke(t){let e=new m(t,this.original);e.bezierize(2),this.strokes.push(e),this.updateMass()}updateMassWith(t){let e=this;for(;void 0!==e.parent;)e.mass+=t,e=e.parent}diameter(t){return this.original.diameter(t)}split(){for(let t of this.strokes)if(0!=Object.keys(this.children).length)for(let e in this.children){const i=this.children[e].original,{innerSide:s,outerSide:r}=i.splitBy(t);delete this.children[e],this.children[e+"i"]=new x(new b(s)),this.children[e+"o"]=new x(new b(r))}else{const e=this.original,{innerSide:i,outerSide:s}=e.splitBy(t);this.children.i=new x(new b(i)),this.children.o=new x(new b(s))}console.log("split",this)}updateChildrenMass(){for(;void allRegionChildren;)nudgeStrokes();this.mass=0;for(let t in this.children)this.mass+=this.children[t].mass}draw(t){if(0==Object.keys(this.children).length)this.original.draw(t);else for(let e in this.children)this.children[e].draw(t);for(let e of this.strokes)e.draw(t)}}new class{constructor(t){this.textStyle={background:"transparent","z-index":2,height:"auto",resize:"none","-webkit-text-fill-color":"transparent",outline:"none"},this.textCodeStyle={position:"absolute",top:"0px",left:0,width:"550px","font-family":'"Inconsolata", "TheSansMono Office", "FiraSans Mono, monospace"',"font-size":"12px","letter-spacing":"-0.05em","line-height":"150%",padding:"10px",resize:"none",border:"none","border-radius":"5px","overflow-x":"scroll","overflow-y":"scroll"},this.edit=document.createElement("textarea"),this.edit.setAttribute("id","textedit"),this.edit.setAttribute("spellcheck","false"),this.edit.setAttribute("class","editor");for(let t in this.textStyle)this.edit.style[t]=this.textStyle[t];for(let t in this.textCodeStyle)this.edit.style[t]=this.textCodeStyle[t];t.appendChild(this.edit),this.preStyle={"white-space":"pre-wrap","word-wrap":"break-word"},this.codeStyle={background:"#fdf6e3","z-index":1};let e=document.createElement("pre");this.disp=document.createElement("code"),this.disp.setAttribute("id","textdisp"),this.disp.setAttribute("class","editor editor-display"),e.appendChild(this.disp),t.appendChild(e);for(let t in this.preStyle)e.style[t]=this.preStyle[t];for(let t in this.textCodeStyle)this.disp.style[t]=this.textCodeStyle[t];for(let t in this.codeStyle)this.disp.style[t]=this.codeStyle[t];this.init()}init(){window.addEventListener("keydown",function(t){var e,i,s,r,n,o;if("Tab"===t.key&&(t.preventDefault(),this.edit.value.split("\n"),e=this.edit,i="  ",n=e.value,o=e.ownerDocument,"number"==typeof e.selectionStart&&"number"==typeof e.selectionEnd?(s=e.selectionEnd,e.value=n.slice(0,s)+i+n.slice(s),e.selectionStart=e.selectionEnd=s+i.length):"undefined"!=o.selection&&o.selection.createRange&&(e.focus(),(r=o.selection.createRange()).collapse(!1),r.text=i,r.select())),"Enter"===t.key&&t.ctrlKey&&t.shiftKey){let e=function(t){var e=t.split("\n").filter(t=>!t.match(/^\s*$/)),i="",s=[],r=0;for(let t=0;t<e.length;t++){for(var n=e[t].search(/\S|$/);s.length>0&&s[s.length-1].indent>=n;)i+=a(s),s.pop();r=0;for(var o=e[t];o.length>0;)switch(o[0]){case" ":s[s.length-1].comma?i+=", ":s[s.length-1].comma=!0,r+=o.search(/\S|$/),o=o.trim();break;case"@":i+="[",s.push({type:"[",indent:r,comma:!1}),r+=1,o=o.slice(1);break;case"#":i+="{",s.push({type:"{",indent:r,comma:!1}),r+=1,o=o.slice(1);break;case":":i+=":",s.push({type:":",indent:r}),r+=1,o=o.slice(1);break;case'"':var h=o.match(/"(?:\\"|[^"])*"/);if(!h)throw"Quoted string missing at Line: "+t;s.length>0&&":"==s[s.length-1].type&&s.pop(),r+=h[0].length,i+=o.slice(0,h[0].length),o=o.slice(h[0].length);break;default:var l=o.match(/[^\s:]*/);if(!l)throw"Simple string got some problem at Line: 1";s.length>0&&":"==s[s.length-1].type&&s.pop(),r+=l[0].length;var d=o.slice(0,l[0].length),c=parseFloat(d);i+=c||0==c?c:'"'+d+'"',o=o.slice(l[0].length)}}for(;s.length>0&&s[s.length-1].indent>=0;)i+=a(s),s.pop();return i}(this.edit.value),i=JSON.parse(e),s=function(t,e){return h(t,e,e).join("\n")}(i,120);this.edit.value=s,this.edit.focus(),t.target.dispatchEvent(new CustomEvent("interpret",{bubbles:!0,detail:i}))}else"Enter"===t.key&&t.ctrlKey}.bind(this)),this.edit.addEventListener("input",function(t){console.log("yaya"),this.edit.style.height=this.edit.scrollHeight;var e=this.edit.value;this.disp.innerHTML=l(e,"","color:#d33682;")+"\n "}.bind(this)),this.edit.innerText="@ ",this.disp.innerHTML=l("@ ","","color:#d33682;")+"\n ",this.edit.focus()}highlight(){}update(t){this.edit.value=t,this.highlight()}}(document.getElementById("editor"));let w=document.createElement("canvas"),S=w.getContext("2d"),M=window.devicePixelRatio;console.log("dpr",M),w.width=400*M,w.height=400*M,w.style.width=400,w.style.height=400,document.getElementById("canvas-container").appendChild(w),S.translate(w.width/2,w.height/2),S.scale(M,M);var k=new x(new b([new d(200,200),new d(-200,200),new d(-200,-200),new d(200,-200)]));k.addSimpleStroke({angle:125,offset:.35}),k.addSimpleStroke({angle:0,offset:.01}),k.split(),k.draw(S),document.addEventListener("interpret",function(t){console.log(t,"interpret")})}]);