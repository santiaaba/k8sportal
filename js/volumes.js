function volume_sections(idNamespace,name){
	/* Genera las solapas  */
	solapa_make('#wrp_play',
		[{name:'Estado', f:volume_status, p:[idNamespace,name]},
		{name:'Estadisticas', f:volume_statistics, p:[idNamespace,name]}])
}

function volume_list(container){
	return new Promise((resolv,reject)=>{
		var pvcs = new Array
		ajax_GET('/v1/app/namespace')
		.then(data=>{
			data.forEach(e => {
				$.ajax({
					method: 'GET',
					cache: false,
					headers:{ "token":userToken},
					url: apiserver + '/v1/app/namespace/' + e.id + '/volume',
					dataType: 'json',
					async: false,
					contentType: 'application/json',
					success: function(data){
						data.items.forEach( s => {
							var pvc = {
								idNamespace:e.id,
								name:s.metadata.name,
								namespace:s.metadata.namespace}
							pvcs.push(pvc)
						})
					},
					error: function(jqXHR,textStatus,errorThrown){
						alert(JSON.stringify(jqXHR))
						reject(jqXHR)
					}
				})
			})
			resolv(pvcs)
		})
		.catch(err=>{
			alert(err)
			alert(JSON.stringify(err))
		})
	})
}

function volume_status(parent,idNamespace,name){
	$(parent).empty()
	$(parent).append("<div id='vs1' class='flex col uno'></div>")
	ajax_GET('/v1/app/namespace/' + idNamespace + '/volume/' + name)
	.then((data)=> {
		printTitle("#vs1","Detalle")
		printText("#vs1","Nombre",azar(),data.metadata.name)
		printText("#vs1","Namespace",azar(),data.metadata.namespace)
		printText("#vs1","Fecha Creaci&oacute;n",azar(),data.metadata.creationTimestamp)
		printText("#vs1","Clase",azar(),data.spec.storageClassName)
		printText("#vs1","Tipo",azar(),data.spec.volumeMode)
		printText("#vs1","Modo",azar(),data.spec.accessModes[0])
		printText("#vs1","Capacidad",azar(),data.spec.resources.requests.storage)
	})
}

function volume_statistics(parent,idNamespace,name){
	alert("Implementar")
}
