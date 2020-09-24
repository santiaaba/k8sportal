var apiserver = "http://10.120.78.86:3000"
var userToken		//Almacena el token obtenido con la autenticacion
var userId
var userName
var anchos = [ '120px', '120px', '120px', '120px', '120px', '120px' ]

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function error(jqXHR,textStatus,errorThrown){
	if(jqXHR.status == 300){
		alert("ERROR: " + JSON.stringify(jqXHR))
		logout()
	} else if(jqXHR.status == 301){
		alert("Su ip no tiene acceso a la API")
	}
}

function logout() {
	var c = document.cookie.split("; ");
	for (i in c) 
		document.cookie =/^[^=]+/.exec(c[i])[0]+"=;expires=Thu, 01 Jan 1970 00:00:00 GMT";    
	window.location.href = "login.html";
}

function menu_click(f,g,h){
	f()
	.then(data=>{
		$('#content')
		.empty()
		.append("<div id='wrp_vl' class='wrp_vl'></div>" +
			    "<div id='wrp_play' class='wrp_play'></div>")
		vertical_list_show('#wrp_vl',data,'name',g,h)
	})
	.catch(err=>{
		alert(err)
	})
}

/*
function make_menu(){
	$("#menu1")
	.append("<div id='m-namespace'><img src='img/capas.png'><span>dockers</span></div>")
	.append("<div id='m-namespace'><img src='img/capas.png'></div>")
	.append("<div id='m-deploy'><img src='img/ship.png'></div>")
	.append("<div id='m-volume'><img src='img/storage.png'></div>")
	.append("<div id='m-secret'><img src='img/key.png'></div>")
	.append("<div id='m-service'><img src='img/service.png'></div>")
	.append("<div id='m-networkPolicy'><img src='img/netPol.png'></div>")

	$("#m-namespace").on('click', function(){
		menu_click(namespace_list,namespace_sections,['id'])
	})

	$("#m-deploy").on('click', function(){
		menu_click(deploy_list,deploy_sections,['idNamespace','name'])
	})

	$("#m-volume").on('click', function(){
		menu_click(volume_list,volume_sections,['idNamespace','name'])
	})

	$("#m-networkPolicy").on('click', function(){
		alert("Implementar")
	})

	$("#m-secret").on('click', function(){
		menu_click(secret_list,secret_sections,['idNamespace','name'])
	})

	$("#m-service").on('click', function(){
		menu_click(service_list,service_sections,['idNamespace','name'])
	})

	/* Para el menu plus
	$("#menuplus")
	.append("<div id='m-plus'>+</div>")
	plus_init('#m-plus')
}
*/

function main(){
	$.ajaxSetup({ cache: false });

	if(getCookie("username") == ""){
		window.location.href = "login.html";
	}
	userToken = getCookie("token");
	userName = getCookie("username");
	userId = getCookie("userid");

	$("#nombre").text(userName)	

	$("#logout").on("click",function(){
		logout()
	})

	main_menu_make('main_menu_w',
		[{type:'submenu',name:'Maquina virtual',img:'img/vm.png',submenu:[],addButton: null},
		{type:'submenu',name:'Hosting Web',img:'img/hostingweb.png',submenu:[],addButton:null},
		{type:'submenu',name:'Almacenamiento',img:'img/s3.png',submenu:[],addButton:null},
		{type:'submenu',name:'Docker',img:'img/ship.png',submenu:[
			{ name: 'Namespace',
			  img: 'img/capas.png',
			  click: null
			},
			{ name: 'Deployment',
			  img: 'img/deployment.png',
			  click: function(){k8s_deployments('content')}
			},
			{ name: 'Volumes',
			  img: 'img/volume.png',
			  click: function(){k8s_volums('content')}
			},
			{ name: 'Security',
			  img: 'img/key.png',
			  click: null
			},
			{ name: 'Services',
			  img: 'img/services.png',
			  click: function(){k8s_services('content')}
			}
			],addButton: k8s_make_agregar},
		{type:'submenu',name:'Base de datos',img:'img/database.png',submenu:[],addButton:null},
		{type:'submenu',name:'IoT',img:'img/iot.png',submenu:[],addButton:null},
		{type:'submenu',name:'Block Chain',img:'img/blockchain.png',submenu:[],addButton:null}])

	$(".contenido").empty()

	menu_agregar = new MenuAgregar

    $(window).on('resize',function(){resize_ajuste()})
	resize_ajuste()
}

function posixTimestampToDate(timestamp){
	var a = new Date(timestamp*1000);
	var months = ['1','2','3','4','5','6','7','8','9','10','11','12'];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate() + '';
	var hour = a.getHours() + '';
	var min = a.getMinutes() + '';
	var sec = a.getSeconds() + '';
	if(min.length == 1 ) { min = '0' + min }
	if(hour.length == 1 ) { hour = '0' + hour }
	if(sec.length == 1 ) { sec = '0' + sec }
	var time = date + '/' + month + '/' + year + ' ' + hour + ':' + min;
	return time;
}

function ordenar(data,col,asc){
	data.sort((a,b) => (a[col] > b[col])? 1 : -1)
	if(asc){
		data.reverse()
	}
	return data
}

