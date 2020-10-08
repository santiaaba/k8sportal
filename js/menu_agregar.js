class MenuAgregar{
	constructor(button){
		/* Button e el boton que al presionar dispara este menu */

		this.items = new Array
		this.contraido = true

		$("body").append("<div id='menu_agregar' class='menu_agregar'>" +
						 "<div id='menu_agregar_items' class='menu_agregar_items'></div>" +
						 "<div id='menu_agregar_detalle' class='menu_agregar_detalle'></div>" +
						 "<div id='menu_agregar_formulario' class='menu_agregar_formulario'></div></div>")
	}

	asignarBoton(button){
		/* Asigna el despliegue del menu para ese boton */
		$("#"+button).on('click',this.desplegar())
	}

	cargar(data){
		/* Arma el menu. El parametro data es un arrya donde cada elemento posee
 		 * los siguientes datos:
 		 * {
 		 * name:	"Nombre a mostrar"
 		 * img:		"Imagen a mostrar"
		 * detalle: 'detalle a mostrar'
		 * f: 'funcion que generara el contenido en "menu_agregar_formulario". El primer
		 * 		parmetro a aceptar por esta funcin debe ser un parent donde especificar el
		 * 		"menu_agregar_formulario"
 		 * }
 		 */
		this.items = []
		data.forEach(function(v){
			this.items.push(v)
		},this)
	}

	borrar(){
		/* Borra todos los items del menu */
		this.items = []
	}

	desplegar(){
		/* Despliega el menu de agregar */
		var items = this.items
		if(this.contraido){
			this.contraido = false
			$("#menu_agregar").animate({
				width:'100%',
				height:'100%'
			},400,function(){
				items.forEach(function(v){
					var id = azar()
					$("#menu_agregar_items")
					.append("<div id='" + id + "' class='menu_agregar_item'><img src='" + v.img +
							"'><div>" + v.name + "</div></div>")
					$("#"+ id).hover(
						function(){
							$("#menu_agregar_detalle").append(v.detalle)
							$("#"+id).css("background-color","#1e165b")
						},
						function(){
							$("#menu_agregar_detalle").empty()
							$("#"+id).css("background-color","")
						})
					$("#"+id).on('click',function(){
						$(".menu_agregar_item").unbind();
						$("#"+id).css("background-color","")
						$("#menu_agregar_items").children().not("#"+id)
							.animate({opacity:'0'},500,function(){
								$("#menu_agregar_items").children().not("#"+id)
									.animate({height:'0',margin:'0',padding:'0'},500,function(){
										this.remove()
									})
							})
						$("#menu_agregar_detalle").empty()
						$("#menu_agregar_detalle").css("padding","0px")
						$("#menu_agregar_formulario").animate({width:'100%'},400,
						function(){
							if(v.f != null)
								v.f("menu_agregar_formulario")
						})
					})
				})
			})
		}
	}

	contraer(f){
		/* Contrae el menu de agregar */
		/* el parametro f es la funcion a ejecutar luego de cerrar el menu. Puede ser null */
		$("#menu_agregar_formulario").empty()
		if(!this.contraido){
			this.contraido = true
			$("#menu_agregar_items").empty()
			$("#menu_agregar").animate({
				width:'0px',
				height:'0px'
			},400,function(){
				$("#menu_agregar_formulario").css("width",0)
				$("#menu_agregar_detalle").css("padding","40px")
				if(f != null)
					f()
			})
		}
	}
}
