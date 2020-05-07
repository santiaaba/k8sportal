function plus_init(plusButton){
	$(plusButton).on("click",function(){
		$("#plus").empty()
		$("#plus").css('deisplay','flex')
		.animate({
			width:'100%',
			height:'100%'
		},400,plus_make())
	})
	$(document).keyup(function(event){
		if(event.keyCode == 27){
			if($("#plus_add").length > 0){
				$("#plus").empty()
				.css('display','hidden')
				.css('width','0px')
				.css('height','0px')
				$("#plus_add").animate({
					left:'0px',
					bottom:'0px',
					width:'0px'
				},400,function(){$("#plus_add").remove()})
			} else {
				$("#plus").animate({
					width:'0px',
					height:'0px'
				},400,function(){
					$("#plus").empty()
					.css('display','hidden')
				})
			}
		}
	})
}

function plus_make(){
	var data = new Array;
	data.push({title:'Namespace',img:'namespace.png',
			   detail:'Crear un nuevo namespace',
			   f:null})
	data.push({title:'Despliegue',img:'deployment.png',
			   detail:'Crear un nuevo despliegue',f:plus_deployment})
	data.push({title:'Enlatado',img:'can.png',
			   detail:'Crear un nuevo enlatado',f:null})
	$("#plus").append("<div id='plus_items' class='plus_items'></div>")
	$.each(data,function(index,value){
		var id=azar()
		$("#plus_items")
		.append("<div id='plus_item_" + id + "' class='plus_item'><div class='plus_img'>" +
				"<img src='img/" + value.img + "'></div>" +
				"<div class='plus_text'>" +
				"<div class='plus_title'>" + value.title + "</div>" +
				"<div class='plus_detail'>" + value.detail + "</div></div></div>")
		$("#plus_item_" + id).on("click",function(){
			plus_select(value.f)
		})
	})
}

function plus_select(f){
	$("#plus").after("<div id='plus_add' class='plus_add'></div>")
	f()
	$("#plus_add").animate({
		right:'0px',
		width:'100%'
	},400)
}

function plus_add_select(parent,name,input_name,data){
	var html = "<div class='input'>" +
				"<div class='flex-row'>" +
					"<div class='input_label'>" + name + "</div>" +
					"<div class='input_input'><select id='" + input_name + "'>"
	var i=0
	html += '<option disabled selected value> ---- </option>'
	while(i<data.length){
		html += "<option value='" + data[i].value + "' "
			  + ">" + data[i].name + "</option>"
		i++
	}
	html += 	    "</select></div>" +
				"</div>" +
				"<div class='input_error'></div>" +
			"</div>"
	$(parent).append(html)
}

function plus_add_input(parent,name,input_name){
	$(parent)
	.append("<div class='input'>" +
				"<div class='flex-row'>" +
					"<div class='input_label'>" + name + "</div>" +
					"<div><input id='" + input_name + "'></div>" +
				"</div>" +
				"<div class='input_error'></div>" +
			"</div>")
}

function plus_add_list(parent,label,name,campos){
	$(parent)
	.append("<div class='input'>" +
				"<div class='flex-row'>" +
					"<div class='input_label'>" + label + "</div>" +
					"<div class='flex-col'>" +
						"<div class='flex-row'>" +
							"<div id='campos_" + name + "' class='flex-row'></div>" +
							"<div><button id='button_" + name + "'>+</button></div>" +
						"</div>" +
						"<div id='list_" + name + "' class='input_list'></div>" +
					"</div>" +
				"</div>" +
				"<div id='error_" + name + "' class='input_error'></div>" +
			"</div>")
	$.each(campos,function(i,v){
		if(typeof(v.option) == 'undefined'){
			if(v.type == 'input'){
				$("#campos_" + name)
				.append("<div>" + v.name + "</div><input class='plus' style='width:" + v.length +
						"px' id='input_" + name + "_" + v.name + "'>")
			} else {
				var options = '<option disabled selected value> ---- </option>'
				$.each(v.options,function(i2,v2){
					options += "<option>" + v2 + "</option>"
				})
				$("#campos_" + name)
				.append("<div>" + v.name + "</div><select name='" + v.name + "' class='plus' style='width:" +
						v.length + "px' id='input_" + name + "_" + v.name + "'>" + options + "</select>")
				$("#input_" + name + "_" + v.name)
				.on("change",function(){
					const c = campos
					const select = $(this)
					$.each(c,function(i2,v2){
						if(v2.selectName == v.name){
							$("#block_" + name + '_' + v2.option).remove()
							if(v2.option == select.val()){
								select.after("<div class='flex-row' id='block_" + name + "_" + v2.name + "'>"
											 + "<div>" + v2.name + "</div><input class='plus'" +
											 " style='width:" + v2.length +
											 "px' id='input_" + name + "_" + v2.name + "'></div>")
							}
						}
					})
				})
			}
		}
	})
	$("#button_" + name).on("click",function(){
		const c = campos
		var b = azar()
		var value = ''	//Muestra el valor tal cual se pasa luego en la API
		$.each(c,function(i,v){
			if(typeof(v.selectName) != 'undefined'){
				if(v.option == $("#input_" + name + "_" + v.selectName).val()){
					value += '"' + name + '":"' + $("#input_" + name + "_" + v.name).val() + '", '
				}
			} else {
				value += '"' + v.name + '":"' + $("#input_" + name + "_" + v.name).val() + '", '
				if(v.type == 'input'){
					$("#input_" + name + "_" + v.name).val("")
				}
			}
		})
		if(value.length>0){
			value = value.slice(0, -2)
		}
		$("#list_" + name)
		.append("<div id='list_item_" + b + "' class='flex-row'><div>" +
				"<input type='hidden' id='data_" + name + "_" + b + "' value='" + value + "'>" +
				value + "</div><div>" +
				  "<button id='remove_item_" + b + "'>-</button></div></div>")
		$("#input_" + name).val("")
		$("#remove_item_" + b).on("click",function(){
			$("#list_item_" + b).remove()
		})
	})
}

