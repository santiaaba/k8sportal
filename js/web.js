const wapiserver = "http://k8sportal.lab.fibercorp.com.ar:3001"

var siteChanged = false;
var actionBar;

function task_result(task_id,f){
	/* Busca el resultado de un task y si es "done" ejecuta
	   la funcion f */

	ajax_GET(wapiserver + '/v1/appweb/task/' + task_id)
	.then(data=>{
		if(data.message.status == 'todo'){
			setTimeout(function(){
				task_result(task_id,f)},1000)
		} else {
			f(data)
		}
	})
	.catch(err=>{
		alert("ERROR: " + err)
	})
}

/******* Namespaces ***************/

function www_namespaces(){
	$("#content").empty()
	var s1 = printSection('content','skeletor','col','uno')
	var d1 = printSection(s1,'data','col','200',
		{id:'namespaces_status',title:'Estado',flex:'row',children:[
			{id:'status_pods',title:'Estado',flex:'row',children:[]},
			{id:'status_cpu',title:'Estado',flex:'row',children:[]},
			{id:'status_mem',title:'Estado',flex:'row',children:[]}
		]})
	var d2 = printSection(s1,'data','col','uno',
		{id:'namespaces',title:'Namespaces',flex:'col',children:[]})

	www_namespace_list('namespaces')
}

function www_namespace_list(parent){

	ajax_GET(wapiserver + '/v1/appweb/namespace')
	.then(data =>{
		task_result(data.message.task,function(a){
			armarListado(parent,[{nombre:'Nombre',dato:'name',tipo:'string',width:200}],
						a.message.data,web_namespace,['id','name'],'name',true)
		})

	})
	.catch(err =>{
		alert(JSON.stringify(err))
	})
}

function web_namespace(params){
	alert("web_namespace")
}

/******* Sites ***************/

function www_sites(){
	$("#content").empty()
	var s1 = printSection('content','skeletor','col','uno')
	var d2 = printSection(s1,'data','col','uno',{
		id:'sites',
		title:'Paginas web',
		flex:'col',
		children:[]
	})

	ajax_GET(wapiserver + '/v1/appweb/namespace')
	.then(data =>{
		var promesas = new Array
		var sites = new Array
		var cant
		task_result(data.message.task,function(a){
			cant = a.message.data.length
			//alert(cant)
			a.message.data.forEach(function(v){
				//alert(JSON.stringify(v))
				promesas.push(ajax_GET(wapiserver + '/v1/appweb/namespace/' + v.id + '/site'))
			})
			Promise.all(promesas)
			.then(tasks => {
				//alert(js(tasks))
				tasks.forEach(function(t){
					//alert(js(t))
					task_result(t.message.task,function(a){
						//alert("Entro")
						//alert(js(a.message.data))
						a.message.data.forEach(function(w){
							sites.push({id:w.id,
										name:w.name,
										status:w.status,
										namespaceName:w.namespaceName,
										idNamespace:w.id})
						})
						cant--
						//alert("Sitios: " + JSON.stringify(sites))
						if(cant == 0){
							//alert("Termino: " + cant)
							armarListado('sites',[
								{nombre:'Nombre',dato:'name',tipo:'string',width:200},
								{nombre:'Estado',dato:'status',tipo:'string',width:200},
								{nombre:'Namespace',dato:'namespaceName',tipo:'string',width:200}
                        			],sites,www_site,['id','idNamespace'],'name',true)
						}
					})
				})
			})
			.catch(err => {
				alert(JSON.stringify(err))
			})
		})
	})
	.catch(err =>{
		alert(JSON.stringify(err))
	})
}

function www_site_despliegue(params){
}

function site_as_changed(){
	if(!siteChanged){
		siteChanged = true
		actionBar.add('site_guardar','Guardar','img/save.png',0, function(){
				www_site_save()
		})
		actionBar.render()
	}
}

function www_site(params){
	siteChanged = false

	$("#content").empty()
	.append("<div id='content_data' class='content_data'>" +
            "</div><div id='content_action' class='content_action'></div>")
	var s1 = printSection('content_data','skeletor','row','uno')
	var s2 = printSection(s1,'skeletor','col','uno')
	var s3 = printSection(s1,'skeletor','col','uno')

	var d1 = printSection(s2,'data','col','uno',{
			id:'s_thumbnail',title:'',flex:'col',children:[]})
	var d2 = printSection(s2,'data','col','uno',{
			id:'s_info',title:'Informacion',flex:'col',children:[]})

	var d3 = printSection(s3,'data','col','uno',{
			id:'s_est',title:'Estadisticas',flex:'col',children:[]})
	var d4 = printSection(s3,'data','col','uno',{
			id:'s_config',title:'Configuracion',flex:'col',children:[
				{title:'Instancias',flex:'col',children:[],id:'web_instancias'},
				{title:'Urls',flex:'col',children:[],id:'web_urls'},
				{title:'Indices',flex:'col',children:[],id:'web_indexes'},
				{title:'Certificados',flex:'col',children:[],id:'web_certs'},
				{title:'Asociacion de Certificados',flex:'col',children:[],id:'web_assoc'}
			]})

	console.log(params)
	ajax_GET(wapiserver + '/v1/appweb/namespace/' + params.idNamespace + '/site/' + params.id)
	.then(data =>{
        task_result(data.message.task,function(a){
			//alert(js(a.message.data))
			printText('s_info',"Nombre",azar(),a.message.data.name)
			printText('s_info',"Estado",azar(),a.message.data.status)
			printText('s_info',"Replicas",azar(),a.message.data.replicas)

			/* Instancias y configuraciones especiales */
			$('#web_instancias').append("<div id='slider'></div>")
			$('#web_instancias').append("<div><input id='slider_value' style='width:40px' disabled></div>")
			$("#slider").slider({
				min:1,
				max:20,
				slide: function(event, ui){
					$('#slider_value').val(ui.value)
				},
				classes:{
					"ui-slider": "ui-slider-custom",
					"ui-slider-handle": "ui-slider-handle-custom",
					"ui-slider-horizontal": "ui-slider-horizontal-custom"
				}
			})

			/* URLS */
			armarListaOrdenable('web_urls',a.message.data.urls,site_as_changed)
			
			/* Indices */
			armarListaOrdenable('web_indexes',a.message.data.indexes,site_as_changed)

			/* Barra de acciones */
			actionBar = new ActionBar('content_action')
			if(a.message.data.status == 'ONLINE'){
				actionBar.add('site_detener','Detener','img/stop.png',2, function(){
						www_site_stop(params)
				})
			} else {
				actionBar.add('site_iniciar','Iniciar','img/start.png',2, function(){
						www_site_start(params)
				})
			}
			actionBar.add('site_eliminar','Eliminar','img/delete.png',3,
				function(){ popup.up('confirm','Seguro que desea eliminar','250px','200px',function(){
					www_site_delete(params)
				})
			})
			actionBar.add('site_visualizar','Visualizar','img/goto.png',1, function(){
				window.open('http://www.google.com.ar','_blank')
			})
			actionBar.render()
		})
	})
}

function www_site_save(){
	alert("salvamos el sitio")
	siteChanged = false
	actionBar.remove("site_guardar")
	actionBar.render()
}
