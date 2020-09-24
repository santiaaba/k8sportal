function service_sections(idNamespace,name){
	/* Genera las solapas */
	solapa_make('#wrp_play',
		[{name:'Estado', f:service_status, p:[idNamespace,name]},
		{name:'Despliegue', f:service_despliegue, p:[idNamespace,name]},
		{name:'Estadisticas', f:service_statistics, p:[idNamespace,name]}])
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
							var service = {
								idNamespace:e.id,
								name:s.metadata.name,
								namespace:s.metadata.namespace}
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

function service_apply(alta){
	/* Armamos el json */
	data = {name: $("#serviceName").val(),
			target: $("#deployName").val()}
	$("[service]").each(function(){
		var id = $(this).attr('id')
		data.type = $("#type_" + id).val()

		if(data.type == 'url'){
			var a='urls'
			data.urls = []
		} else {
			var a='ports'
			data.ports = []
		}
		$(this).find("[" + a + "]").each(function(){
			var linea='{'
			$(this).find(":input").each(function(){
				if($(this).attr('name'))
					linea += '"' + $(this).attr('name') + '":"' + $(this).val() + '",'
			})
			linea = linea.slice(0, -1) + '}'
			if(data.type == 'url')
           		data.urls.push(JSON.parse(linea))
			else
           		data.ports.push(JSON.parse(linea))
		})
	})
	alert(JSON.stringify(data))
	ajax_POST('/v1/app/namespace/' + $("#idNamespace").val() + '/service/',data)
	.then(ok =>{
		alert(JSON.stringify(ok))
	})
	.catch(err =>{
		alert(JSON.stringify(err))
	})
}

function service_despliegue(parent,idNamespace,name){
	function change_deployments(select){
		var p_deploy = ajax_GET('/v1/app/namespace/' + $(select).val() + '/deployment' )
		p_deploy.then(ok=>{
			var options = ''
			ok.items.forEach(function(v,i){
				options += '<option value="' + v.metadata.name + '">' + v.metadata.name + ' </option>'
			})
			$("#deployName").empty()
			$("#deployName").append(options)
		},err=>{
			alert("Error al querer obtener los deployments")
		})
	}

	var alta
	$(parent).empty()
	var a = "<div id='section' class='flex col uno overflow-y'>" +
			"<div id='vs1' class='flex col padding_not_r'></div>" +
			"<div id='vs2' class='flex col padding_not_r'></div></div>"
	if(idNamespace != null){
		/* Es una modificacion */
		a += "<div id='actions' class='actions'></div>"
		$(parent).append(a)
	} else {
		/* Es un alta */
		a += "<div style='text-align: center;'>" +
			 "<button id='nuevoService' class='alta_button'>Agregar</button></div>"
		$(parent).append(a)
		$("#nuevoService").on('click',function(){
			alert("Agregamos un Servicio")
			service_apply()
		})
	}
	var promise
	if(idNamespace != null){
		alta = false
		/* Es una modificacion */
		actions_make('#actions',[
			{name:'Apli',action:service_apply},
			{name:'Elim',action:service_delete}])
		promise = ajax_GET('/v1/app/namespace/' + idNamespace + '/service/' + name )
	} else {
		alta = true
		/* Es un alta. No hay servicio que buscar */
		promise = new Promise((resolv,reject)=>{ resolv(null) })
	}
	promise.then(data=>{
		if(!alta){
			/* Si es una edicion */
			printText('#vs1',"Nombre del servicio",'serviceName',data.name)
			printText('#vs1',"Namespace",'idNamespace',data.namespace)
			$("#vs1").append("<input type='hidden' id='idNamespace' value='" + idNamespace + "'>")
			$("#vs1").append("<input type='hidden' id='deployName' value='" +
							 data.target + "'>")
		} else {
			/* Si es un alta */
			var promise_n = ajax_GET('/v1/app/namespace')
			promise_n.then(ok=>{
				var options = []
				ok.forEach(function(v,i){
					options.push({name:v.name,value:v.id})
				})
				printInput('#vs1',"Nombre del servicio",'serviceName','')
				printSelect('#vs1',"Namespace",'idNamespace',options,change_deployments)
				printSelect('#vs1',"Despliegue",'deployName',[],null)
			},err=>{
				alert("Error al querer obtener los namespaces")
			})
		}
		var selectOptions = [
			{name:'url',value:'url'},
			{name:'Interno',value:'in'},
			{name:'Externo',value:'out'}]

		printList("#vs2",'Servicios',"service",[
          	{name:'type',label:'tipo',length:100,type:'select',
           		options:[   {value:"in",label:"interna"},
                        	{value:"out",label:"externa"},
                        	{value:"url",label:"URL"}]},
            {name:'ip',label:'ip',length:60,type:'input',selectName:'type',option:'out'},
            {name:'ports',label:'ports',length:60,type:'list',selectName:'type',option:'in',
           		data:[  {name:'name',label:'nombre',length:60,type:'input'},
                	    {name:'protocol',label:'protocol',length:60, type:'select',options:[
                            {label:"tcp",value:"TCP"},
                            {label:"udp",value:"UDP"}]},
                     	{name:'port',label:'puerto',length:60,type:'input'}]},
            {name:'ports',label:'ports',length:60,type:'list',selectName:'type',option:'out',
            	data:[  {name:'name',label:'nombre',length:60,type:'input'},
                    	{name:'protocol',label:'protocol',length:60,type:'select',options:[
                        	{label:"tcp",value:"TCP"},
                        	{label:"udp",value:"UDP"}]},
                    	{name:'port',label:'puerto',length:100,type:'input'}]},
			{name:'urls',label:'url',length:150,type:'list',selectName:'type',option:'url',
                data:[  {name:'url',label:'',length:200,type:'input'},
                        {name:'path',label:'',length:200,type:'input'},
                        {name:'port',label:'',length:200,type:'select',
                             options:[	 {value:"80", label:"http"},
                                		 {value:"443", label:"https"} ]} ]
            }], data,true)
	},err=>{
		alert("Error al generar el formulario")
		alert(JSON.stringify(err))
	})
}

function service_status(){
	alert("Implementar")
}
function service_delete(){
	alert("Implementar")
}

function service_statistics(){
	alert("Implementar")
}
