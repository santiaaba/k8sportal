class ActionBar{
	constructor(parent){
		//alert("Asignando parent " + parent)
		this.buttons = new Array
		this.parent = parent
		this.id = azar()
	}

	add(id,name,icon,position,f){
		/* Agrega o reemplaza un boton por su nombre */
		
		var index = -1
		this.buttons.forEach(function(v,i){
			if(v.id == id)
				index = i
		})
		if(index != -1)
			this.buttons.splice(index,1)
		this.buttons.push({id:id,name:name,icon:icon,position:position,f:f})
	}

	remove(id){
		/* Elimina el boton por su identificador */
		this.buttons = this.buttons.filter(function(item){
			return item.id != id
		})
	}

	clean(){
		this.buttons = []
	}

	render(){
		var bar_id = this.id
		$("#" + this.parent)
		.empty()
		.append("<div id='" + this.id + "' class='actionBar'></div>")
		this.buttons.sort((a, b) => (a.position > b.position) ? 1 : -1)
		this.buttons.forEach(function(v){
			//alert("Agregando boton en ")
			$("#" + bar_id).append("<div id='" + v.id + "'><img src='"+ v.icon +"'></div>")
			$("#" + v.id).on('click',function(){
				v.f()
			})
		})
	}
}
