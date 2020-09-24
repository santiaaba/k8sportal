var main_menu_selected = null

function main_menu_make(parent,data){
/* parent es el id del elemento donde generar el menu
 *
 * data es una ilista json con los siguientes
 * datos en elemento a mostrar en el menu
 *
 * {
 *   type: [submenu,section]
 * 	 name: <nombre del elemento>,
 *   img: <path del img>,
 *   section: <seccion a la cual ingresar>
 *   submenu: <submenu a presentar al realizar click>
 * }
 *
 * donde type determina la accion de presionar en ese item del menu:
 * submenu: Despliega un submenu. Debe existir entonces el atributo sbmenu
 *          que no es otra cosa que una estructura recusiva
 * section: funcion a invocar que presenta la seccion en la parte de la derecha
 *
 */

	var idmenu = azar()
	$('#'+parent).append("<div id='main_menu' class='main_menu'></div>")
	$('#main_menu').append("<div id='main_submenu' class='main_menu_submenu'></submenu>")
	data.forEach(function(v){
		var id = azar()
		$('#main_menu')
		.append("<div id='" + id + "' class='main_menu_item'><img src='" + v.img + "'><div>" + v.name + "</div></div>")
		switch(v.type){
			case 'submenu':
				$("#" + id).on("click",function(){ main_submenu_make(id,v.submenu,v.addButton)})
				break;
			case 'section':
				break;
			default:
				alert("error")
		}
	})	
}

function main_submenu_make(id,data,addButton){
	/* Anima el submenu para que aparezca y armar el mismo */
	/* data es una estructura array donde cada elemento posee:
	 * {
	 * type: "De mo mento no se utiliza. Todos son subumenus"
	 * img: "Imagen a mostrar"
	 * name: Nombre a mostrar"
	 * click: "Accion al realizar click"
	 * }
	 * addButon es una funcion para  agregar un botone que puede o no aparecer al final del menu. 
	 */

	if($("#main_submenu").css("width") == "0px"){
		$("#" + id).css("background-color","#1e165b")
		$("#main_submenu").animate({
			left: 50,
			width: 150
		},500,function(){
			main_menu_selected = id
			data.forEach(function(v){
				var id = azar()
				$("#main_submenu")
				.append("<div id='" + id + "' class='main_submenu_item'>" +
						"<img src='" + v.img + "'><span>" + v.name + "</span></div>")
				$("#"+id).on('click',v.click)
			})
			if(addButton != null){
				$("#main_submenu").append("<div id='addButton' class='addButton'><img src='img/addButton.png'></div>")
				$('#addButton').on('click',function(){
					menu_agregar.asignarBoton(addButton)
					menu_agregar.desplegar()
				})
			}
		})
	} else {
		$("#main_submenu").empty()
		$("#main_submenu").animate({
			left: 200,
			width: 0
		},500,function(){
			$("#" + main_menu_selected).css("background-color","")
			if(id != main_menu_selected){
				main_submenu_make(id,data)
			}
		})
	}
}
