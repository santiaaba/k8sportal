/* ------------------- Deployments -----------------------*/

function k8s_make_agregar(button){
	/* Arma el menu y sus respectivos formularios de agregar
	 * componentes de kubernetes. El parametro button
	 * es la referencia al boton que lo despliega */
	alert('hola mundo agregar')
}

function k8s_deployments(parent){
	$("#" + parent).empty()
	var id = azar()
	var s5 = printSection(parent,'data','col','uno',{id:id,flex:'col',children:[]})
	k8s_deployment_list(id)
}

function k8s_deployment_list(parent){
	var a = new Promise((resolv,reject)=>{
		var deployments = new Array
		ajax_GET('/v1/app/namespace')
		.then(data=>{
			data.forEach(e => {
				$.ajax({
					method: 'GET',
					cache: false,
					headers:{ "token":userToken},
					url: apiserver + '/v1/app/namespace/' + e.id + '/deployment',
					dataType: 'json',
					async: false,
					contentType: 'application/json',
					success: function(data){
						data.items.forEach( s => {
							var deploy = {
								idNamespace:e.id,
								name:s.metadata.name,
								namespace:s.metadata.namespace}
							deployments.push(deploy)
						})
					},
					error: function(jqXHR,textStatus,errorThrown){
						reject(jqXHR)
					}
				})
			})
			resolv(deployments)
		})
		.catch(err=>{
			alert(JSON.stringify(err))
		})
	})
	.then(data => {
		armarListado(parent,[{nombre:'Nombre',dato:'name',tipo:'string',width:200},
							 {nombre:'Namespace',dato:'namespace',tipo:'string',width:200}
							 ],data,k8s_deployment,['idNamespace','name'],'name',true)
	})
	.catch(err => {
		alert(JSON.stringify(err))
	})
}

function k8s_deployment(params){
	/* params es una estructura con dos valores: idNamespace y name */
	$("#content").empty()
	.append("<div id='content_menu' class='content_menu'>" +
			"</div><div id='content_data' class='content_data'></div>" +
			"</div><div id='content_action' class='content_action'></div>")
	make_menu('content_menu',function(){k8s_deployments('content')},params.name,[
		{title:'Estado',f:function(){k8s_deployment_status('content_data',params)},default:'yes'},
		{title:'Despliegue',f:function(){k8s_deployment_despliegue('content_data',params)}},
		{title:'Pods',f:function(){k8s_deployment_pods('content_data',params)}},
		{title:'Estadisticas',f:null}
	])
	actionBar = new ActionBar('content_action')
	actionBar.add('Eliminar','img/delete.png',2,function(){alert("Eliminar")})
	actionBar.render()
}

function infoPod(params){
	$("#pod_info").empty()
	$("#pod_conditions").empty()
	$("#pod_containers").empty()
	$("#pod_events").empty()

	/* Info del POD */
	printText('pod_info',"Creado",azar(),podData[params.name].metadata.creationTimestamp)
	printText('pod_info',"Face",azar(),podData[params.name].status.phase)
	printText('pod_info',"Fecha inicio",azar(),podData[params.name].status.startTime)

	/* Condiciones POD */
	var columnas = [{name:'Nombre',width:'100px'},
				   {name:'Estado',width:'100px'},
				   {name:'Razon',width:'100px'},
				   {name:'Mensaje',width:'300px'}]
	lineas = []
	podData[params.name].status.conditions.forEach(function(v,i){
		var linea = new Array
		linea.push(v.type)
		linea.push(v.status)
		if (typeof(v.reason) != 'undefined')
			linea.push(v.reason)
		else
			linea.push('-')
		if (typeof(v.message) != 'undefined')
			linea.push(v.message)
		else
			linea.push('-')
		lineas.push(linea)
	})
	printTableSimple('pod_conditions',columnas,lineas)

	/* Containers */
	podData[params.name].status.containerStatuses.forEach(function(v){
		id = azar()
		var state = Object.keys(v.state)[0]
		//alert(JSON.stringify(v))
		printTitle('pod_containers',v.name)
		printText('pod_containers',"Estado",azar(),state)
		printText('pod_containers',"Imagen",azar(),v.image)
		if(typeof(v.state[state].reason) != 'undefined'){
			printText('pod_containers',"Motivo",azar(),v.state[state].reason)
			printText('pod_containers',"Mensaje",azar(),v.state[state].message)
		}
		var lastState = Object.keys(v.lastState)
		if(typeof(lastState[0]) != 'undefined'){
			printText('pod_containers',"Ultimo Estado",azar(),lastState)
			printText('pod_containers',"Motivo",azar(),v.lastState[lastState].reason)
			printText('pod_containers',"Mensaje",azar(),v.lastState[lastState].message)
		}
	})

	/* Eventos */
	var columnas = [{name:'Tipo',width:'100px'},
				   {name:'Motivo',width:'100px'},
				   {name:'Edad',width:'100px'},
				   {name:'Origen',width:'100px'},
				   {name:'Mensaje',width:'300px'}]
	var lineas = []
//	alert(JSON.stringify(podData[params.name].events))
	podData[params.name].events.forEach(function(v,i){
		var linea = new Array
		linea.push(v.type)
		linea.push(v.reason)
		linea.push(v.deprecatedFirstTimestamp)
		linea.push(v.deprecatedSource.component)
		linea.push(v.note)
		lineas.push(linea)
	})
//	alert(JSON.stringify(lineas))
	printTableSimple('pod_events',columnas,lineas)

}

