// 测试方法的prototype和new function()会产生什么样的对象
// function asa() {
// 	var d = function() {
// 		return "deferDataKey"
// 	};
// };
// asa.prototype = {
// 	b: function() {
// 		alert(this.name);
// 	},
// 	name: 'asa',
// }

// var a = new asa();
// 结论
// 在b:function()中可以通过this.name访问到prototype里面的name
// 同时可以通过asa.name访问到
// 但是这两个各自修改之后互不干扰,但是修改asa.prototype.name那么
// 新创建的asa的name会随着改变
// 
// 
// 结论通过new function()出来的对象拥有属于自己的一份function prototype
// 属性,通过this指整个属于自己的prototype属性
// 
// 

// 测试$.extend 和 $.fn.extend里面的this指向和进行添加
// 属性和方法的正确位置
// function asa() {

// }
// asa.fn = asa.prototype;
// asa.fn.bb = asa.bb = function(name, value) {
// 	this[name] = value;
// 	alert(asa == this);
// };
// debugger;
// asa.bb("cc", "11");
// debugger;
// asa.fn.bb("cc", "22");
// debugger;

// 结论:
// 要的出下面的结论还得经过在浏览器里面进行一步一步的查看各个
// 变量的值.
// $.extend是在jquery构造函数上面进行添加即$.xxx方法
// $.fn.extend是在jquery的构造函数原型上面进行添加
// 又因为jquery的fn.init的原型也是指向构造函数的原型
// 所以也是在init方法的原型上面进行添加
// 又因为调用jquery构造函数的时候实际上
// 是new jquery.fn.init
// 而这里面的init又进行了上面的$.fn.extend扩展
// 所以能够调用$(xx).function()这样的方法
// 在这个基础上jquery就可以有两种扩展方式
// 一种方式是为jquery构造函数方式添加属性和方法
// 一种是为jquery的原型添加属性和方法
// 像目前的ui插件如使用$.dialog 和$(selector).dailog
// 也是采取相关的扩展
//