function make_json(elementType){
	switch(elementType){
		case 'deployment':
			return make_json_deployment()
			break
	}
}

function make_json_deployment(){

	var json ='{"deployName":"' + $('#deploy_name').val() + '",' +
	'  "image":"' + $('#deploy_image').val() + '",' +
	'  "containerName":"' + $('#deploy_container_name').val() + '",' +
	'  "resources":{ "cpu":"' + $('#deploy_cpu').val() + 'm",' +
	'   "mem":"' + $('#deploy_mem').val() + 'Mi" },' +
	'  "replicas":' + $('#deploy_replica').val()

	/* Argumentos  */
	var aux =''
	$(':input').each(function(){
		var s = $(this).attr('id')
		if(s.match('data_arg_.*'))
			aux += $(this).val().substring(12) + ','
	})
	if(aux.length > 0)
		json += ',"args":[' + aux.slice(0, -1) + ']'

	/* Environment */
	aux =''
	$(':input').each(function(){
		var s = $(this).attr('id')
		if(s.match('data_env_.*'))
			aux += '{' + $(this).val() + '},'
	})
	if(aux.length > 0)
		json += ',"envs":[' + aux.slice(0, -1) + ']'

	/* Puertos */
	aux =''
	$(':input').each(function(){
		var s = $(this).attr('id')
		if(s.match('data_port_.*'))
			aux += '{' + $(this).val() + '},'
	})
	if(aux.length > 0)
		json += ',"ports":[' + aux.slice(0, -1) + ']'

	/* Volumens */
	aux =''
	$(':input').each(function(){
		var s = $(this).attr('id')
		if(s.match('data_vol_.*'))
			aux += '{' + $(this).val() + '},'
	})
	if(aux.length > 0)
		json += ',"volumes":[' + aux.slice(0, -1) + ']'


	/* Puntos montaje */
	aux =''
	$(':input').each(function(){
		var s = $(this).attr('id')
		if(s.match('data_mount_.*'))
			aux += '{' + $(this).val() + '},'
	})
	if(aux.length > 0)
		json += ',"mounts":[' + aux.slice(0, -1) + ']'

	json += '}'
	return json
}

function plus_commit(parent,elementType,namespaceField){
	/* parent: Es el contenedor del html generado
	 * elementType puede ser: namespace, deployment, service, volume, can
	 * namespaceField: Es el id del input/select del cual id del namespace
	*/
	
	$(parent).append("<button id='submit'>Agregar</button>")
	$('#submit').on('click',function(){
		var data = make_json(elementType)
		namespaceId = $(namespaceField).val()
		alert("namespaceID " + namespaceId)
		$.ajax({
			method: 'POST',
			cache: false,
			headers:{ "token": userToken},
			url: apiserver + '/v1/app/namespace/' + namespaceId + '/' + elementType,
			dataType: 'json',
			contentType: 'application/json',
			data: data,
			success: function(data){
				alert("Alta realizada")
			},
			error: function(jqXHR,textStatus,errorThrown){
				alert(JSON.stringify(jqXHR))
			}
		})
	})
}

function plus_deployment(){
	namespace_data()
	.then(data => {
		//alert(JSON.stringify(data))
		var i=0
		namespaces = new Array
		while(i < data.length ){
			namespaces.push({name:data[i].name,value:data[i].id})
			i++
		}
		plus_add_input('#plus_add','Nombre','deploy_name')
		plus_add_select('#plus_add','Namespace','deploy_namespace',namespaces)
		plus_add_input('#plus_add','Nombre del Contenedor','deploy_container_name')
		plus_add_input('#plus_add','CPU','deploy_cpu')
		plus_add_input('#plus_add','Memoria','deploy_mem')
		plus_add_input('#plus_add','Imagen','deploy_image')
		plus_add_input('#plus_add','Replicas','deploy_replica')
		plus_add_list('#plus_add','Argumentos','arg',[{name:'argumento',length:200,type:'input'}])
		plus_add_list('#plus_add','Variables de Entorno','env',
					[{name:'nombre',length:100,type:'input'},{name:'valor',length:250,type:'input'}])
		plus_add_list('#plus_add','Volumenes','vol',
					[{name:'nombre',length:100,type:'input'},
					{name:'tipo',length:100,type:'select',options:["PVC","EmptyDir","Secret"]},
					{name:'PVC',length:60,type:'input',selectName:'tipo',option:'PVC'},
					{name:'Secret',length:60,type:'input',selectName:'tipo',option:'Secret'}])
		plus_add_list('#plus_add','Puertos Montaje','mount',
					[{name:'nombre',length:150,type:'input'},
					{name:'punto',length:150,type:'input'}])
		plus_add_list('#plus_add','Puertos','port',
					[{name:'nombre',length:100,type:'input'},
					{name:'protocolo',length:60,type:'select',options:["tcp","udp"]},
					{name:'puerto',length:60,type:'input'},
					{name:'tipo',length:100,type:'select',options:["interna","externa","URL"]},
					{name:'externa',length:60,type:'input',selectName:'tipo',option:'externa'},
					{name:'url',length:60,type:'input',selectName:'tipo',option:'URL'}])
		plus_commit('#plus_add','deployment','#deploy_namespace')
	})
	.catch(err=>{
		alert(JSON.stringify(err))
	})
}