function k8s_deployment_despliegue(parent,params){
   /* Se utiliza tanto para las antas como para las
 *	  * modificaciones de los despliegues */
	$("#" + parent).empty()
	var s1 = printSection(parent,'skeletor','col','uno')
	var d1 = printSection(s1,'data','col','uno',{id:'pod_conf',flex:'col',children:[]})
	var d1 = printSection(s1,'data','col','uno',{id:'pod_vol',flex:'col',children:[]})
	var d1 = printSection(s1,'data','col','uno',{id:'pod_containers',flex:'col',children:[]})

/*
	if(params.idNamespace != null){
		/* Es una modificacion 
		var a += "<div id='actions' class='actions'></div>"
		$(parent).append(a)
	} else {
		/* Es un alta 
		var a += "<div style='text-align: center;'>" +
			 "<button id='nuevoDeploy' class='alta_button'>Agregar</button></div>"
		$(parent).append(a)
		$("#nuevoDeploy").on('click',function(){
			alert("Agregamos un deploy")
		})
	}
*/
	var promise
	if(params.idNamespace != null){
		/* Es una modificacion */
	//	alert("Modificacion")
		/*
		actions_make('#actions',[
				{name:'Apli',action:deploy_apply},
				{name:'Elim',action:deploy_delete}])
		*/
		promise = ajax_GET('/v1/app/namespace/' + params.idNamespace + '/deployment/' + params.name )
	} else {
		/* Es un alta */
	//	alert("Alta")
		/* Debemos cargar con null algunos datos */
		/*
		data = {resources:{cpu:'1',mem:'10Mi'},replicas:'1',image:''}
		printInput('#vs1',"Namespace",'namespaceName','')
		*/
		promise = new Promise((resolv,reject)=> { resolv(data)})
	}
	promise.then(data=>{
	   if(params.idNamespace != null){
			$("#pod_conf").append("<input type='hidden' id='fibercorpID' value='" + data.fibercorpID + "'>")
			$("#pod_conf").append("<input type='hidden' id='idNamespace' value='" + params.idNamespace + "'>")
			printText("pod_conf","Nombre",'deployName',data.deployName)
			printText("pod_conf","Replicas",'replicas',data.replicas)
		} else {
			printInput("pod_conf","Nombre",'deployName','')
			printInput("pod_conf","Replicas",'replicas','')
		}

		printList("pod_vol",'Volumenes',"volumes",
					[{name:'name',label:'nombre',length:100,type:'input'},
					{name:'type',label:'tipo',length:100,type:'select',
					options:[   {value:'pvc',label:"pvc"},
								{value:'emptydir',label:"EmptyDir"},
								{value:'secret',label:"Secret"}
					]},
					{name:'pvc',label:'Nombre',length:180,type:'input',
					 selectName:'type',option:'pvc'},
					{name:'Secret',label:'Secret',length:60,type:'input',
					 selectName:'type',option:'secret'}],
					data.volumes,false)

		var montajes = [{name:'name',label:'Nombre Volumen',length:200,type:'input'},
						{name:'mountPath',label:'Punto de Montaje',length:200,type:'input'}]

		printList("pod_containers","Contenedores",'containers',
			[{name:'name',label:'Nombre',length:100,type:'input'},
			{name:'image',label:'Imagen',length:100,type:'input'},
	/*	  {name:'cpu',label:'Cpu',length:100,type:'input'},
 *				  {name:'mem',label:'Memoria',length:100,type:'input'}, */
			{name:'args',label:'Argumentos',type:'list',data:[
				{name:'arg',label:'',length:200,type:'input'}]},
			{name:'envs',label:'Variables de Entorno',type:'list',data:[
				{name:'name',label:'Nombre',length:200,type:'input'},
				{name:'type',label:'Tipo',length:100,type:'select', options:[
						{value:'text',label:'text'},
						{value:'secret',label:'secret'}]},
				{name:'key',label:'Key',length:100,type:'input',
					selectName:'type',option:'secret'},
				{name:'secret',label:'Secret',length:100,type:'input',
					selectName:'type',option:'secret'},
				{name:'value',label:'Valor',length:100,type:'input',
					selectName:'type',option:'text'}]},
			{name:'mounts',label:'Discos',type:'list',data:montajes},
			{name:'ports',label:'puertos',type:'list',data:[
				{name:'port',label:'Puerto',length:200,type:'input'},
				{name:'protocol',label:'Protocolo',length:200,type:'select', options:[
						{value:'TCP',label:'TCP'},
						{value:'UDP',label:'UDP'}]}
			]}], data.containers,false)
	})
	actionBar.add('Salvar','img/save.png',1,function(){alert("salvar " + params.idNamespace + " - " + params.name)})
	actionBar.render()
}

