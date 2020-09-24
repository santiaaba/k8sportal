function deploy_sections(idNamespace,name){
	/* Genera las solapas  */
	solapa_make('#wrp_play',
		[{name:'Estado', f:deploy_status, p:[idNamespace,name]},
		{name:'Despliegue', f:deploy_despliegue, p:[idNamespace,name]},
		{name:'Pods', f:deploy_pods_status, p:[idNamespace,name]},
		{name:'Estadisticas', f:deploy_statistics, p:[idNamespace,name]}])
}

function deploy_list(container){
	/* retorna una Promesa que se encarga de obtener
	 * los datos de un deployment. El resolv es la
	 * funcion encargada de procesar los datos obtenidos */
	return new Promise((resolv,reject)=>{
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
							//alert(JSON.stringify(s))
							var deploy = {
								idNamespace:e.id,
								name:s.metadata.name,
								namespace:s.metadata.namespace}
							//alert(JSON.stringify(deploy))
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
}

function deploy_status(parent,idNamespace,name){
	/* informa del estado de un deploy */
	$(parent).empty()
	$(parent).append("<div id='vs1status' class='flex col uno'></div>")
	ajax_GET('/v1/app/namespace/' + idNamespace + '/deployment/' + name + '/status')
	.then((data)=> {

		printTitle("#vs1status","Detalle")
		printText("#vs1status","Nombre",azar(),data.metadata.name)
		printText("#vs1status","Namespace",azar(),data.metadata.namespace)
		printText("#vs1status","Fecha Creaci&oacute;n",azar(),data.metadata.creationTimestamp)

		printTitle("#vs1status","Replicas")
		var c=[ {name:'solicitadas',width:'100px'},
				{name:'act.',width:'100px'},
				{name:'disp.',width:'100px'},
				{name:'no disp.',width:'100px'} ]
		var a=[[
			data.status.replicas,
			data.status.updatedReplicas,
			data.status.availableReplicas,
			data.status.unavailableReplicas]]
		printTableSimple('#vs1status',"Replicas",c,a)

		// Estrategia
		if(data.spec.strategy.type == 'RollingUpdate'){
			printText("#vs1status","Estrategia",azar(),'RollingUpdate: ' + 
						data.spec.strategy.rollingUpdate.maxUnavailable +
						' max. no disponible / ' +
						data.spec.strategy.rollingUpdate.maxSurge +
						' max. pico')
		}
	})
	.catch(err =>{
		alert(err)
		alert(JSON.stringify(err))
	})
}

function deploy_apply(){
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
		var id = $(this).attr('id')		/* ID que poseen todos los elementos del container */
		var container = {	name:$("#name_" + id).val(),
							image:$("#image_" + id).val(),
							cpu:$("#cpu_" + id).val(),
							mem:$("#mem_" + id).val(),
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


	//alert(JSON.stringify(data))
	$(".solapa_body").append(JSON.stringify(data))

	ajax_POST('/v1/app/namespace/' + $("#idNamespace").val() + '/deployment/',data)
	.then(ok =>{
		alert(JSON.stringify(ok))
	})
	.catch(err =>{
		alert(JSON.stringify(err))
	})
}

function deploy_despliegue(parent,idNamespace,name){
	/* Se utiliza tanto para las antas como para las
 	 * modificaciones de los despliegues */
	$(parent).empty()
	var a = "<div id='section' class='flex col uno overflow-y'>" +
           	"<div id='vs1' class='flex col uno padding_not_r overflow-y'></div></div>"
	if(idNamespace != null){
		/* Es una modificacion */
		a += "<div id='actions' class='actions'></div>"
		$(parent).append(a)
	} else {
		/* Es un alta */
		a += "<div style='text-align: center;'>" +
			 "<button id='nuevoDeploy' class='alta_button'>Agregar</button></div>"
		$(parent).append(a)
		$("#nuevoDeploy").on('click',function(){
			alert("Agregamos un deploy")
		})
	}
	var promise
	if(idNamespace != null){
		/* Es una modificacion */
		actions_make('#actions',[
				{name:'Apli',action:deploy_apply},
				{name:'Elim',action:deploy_delete}])
		promise = ajax_GET('/v1/app/namespace/' + idNamespace + '/deployment/' + name )
	} else {
		/* Es un alta */
		/* Debemos cargar con null algunos datos */
		data = {resources:{cpu:'1',mem:'10Mi'},replicas:'1',image:''}
		printInput('#vs1',"Namespace",'namespaceName','')
		promise = new Promise((resolv,reject)=> { resolv(data)})
	}
	promise.then(data=>{
		if(idNamespace != null){
			$('#vs1').append("<input type='hidden' id='fibercorpID' value='" + data.fibercorpID + "'>")
			$('#vs1').append("<input type='hidden' id='idNamespace' value='" + idNamespace + "'>")
			printText('#vs1',"Nombre",'deployName',data.deployName)
			printText('#vs1',"Replicas",'replicas',data.containerName)
		} else {
			printInput('#vs1',"Nombre",'deployName','')
			printInput('#vs1',"Replicas",'replicas','')
		}

		printList("#vs1",'Volumenes',"volumes",
					[{name:'name',label:'nombre',length:100,type:'input'},
					{name:'type',label:'tipo',length:100,type:'select',
					options:[	{value:'pvc',label:"pvc"},
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

		printList('#vs1',"Contenedores",'containers',
			[{name:'name',label:'Nombre',length:100,type:'input'},
			{name:'image',label:'Imagen',length:100,type:'input'},
	/*		{name:'cpu',label:'Cpu',length:100,type:'input'},
			{name:'mem',label:'Memoria',length:100,type:'input'}, */
			{name:'args',label:'Argumentos',type:'list',data:[
				{name:'arg',label:'',length:300,type:'input'}]},
			{name:'envs',label:'Variables de Entorno',type:'list',data:[
				{name:'name',label:'Nombre',length:300,type:'input'},
				{name:'type',label:'Tipo',length:300,type:'select', options:[
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

}

function deploy_containers_status(parent,data){
	$.each(data,function(i,v){
		id = azar()
		deploy_container_status(parent,v)
	})
}


function deploy_container_status(parent,data){
	var state = Object.keys(data.state)[0]
	printText(parent,"Estado",azar(),state)
	if(typeof(data.state[state].reason) != 'undefined'){
		printText(parent,"Motivo",azar(),data.state[state].reason)
		printText(parent,"Mensaje",azar(),data.state[state].message)
	}
	var lastState = Object.keys(data.lastState)
	if(typeof(lastState[0]) != 'undefined'){
		printText(parent,"Ultimo Estado",azar(),lastState)
		printText(parent,"Motivo",azar(),data.lastState[lastState].reason)
		printText(parent,"Mensaje",azar(),data.lastState[lastState].message)
	}

}


function deploy_pod_status(parent,data){
	var id = azar()
	var lineas = new Array
	$(parent).append("<div id='p1" + id + "' class='flex-col padding_not_r uno'></div>")
	printTitle('#p1'+id,"POD: " + data.metadata.name)
	printText('#p1'+id,"Creado",azar(),data.metadata.creationTimestamp)
	printText('#p1'+id,"Face",azar(),data.status.phase)
	printText('#p1'+id,"Fecha inicio",azar(),data.status.startTime)

	/* Container Statuses */
	deploy_containers_status('#p1'+id,data.status.containerStatuses)

	/* Condiciones */
	var columnas = [{name:'Nombre',width:'100px'},
				   {name:'Estado',width:'100px'},
				   {name:'Razon',width:'100px'},
				   {name:'Mensaje',width:'300px'}]
	lineas = []
	data.status.conditions.forEach(function(v,i){
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
	printTableSimple('#p1'+id,"Condiciones",columnas,lineas)

	/* Eventos. */
	var columnas = [{name:'Tipo',width:'100px'},
				   {name:'Motivo',width:'100px'},
				   {name:'Edad',width:'100px'},
				   {name:'Origen',width:'100px'},
				   {name:'Mensaje',width:'300px'}]
	lineas = []
	data.events.forEach(function(v,i){
		var linea = new Array
		linea.push(v.type)
		linea.push(v.reason)
		linea.push(v.deprecatedFirstTimestamp)
		linea.push(v.deprecatedSource.component)
		linea.push(v.note)
		lineas.push(linea)
	})
	printTableSimple('#p1'+id,"Eventos",columnas,lineas)


}

function deploy_pods_status(parent,idNamespace,name){
	ajax_GET('/v1/app/namespace/' + idNamespace + '/deployment/' + name + '/pods')
	.then(ok=>{
		$.each(ok.items,function(i,v){
			id = azar()
			$(parent).append("<div id='" + id + "' class='flex-col'></div>")
			deploy_pod_status('#'+id,v)
		})
	})
}

function deploy_statistics(parent,idNamespace,name){
	$(parent).append("IMPLEMENTAR")
}

function deploy_delete(){
	alert("IMPLEMENTAR")
}
