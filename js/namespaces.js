function namespace_data(){
	return new Promise((resolv,reject)=>{
		$.ajax({
			method: 'GET',
			cache: false,
			headers:{ "token":userToken},
			url: apiserver + '/v1/app/namespace',
			dataType: 'json',
			contentType: 'application/json',
			success: function(data){	
				resolv(data)
			},
			error: function(jqXHR,textStatus,errorThrown){
				reject(jqXHR)
			}
		})
	})
}

function namespace_show(id){
	$.ajax({
		method: 'GET',
		cache: false,
		headers:{ "token":userToken},
		url: apiserver + '/v1/app/namespace/' + id,
		dataType: 'json',
		contentType: 'application/json',
		success: function(data){
			solapa_make('#wrp_play',[
				{name:'Estadisticas',
				 f:namespace_statistics,
				 p:[id]},
				{name:'Despliegues',
				 f:namespace_statistics,
				 p:[id]},
				{name:'Volumenes',
				 f:namespace_statistics,
				 p:[id]},
				{name:'Enlatados',
				 f:namespace_statistics,
				 p:[id]}])
		},
		error: function(jqXHR,textStatus,errorThrown){
			alert(JSON.stringify(jqXHR))
		}
	})
}

function namespace_statistics(parent,id){
	/* muestra estadisticas del namespace */
}

function namespace_services(parent,id){
	/* Lista los servicios del namespace */
}

function namespace_deployments(parent,id){
	/* Lista los deployments del namespace */
}

function namespace_volumes(parent,id){
	/* Lista los volumenes del namespace */
}

function namespace_cans(parent,id){
	/* Muestra los enlatados del namespace */
}
