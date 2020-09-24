function make_menu(parent,home,elementName,items){
	/* home:			funcion que regresa al home
     * elementName		Nombre del elemento al que le aplica el menu
     * items			Items del menu. Array donde cada elemento posee:
     * 		title:		titulo del item del menu
     * 		f:			funcion resultante de hacer click en el item
     * 		default:	Debe estar solo en uno. El item por defecto que se activa. Valor sin importancia
     */

	$('#' + parent).append('<div id="menu" class="menu"></div>')
	/* Ir al home */
	$("#menu").append("<div id='menu_home' class='menu_home'><img src='img/home.png'></div>")
	$("#menu_home").on('click',home)
	/* Nombre del elemento seleccionado */
	$("#menu").append("<div class='menu_element'>" + elementName + "</div>")
	items.forEach(function(value){
		var id = azar()
		$("#menu").append("<div id='" + id + "' class='menu_item'>" + value.title + "</div>")
		$("#" + id).on('click',function(){
			$(".menu_item").removeClass("menu_select");
			$("#" + id).addClass("menu_select");
			value.f()
		})
		if(typeof(value.default) != 'undefined'){
			$("#" + id).addClass("menu_select");
			value.f()
		}
	})
}
