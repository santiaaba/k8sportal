/* ------------------- Namespace -----------------------*/
function k8s_namespaces(){

	function consolidar(d){
		console.log(d)
		var a = new Array
		/* Los elementos del array ya vienen ordenados por el campo time */
		d.forEach(function(v){
			a.push({x:Math.floor(v[0]),y:parseFloat(v[1])})
		})
		console.log(a)
		return a
	}

	$("#content").empty()
	var s1 = printSection('content','skeletor','col','uno')
	var d1 = printSection(s1,'data','col','uno',{id:'namespaces_status',title:'Estado',flex:'row',children:[
		{id:'status_pods',title:'Estado',flex:'row',children:[]},
		{id:'status_cpu',title:'Estado',flex:'row',children:[]},
		{id:'status_mem',title:'Estado',flex:'row',children:[]}
	]})
	var d2 = printSection(s1,'data','col','uno',{id:'namespaces',title:'Recursos',flex:'col',children:[]})

	var deployments = new Array
	var dep_status = [
		{nombre:'activas', valor: 0, color:'green'},
		{nombre:'inactivas', valor: 0, color:'red'}]
	
	/* Consumo de ram y cpu de todos los namespaces */
	var end = Date.now() / 1000
	var start = end - 3600	//1 horas
	ajax_GET('/v1/app/namespace/metrics/cpu?start=' + start + '&end=' + end + '&step=5m')
	.then(data => {
		chart_littleLine('status_cpu',consolidar(data.message.data.result[0].values),50,50)
	})
	ajax_GET('/v1/app/namespace/metrics/mem?start=' + start + '&end=' + end + '&step=5m')
	.then(data => {
		chart_littleLine('status_mem',consolidar(data.message.data.result[0].values),50,50)
	})

	/* Estado de los pods de todos los namespaces */
	ajax_GET('/v1/app/namespace')
	.then(data=>{
		var promesas = new Array
		data.forEach(e => {
			promesas.push(ajax_GET('/v1/app/namespace/' + e.id + '/deployment'))
		})
		Promise.all(promesas)
		.then(data => {
			data.forEach(d => {
				var idNamespace = d.idNamespace
				d.items.forEach( s => {
					var deploy = {
						idNamespace:idNamespace,
						name:s.metadata.name,
						namespace:s.metadata.namespace,
						activas:0,
						inactivas:0}
					deployments.push(deploy)
					if(typeof(s.status.availableReplicas) != 'undefined'){
						dep_status[0].valor += s.status.availableReplicas
						deploy.activas = s.status.availableReplicas
					}
					if(typeof(s.status.unavailableReplicas) != 'undefined'){
						dep_status[1].valor += s.status.unavailableReplicas
						deploy.inactivas = s.status.unavailableReplicas
					}
				})
			})
			chart_donut('status_pods',dep_status,50,50)
		})
		.catch(err => {
            alert(err)
            alert(JSON.stringify(err))
        })
	})


	k8s_namespace_list('namespaces')
}

function k8s_namespace_list(parent){
	var namespaces = new Array
	ajax_GET('/v1/app/namespace')
	.then(data=>{
		data.forEach(e => {
			namespaces.push(e)
		})
		armarListado(parent,[{nombre:'Nombre',dato:'name',tipo:'string',width:200}],
							 data,k8s_namespace,['id'],'name',true)
	})
	.catch(err=>{
		alert(JSON.stringify(err))
	})
}

function k8s_namespace_status(){
}

function k8s_namespace(params){
	/* params es una estructura con dos valores: idNamespace y name */
	$("#content").empty()
	.append("<div id='content_menu' class='content_menu'>" +
			"</div><div id='content_data' class='content_data'></div>" +
			"</div><div id='content_action' class='content_action'></div>")
	make_menu('content_menu',function(){k8s_namespaces()},params.name,[
		{title:'Estado',f:function(){k8s_namespace_status('content_data',params)},default:'yes'},
		{title:'Estadisticas',f:null}
	])
	actionBar = new ActionBar('content_action')
	actionBar.add('Eliminar','img/delete.png',2,
		function(){ popup.up('confirm','Seguro que desea eliminar','250px','200px',k8s_namespace_delete,params)})
	actionBar.render()
}

