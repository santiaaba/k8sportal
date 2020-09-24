function namespace_list(){
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

function namespace_sections(id){
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
				 p:[id,data.metadata.name]}])
		},
		error: function(jqXHR,textStatus,errorThrown){
			alert(JSON.stringify(jqXHR))
		}
	})
}

function namespace_sumary(id,parent){
	ajax_GET('/v1/app/namespace/' + id)
	.then(data => {
		$(parent).append("<div><div>Deployments</div><div>" +
						data.summary.deployments + "</div></div>")
		$(parent).append("<div><div>Servicios</div><div>" +
						data.summary.services + "</div></div>")
		$(parent).append("<div><div>Volumenes</div><div>" +
						data.summary.pvcs + "</div></div>")
	})
	.catch(err => {
		alert(JSON.stringify(err))
	})
}

function namespace_statistics(parent,id,name){
	/* muestra estadisticas del namespace. El parametro
	   parent es el body de la solapa  */
	$(parent).append("<div class='flex row'>" +
					 	"<div class='flex col'>" +
							"<div id='e_cpu'></div>" +
					 		"<div id='e_ram'></div>" +
						"</div>" +
					 "</div><div id='n_summary'></div>")

	/* Detalle de elementos en el namespace */
	namespace_sumary(id,'#n_summary')

	/* Para las estadisticas */
	var now = Date.now() / 1000
	var before = now - 86400
	chart_get_data(	"e_cpu", before, now,
					'sum (container_cpu_usage_seconds_total{namespace="' + name + '"})')
	chart_get_data(	"e_ram", before, now,
					'sum(container_memory_max_usage_bytes{namespace="' + name + '"})')
}
