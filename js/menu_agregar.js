class MenuAgregar{
	constructor(button){
		/* Button e el boton que al presionar dispara este menu */

		this.items = new Array

		$("body").append("<div id='menu_agregar' class='menu_agregar'></div>")

		$(document).keyup(function(event){
			if(event.keyCode == 27){
				this.contraer()
			}
		})
	}

	asignarBoton(button){
		/* Asigna el despliegue del menu para ese boton */
		$("#"+button).on('click',this.desplegar())
	}

	add(data){
		/* Agrega al menu un boton para agregar */
		/* data posee la siguiente estructura:
 			{
				name: 'nombre a mostrar'
				icon: 'icono a mostrar'
				detalle: 'detalle a mostrar'
				f: 'funcion a aplicar al seleccionar'
			}
		*/
		this.items.push(data)

	}
	borrar(){
		/* Borra todos los items del menu */
		this.items = []
	}
	desplegar(){
		/* Despliega el menu de agregar */
		$("#menu_agregar").animate({
			width:'100%',
			height:'100%'
		},400)
	}
	contraer(){
		/* Contrae el menu de agregar */
		$("#menu_agregar").animate({
			width:'0px',
			height:'0px'
		},400)
	}
	desplegar_form(){
		/* Despliega el formulario una vez
		   seleccionado lo que se desea agregar */
	}
	contraer_form(){
	}
	render(){
		/* Dibuja el menu */
	}
}