function k8s_namespace_apply(){
}

function k8s_namespace_delete(){
}



/* ------------------- Deployments -----------------------*/

function k8s_deployments(){
	$("#content").empty()
	var s1 = printSection('content','skeletor','col','uno')
	var d1 = printSection(s1,'data','col','uno',{id:'dep_status',title:'Estado',flex:'row',children:[
		{id:'dep_status_pods',title:'Estado',flex:'row',children:[]},
		{id:'dep_status_cpu',title:'Estado',flex:'row',children:[]},
		{id:'dep_status_mem',title:'Estado',flex:'row',children:[]}
	]})
	var d2 = printSection(s1,'data','col','uno',{id:'dep_recursos',title:'Recursos',flex:'col',children:[]})
	var d3 = printSection('content','data','col','uno',{id:'dep_listado',title:'Deployments',flex:'col',children:[]})

	var deployments = new Array
	var dep_status = [
		{nombre:'activas', valor: 0, color:'green'},
		{nombre:'inactivas', valor: 0, color:'red'}]
	ajax_GET('/v1/app/namespace')
	.then(data=>{
		var promesas = new Array
		data.forEach(e => {
			promesas.push(ajax_GET('/v1/app/namespace/' + e.id + '/deployment'))
		})
		Promise.all(promesas)
		.then(data => {
			data.forEach(d => {
				var idNamespace = d.idNamespace
				d.items.forEach( s => {
					var deploy = {
						idNamespace:idNamespace,
						name:s.metadata.name,
						namespace:s.metadata.namespace,
						activas:0,
						inactivas:0}
					deployments.push(deploy)
					if(typeof(s.status.availableReplicas) != 'undefined'){
						dep_status[0].valor += s.status.availableReplicas
						deploy.activas = s.status.availableReplicas
					}
					if(typeof(s.status.unavailableReplicas) != 'undefined'){
						dep_status[1].valor += s.status.unavailableReplicas
						deploy.inactivas = s.status.unavailableReplicas
					}
				})
			})

			/* Status de los deployments */
			chart_donut('dep_status_pods',dep_status,50,50)
			chart_donut('dep_status_cpu',dep_status,50,50)
			chart_donut('dep_status_mem',dep_status,50,50)
			/* recursos de los deployments */

			/* Listado de deployments */
			armarListado('dep_listado',[{nombre:'Nombre',dato:'name',tipo:'string',width:200},
						 {nombre:'Namespace',dato:'namespace',tipo:'string',width:200},
						 {nombre:'Pod activos',dato:'activas',tipo:'string',width:200},
						 {nombre:'Pod inactivos',dato:'inactivas',tipo:'string',width:200}
						 ],deployments,k8s_deployment,['idNamespace','name'],'name',true)
		})
		.catch(err => {
			alert(err)
			alert(JSON.stringify(err))
		})
	})
}

