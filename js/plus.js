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
			   help:'<p>Un Namespace le permite organizar sus proyectos.</p>' +
					'<p>Los Namespace agrupan recursos como vol&uacute;menes de discos, ' +
					'despliegues de aplicaciones.</p><p>Las aplicaciones de una namespace ' +
					'pueden verse entre si pero no de con aplicaciones de otros namespace.' +
					'Al menos no si no se lo permite explicitamente</p>',
			   f:crear_namespace})
	data.push({title:'Despliegue',img:'deployment.png',
			   detail:'Crear un nuevo despliegue',
			   help:'<p>Un depliegue es la implementaci&oacute;n de una aplicaci&oacute;n</p>',
			   f:crear_deployment})
	data.push({title:'Volumen',img:'can.png',
			   detail:'Crear un nuevo Volumen',
			   help:'<p>Un volumen es la forma de almacenar datos de forma persistente.</p> ' +
					'<p>Un volumen pertenece al namespace en el que se lo cree. Solo las ' +
					'aplicaciones dentro de ese namespace puede ver el volumen creado</p>',
			   f:crear_volumen})
	data.push({title:'Secret',img:'secret.png',
			   detail:'Crear un nuevo Secreto',
			   help:'<p>Un secreto es la forma de...</p> ',
			   f:crear_secreto})
	data.push({title:'Enlatado',img:'can.png',
			   detail:'Crear un nuevo enlatado',
			   help:'UnEnlatado es...',
			   f:null})
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
			plus_select(value.f,value.img,value.help)
		})
	})
}

function plus_select(f,image,help){
	$("#plus")
	.after("<div id='plus_add' class='plus_add'>" +
		   "<div class='plus_add_detail'>" +
		   "<img src='img/" + image + "'>" +
		   "<div class='plus_help'>" + help + "</div>" +
		   "</div>" +
		   "<div class='plus_add_data' id='plus_add_data'></div></div>")
	f()
	$("#plus_add").animate({
		right:'0px',
		width:'100%'
	},400)
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
function crear_deployment(){
	deploy_despliegue("#plus_add_data",null,null)
}

function crear_namespace(){
	$(".plus_add_data")
	.empty()
	.append(	"<div class='flex uno' id='plus_play' " +
				"style='display:flex; align-items:center'></div>" + 
				"<div style='text-align: center; padding-bottom:10px'>" +
				"<button class='alta_button'>Agregar</button></div></div>")
	printInput('#plus_play',"Namespace",'namespace','')
	$(".alta_button").on('click',function(){
		ajax_POST('/v1/app/namespace/',{name:$("#namespace").val()})
		.then(ok => {
			alert("Namespace dado de alta")
		})
		.catch(err => {
			alert(JSON.stringify(err))
		})
	})
}

function crear_secreto(){
	secret_despliegue("#plus_add_data",null,null)
}

function crear_volumen(){
	/* Opciones de momento estaticas */
	$(".plus_add_data")
	.empty()
	.append(	"<div class='flex uno col' id='plus_play' " +
				"style='display:flex; align-items:left; justify-content:center'></div>" + 
				"<div style='text-align: center; padding-bottom:10px'>" +
				"<button class='alta_button'>Agregar</button></div></div>")
	var options = [{name:'Ceph',value:'csi-rbd-sc'}]
	
	ajax_GET('/v1/app/namespace')
	.then(data=>{
		namespaces = new Array
		data.forEach(function(v,i){
			namespaces.push({name:v.name,value:v.id})
		})
		printSelect('#plus_play',"Namespace",'namespace',namespaces,'')
		printInput('#plus_play',"Nombre del Volumen",'name','')
		printSelect('#plus_play',"Tipo",'type',options,'')
		printInput('#plus_play',"Capasidad(GB)",'size','')
		$(".alta_button").on('click',function(){
			data = {name:$("#name").val(),
					size:$("#size").val(),
					class:$("#type").val()}
			//alert(JSON.stringify(data))
			ajax_POST('/v1/app/namespace/' + $("#namespace").val() + '/volume/',data)
			.then(ok => {
				alert("Volumen dado de alta")
			})
			.catch(err => {
				alert(JSON.stringify(err))
			})
		})
	})
	.catch(err=>{
		alert(JSON.stringify(err))
	})
}
