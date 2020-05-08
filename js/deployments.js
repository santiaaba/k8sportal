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
	ajax_GET('/v1/app/namespace/' + idNamespace + '/deployment/' + name + '/status')
	.then((data)=> {
		//alert(JSON.stringify(data))
		$(parent).empty()
		$(parent).append("<div class='flex col uno overflow-y'>" +
				"<div id='vs1' class='vertical_simetric'></div>"+
				"<div id='vs2' class='vertical_simetric border-left'></div></div>")

		printTitle("#vs1","Detalle")
		printText("#vs1","Nombre",data.metadata.name)
		printText("#vs1","Namespace",data.metadata.namespace)
		printText("#vs1","Fecha Creaci&oacute;n",data.metadata.creationTimestamp)

		printTitle("#vs1","Replicas")
		var c=[ {name:'solicitadas',width:'100px'},
				{name:'act.',width:'100px'},
				{name:'disp.',width:'100px'},
				{name:'no disp.',width:'100px'} ]
		var a=[[
			data.status.replicas,
			data.status.updatedReplicas,
			data.status.availableReplicas,
			data.status.unavailableReplicas]]
		printStaticTable("#vs1",c,a)

		printTitle("#vs2","Servicios")
		printText("#vs2","Restart policy",data.spec.restartPolicy)
		printText("#vs2","Terminated grace period",data.spec.terminationGracePeriodSeconds)
		printText("#vs2","Dns policy",data.spec.dnsPolicy)
	})
	.catch(err =>{
		alert(JSON.stringify(err))
	})
}

