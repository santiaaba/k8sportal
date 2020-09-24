function chart_get_data(parent, start,end,query){
	$.ajax({
		method: 'GET',
		cache: false,
		url: "http://10.120.78.86:30000/api/v1/query_range",
		data: {
			query: query,
			start: start,
			end: end,
			step: 300
		},
		beforeSend: function(){
			$('#' + parent).empty()
			$('#' + parent).append("<img src='img/loading.gif'>")
		},
		success: function(data){
			$('#' + parent).empty()
			var dataf = format_data_counter(data.data.result[0].values)
        	chart_micro(parent,'cpu',dataf)
		},
		error: function(jqXHR,textStatus,errorThrown){
			reject(jqXHR)
		}
	})
}

function chart_micro(parent,title,data){
	id = azar()
	$('#' + parent).append('<div class="micro_chart"><div>' + title + '</div><div id="' + id +
					 '" style="background-color: #03394a"></div></div>')
	g = new Dygraph(
		document.getElementById(id),
		data,
		{
		width: 500,
		height: 100,
		drawAxis: false,
		axisLineColor: 'white',
		fillGraph: true,
		colors: ['#0b0821'],
		axisLineColor: 'white'
		}
  );
}
