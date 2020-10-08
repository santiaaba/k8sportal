class PopUp{
	constructor(){
		$("body").append("<div id='popup_velo' class='popup_velo'></div>")
		$("body").append("<div id='popup' class='popup'><div id='popup_content' class='popup_content'></div>" +
						 "<div id='popup_buttons' class='popup_buttons'></div></div>")
	}

	up(type,message,base,altura,f,params){
		function down(){
			$("#popup").css('display','none')
			$("#popup_velo").css('display','none')
			$("#popup_buttons").empty()
			$("#popup_content").empty()
		}
		$("#popup_buttons").empty()
		$("#popup_content").empty()
		.append(message)
		$("#popup").css('width',base)
		$("#popup").css('height',altura)
		var id = 0
		switch(type){
			case 'info':
			case 'error':
				id = azar()
				$("#popup_buttons").append("<button id='" + id + "'>Cerrar</button>")
				$("#" + id).on('click',down)
				break
			case 'confirm':
				id = azar()
				$("#popup_buttons").append("<button id='" + id + "'>Aceptar</button>")
				$("#" + id).on('click',function(){
					down()
					f(params)
				})
				id = azar()
				$("#popup_buttons").append("<button id='" + id + "'>Cancelar</button>")
				$("#" + id).on('click',down)
				break
		}
		$("#popup").css('display','flex')
		$("#popup_velo").css('display','block')
	}
}