function k8s_deployment_pods(parent,params){
	/* Genera un listado de los pods que conforman el deployment.
	 * Presionando sobre cada elemento del listado genera informacion
 	 * espesifica de ese pod */
	$("#" + parent).empty()
	var s0 = printSection(parent,'skeletor','row','uno')
	var d0 = printSection(s0,'data','','uno',{id:'pod_list',flex:'col',children:[]})
	var s1 = printSection(s0,'skeletor','col','dos')
	var d1 = printSection(s1,'data','','uno',{id:'pod_info',flex:'col',children:[]})
	var d2 = printSection(s1,'data','','uno',{id:'pod_conditions',flex:'col',children:[]})
	var d3 = printSection(s1,'data','','uno',{id:'pod_containers',flex:'col',children:[]})
	var d4 = printSection(s1,'data','','uno',{id:'pod_events',flex:'col',children:[]})


	ajax_GET('/v1/app/namespace/' + params.idNamespace + '/deployment/' + params.name + '/pods')
	.then(ok=>{
		podData = new Array
		var datalist = new Array
		ok.items.forEach(function(v){
			podData[v.metadata.name] = v
			datalist.push({name:v.metadata.name})
		})
		armarListado(d0,[{nombre:'Nombre',dato:'name',tipo:'string',width:200}
							],datalist,infoPod,['name'],'name',true)
	})
}

