!function(t){var e={};function i(s){if(e[s])return e[s].exports;var n=e[s]={i:s,l:!1,exports:{}};return t[s].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=t,i.c=e,i.d=function(t,e,s){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:s})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var s=Object.create(null);if(i.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)i.d(s,n,function(e){return t[e]}.bind(null,n));return s},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=0)}([function(t,e,i){"use strict";function s(t){return t.match(/[ @]/)?'"'+t+'"':t}function n(t,e){return(0==e?"@ ":"  ")+t}function r(t,e){return(0==e?"# ":"  ")+t}function o(t,e,i,n){var o=Object.keys(t),l=o.map(s=>({key:s,val:e(t[s],i-s.length,n)})),h=l.map(t=>t.val.some(t=>t.includes("@")||t.includes("#"))).some(t=>t),a=l.map(t=>s(t.key)+": "+t.val[0]).join(" "),c=h||a.length>i,d=l.map(t=>t.val.map((e,i)=>(function(t,e,i){var n=s(i);return(0==e?n+": ":" ".repeat(n.length+2))+t})(e,i,t.key))).flat(),u=d.some(t=>t.length>n),p=o.map(s=>({key:s,val:e(t[s],i-2,n)})).map(t=>(function(t,e){return[e+":"].concat(t.map(t=>" "+t))})(t.val,t.key)).flat();return u?p.map(r):c?d.map(r):["# "+a]}function l(t,e,i){switch(typeof t){case"string":return[s(t)];case"number":return[t%1==0?t.toString():t.toFixed(3)];case"object":return Array.isArray(t)?function(t,e,i){var s=t.map(t=>e(t,i-2)).flat(),r=s.join(" ");return s.some(t=>t.includes("@")||t.includes("#"))||r.length>i?s.map(n):["@ "+r]}(t,l,e):o(t,l,e,i)}}function h(t){return{"{":"}","[":"]",":":""}[t[t.length-1].type]}function a(t,e,i){return t.split("\n").map(t=>t.replace(/(\S+\s*)(?=:)/g,'<b class="'+e+'">$1</b>').replace(/([#@:])/g,'<b class="'+i+'">$1</b>')).join("\n")}i.r(e);class c{constructor(t,e,i){void 0===i?(this.attr={},void 0===e?void 0===t?(this.x=0,this.y=0):void 0!==t.x&&void 0!==t.y?(this.x=t.x,this.y=t.y):void 0!==t.len&&void 0!==t.ang?(this.x=t.len*Math.cos(t.ang*Math.PI/180),this.y=t.len*Math.sin(t.ang*Math.PI/180)):"number"==typeof t&&(this.x=Math.cos(t*Math.PI/180),this.y=Math.sin(t*Math.PI/180)):(this.x=t,this.y=e)):(this.attr=i,this.x=t,this.y=e)}add(t){return new c(this.x+t.x,this.y+t.y)}iadd(t){this.x+=t.x,this.y+=t.y}sub(t){return new c(this.x-t.x,this.y-t.y)}isub(t){this.x-=t.x,this.y-=t.y}mult(t){return void 0===t.x?new c(this.x*t,this.y*t):new c(this.x*t.x,this.y*t.y)}imult(t){void 0===t.x?(this.y*=t,this.x*=t):(this.x*=t.x,this.y*=t.y)}polar(t){return new c(this.x+t.len*Math.cos(t.ang*Math.PI/180),this.y+t.len*Math.sin(t.ang*Math.PI/180))}ipolar(t){this.x+=t.len*Math.cos(t.ang*Math.PI/180),this.y+=t.len*Math.sin(t.ang*Math.PI/180)}iscale(t,e){this.isub(e),this.imult(t),this.iadd(e)}rotate(t){let e=t/180*Math.PI,i=Math.sin(e),s=Math.cos(e);return new c(this.x*s-this.y*i,this.x*i+this.y*s)}irotate(t){let e=this.rotate(t);this.x=e.x,this.y=e.y}neg(){return new c(-this.x,-this.y)}cross(t){return this.x*t.y-t.x*this.y}mag(){return Math.hypot(this.x,this.y)}norm(){return this.mult(1/this.mag())}angle(){return Math.atan2(this.y,this.x)/Math.PI*180}isNaN(){return isNaN(this.x)||isNaN(this.y)}addAttr(t){this.attr.push(t)}setAttr(t){return Object.assign(this.attr,t)}removeAttr(t){this.attr[t]=void 0}copy(){return new c(this.x,this.y,JSON.parse(JSON.stringify(this.attr)))}}class d{constructor(t,e,i,s){this.type="Color";const n={plum:[[-.0399966,.0271153,-484974e-9,308273e-10],[-.00588486,.00511731,-405736e-10,7.75887*1e-6],[.00402332,.0015165,220422e-9,1e-5*-1.92692]]};if(void 0!==e&&void 0!==i)this.r=t,this.g=e,this.b=i,this.a=s;else{const e=void 0!==t?n[t.scheme]:n.plum,i=void 0!==t?t.t:50*Math.random();console.log(i),this.r=255*(e[0][0]+e[0][1]*i+e[0][2]*i*i+e[0][3]*i*i*i),this.g=255*(e[1][0]+e[1][1]*i+e[1][2]*i*i+e[1][3]*i*i*i),this.b=255*(e[2][0]+e[2][1]*i+e[2][2]*i*i+e[2][3]*i*i*i),this.a=.7}}toString(){return"rgba("+this.r.toFixed(4)+", "+this.g.toFixed(4)+", "+this.b.toFixed(4)+", "+this.a.toFixed(4)+")"}darken(t){this.r*=t,this.g*=t,this.b*=t}lighten(t){this.r=1-(1-this.r)*t,this.g=1-(1-this.g)*t,this.b=1-(1-this.b)*t}}function u(t,e){for(let i=0;i<t.length-1;i++)e(i,t[i],t[i+1])}function p(t){let e=0;return t.length>3&&u(t,function(t,i,s){e+=i.cross(s)/2}),e}function y(t,e){let i=0;return u(t,function(t,s,n){i+=(s[e]+n[e])*s.cross(n)/6}),i}class f extends Array{constructor(t){super(...t),this.push(this[0]),this.color=new d,this.area=p(this),this.centroid=function(t){if(t.length>2){let e=y(t,"x"),i=y(t,"y"),s=p(t);return new c(e/s,i/s)}console.error("centroid needs at least two points over the curve")}(this),this.type="Polygon"}scale(t){for(let e=0;e<this.length-1;e++)this[e].imult(t)}trans(t){for(let e=0;e<this.length-1;e++)this[e].iadd(t)}draw(t){t.fillStyle=this.color.toString(),console.log(t.fillStyle),t.beginPath(),t.moveTo(this[0].x,this[0].y);for(let e=0;e<this.length;e++)t.lineTo(this[e].x,this[e].y);t.closePath(),t.fill(),t.fillStyle="black",t.beginPath(),t.arc(this.centroid.x,this.centroid.y,10,0,2*Math.PI),t.fill()}splitBy(t){const{enter:e,exit:i,strokeIntersection:s}=function(t,e){let i=void 0,s=void 0;u(e,function(e,n,r){u(t,function(t,o,l){var h=function(t,e,i,s){let n=t.sub(i).cross(i.sub(s)),r=-t.sub(e).cross(t.sub(i)),o=t.sub(e).cross(i.sub(s)),l=n/o,h=r/o;return{p:t.add(e.sub(t).mult(l)),s:l,t:h}}(n,r,o,l);let a=h.t>0&&h.t<1,c=h.s<1&&h.s>0,d=h.s<1&&n.attr.head,u=h.s>0&&r.attr.tail;if(a&&(d||c||u)){let n={inter:h,stroEdge:e,polyEdge:t};if(i){if(s)return;s=n}else i=n}})});let n=[];if(void 0!==i&&void 0!==s){n.push(i.inter.p);for(let t=i.stroEdge+1;t<=s.stroEdge;t++)n.push(e[t]);n.push(s.inter.p)}return{enter:i,exit:s,strokeIntersection:n}}(this,t);let n,r;e.polyEdge<i.polyEdge?(n=e.polyEdge,r=i.polyEdge,s.reverse()):(n=i.polyEdge,r=e.polyEdge);let o=Array.from(this);return{innerSide:o.slice(n,r+1).concat(s),outerSide:o.slice(1,n).concat(s.reverse()).concat(o.slice(r))}}area(){return this.body.length>3?this.body.concat(this.body[0].copy()).part(2,1).map(t=>t[0].cross(t[1])/2).sum():0}}new class{constructor(t){this.textStyle={background:"transparent","z-index":2,height:"auto",resize:"none","-webkit-text-fill-color":"transparent",outline:"none"},this.textCodeStyle={position:"absolute",top:"0px",left:0,width:"550px","font-family":'"Inconsolata", "TheSansMono Office", "FiraSans Mono, monospace"',"font-size":"12px","letter-spacing":"-0.05em","line-height":"150%",padding:"10px",resize:"none",border:"none","border-radius":"5px","overflow-x":"scroll","overflow-y":"scroll"},this.edit=document.createElement("textarea"),this.edit.setAttribute("id","textedit"),this.edit.setAttribute("spellcheck","false"),this.edit.setAttribute("class","editor");for(let t in this.textStyle)this.edit.style[t]=this.textStyle[t];for(let t in this.textCodeStyle)this.edit.style[t]=this.textCodeStyle[t];t.appendChild(this.edit),this.preStyle={"white-space":"pre-wrap","word-wrap":"break-word"},this.codeStyle={background:"#fdf6e3","z-index":1};let e=document.createElement("pre");this.disp=document.createElement("code"),this.disp.setAttribute("id","textdisp"),this.disp.setAttribute("class","editor editor-display"),e.appendChild(this.disp),t.appendChild(e);for(let t in this.preStyle)e.style[t]=this.preStyle[t];for(let t in this.textCodeStyle)this.disp.style[t]=this.textCodeStyle[t];for(let t in this.codeStyle)this.disp.style[t]=this.codeStyle[t];this.init()}init(){window.addEventListener("keydown",function(t){var e,i,s,n,r,o;if("Tab"===t.key&&(t.preventDefault(),this.edit.value.split("\n"),e=this.edit,i="  ",r=e.value,o=e.ownerDocument,"number"==typeof e.selectionStart&&"number"==typeof e.selectionEnd?(s=e.selectionEnd,e.value=r.slice(0,s)+i+r.slice(s),e.selectionStart=e.selectionEnd=s+i.length):"undefined"!=o.selection&&o.selection.createRange&&(e.focus(),(n=o.selection.createRange()).collapse(!1),n.text=i,n.select())),"Enter"===t.key&&t.ctrlKey){let e=function(t){var e=t.split("\n").filter(t=>!t.match(/^\s*$/)),i="",s=[],n=0;for(let t=0;t<e.length;t++){for(var r=e[t].search(/\S|$/);s.length>0&&s[s.length-1].indent>=r;)i+=h(s),s.pop();n=0;for(var o=e[t];o.length>0;)switch(o[0]){case" ":s[s.length-1].comma?i+=", ":s[s.length-1].comma=!0,n+=o.search(/\S|$/),o=o.trim();break;case"@":i+="[",s.push({type:"[",indent:n,comma:!1}),n+=1,o=o.slice(1);break;case"#":i+="{",s.push({type:"{",indent:n,comma:!1}),n+=1,o=o.slice(1);break;case":":i+=":",s.push({type:":",indent:n}),n+=1,o=o.slice(1);break;case'"':var l=o.match(/"(?:\\"|[^"])*"/);if(!l)throw"Quoted string missing at Line: "+t;s.length>0&&":"==s[s.length-1].type&&s.pop(),n+=l[0].length,i+=o.slice(0,l[0].length),o=o.slice(l[0].length);break;default:var a=o.match(/[^\s:]*/);if(!a)throw"Simple string got some problem at Line: 1";s.length>0&&":"==s[s.length-1].type&&s.pop(),n+=a[0].length;var c=o.slice(0,a[0].length),d=parseFloat(c);i+=d||0==d?d:'"'+c+'"',o=o.slice(a[0].length)}}for(;s.length>0&&s[s.length-1].indent>=0;)i+=h(s),s.pop();return i}(this.edit.value),i=JSON.parse(e),s=function(t,e){return l(t,e,e).join("\n")}(i,120);this.edit.value=s,this.edit.focus(),t.target.dispatchEvent(new CustomEvent("interpret",{bubbles:!0,detail:i}))}else"Enter"===t.key&&t.ctrlKey}.bind(this)),this.edit.addEventListener("input",function(t){console.log("yaya"),this.edit.style.height=this.edit.scrollHeight;var e=this.edit.value;this.disp.innerHTML=a(e,"","color:#d33682;")+"\n "}.bind(this)),this.edit.innerText="@ ",this.disp.innerHTML=a("@ ","","color:#d33682;")+"\n ",this.edit.focus()}highlight(){}update(t){this.edit.value=t,this.highlight()}}(document.getElementById("editor"));let g=document.createElement("canvas"),m=g.getContext("2d"),x=window.devicePixelRatio;g.width=800,g.height=800,g.style.width=400,g.style.height=400,document.getElementById("canvas-container").appendChild(g),m.translate(g.width/2,g.height/2),m.scale(x,x);var b=new class{constructor(t){this.poly={s:t},this.strokes=[]}split(t){for(let e in this.poly){const i=this.poly[e],{innerSide:s,outerSide:n}=i.splitBy(t);delete this.poly[e],this.poly[e+"i"]=new f(s),this.poly[e+"o"]=new f(n)}this.strokes.push(t)}draw(t){for(let e in this.poly)"Polygon"==this.poly[e].type&&this.poly[e].draw(t);for(let e of this.strokes)e.draw(t)}}(new f([new c(200,200),new c(-200,200),new c(-200,-200),new c(200,-200)]));let v=new class extends Array{constructor(t){super(...t),this[0].setAttr({head:!0}),this[this.length-1].setAttr({tail:!0}),this.color=new d,this.color.darken(.3),this.type="Stroke"}scale(t){for(let e=0;e<this.length;e++)this[e].imult(t)}draw(t){t.strokeStyle=this.color.toString(),t.lineWidth=5,t.beginPath(),t.moveTo(this[0].x,this[0].y);for(let e=0;e<this.length;e++)t.lineTo(this[e].x,this[e].y);t.stroke()}}([new c(0,2),new c(.1,.5),new c(-.1,-.5),new c(0,-2)]);v.scale(80),b.split(v),b.draw(m),document.addEventListener("interpret",function(t){console.log(t,"interpret")})}]);