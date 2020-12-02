function js(a){
	return JSON.stringify(a)
}

function printSection(parent,type,direction,flex,structure){
	/* parent:		 especifica el elemento DOM que la contendra
	   type:		 especifica si es "skeletor" (solo para ordenar)
  					 o es "data" (posee datos)
	   direction:	 cuando es "skeletor" indica la direccion del flex de css
					 [row,col]
	   flex:		 La relacion. uno, dos, tres en css o un numero que es fijo
	   structure:	 En formato Json, detalla como es la estructura dentro de la
					 seccion cuando type es data. Cada elemento posee tres campos:
						title: titulo a mostrar. Si title es null no se imprime
					    flex: indica la direccion Flex css
					    children: otro structure. Es recursivo
					    id: Un id unico en todo el sitio
	*/
	function printStruct(parent,data){
		/* Imprime de forma recursiva la estructura */
		var titulo = ''
		if(data.title != null)
			titulo = "<H3>" + data.title + "</H3>"
		$("#"+parent)
		.append("<div id='" + data.id + "' class='section_struct " +
				data.flex + "'>" + titulo + "</div>")
		data.children.forEach(function(v){
			printStruct(data.id,v)
		})
	}
	  
	var id = azar()
	var style =''

	if(flex != 'uno' && flex != 'dos' && flex != 'tres'){
		style="style='display:flex; flex:initial;"
		if(direction == 'row')
			style += " width:" + flex + "px'"
		else
			style += " height:" + flex + "px'"
	}
	flex=''
	if(type == "skeletor"){
		$('#' + parent)
		.append("<div id='" + id + "' class='section_skeletor " +
				direction + " " + flex + "' " + style + "></div>")
	} else {
		$('#' + parent)
		.append("<div id='" + id + "' class='section_data col " +
				flex + "' " + style + "></div>")
		/*
		if(typeof(structure.title) != 'undefined')
			$("#" + id).append("<div class='section_title'>" + structure.title + "</div>")
		*/
		printStruct(id,structure)
	}
	return id
}

function printHidden(parent,name,value){
	$("#"+parent).append("<input type='hidden' id='" + name +
						 "' value='" + value + "'>")
}

function printTitle(parent,name){
	$("#"+parent).append("<div class='title v_center'>" + name +
						 "</div>")
}

function printText(parent,label,id,data){
	$("#"+parent)
	.append("<div class='info'><div class='label'>" +
			label + "</div><div class='data'>" + data +
			"<input id='" + id + "' type='hidden' value='" +
			data + "'>" + "</div></div>")
}

function printSelect(parent,label,input_name,options,f_onchange){

	var html = "<div class='info'><div class='label'>" +
			   label + "</div><div class='data'>" +
			   "<select id='" + input_name + "'>"
	var i=0
	html += '<option disabled selected value> ---- </option>'
	options.forEach(function(v,i){
		html += "<option value='" + v.value + "' "
			  + ">" + v.name + "</option>"
	})
	html +=		 "</select></div></div>"
	$("#"+parent).append(html)
	if(f_onchange != null){
		$("#" + input_name).on('change',function(){
			f_onchange("#" + input_name)
		})
	}
}

function printAttibutes(parent,name,grupo,datos){
	/* Presenta un formulario con par key:value */

	function add_line(grupo,parent,dato){
		var idlinea = azar()
		var parte = "parte_" + azar()
		$("#listado_" + id)
		.append("<div id='" + idlinea + "' class='flex-col padding'>" +
				"<div id='" + parte + "' class='flex-row'></div></div>")
		$("#" + parte)
		.append("<div " + grupo + " class='flex-row'>" +
				"<input name='" + idlinea + "' id='name_" + idlinea + "'>" + 
				"<input id='value_" + + idlinea + "'></div>")
		if(dato!=null){
			$("#name_" + idlinea).val(dato.name)
			$("#value_" + idlinea).val(dato.value)
		}
		$("#" + parte).append("<button id='delete_" + idlinea + "'>-</button>")
		$("#delete_" + idlinea).on("click",function(){
			$("#" + idlinea).remove()
		})
	}
	
	var id = azar()
	$("#"+parent)
	.append("<div class='input'>" +
				"<div class='flex-col'>" +
					"<div class='flex-row' style='margin-bottom:10px'>" +
						"<div class='uno title v_center'>" + name + "</div>" +
						"<div class='initial v_center flex'><button id='button_" + id +
						"' class='add_button'>+</button></div>" +
					"</div><div id='listado_" + id + "' class='flex-col'></div>" +
				"</div>" +
			"</div>")
	$("#button_" + id).on("click",function(){
		add_line(grupo,'#listado_' + id,null)
	})

	/* Cargamos datos pasados */
	if(datos != null){
		Object.keys(datos).forEach(function(v,i){
			add_line(grupo,'#listado_' + id,{name:v,value:datos[v]})
		})
	}
}

