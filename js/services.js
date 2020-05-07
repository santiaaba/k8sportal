function service_sections(idNamespace,name){
	/* Genera las solapas */
	solapa_make('#wrp_play',[
		{name:'Estado',
		 f:service_status,
		 p:[idNamespace,name]}],'100%')
}

function service_status(parent,idNamespace,name){
	//alert('/v1/app/namespace/' + idNamespace + '/service/' + name)
	ajax_GET('/v1/app/namespace/' + idNamespace + '/service/' + name)
	.then(data => {
		printTitle(parent,"Detalle")
		printText(parent,"Nombre",data.metadata.name)
		printText(parent,"Namespace","A BUSCAR")
		printText(parent,"Fecha creaci&oacute;n",data.metadata.creationTimestamp)
		if(typeof(data.spec.clusterIP) != 'undefined'){
			tipo = "servicio Interno"
			ip = data.spec.clusterIP
		} else {
			tipo = "servicio Externo"
			ip = "DETERMINAR"	/* Hay que obtenerla del firewall */
		}
		printText(parent,"Tipo",tipo)
		printText(parent,"IP",ip)
		printTitle(parent,"Puertos")
		var c=[ {name:'Nombre',width:'100px'},
				{name:'protocolo',width:'100px'},
				{name:'puerto',width:'100px'} ]
		var a = new Array
		$.each(data.spec.ports,function(i,v){
			a.push([ v.name, v.protocol, v.port])
		})
		printStaticTable(parent,c,a)

	})
	.catch(err=> {
		alert(JSON.stringify(err))
	})
}

function service_list(){
	return new Promise((resolv,reject)=>{
		var services = new Array
		ajax_GET('/v1/app/namespace')
		.then(data=>{
			data.forEach(e => {
				$.ajax({
					method: 'GET',
					cache: false,
					headers:{ "token":userToken},
					url: apiserver + '/v1/app/namespace/' + e.id + '/service',
					dataType: 'json',
					async: false,
					contentType: 'application/json',
					success: function(data){	
						data.items.forEach( s => {
							//alert(JSON.stringify(s))
							var service = {
								idNamespace:e.id,
								name:s.metadata.name,
								namespace:s.metadata.namespace}
							//alert(JSON.stringify(service))
							services.push(service)
						})
					},
					error: function(jqXHR,textStatus,errorThrown){
						reject(jqXHR)
					}
				})
			})
			resolv(services)
		})
		.catch(err=>{
			alert(JSON.stringify(err))
		})
	})
}
