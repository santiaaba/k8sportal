function secret_sections(idNamespace,name){
	/* Genera las solapas  */
	solapa_make('#wrp_play',
		[{name:'Estado', f:secret_despliegue, p:[idNamespace,name]},
		{name:'Estadisticas', f:secret_statistics, p:[idNamespace,name]}])
}

function secret_list(container){
	return new Promise((resolv,reject)=>{
		var secrets = new Array
		ajax_GET('/v1/app/namespace')
		.then(data=>{
			data.forEach(e => {
				$.ajax({
					method: 'GET',
					cache: false,
					headers:{ "token":userToken},
					url: apiserver + '/v1/app/namespace/' + e.id + '/secret',
					dataType: 'json',
					async: false,
					contentType: 'application/json',
					success: function(data){
						data.items.forEach( s => {
							var secret = {
								idNamespace:e.id,
								name:s.metadata.name,
								namespace:s.metadata.namespace}
							secrets.push(secret)
						})
					},
					error: function(jqXHR,textStatus,errorThrown){
						alert(JSON.stringify(jqXHR))
						reject(jqXHR)
					}
				})
			})
			resolv(secrets)
		})
		.catch(err=>{
			alert(err)
			alert(JSON.stringify(err))
		})
	})
}

function secret_despliegue(parent,idNamespace,name){
	/* Permite editar los datos de un secret */
	//alert("Entro")
	$(parent).empty()
	var a = "<div id='section' class='flex col uno overflow-y'>" +
			"<div id='vs1' class='flex col uno padding'></div></div>"
	if(idNamespace != null){
		a += "<div id='actions' class='actions'></div>"
		$(parent).append(a)
	} else {
		a += "<div style='text-align: center;'>" +
			 "<button id='nuevoSecret' class='alta_button'>Agregar</button></div>"
		$(parent).append(a)
		$("#nuevoSecret").on('click',function(){
			secret_apply()
			//alert("Agregamos un Secret")
		})
	}
	var promise
	if(idNamespace != null){
		/* Es una modificacion */
		actions_make('#actions',[
				{name:'Apli',action:secret_apply},
				{name:'Elim',action:secret_delete}])
		promise = ajax_GET('/v1/app/namespace/' + idNamespace + '/secret/' + name )
	} else {
		/* Es un alta */
		data={}
		printInput('#vs1',"Namespace",'idNamespace','')
		promise = new Promise((resolv,reject)=> { resolv(data)})
	}
	promise.then(data => {
		//alert(JSON.stringify(data))
		if(idNamespace != null){
			$(parent).append("<input type='hidden' id='idNamespace' value='" + idNamespace + "'>")
			printText('#vs1',"Nombre",'secretName',data.metadata.name)
		} else {
			printInput('#vs1',"Nombre",'secretName','')
		}
		printAttibutes('#vs1','Secrets',"data",data.data)
	},err=>{
		alert(err)
		alert(JSON.stringify(err))
	})
	
}

function secret_apply(){
	data = {name:$("#secretName").val(),data:[]}

	$("[data]").each(function(){
		var linea='{'
		$(this).find(":input").each(function(){
			if($(this).attr('name'))
				linea += '"name":"' + $(this).val() + '",' + 
						 '"value":"' + $('#value_' + $(this).attr('name')).val() + '",'
		})
		linea = linea.slice(0, -1) + '}'
		//alert(linea)
		data.data.push(JSON.parse(linea))
	})

	//alert("Enviando datos: " + JSON.stringify(data))
	ajax_POST('/v1/app/namespace/' + $("#idNamespace").val() + '/secret/',data)
	.then(ok =>{
		//alert(JSON.stringify(ok))
	})
	.catch(err =>{
		alert(JSON.stringify(err))
	})
}

function secret_statistics(parent,idNamespace,name){
	alert("Implementar")
}

function secret_delete(){
	alert("Implementar")
}
