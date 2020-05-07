function solapa_make(parent,sections){
/* sections: un array de objetos con la siguiente estructura:
 *	{
 *		name: <nombre a mostrar en la solapa>
 *		f: funcion de carga de la solapa
 *		p: un array de parametros
 *	}
 *	height: alto del body de la zolapa
 *
 *	NOTA: Siempre el primer parametro que debe poder recibir
 *	la funcion f es el id del body de la solapa
 */

	//alert(parent + " - " + JSON.stringify(sections))
	
	function doit(t,d,a){
		$('#s_s_' + a + ' div.solapa_head div').removeClass('solapa_selected')
		$(t).addClass('solapa_selected')
		$("#s_b_" + a).empty()
		switch(d.p.length){
			case 0: d.f("#s_b_" + a); break;
			case 1: d.f("#s_b_" + a,d.p[0]); break;
			case 2: d.f("#s_b_" + a,d.p[0],d.p[1]); break
			case 3: d.f("#s_b_" + a,d.p[0],d.p[1],d.p[2]); break
			case 4: d.f("#s_b_" + a,d.p[0],d.p[1],d.p[2],d.p[3]); break
			default: alert("solapa_make error: Demasiados parametros")
		}
	}

	var a = azar()
	var first = ''
	$(parent).empty()
	.append("<div id='s_s_" + a + "' class='solapa'>" +
			"<div class='solapa_head' id='s_h_" + a + "'></div>" +
			"<div class='solapa_body overflow-y' id='s_b_" + a + "'></div></div>")
	$.each(sections,function(index,value){
		var b = azar()
		if(first == ''){
			first = "#s_h_s_" + b
		}
		$("#s_h_" + a)
		.append("<div id='s_h_s_" + b + "'>" + value.name + "</div>")
		$("#s_h_s_" + b).on('click',function(){
			doit(this,value,a)
		})
	})
	doit(first,sections[0],a)
}