function printList(parent,name,grupo,campos,datos,unico){
	/* Presenta un formulario compuesto por campos
	 * para gestionar datos que tienen comportamiento
	 * de listado. Por ejemplo... listado de volumens */
	function select_change(parte,idcampo,campos,select,v,idlinea,datos){
		//alert(JSON.stringify(datos))
		$("[select=" + $(select).attr('id') + "]").remove()
		$.each(campos,function(j,w){
			if(w.selectName == v.name){
				if(w.option == $(select).find('option:selected').val()){
					/* Si la seleccion del SELECT implica la aparicion de
 					   nuevos campos, debemos asociarlo al SELECT para que
					   podamos borrarlos posteriormente. para ello, a cada
					   campo le agregamos un atributo de nombre que lo asocie
					   al select. Este attributo sera "select=<id select>" */
					if(w.type=='list'){
						var idparte = azar()
						$("#"+parte).parent().append("<div id='parte_" +
							idparte + "' select='" +
						    $(select).attr('id') +
						    "' class='flex-col tab padding'></div>")
						if(datos != null)
							printList("parte_" + idparte,w.label,w.name,
									  w.data,datos[w.name],false)
                        else
							printList("parte_" + idparte,w.label,w.name,w.data,null,false)
					} else {
						select.after("<div class='flex-row' id='campo_" +
								 idcampo + "'" +
								 " select='" + $(select).attr('id') + "'>" +
								 "<div class='label'>" + w.label +
								 "</div><input name='" + w.name + "' class='plus'" +
								 " style='width:" + w.length +
								 "px' id='" + w.name + "_" + idlinea + "'></div>")
						if(datos != null)
							$("#" + w.name + "_" + idlinea).val(datos[w.name])
					}
				}
			}
		})
	}

	function add_line(grupo,parent,campos,datos){
		var idlinea = azar()
		var parte = "parte_" + azar()
		$("#listado_" + id)
		.append("<div id='" + idlinea + "' " + grupo +
				" class='flex-col AF-item'>" + 
				"<div id='" + parte + "' class='flex-row' " +
				"style='align-items: center'></div></div>")
		$.each(campos,function(i,v){
			var idcampo = azar()
			if(typeof(v.option) == 'undefined'){
				//alert(v.name + ": " + v.type)
				switch(v.type){
					case 'input':
						$("#" + parte)
						.append("<div class='flex-row linea_campo' id='campo_" +
								idcampo + "'><div class='label'>" + v.label +
								"</div><input name='" + v.name + "' style='width:" +
								v.length + "px' id='" + v.name + "_" + idlinea +
								"'></div>")
						if(datos!=null){
							if(typeof(datos)=='string')
								$("#" + v.name + "_" + idlinea).val(datos)
							else
								$("#" + v.name + "_" + idlinea).val(datos[v.name])
						}
						break
					case 'select':
						/* Es un SELECT. Armamos las opciones. Si es una
 						 * edicion, seleccionamos la opcion que deberia ser */
						var options = '<option disabled selected value> ---- </option>'
						$.each(v.options,function(i2,v2){
							options += "<option value='" + v2.value + "'"
							/* Si es una edicion */
							if(datos != null && datos[v.name] == v2.value){
								options += " selected"
							}
							options += ">" + v2.label + "</option>"
						})
						$("#" + parte)
						/* Armamos el SELECT */
						.append("<div class='flex-row linea_campo' id='campo_" + idcampo +
								"'><div class='label'>" + v.label +
								"</div><select name='" + v.name +
								"' class='plus' style='width:" +
								v.length + "px' id='" + v.name + "_" + idlinea + "'>" +
								options + "</select></div>")
						/* Cuando el SELECT cambia */
						$("#campo_" + idcampo).on("change",function(){
							select_change(parte,idcampo,campos,$(this),v,idlinea,null)
						})
						/* Si es una edicion */
						if(datos !=null){
							//alert("Enviamos datos al select")
							select_change(parte,idcampo,campos,
										  $("#campo_" + idcampo),
										  v,idlinea,datos)
						}
						break
					case 'list':
						//alert(JSON.stringify(datos))
						var partelist = "parte_" + azar()
						$("#" + idlinea)
						.append("<div id='" + partelist + 
								"' class='flex-row tab' style='padding: " +
								"10px 0px 10px 10px' ></div></div>")
						if(datos != null){
							//alert("Hay datos")
							printList(partelist,v.label,v.name,v.data,datos[v.name],false)
						} else
							printList(partelist,v.label,v.name,v.data,null,false)
						break
				}
			}
		})
		if(!unico){
			$("#" + parte).append("<img class='AF-remove' id='delete_" + idlinea +
								  "' src='img/remove.png'>")
			$("#delete_" + idlinea).hover(function(){
				$("#" + idlinea).css("background-color","#f78585")
				//$("#" + idlinea).animate({backgroundColor:"#f78585"},400)
			},function(){
				//$("#" + idlinea).animate({backgroundColor:"white"},400)
				$("#" + idlinea).css("background-color","")
			})
			$("#delete_" + idlinea).on("click",function(){
				$("#" + idlinea).remove()
			})
		}
	}

	//alert(JSON.stringify(datos))
	var id = azar()
	var contenido = "<div class='input flex-col'>" +
					"<div class='AF-title'>" +
						"<div class='uno title v_center'>" + name + "</div>" +
						"<div class='initial v_center flex'>"
	if(!unico)
		contenido += "<img class='AF-add' id='button_" + id + "' src='/img/add2.png'>"
	contenido += "</div></div><div id='listado_" + id + "' class='flex-col'></div>" +
				 "</div>"
	$("#" + parent).append(contenido)
	if(!unico){
		$("#button_" + id).on("click",function(){
			add_line(grupo,'#listado_' + id,campos,null)
		})
	} else {
		if(datos == null)
			add_line(grupo,'#listado_' + id,campos,null)
	}

	/* Cargamos datos pasados */
	
	if(datos != null){
		if(!unico){
			datos.forEach(function(v,i){
				add_line(grupo,'#listado_' + id,campos,v)
			})
		} else {
			add_line(grupo,'#listado_' + id,campos,datos)
		}
	}
}

