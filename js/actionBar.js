class ActionBar{
	constructor(parent){
		//alert("Asignando parent " + parent)
		this.buttons = new Array
		this.parent = parent
		this.id = azar()
	}

	add(name,icon,position,f){
		/* Agrega o reemplaza un boton por su nombre */
		
		var index = -1
		this.buttons.forEach(function(v,i){
			if(v.name == name)
				index = i
		})
		if(index != -1)
			this.buttons.splice(index,1)
		this.buttons.push({name:name,icon:icon,position:position,f:f})
		this.buttons.sort((a, b) => (a.color > b.color) ? 1 : -1)
	}

	delete(){
		/* Elimina el boton por su nombre */
	}

	clean(){
		this.buttons = []
	}

	render(){
		var bar_id = this.id
		$("#" + this.parent)
		.empty()
		.append("<div id='" + this.id + "' class='actionBar'></div>")
		this.buttons.forEach(function(v){
			//alert("Agregando boton en ")
			var id = azar()
			$("#" + bar_id).append("<div id='" + id + "'><img src='"+ v.icon +"'></div>")
			$("#"+id).on('click',function(){
				v.f()
			})
		})
	}
}
