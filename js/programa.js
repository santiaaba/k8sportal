const apiserver = "http://k8sportal.lab.fibercorp.com.ar:3000"
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
		[{type:'submenu',name:'Pantalla principal',img:'img/dashboard.png',submenu:[],addData: null},
		{type:'submenu',name:'Maquina virtual',img:'img/vm.png',submenu:[],addData: null},
		{type:'submenu',name:'Hosting Web',img:'img/hostingweb.png',submenu:[
			{ name: 'Namespace',
			  img: 'img/capas.png',
			  click: www_namespaces
			},
			{ name: 'Site',
			  img: 'img/www.png',
			  click: www_sites
			}
		],addData: [
				{name:"Sition Web Estandard",img:"img/www.png",detalle:
				'<p>Le permite disponer de un sitio web utilizando tecnolog&iacute;s .NET, ' +
				'PHP os implemente HTTP plano.</p><p>La herramienta le provee de todo los necesario' +
				'para el desarrollo del sitio. Gesti&oacute;n de usuarios y Acceso FTP, gesti&oacute;n de URLs, ' +
				'estadisticas, etc</p> Controle la cantidad de instancias cuando note que su sitio' +
				'presenta un uso excesivo o progr&aacute;melo para que escale autom&aacute;ticamente.</p>'
				,f:www_site_despliegue}
		]},
		{type:'submenu',name:'Almacenamiento',img:'img/storage.png',submenu:[
			{ name: 'Object Storage',
			  img: 'img/sss.png',
			  click: null
			},
			{ name: 'Archiving',
			  img: 'img/archive.png',
			  click: null
			}
		],addData: null},
		{type:'submenu',name:'Docker',img:'img/ship.png',submenu:[
			{ name: 'Namespace',
			  img: 'img/capas.png',
			  click: k8s_namespaces
			},
			{ name: 'Deployment',
			  img: 'img/deployment.png',
			  click: k8s_deployments
			},
			{ name: 'Volumes',
			  img: 'img/volume.png',
			  click: k8s_volumes
			},
			{ name: 'Secrets',
			  img: 'img/key.png',
			  click: k8s_secrets
			},
			{ name: 'Services',
			  img: 'img/service.png',
			  click: k8s_services
			},
			{ name: 'Configmap',
			  img: 'img/configmap.png',
			  click: null
			}
			],addData: [
				{name:"Namespace",img:"img/namespace.png",detalle:
				'<p>Un Namespace le permite organizar sus proyectos.</p>' +
                '<p>Los Namespace agrupan recursos como vol&uacute;menes de discos, ' +
                'despliegues de aplicaciones.</p><p>Las aplicaciones de una namespace ' +
                'pueden verse entre si pero no de con aplicaciones de otros namespace.' +
                'Al menos no si no se lo permite explicitamente</p>'
				,f:k8s_namespace_despliegue},
				{name:"Deployment",img:"img/deployment.png",
				 detalle:'<p>Un Deployment le permite correr su aplicaci&oacute;n dentro de ' +
				'la cantidad de contenedores que usted defina.</p>',
				 f:k8s_deployment_despliegue},
				{name:"Volumen",img:"img/volume.png",detalle:"Aca va texto explicativo",
				 f:k8s_volume_despliegue},
				{name:"Servicio",img:"img/service.png",detalle:"Aca va texto explicativo",
				 f:k8s_service_despliegue},
				{name:"Key",img:"img/key.png",detalle:"Aca va texto explicativo",f:null}
			]},
		{type:'submenu',name:'Base de datos',img:'img/database.png',submenu:[
			{ name: 'MS SQL',
			  img: 'img/db_mssql.png',
			  click: null
			},
			{ name: 'Postgress',
			  img: 'img/db_postgress.png',
			  click: null
			},
			{ name: 'MariaDB',
			  img: 'img/db_mysql.png',
			  click: null
			},
			{ name: 'MongoDB',
			  img: 'img/db_mongodb.png',
			  click: null
			},
			{ name: 'Time Scale DB',
			  img: 'img/db_timescaledb.png',
			  click: null
			},
			{ name: 'RedisDB',
			  img: 'img/db_redis.png',
			  click: null
			}
		],addData: null},
		{type:'submenu',name:'IoT',img:'img/iot.png',submenu:[],addData: null},
		{type:'submenu',name:'Block Chain',img:'img/blockchain.png',submenu:[],addData: null}])

	$(".contenido").empty()

	menu_agregar = new MenuAgregar
	popup = new PopUp

	$(document).keyup(function(event){
		if(event.keyCode == 27)
			menu_agregar.contraer(null)
	})

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
/*
function armarListado(padre,columnas,data,onclick,onclickid,colores,anchos,ord_col,ord_dir){
 * padre: contenedor de la lista
 * columnas: array de nombre de columnas. Debe coincidir con las columnas en data
 * data: los datos a mostrar
 * onclick: funcion a ejecutar al hacer click
 * onclickid: columna de data que se pasa como parametro a la funcion de onclick
 * colores: color de fondo de cada fila. Debe coincidir con la cantidad de filas de data
 * anchos: array de anchos con sufijo 'px'. ej: '100px'. Uno por cada columna en data
 * ord_col: nombre de la columna de data por la que se ordena
 * ord_dir: direccion del ordenamiento [ 1 | 0 ]
 
	var idlista = azar()
	var classOscuro = '';

	alert("Entro en este\n")
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
*/

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
	$("#main_submenu").height($(window).height() - 50)
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