function printButton(parent,label,f){
	var id = azar();
	$("#" + parent).append("<button id='" + id + "'>" + label + "</button>")
	$("#" + id).on("click",function(){
		f()
	})
	return id
}

function printInput(parent,label,id,data){
	$("#" + parent)
	.append("<div class='info'><div class='label'>" +
			label + "</div><div class='data'><input id='" +
			id + "' value='" + data + "'>" +
			"</div></div>")
}

function printTableSimple(parent,columns,data){
	/* Imprime una tabla simple */
	a = azar()
	$("#"+parent).append("<TABLE id='table_" + a +
						 "' class='static_table' border='1'></TABLE>")
	fila=''
	$.each(columns,function(i,v){
		fila += "<TH style='width:" + v.width + "'>" + v.name + "</TH>"
	})
	$('#table_' + a).append("<TR>" + fila + "</TR>")
	$.each(data,function(i,v){
		fila=''
		$.each(v,function(j,w){
			fila += "<TD>" + w + "</TD>"
		})
		$('#table_' + a).append("<TR>" + fila + "</TR>")
	})
}

function azar(){
	return Math.floor(Math.random() * 1000000)
}

function ajax_GET(path,a){
	console.log(path)
	if(typeof(a) != 'undefined')
		var async = a
	else
		var async = true
	return new Promise((resolv,reject)=>{
		$.ajax({
			method: 'GET',
			cache: false,
			headers:{ "token":userToken},
			url: path,
			async: async,
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

function ajax_DELETE(path){
	return new Promise((resolv,reject)=>{
		$.ajax({
			method: 'DELETE',
			cache: false,
			headers:{ "token":userToken},
			url: path,
			contentType: 'application/json',
			success: function(){
				resolv()
			},
			error: function(jqXHR,textStatus,errorThrown){
				reject(jqXHR)
			}
		})
	})
}

function ajax_POST(path,data){
	console.log(apiserver + path)
	return new Promise((resolv,reject)=>{
		$.ajax({
			method: 'POST',
			cache: false,
			headers:{ "token":userToken},
			url: path,
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: function(){
				resolv()
			},
			error: function(jqXHR, textStatus, errorThrown){
				console.log(textStatus, errorThrown);
				reject(jqXHR)
			}
		})
	})
}

function ajax_PUT(path,data){
	console.log(apiserver + path)
	return new Promise((resolv,reject)=>{
		$.ajax({
			method: 'PUT',
			cache: false,
			headers:{ "token":userToken},
			url: path,
			//dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify(data),
			success: function(){
				resolv()
			},
			error: function(jqXHR, textStatus, errorThrown){
				console.log(textStatus, errorThrown);
				reject(jqXHR)
			}
		})
	})
}

function actions_make(parent,actions){
/* Donde actions es un array de objetos:
 * {name:<nombre>,action:<funcion onclick>}
 */
	actions.forEach(function(v,i){
		a = azar()
		$(parent).append("<div id='id" + a + "'>" + v.name + "</div>")
		$("#id" + a).on('click',function(f){
			v.action()
		})
	})
}

function coloresDefault(data){
	var colores = new Array
	var oscuro = false
	$.each(data, function(index,value){
		var color = {background:"", text:""}
		if(oscuro){
			color.background = '#E8E8E8'
			color.text = '#222'
		} else {
			color.background = '#F8F8F8'
			color.text = '#222'
		}
		oscuro = !oscuro
		colores.push(color)
	})
	return colores
}

function ordenar(data,col,asc){
   data.sort((a,b) => (a[col] > b[col])? 1 : -1)
	if(asc){
		data.reverse()
	}
	return data
}

function printTable(padre,columnas,data,onclick,onclickid,colores,anchos,ord_col,ord_dir){
	/* columnas: Es un array con elementos con el siguiente formato:
  		   {nombre:<nombre a mostrar>,dato:<dato a buscar>}
  	   data: array donde cada elemento es un objeto.
	   colores: es un array de la misma cantidad de elementos que filas en data
       cada elemento del array tiene dos valores:
       background      para el color del fondo
       text	    para el color de la fuente
       width	   determina el ancho de la columna
     */

	var idlista = azar()
	var classOscuro = '';
	if(typeof(ord_col) != 'undefined' && typeof(ord_dir) != 'undefined')
		data = ordenar(data,ord_col,ord_dir)

	$(padre).empty()
	$(padre)
	.append("<div id='listado_" + idlista + "' class='listado'>" +
	    "<div id='listado_cabecera_" + idlista + "' class='listado_cabecera'></div>" +
	    "<div id='listado_contenido_" + idlista + "' class='listado_contenido'></div>" +
	    "</div>")

	var border=''
	$.each(columnas,function(index,value){
		$("#listado_cabecera_" + idlista)
		.append("<div style=\"display:flex; width:" + anchos[index] + border + "\">" +
				"<div style=\"display: flex; flex-direction:column; width:25px\">" +
			    "<div id='ord_" + value.nombre + "_up'><img width=\"12px\"" +
				" src='img/up.png'></div>" +
			    "<div id='ord_" + value.nombre + "_down'><img width=\"12px\"" +
				" src='img/down.png'></div>" +
				"</div><div style=\"flex: 1 1\">" + value.nombre + "</div>")
		border = ';border-left: 1px solid #8a8484'
		$("#ord_" + value.nombre + "_up").on("click",function(){
			printList(padre,columnas,data,onclick,onclickid,colores,anchos,value.dato,1,false)
		})
		$("#ord_" + value.nombre + "_down").on("click",function(){
			printList(padre,columnas,data,onclick,onclickid,colores,anchos,value.dato,0,false)
		})
	})

	 $.each(data,function(index,value){
		var seleccionado = ''
		var idfila = azar()
		$("#listado_contenido_" + idlista)
		.append("<div id='listado_fila_" + idfila +
			  	"' class='listado_fila' style=\"background-color:" +
				colores[index].background +
				"; color:" + colores[index].text + "\">")

		$.each(columnas,function(c_index,c_value){
			$("#listado_fila_" + idfila)
			.append("<div style=\"width:" + anchos[c_index] +
					"\">" + value[c_value.dato] + "</div>")
		})
		$("#listado_fila_" + idfila)
		.on('click',function(){
			$("#listado_contenido_" + idlista).children().each(function(index){
				$(this).removeClass("seleccionada")
			})
			$(this).addClass("seleccionada")
			onclick(value[onclickid])
		})
	})
}

function format_data_gauge(data){
	/* Dados datos obtenidos por la api de Prometheus,
	 * Se pasan a datos con formato que comprende la
	 * librería dygraphs */
	var dataf = []
	i = 0
	size = data.length
	for(i=0;i<size;i++){
		dataf.push([new Date(data[i][0] * 1000),parseFloat(data[i][1])])
	}
	return dataf
}

function format_data_counter(data){
	/* Dados datos obtenidos por la api de Prometheus,
	 * Se pasan a datos con formato que comprende la
	 * librería dygraphs */
	var dataf = []
	var prio = null
	var actual = null
	i = 0
	size = data.length
	for(i=0;i<size;i++){
		actual = data[i]
		if (prio != null){
			dataf.push([new Date(actual[0] * 1000),
					   (parseFloat(actual[1]) - parseFloat(prio[1])) / (actual[0] - prio[0])
					   ])
		}
		prio = actual
	}
	return dataf
}

function chart_lines(parent,data,width,height){
	/* data posee la siguiente estructura:
		{ datasets: [{data:[{x:,y:}..],labels:},...], labels:[]}
	 * dataset posee la siguiente estructura:
	   {label:,color:,data
	 * {x:<fecha>,y:<valor>}
	 */
	console.log(data)
	var config =  {
		type: 'line',
		data: data,
		options: {
			scales: {
				xAxes:[
					{display: false}
				]
			},
			responsive: false,
			legend: {
				display: false
			}
		}
	}

	var id = azar()
	$("#" + parent).append("<div width='" + width + "' height='" + height + "'>" +
						   "<canvas id='" + id + "'></canvas></div>")
	var ctx = document.getElementById(id).getContext('2d');
	var litlelinechar = new Chart(ctx, config);
}


function chart_littleLine(parent,d,width,height){
	/* data es un array donde cada elemento es de la forma
	 * {x:<fecha>,y:<valor>}
	 */
	var data = new Array
	var labels = new Array
	d.forEach(function(v){
		data.push(v.y)
		labels.push(v.x)
	})
	console.log(data)
	var valores = new Array;
	var config =  {
		type: 'line',
		data: {
			datasets: [{
				data: data
			}],
			labels:labels
		},
		options: {
			scales: {
				xAxes:[
					{display: false}
				]
			},
			responsive: false,
			legend: {
				display: false
			}
		}
	}

	var id = azar()
	$("#" + parent).append("<div width='" + width + "' height='" + height + "'>" +
						   "<canvas id='" + id + "'></canvas></div>")
	var ctx = document.getElementById(id).getContext('2d');
	var litlelinechar = new Chart(ctx, config);
}

function chart_donut(parent,data,width,height){
	/* data es un array donde cada elemento es de la forma
	 * {nombre:<nombre>,valor:<valor>,color:<color>}
	 */
	var valores = new Array;
	var nombres = new Array;
	var colores = new Array;
	data.forEach(function(v){
		valores.push(v.valor)
		nombres.push(v.nombre)
		colores.push(v.color)
	})
	
	var config =  {
		type: 'doughnut',
		data: {
			datasets: [{
				data: valores,
				backgroundColor: colores,
				label: 'Dataset 1'
			}],
			labels: nombres
		},
		options: {
			responsive: false,
			legend: {
				position: 'bottom'
			}
		}
	}

	var id = azar()
	$("#" + parent).append("<div width='" + width + "' height='" + height + "'>" +
						   "<canvas id='" + id + "'></canvas></div>")
	var ctx = document.getElementById(id).getContext('2d');
	var donutchar = new Chart(ctx, config);
}