function k8s_deployment_status(parent,params){
	$("#" + parent).empty()
	var s1 = printSection(parent,'skeletor','col','uno',null)
	var s2 = printSection(s1,'skeletor','row','uno',null)

	var id1 = azar()
	printSection(s2,'data','col','uno', {id:'deploy_detalle',flex:'col',children:[]})
	printSection(s2,'data','col','uno', {id:'deploy_estrategia',flex:'col',children:[]})
	printSection(s1,'data','col','uno',{id:'deploy_replicas',flex:'col',children:[]})
	printSection(s1,'data','col','uno',{id:'deploy_conditions',flex:'col',children:[]})

	//alert("los: " + params.name + " - " + params.idNamespace)
	ajax_GET('/v1/app/namespace/' + params.idNamespace + '/deployment/' + params.name + '/status')
	.then((data)=> {

	// Metadatos
		printTitle('deploy_detalle',"Detalle")
		printText('deploy_detalle',"Nombre",azar(),data.metadata.name)
		printText('deploy_detalle',"Namespace",azar(),data.metadata.namespace)
		printText('deploy_detalle',"Fecha Creaci&oacute;n",azar(),data.metadata.creationTimestamp)

	// Estrategia
		if(data.spec.strategy.type == 'RollingUpdate'){
			printText('deploy_estrategia',"Estrategia",azar(),'RollingUpdate: ' +
			data.spec.strategy.rollingUpdate.maxUnavailable +
				' max. no disponible / ' +
				data.spec.strategy.rollingUpdate.maxSurge +
				' max. pico')
		}

	// Estado de las replicas
		printTitle('deploy_replicas',"Replicas")
		var c=[ {name:'solicitadas',width:'100px'},
				{name:'act.',width:'100px'},
				{name:'disp.',width:'100px'},
				{name:'no disp.',width:'100px'} ]
		var a=[[
			data.status.replicas,
			data.status.updatedReplicas,
			data.status.availableReplicas,
			data.status.unavailableReplicas]]
		printTableSimple('deploy_replicas',c,a)

	//Conditions
		printTitle('deploy_conditions',"Condiciones")
		c = [{name:'tipo',widht:'100px'},
			 {name:'estado',widht:'100px'},
			 {name:'ultima actualizacion',widht:'100px'},
			 {name:'ultima transision',widht:'100px'},
			 {name:'razon',widht:'100px'},
			 {name:'mensaje',widht:'100px'}]
		a = new Array
		data.status.conditions.forEach(function(v){
			a.push([v.type,v.status,v.lastUpdateTime,v.lastTransitionTime,v.reason,v.message])
		})
		printTableSimple('deploy_conditions',c,a)
	})
	.catch(err =>{
		alert(err)
		alert(JSON.stringify(err))
	})
}

/* ------------------- Volumenes -----------------------*/

function k8s_volums(parent){
	$("#" + parent).empty()
	var id = azar()
	var s5 = printSection(parent,'data','col','uno',{id:id,flex:'col',children:[]})
	k8s_volums_list(id)
}


