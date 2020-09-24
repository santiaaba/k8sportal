function ordenar(data,col,asc){
	data.sort((a,b) => (a[col] > b[col])? 1 : -1)
	if(asc)
		data.reverse()
	return data
}

function armarListado(padre,columnas,data,onclick,onclickid,ord_col,ord_dir){
	/* padre: Es el id del elemento DOM contenedor del lsitado
	 * columnas: Un array donde cada elemento posee:
	 * 			 { nombre: Nombre de la columna,
	 * 			   dato: Nombre del dato en el array dato
	 * 			   tipo: tipo de dato de la columna [string,int,fecha],
	 * 			   width: ancho de la columna }
	 * data: Un array donde cada elemento es una fila de la tabla
	 * onClick: funcion a aplicar al hacer click en la fila
	 * onclickid: nombre del atributo de los datos al enviar como parametro al hacer click
     */

	var idlista = azar()
	var classOscuro = '';

	if(typeof(ord_col) != 'undefined' && typeof(ord_dir) != 'undefined'){
		data = ordenar(data,ord_col,ord_dir)
	}
	$("#"+padre).empty()
	$("#"+padre).append("<div id='listado_" + idlista + "' class='listado'>" + 
	    "<div id='listado_cabecera_" + idlista + "' class='listado_cabecera'></div>" +
	    "<div id='listado_contenido_" + idlista + "' class='listado_contenido'></div>" +
	    "</div>")
	var border=''
	columnas.forEach(function(value){
		$("#listado_cabecera_" + idlista)
		.append("<div style=\"display:flex; width:" + value.width + border + "\">" +
				"<div style=\"display: flex; flex-direction:column; width:25px\">" +
			    "<div id='ord_" + value.nombre + "_up'>" +
				"<img width=\"10px\" src='img/up.png'></div>" +
			    "<div id='ord_" + value.nombre +
				"_down'><img width=\"10px\" src='img/down.png'></div>" +
				"</div><div style=\"flex: 1 1\">" + value.nombre + "</div>")
		border = ';border-left: 1px solid #8a8484'
		$("#ord_" + value.nombre + "_up").on("click",function(){
			armarListado(padre,columnas,data,onclick,onclickid,value.dato,1)
		})
		$("#ord_" + value.nombre + "_down").on("click",function(){
			armarListado(padre,columnas,data,onclick,onclickid,value.dato,0)
		})
	})
	data.forEach(function(value,index){
		var seleccionado = ''
		var idfila = azar()
		$("#listado_contenido_" + idlista)
		.append("<div id='listado_fila_" + idfila +
			   "' class='listado_fila' >")
		columnas.forEach(function(c_value){
			if(	c_value.tipo == 'fecha')
				var valor = posixTimestampToDate(value[c_value.dato])
			else
				var valor = value[c_value.dato]
				$("#listado_fila_" + idfila)
		 		.append("<div style=\"width:" + c_value.width +
						"\">" + valor + "</div>")
		})
		$("#listado_fila_" + idfila).on('click',function(){
	 		$("#listado_contenido_" + idlista).children().each(function(index){
	 			$(this).removeClass("seleccionada")
		 	})
			var params = []
			onclickid.forEach(function(p){
				params[p] = value[p]
			})
			$(this).addClass("seleccionada")
			onclick(params)
		})
	})
}