function armarListado(padre,columnas,data,onclick,onclickid,colores,anchos,ord_col,ord_dir){
/*
 * padre: contenedor de la lista
 * columnas: array de nombre de columnas. Debe coincidir con las columnas en data
 * data: los datos a mostrar
 * onclick: funcion a ejecutar al hacer click
 * onclickid: columna de data que se pasa como parametro a la funcion de onclick
 * colores: color de fondo de cada fila. Debe coincidir con la cantidad de filas de data
 * anchos: array de anchos con sufijo 'px'. ej: '100px'. Uno por cada columna en data
 * ord_col: nombre de la columna de data por la que se ordena
 * ord_dir: direccion del ordenamiento [ 1 | 0 ]
 */
	var idlista = azar()
	var classOscuro = '';

	//alert(ord_col + " - " + ord_dir)
	if(typeof(ord_col) != 'undefined' && typeof(ord_dir) != 'undefined'){
		data = ordenar(data,ord_col,ord_dir)
	}

	$(padre).empty()
	$(padre).append("<div id='listado_" + idlista + "' class='listado'>" + 
			    "<div id='listado_cabecera_" + idlista + "' class='listado_cabecera'></div>" +
			    "<div id='listado_contenido_" + idlista + "' class='listado_contenido'></div>" +
			    "</div>")

	var border=''
	$.each(columnas,function(index,value){
		$("#listado_cabecera_" + idlista)
		.append("<div style=\"display:flex; width:" + anchos[index] + border + "\">" +
				"<div style=\"display: flex; flex-direction:column; width:25px\">" +
			    "<div id='ord_" + value.nombre + "_up'><img width=\"12px\"" +
			    " src='img/up.png'></div>" +
			    "<div id='ord_" + value.nombre + "_down'><img width=\"12px\"" + 
				"src='img/down.png'></div>" +
				"</div><div style=\"flex: 1 1\">" + value.nombre + "</div>")
		border = ';border-left: 1px solid #8a8484'
		$("#ord_" + value.nombre + "_up").on("click",function(){
			armarListado(padre,columnas,data,onclick,onclickid,colores,anchos,value.dato,1)
		})
		$("#ord_" + value.nombre + "_down").on("click",function(){
			armarListado(padre,columnas,data,onclick,onclickid,colores,anchos,value.dato,0)
		})
	})

	$.each(data,function(index,value){
		var seleccionado = ''
		var idfila = azar()
		$("#listado_contenido_" + idlista)
		.append("<div id='listado_fila_" + idfila +
			    "' class='listado_fila' style=\"background-color:" +
			    colores[index].background +
				"; color:" + colores[index].text + "\">")

		$.each(columnas,function(c_index,c_value){
			$("#listado_fila_" + idfila)
			.append("<div style=\"width:" + anchos[c_index] +
					"\">" + value[c_value.dato] + "</div>")
		})
		$("#listado_fila_" + idfila).on('click',function(){
			$("#listado_contenido_" + idlista).children().each(function(index){
				$(this).removeClass("seleccionada")
			})
			$(this).addClass("seleccionada")
			onclick(value[onclickid])
		})
	})
}

function coloresDefault(data){
	var colores = new Array
	var oscuro = false
	$.each(data, function(index,value){
		var color = {background:"", text:""}
		if(oscuro){
			color.background = '#E8E8E8'
			color.text = '#222'
		} else {
			color.background = '#F8F8F8'
			color.text = '#222'
		}
		oscuro = !oscuro
		colores.push(color)
	})
	return colores
}

function popUpStart(width,height,fv){
	$(".popUp").css("width",width)
	$(".popUp").css("height",height)
	$(".velo").css("display","block")
	$(".popUp").css("display","block")
	fv()
}

function popUpClose(){
	$(".velo").css("display","none")
	$(".popUp").css("display","none")
}

function resize_ajuste(){
	/* Ajusta algunas cuestiones del responsive si cambia
 	   el tamano del navegador */
	$(".wrp1").height($(window).height() - 50)
	$("#content").height($(window).height() - 50)
}

function vertical_list_show(padre,data,column,onclick,params){
/* Genera un listado vertical
 * padre: contenedor del listado
 * data: array de datos.
 * column: nombre de la columna en datos a ser mostrada.
 * onclick: nombre de la funcion al hacer click en un elemento
 * params: Array de nombre de columans en data que se pasan
 * por parametro a onclick
 */

	var idlista = azar()
	$(padre).empty()
	$(padre).append("<div id='vertical_list_" + idlista +
					"' class='vertical_list'>" + "</div>")
	$.each(data,function(index,value){
		var idfila = azar()
		$("#vertical_list_" + idlista)
		.append("<div id='" + idfila + "'>" + value[column] + "</div>")
		$("#" + idfila).on('click',function(){
			$("#vertical_list_" + idlista).children().each(function(){
				$(this).css('background-color','')
			})
			$(this).css('background-color','#408588')
			switch(params.length){
				case 0: onclick()
					break
				case 1: onclick(value[params[0]])
					break
				case 2: onclick(value[params[0]],value[params[1]])
					break
				case 3: onclick(value[params[0]],value[params[1]],value[params[2]])
					break
				case 4: onclick(value[params[0]],value[params[1]],value[params[2]],value[params[3]])
					break
				default: alert("vertical_list_show: Demasiados parametros")
			}
		})
	})
}