function k8s_volums_list(parent){
	var a= new Promise((resolv,reject)=>{
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
	.then(data =>{
		armarListado(parent,[{nombre:'Nombre',dato:'name',tipo:'string',width:200},
							 {nombre:'Namespace',dato:'namespace',tipo:'string',width:200}
							],data,k8s_volume,['idNamespace','name'],'name',true)
	})
}

function k8s_volume(params){
	$("#content").empty()
	.append("<div id='content_menu' class='content_menu'>" +
			"</div><div id='content_data' class='content_data'></div>")
	make_menu('content_menu',function(){k8s_volums('content')},params.name,[
		{title:'Estado',f:function(){k8s_volum_status('content_data',params)},default:'yes'},
		{title:'Estadisticas',f:null}
	])
}

function k8s_volum_status(parent,params){
	$("#" + parent).empty()
	var s1 = printSection(parent,'data','col','uno',{id:'volum_detalle',flex:'col',children:[]})

	ajax_GET('/v1/app/namespace/' + params.idNamespace + '/volume/' + params.name)
	.then((data)=> {
		printTitle("volum_detalle","Detalle")
		printText("volum_detalle","Nombre",azar(),data.metadata.name)
		printText("volum_detalle","Namespace",azar(),data.metadata.namespace)
		printText("volum_detalle","Fecha Creaci&oacute;n",azar(),data.metadata.creationTimestamp)
		printText("volum_detalle","Clase",azar(),data.spec.storageClassName)
		printText("volum_detalle","Tipo",azar(),data.spec.volumeMode)
		printText("volum_detalle","Modo",azar(),data.spec.accessModes[0])
		printText("volum_detalle","Capacidad",azar(),data.spec.resources.requests.storage)
	})
}

/* ------------------- Services -----------------------*/

function k8s_services(parent){
	$("#" + parent).empty()
	var id = azar()
	var s5 = printSection(parent,'data','col','uno',{id:id,flex:'col',children:[]})
	k8s_services_list(id)
}

function k8s_services_list(parent){
	var a = new Promise((resolv,reject)=>{
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
	.then(data =>{
		armarListado(parent,[{nombre:'Nombre',dato:'name',tipo:'string',width:200},
							 {nombre:'Namespace',dato:'namespace',tipo:'string',width:200}
							],data,k8s_service,['idNamespace','name'],'name',true)
	})

}

function k8s_service(params){
	$("#content").empty()
	.append("<div id='content_menu' class='content_menu'>" +
			"</div><div id='content_data' class='content_data'></div>")
	make_menu('content_menu',function(){k8s_services('content')},params.name,[
		{title:'Estado',f:function(){k8s_service_status('content_data',params)},default:'yes'},
		{title:'Despliegue',f:function(){k8s_service_despliegue('content_data',params)}},
		{title:'Estadisticas',f:null}
	])
}

function k8s_service_status(parent,params){
	alert("Implementar")
}

function k8s_service_despliegue(parent,params){

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

	$("#" + parent).empty()
	var s1 = printSection(parent,'skeletor','col','uno')
	printSection(s1,'data','col','uno',{id:'vs1',flex:'col',children:[]})
	printSection(s1,'data','col','uno',{id:'vs2',flex:'col',children:[]})

	$(parent).empty()
	var a = "<div id='section' class='flex col uno overflow-y'>" +
			"<div id='vs1' class='flex col padding_not_r'></div>" +
			"<div id='vs2' class='flex col padding_not_r'></div></div>"
/*
	if(idNamespace != null){
		/* Es una modificacion 
		a += "<div id='actions' class='actions'></div>"
		$(parent).append(a)
	} else {
		/* Es un alta
		a += "<div style='text-align: center;'>" +
			 "<button id='nuevoService' class='alta_button'>Agregar</button></div>"
		$(parent).append(a)
		$("#nuevoService").on('click',function(){
			alert("Agregamos un Servicio")
			service_apply()
		})
	}
*/

	var promise
	var alta
	if(params.idNamespace != null){
		alta = false
		alert("Es una modificacion")
		/* Es una modificacion */
		actions_make('#actions',[
			{name:'Apli',action:service_apply},
			{name:'Elim',action:service_delete}])
		promise = ajax_GET('/v1/app/namespace/' + params.idNamespace + '/service/' + params.name )
	} else {
		alert("Es un alta")
		alta = true
		/* Es un alta. No hay servicio que buscar */
		promise = new Promise((resolv,reject)=>{ resolv(null) })
	}
	promise.then(data=>{
		if(!alta){
			/* Si es una edicion */
			printText('vs1',"Nombre del servicio",'serviceName',data.name)
			printText('vs1',"Namespace",'idNamespace',data.namespace)
			$("#vs1").append("<input type='hidden' id='idNamespace' value='" + params.idNamespace + "'>")
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
				printInput('vs1',"Nombre del servicio",'serviceName','')
				printSelect('vs1',"Namespace",'idNamespace',options,change_deployments)
				printSelect('vs1',"Despliegue",'deployName',[],null)
			},err=>{
				alert("Error al querer obtener los namespaces")
			})
		}
		var selectOptions = [
			{name:'url',value:'url'},
			{name:'Interno',value:'in'},
			{name:'Externo',value:'out'}]

		printList("vs2",'Servicios',"service",[
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
						{name:'port',label:'puerto',length:100,type:'input'}]},
			{name:'urls',label:'url',length:150,type:'list',selectName:'type',option:'url',
				data:[  {name:'url',label:'',length:200,type:'input'},
						{name:'path',label:'',length:200,type:'input'},
						{name:'port',label:'',length:200,type:'select',
							 options:[   {value:"80", label:"http"},
										 {value:"443", label:"https"} ]} ]
			}], data,true)
	},err=>{
		alert("Error al generar el formulario")
		alert(JSON.stringify(err))
	})
}