function deploy_apply(){
	/* llama a la API para actualizar el deploy */

	/* Armamos el Json */
	data = {
		fibercorpID: $("#fibercorpID").val(),
		deployName: $("#deployName").text(),
		containerName: $("#containerName").text(),
		image: $("#image").val(),
		replicas: $("#replicas").val(),
		resources:{
			cpu: $("#cpu").val(),
			mem: $("#mem").val()
		},
		args:[],
		envs:[],
		volumes:[],
		services:[]
	}
	/* Los argumentos */
	$("[args]").each(function(){
		$(this).find(":input").each(function(){
			if($(this).attr('name'))
				data.args.push($(this).val())
		})
	})
	/* Los environment */
	$("[envs]").each(function(){
		var linea='{'
		$(this).find(":input").each(function(){
			if($(this).attr('name'))
				linea += '"' + $(this).attr('name') + '":"' + $(this).val() + '",'
		})
		linea = linea.slice(0, -1) + '}'
		data.envs.push(JSON.parse(linea))
	})
	/* los volumenes */
	$("[volumes]").each(function(){
		var linea='{'
		$(this).find(":input").each(function(){
			if($(this).attr('name'))
				linea += '"' + $(this).attr('name') + '":"' + $(this).val() + '",'
		})
		linea = linea.slice(0, -1) + '}'
		data.volumes.push(JSON.parse(linea))
	})
	/* Los servicios */
	$("[services]").each(function(){
		var id = $(this).attr('id')
		var service = '{"name":"' + $("#name_" + id).val() +
				  '","type":"' + $("#type_" + id).val() + '"'
		switch($("#type_" + id).val()){
			case 'out':
			case 'in':
				service += ',"ports":['
				$(this).find("[ports]").each(function(){
					var idport = $(this).attr('id')
					service += '{"name":"' + $("#name_" + idport).val() +
							    '","protocol":"' + $("#protocol_" + idport).val() +
								'","port":"' + $("#port_" + idport).val() + '"},'
				})
				service = service.slice(0, -1) + ']}'
				break
			case 'url':
				service += ',"urls":['
				$(this).find("[urls]").each(function(){
					var idport = $(this).attr('id')
					service += '{"url":"' + $("#url_" + idport).val() +
							    '","path":"' + $("#path_" + idport).val() +
								'","port":"' + $("#port_" + idport).val() + '"},'
				})
				service = service.slice(0, -1) + ']}'
		}
		//alert(service)
		data.services.push(JSON.parse(service))
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
	$(parent).empty()
	$(parent).append("<div id='section' class='flex col uno overflow-y'>" +
					 	"<div class='flex row cero'>" +
					 		"<div id='vs1' class='flex col uno padding'></div>" +
					 		"<div id='vs2' class='flex col uno padding'></div>" + 
					 	"</div>"+
                	 	"<div id='vs3' class='flex col uno padding'></div>" +
                	 	"<div id='vs4' class='flex col uno padding'></div>" +
                	 	"<div id='vs5' class='flex col uno padding'></div>" +
                	 	"<div id='vs6' class='flex col uno padding'></div>" +
					 "</div><div id='actions' class='actions'></div>")
	actions_make('#actions',[
			{name:'Apli',action:deploy_apply},
			{name:'Elim',action:deploy_delete}])
	ajax_GET('/v1/app/namespace/' + idNamespace + '/deployment/' + name )
	.then(data=>{
		$(parent).append("<input type='hidden' id='fibercorpID' value='" + data.fibercorpID + "'>")
		$(parent).append("<input type='hidden' id='idNamespace' value='" + idNamespace + "'>")
		printText('#vs1',"Nombre",'deployName',data.deployName)
		printInput('#vs1',"Replicas",'replicas',data.replicas)
		printText('#vs2',"Nombre",'containerName',data.containerName)
		printInput('#vs2',"Imagen",'image',data.image)
		printInput('#vs2',"Cpu",'cpu',data.resources.cpu)
		printInput('#vs2',"Memoria",'mem',data.resources.mem)
		printList('#vs3','Argumentos',"args",[{name:'arg',label:'',length:200,type:'input'}],
				  data.args)

		printList('#vs4','Variables',"envs",
				  [{name:'name',label:'nombre',length:100,type:'input'},
				   {name:'value',label:'valor',length:250,type:'input'}],
				   data.envs)
		printList("#vs5",'Volumenes',"volumes",
					[{name:'name',label:'nombre',length:100,type:'input'},
					{name:'path',label:'Punto de montaje',length:100,type:'input'},
					{name:'type',label:'tipo',length:100,type:'select',
					options:[	{value:'pvc',label:"PVC"},
								{value:'emptydir',label:"EmptyDir"},
								{value:'secret',label:"Secret"}
					]},
					{name:'pvc',label:'PVC',length:60,type:'input',
					 selectName:'type',option:'pvc'},
					{name:'Secret',label:'Secret',length:60,type:'input',
					 selectName:'type',option:'secret'}],
					data.volumes)

		printList("#vs6",'Servicios',"services",

        [ {name:'name',label:'nombre',length:100,type:'input'},
          {name:'type',label:'tipo',length:100,type:'select',
		   options:[	{value:"in",label:"interna"},
						{value:"out",label:"externa"},
						{value:"url",label:"URL"}
				    ]},
          {name:'ip',label:'ip',length:60,type:'input',selectName:'type',option:'out'},
          {name:'ports',label:'ports',length:60,type:'list',selectName:'type',option:'in',
		   data:[	{name:'name',label:'nombre',length:60,type:'input'},
                    {name:'protocol',label:'protocol',length:60,
                     type:'select',options:[
							{label:"tcp",value:"TCP"},
							{label:"udp",value:"UDP"}
					]},
                     {name:'port',label:'puerto',length:60,type:'input'}
			]},
           {name:'ports',label:'ports',length:60,type:'list',selectName:'type',option:'out',
		    data:[	{name:'name',label:'nombre',length:60,type:'input'},
                    {name:'protocol',label:'protocol',length:60,
                     type:'select',options:[
						{label:"tcp",value:"TCP"},
						{label:"udp",value:"UDP"}
				 	 ]},
                    {name:'port',label:'puerto',length:100,type:'input'}
				]},
                 {name:'urls',label:'url',length:150,type:'list',selectName:'type',option:'url',
				  data:[	{name:'url',label:'',length:200,type:'input'},
					 		{name:'path',label:'',length:200,type:'input'},
					 		{name:'port',label:'',length:200,type:'select',
							 options:[
								{value:"80", label:"http"},
								{value:"443", label:"https"}
							]}
					   ]
				  }], data.services)
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
	$(parent).append("<div id='titulo" + id + "'></div>" +
					 "<div class='flex-row'>" +
					 	"<div id='p1" + id + "' class='flex-col '></div>" +
					 	"<div id='p2" + id + "' class='flex-col uno'></div>" +
					 "</div>" +
					 "<div id='p3" + id + "' class='flex-col uno'></div>" +
					 "<div id='p4" + id + "' class='flex-col uno'></div>")
	printTitle('#titulo'+id,"POD: " + data.metadata.name)
	printText('#p1'+id,"Creado",azar(),data.metadata.creationTimestamp)
	printText('#p1'+id,"Face",azar(),data.status.phase)
	printText('#p1'+id,"Fecha inicio",azar(),data.status.startTime)

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
	printTableSimple('#p3'+id,columnas,lineas)

	/* Container Statuses */
	deploy_containers_status('#p4'+id,data.status.containerStatuses)
}

function deploy_pods_status(parent,idNamespace,name){
	ajax_GET('/v1/app/namespace/' + idNamespace + '/deployment/' + name + '/pods')
	.then(ok=>{
		/*
		data = new Array
		columns = new Array
		anchos = [ '250px', '250px', '120px', '250px']
		columns.push({nombre:'Nombre',dato:'name'})
		columns.push({nombre:'Creado',dato:'created'})
		columns.push({nombre:'Estado',dato:'status'})
		columns.push({nombre:'Corriendo Deste',dato:'started'})
		*/
		$.each(ok.items,function(i,v){
			id = azar()
			$(parent).append("<div id='" + id + "' class='flex-col'></div>")
			deploy_pod_status('#'+id,v)
			/*
			data.push({name:v.metadata.name,
					   created:v.metadata.creationTimestamp,
					   status:v.status.phase,
					   started:v.status.startTime})
			*/
		})
		/*
		alert(JSON.stringify(data))
		printList(parent,columns,data,null,null,coloresDefault(data),anchos,name,1)
		*/
	})
}

function deploy_statistics(parent,idNamespace,name){
	$(parent).append("IMPLEMENTAR")
}

function deploy_delete(){
	alert("IMPLEMENTAR")
}