function k8s_deployment(params){
	/* params es una estructura con dos valores: idNamespace y name */
	$("#content").empty()
	.append("<div id='content_menu' class='content_menu'>" +
			"</div><div id='content_data' class='content_data'></div>" +
			"</div><div id='content_action' class='content_action'></div>")
	make_menu('content_menu',function(){k8s_deployments()},params.name,[
		{title:'Estado',f:function(){k8s_deployment_status('content_data',params)},default:'yes'},
		{title:'Despliegue',f:function(){k8s_deployment_despliegue('content_data',params)}},
		{title:'Pods',f:function(){k8s_deployment_pods('content_data',params)}},
		{title:'Estadisticas',f:null}
	])
	actionBar = new ActionBar('content_action')
	actionBar.add('Eliminar','img/delete.png',2,
		function(){ popup.up('confirm','Seguro que desea eliminar','250px','200px',k8s_deployment_delete,params)})
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
	var pod_conf_section = azar()
	var pod_vol_section = azar()
	var pod_containers_section = azar()
	var s1 = printSection(parent,'skeletor','col','uno')
	printSection(s1,'data','col','uno',{id:pod_conf_section,title:'Deployment',flex:'col',children:[]})
	printSection(s1,'data','col','uno',{id:pod_vol_section,title:'Volumenes',flex:'col',children:[]})
	printSection(s1,'data','col','uno',{id:pod_containers_section,title:'Contenedores',flex:'col',children:[]})

	if(typeof(params) != 'undefined'){
		/* Es una modificacion */
		promise = ajax_GET('/v1/app/namespace/' + params.idNamespace + '/deployment/' + params.name )
	} else {
		/* Es un alta */
		promise = new Promise((resolv,reject)=> { resolv()})
	}
	promise.then(data=>{
	   if(typeof(params) != 'undefined'){
			/* Es una modificacion */
			actionBar.add('Salvar','img/save.png',1,k8s_deployment_apply)
			actionBar.render()
/*
			$("#pod_conf").append("<input type='hidden' id='fibercorpID' value='" + data.fibercorpID + "'>")
			$("#pod_conf").append("<input type='hidden' id='idNamespace' value='" + params.idNamespace + "'>")
*/
			printText(pod_conf_section,"Nombre",'deployName',data.deployName)
			printText(pod_conf_section,"Replicas",'replicas',data.replicas)
		} else {
			/* Es un alta */
			printInput(pod_conf_section,"Nombre",'deployName','')
			printInput(pod_conf_section,"Replicas",'replicas','')
			ajax_GET('/v1/app/namespace/')
			.then(data=>{
				var options =  new Array
				data.forEach(function(v){
					options.push({name:v.name,value:v.id})
				})
				printSelect(pod_conf_section,'Namespace','idNamespace',options,null)
			},err => {
				alert(JSON.stringify(err))}
			)
			var data = {volumes:[],containers:[]}
		}

		printList(pod_vol_section,'Volumenes',"volumes",
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

		printList(pod_containers_section,"Contenedores",'containers',
			[{name:'name',label:'Nombre',length:300,type:'input'},
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

		if(typeof(params) == 'undefined'){
			/* Es un alta */
			printSection(s1,'data','col','uno',{id:'deploy_salvar',flex:'row',children:[]})
			printButton("deploy_salvar","Agregar",k8s_deployment_apply)
		}
	})
}

function k8s_deployment_apply(){
	alert("Salvando o actualizando")
	/* llama a la API para aplicar el deploy */

	/* Armamos el Json */
	data = {
		fibercorpID: $("#fibercorpID").val(),
		deployName: $("#deployName").val(),
		replicas: $("#replicas").val(),
		containers:[],
		volumes:[]
	}
	/* Los containers */
	$("[containers]").each(function(){
		var id = $(this).attr('id')	 /* ID que poseen todos los elementos del container */
		var container = {   name:$("#name_" + id).val(),
							image:$("#image_" + id).val(),
						/*	cpu:$("#cpu_" + id).val(),
							mem:$("#mem_" + id).val(),*/
							args:[],
							envs:[],
							discs:[],
							services:[]}

		/* Los argumentos */
		$(this).find("[args]").each(function(){
			$(this).find(":input").each(function(){
				if($(this).attr('name'))
					container.args.push($(this).val())
			})
		})
		/* Los environment */
		$(this).find("[envs]").each(function(){
			var linea='{'
			$(this).find(":input").each(function(){
				if($(this).attr('name'))
					linea += '"' + $(this).attr('name') + '":"' + $(this).val() + '",'
			})
			linea = linea.slice(0, -1) + '}'
			container.envs.push(JSON.parse(linea))
		})

		/* los volumenes */
		$(this).find("[mounts]").each(function(){
			var linea='{'
			$(this).find(":input").each(function(){
				if($(this).attr('name'))
					linea += '"' + $(this).attr('name') + '":"' + $(this).val() + '",'
			})
			linea = linea.slice(0, -1) + '}'
			container.discs.push(JSON.parse(linea))
		})

		/* Los Puertos */
		$(this).find("[ports]").each(function(){
			var linea='{'
			$(this).find(":input").each(function(){
				if($(this).attr('name'))
					linea += '"' + $(this).attr('name') + '":"' + $(this).val() + '",'
			})
			linea = linea.slice(0, -1) + '}'
			container.ports.push(JSON.parse(linea))
		})
		data.containers.push(container)
	})
	/* Los volume */
	$("[volumes]").each(function(){
		var linea='{'
		$(this).find(":input").each(function(){
			if($(this).attr('name'))
				linea += '"' + $(this).attr('name') + '":"' + $(this).val() + '",'
		})
		linea = linea.slice(0, -1) + '}'
		data.volumes.push(JSON.parse(linea))
	})


	alert(JSON.stringify(data))
	$(".solapa_body").append(JSON.stringify(data))
	
	ajax_POST('/v1/app/namespace/' + $("#idNamespace").val() + '/deployment/',data)
	.then(ok =>{
		alert(JSON.stringify(ok))
	})
	.catch(err =>{
		alert(JSON.stringify(err))
	})
}

function k8s_deployment_pods(parent,params){
	/* Genera un listado de los pods que conforman el deployment.
	 * Presionando sobre cada elemento del listado genera informacion
 	 * espesifica de ese pod */
	$("#" + parent).empty()
	var s0 = printSection(parent,'skeletor','row','uno')
	var d0 = printSection(s0,'data','','uno',{id:'pod_list',title:'titulo',flex:'col',children:[]})
	var s1 = printSection(s0,'skeletor','col','dos')
	var d1 = printSection(s1,'data','','uno',{id:'pod_info',title:'titulo',flex:'col',children:[]})
	var d2 = printSection(s1,'data','','uno',{id:'pod_conditions',title:'titulo',flex:'col',children:[]})
	var d3 = printSection(s1,'data','','uno',{id:'pod_containers',title:'titulo',flex:'col',children:[]})
	var d4 = printSection(s1,'data','','uno',{id:'pod_events',title:'titulo',flex:'col',children:[]})


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
	printSection(s2,'data','col','uno', {id:'deploy_detalle',title:'titulo',flex:'col',children:[]})
	printSection(s2,'data','col','uno', {id:'deploy_replicas',title:'titulo',flex:'col',children:[]})
	printSection(s1,'data','col','uno',{id:'deploy_estadisticas',title:'titulo',flex:'col',children:[]})
	printSection(s1,'data','col','uno',{id:'deploy_conditions',title:'titulo',flex:'col',children:[]})

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
			printText('deploy_detalle',"Estrategia",azar(),'RollingUpdate: ' +
			data.spec.strategy.rollingUpdate.maxUnavailable +
				' max. no disponible / ' +
				data.spec.strategy.rollingUpdate.maxSurge +
				' max. pico')
		}

	// Estado de las replicas
		printTitle('deploy_replicas',"Replicas")
		chart_donut('deploy_replicas',[
			{nombre:'activas', valor: data.status.availableReplicas, color:'green'},
			{nombre:'inactivas', valor:data.status.unavailableReplicas, color:'red'}],50,50)

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


function k8s_deployment_delete(params){
	/* Envia a eliminar un deploy 
	params: {idnamespace: ide del namespace, name: nombre del deploy}
	*/
	ajax_DELETE("/v1/app/namespace/" + params.idNamespace + "/deployment/" + params.name)
	.then(ok => {
		k8s_deployments()
	})
	.catch(err => {
		alert("Error al Eliminar:" + JSON.stringify(err))
	})
	
}

/* ------------------- Volumenes -----------------------*/

function k8s_volumes(){
	$("#content").empty()
	var id = azar()
	var s5 = printSection('content','data','col','uno',{id:id,title:'titulo',flex:'col',children:[]})
	k8s_volumes_list(id)
}


function k8s_volumes_list(parent){
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
			"</div><div id='content_data' class='content_data'></div>" +
			"</div><div id='content_action' class='content_action'></div>")
	make_menu('content_menu',function(){k8s_volumes()},params.name,[
		{title:'Estado',f:function(){k8s_volum_status('content_data',params)},default:'yes'},
		{title:'Estadisticas',f:null}
	])
	actionBar = new ActionBar('content_action')
	actionBar.add('Eliminar','img/delete.png',2,
		function(){ popup.up('confirm','Seguro que desea eliminar','250px','200px',k8s_volume_delete,params)})
	actionBar.render()
}

function k8s_volume_delete(params){
	/* Envia a eliminar un deploy 
	params: {idnamespace: ide del namespace, name: nombre del volumen}
	*/
	ajax_DELETE("/v1/app/namespace/" + params.idNamespace + "/volume/" + params.name)
	.then(ok => {
		k8s_volumes()
	})
	.catch(err => {
		alert("Error al Eliminar:" + JSON.stringify(err))
	})
	
}

function k8s_volum_status(parent,params){
	$("#" + parent).empty()
	var s1 = printSection(parent,'data','col','uno',{id:'volum_detalle',title:'titulo',flex:'col',children:[]})

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

function k8s_volume_despliegue(parent,params){

	$("#" + parent).empty()
	var volume_conf = azar()
	var s1 = printSection(parent,'skeletor','col','uno')
	printSection(s1,'data','col','uno',{id:volume_conf,title:'titulo',flex:'col',children:[]})

	var promise
	if(typeof(params) != 'undefined'){
		alert("Es una modificacion")
		/* Es una modificacion */
		promise = ajax_GET('/v1/app/namespace/' + params.idNamespace + '/volume/' + params.name )
	} else {
		alert("Es un alta")
		/* Es un alta. No hay volumen que buscar */
		promise = new Promise((resolv,reject)=>{ resolv(null) })
	}
	promise.then(data=>{
		if(typeof(params) != 'undefined'){
			/* Si es una modificacion  aun no esta implementado */
		} else {
			/* Si es un alta */
			var promise_n = ajax_GET('/v1/app/namespace')
			promise_n.then(data=>{
				var options =  new Array
				data.forEach(function(v){
					options.push({name:v.name,value:v.id})
				})
				printSelect(volume_conf,'Namespace','namespace',options,null)
				printInput(volume_conf,'Nombre del Volumen','name','',null)
				printSelect(volume_conf,'Despliegue','type',[{name:'Ceph',value:'csi-rbd-sc'}],null)
				printInput(volume_conf,'Capacidad(GB)','size','',null)
			},err=>{
				alert("Error al querer obtener los namespaces")
			})
			printSection(s1,'data','col','uno',{id:'volume_salvar',title:'titulo',flex:'row',children:[]})
			printButton("volume_salvar","Agregar",function(){
				k8s_volume_apply(function(){
					alert("cerramos alta")
					menu_agregar.contraer(k8s_volumes)
				},function(){
					alert("informamos error")
				})
			})
		}
	},err=>{
		alert("Error al generar el formulario")
		alert(JSON.stringify(err))
	})
}

function k8s_volume_apply(ok,bad){
	alert("Apply")
	data = {name:$("#name").val(),
			size:$("#size").val(),
			class:$("#type").val()}
	alert(JSON.stringify(data))
	ajax_POST('/v1/app/namespace/' + $("#namespace").val() + '/volume/',data)
	.then(data => {
		alert("Volumen dado de alta")
		ok()
	},err => {
		alert("ERROr alta volumen" + JSON.stringify(err))
		bad()
	})
}


/* ------------------- Services -----------------------*/

function k8s_services(){
	$("#content").empty()
	var id = azar()
	var s5 = printSection('content','data','col','uno',{id:id,title:'titulo',flex:'col',children:[]})
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
			"</div><div id='content_data' class='content_data'></div>" +
			"</div><div id='content_action' class='content_action'></div>")
	make_menu('content_menu',function(){k8s_services()},params.name,[
		{title:'Estado',f:function(){k8s_service_status('content_data',params)},default:'yes'},
		{title:'Despliegue',f:function(){k8s_service_despliegue('content_data',params)}},
		{title:'Estadisticas',f:null}
	])
	actionBar = new ActionBar('content_action')
	actionBar.add('Eliminar','img/delete.png',2,
		function(){ popup.up('confirm','Seguro que desea eliminar','250px','200px',k8s_service_delete,params)})
	actionBar.render()
}

function k8s_service_status(parent,params){
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
	var service_conf = azar()
	var s1 = printSection(parent,'skeletor','col','uno')
	printSection(s1,'data','col','uno',{id:service_conf,title:'titulo',flex:'col',children:[]})

	var promise
	if(typeof(params) != 'undefined'){
		/* Es una modificacion */
		promise = ajax_GET('/v1/app/namespace/' + params.idNamespace + '/service/' + params.name )
	} else {
		/* Es un alta. No hay servicio que buscar */
		promise = new Promise((resolv,reject)=>{ resolv(null) })
	}
	promise.then(data=>{
		if(typeof(params) != 'undefined'){
			/* Si es una modificacion */
			printText(service_conf,"Nombre del servicio",'serviceName',data.name)
			printText(service_conf,'Namespace','namespace',data.namespace)
			printHidden(service_conf,'deployName',data.target)
			printHidden(service_conf,'idNamespace',params.idNamespace)

			actionBar.add('Salvar','img/save.png',1,function(){
				k8s_service_apply(null,function(){
					alert("Informamos del error")
				})
			})
			actionBar.render()
		} else {
			/* Si es un alta */
			var promise_n = ajax_GET('/v1/app/namespace')
			promise_n.then(ok=>{
				var options = []
				ok.forEach(function(v,i){
					options.push({name:v.name,value:v.id})
				})
				printInput(service_conf,"Nombre del servicio",'serviceName','')
				printSelect(service_conf,"Namespace",'idNamespace',options,change_deployments)
				printSelect(service_conf,"Despliegue",'deployName',[],null)
			},err=>{
				alert("Error al querer obtener los namespaces")
			})
		}
		var selectOptions = [
			{name:'url',value:'url'},
			{name:'Interno',value:'in'},
			{name:'Externo',value:'out'}]

		printList(service_conf,'Servicios',"service",[
			{name:'type',label:'tipo',length:100,type:'select',
				options:[   {value:"in",label:"interna"},
							{value:"out",label:"externa"},
							{value:"url",label:"URL"}]},
			{name:'ip',label:'ip',length:60,type:'input',selectName:'type',option:'out'},
			{name:'ports',label:'ports',length:100,type:'list',selectName:'type',option:'in',
				data:[  {name:'name',label:'nombre',length:200,type:'input'},
						{name:'protocol',label:'protocol',length:100, type:'select',options:[
							{label:"tcp",value:"TCP"},
							{label:"udp",value:"UDP"}]},
						{name:'port',label:'puerto',length:100,type:'input'}]},
			{name:'urls',label:'url',length:150,type:'list',selectName:'type',option:'url',
				data:[  {name:'url',label:'url',length:200,type:'input'},
						{name:'path',label:'path',length:200,type:'input'},
						{name:'port',label:'puerto',length:100,type:'select',
							 options:[   {value:"80", label:"http"},
										 {value:"443", label:"https"} ]} ]
			}], data,true)

		if(typeof(params) == 'undefined'){
			/* Es un alta */
			printSection(s1,'data','col','uno',{id:'service_salvar',flex:'row',children:[]})
			printButton("service_salvar","Agregar",function(){
				k8s_service_apply(function(){
					menu_agregar.contraer(k8s_services)
				},function(){
					alert("Informamos del error")
				})
			})
		}
	},err=>{
		alert("Error al generar el formulario")
		alert(JSON.stringify(err))
	})
}

function k8s_service_apply(ok,bad){
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
	ajax_POST('/v1/app/namespace/' + $("#idNamespace").val() + '/service/',data)
	.then(data =>{
		ok()
	},err =>{
		bad()
	})
}

function k8s_service_delete(params){
	/* Envia a eliminar un servicio
	params: {idnamespace: ide del namespace, name: nombre del deploy}
	*/
	ajax_DELETE("/v1/app/namespace/" + params.idNamespace + "/service/" + params.name)
	.then(ok => {
		k8s_services()
	})
	.catch(err => {
		alert("Error al Eliminar:" + JSON.stringify(err))
	})
	
}


