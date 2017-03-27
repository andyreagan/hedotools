// namespace it
var hedotools = hedotools || {};

// begin with some helper functions
// http://stackoverflow.com/a/1026087/3780153
function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// this works really well, but it's deadly slow (working max 5 elements)
// and it's coupled to jquery
// http://stackoverflow.com/a/5047712/3780153
String.prototype.width = function(font) {
    var f = font || '12px arial',
    o = $('<div>' + this + '</div>')
	.css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
	.appendTo($('body')),
    w = o.width();
    o.remove();
    return w;
}

String.prototype.safe = function() {
    var tmp = this.split("/")
    tmp[tmp.length-1] = escape(tmp[tmp.length-1])
    return tmp.join("/");
}

// yup
// http://stackoverflow.com/questions/3883342/add-commas-to-a-number-in-jquery
function commaSeparateNumber(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
	val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
}

function splitWidth(s,w) {
    // s is the string
    // w is the width that we want to split it to
    var t = s.split(" ");
    var n = [t[0]];
    var i = 1;
    var j = 0;
    while (i<t.length) {
	if ((n[j]+t[i]).width() < w) {
	    n[j] += " "+t[i]
	}
	else {
	    j++;
	    n.push(t[i]);
	}
	i++;
    }
    return n;
}

// look away
var intStr0 = ["zero","one","two","three","four","five","six","seven","eight","nine","then"];
var intStr = intStr0.slice(1,100);

/*
hedotools.urllib
=========

a simple hedotools plugin to manage pushing and pulling the visualization state to the brower url

tests
-----
no test suite, I've tested in in Chrome v35 for reasonable use cases

example
-------
also no simple example, but you can see it in use here:
http://www.uvm.edu/storylab/share/papers/dodds2014a/books.html

documentation
-------------
slightly more documentation in the README

new:

decoder returns { current, cached } values
the current will be blank if there is nothing in the url
but the cached remains
I like this feature

*/
hedotools.urllib = {
    encoder: function() {
	var varname = "tmp";
	var varval = [];
	var show = true;
	//var that = this;
	
	function urllib(d) {
	    // nothing yet
	    //console.log(this);
	    //console.log(that);
	    return {current: varval,};
	}

	function parseurl() {
	    GET = {};
	    query = window.location.search.substring(1).split("&");
	    // break down the url
	    for (var i = 0, max = query.length; i < max; i++)
	    {
		if (query[i] === "") // check for trailing & with no param
		    continue;
		var param = query[i].split("=");
		GET[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || "");
	    }

	    baseUrl = window.location.origin+window.location.pathname;
	    var tmpStr = ""
	    if (typeof varval == 'string' || varval instanceof String)
	    { tmpStr+=varval; }
	    else
	    {
		tmpStr += "["+varval[0]
		for (var i=1; i<varval.length; i++) { tmpStr += ","+varval[i]; }
		tmpStr+="]"
	    }
	    GET[varname] = tmpStr;

	    var urlString = ""
	    for (var key in GET) {
		if (GET.hasOwnProperty(key)) {
		    if (varname === key) {
			// console.log("found that variable");
			// console.log(show);
			if (show) {
			    urlString += key+"="+GET[key]+"&";
			}
		    }
		    else { urlString += key+"="+GET[key]+"&"; }
		}
	    }

	    urlString = urlString.substring(0,urlString.length-1);
	    
	    // only add to url if there is stuff
	    if (urlString.length > 0) {
		newDataUrl = baseUrl+"?"+urlString
	    }
	    else { newDataUrl = baseUrl; }

	    window.history.replaceState("object or string", "title",newDataUrl);

	    return urllib;
	}

	urllib.varname = function(_) {
	    if (!arguments.length) return varname;
	    varname = _;
	    return urllib;
	}

	urllib.destroy = function() {
	    show = false;
	    parseurl();
	    show = true;
	    // return urllib;
	}

	urllib.varval = function(_) {
	    if (!arguments.length) return varval;
	    varval = _;
	    return parseurl();
	}

	return urllib;
    },
    decoder: function() {
	var varname = "tmp";
	var varresult = [];
	var defvalue = [];
	
	function urllib(d) {
	    parseurl();
	    return {current: varresult,
		    cached: defvalue};
	}

	function parseurl() {
	    GET = {};
	    query = window.location.search.substring(1).split("&");
	    for (var i = 0, max = query.length; i < max; i++) {
		if (query[i] === "") // check for trailing & with no param
		    continue;
		var param = query[i].split("=");
		GET[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || "");
	    }

	    if (varname in GET) {
		if (GET[varname].length > 0 && GET[varname][0] === "[") {
		    if (GET[varname][GET[varname].length-1] === "]") { 
			var tmpArray = GET[varname].substring(1, GET[varname].length - 1).split(',');
		    }
		    else {
			var tmpArray = GET[varname].substring(1, GET[varname].length).split(',');
		    }
		    varresult = tmpArray;
		    defvalue = tmpArray;
		}
		else {
		    varresult = GET[varname];
		    defvalue = GET[varname];
		}
	    }
	    else {
		// if there is nothing in the url...we'll let the value
		// live. this next line would kill the value
		varresult = ""
	    }
	    return urllib;
	}

	urllib.varname = function(_) {
	    if (!arguments.length) return varname;
	    varname = _;
	    return parseurl();
	}

	urllib.varresult = function(_) {
	    if (!arguments.length) return varresult;
	    varresult = _;
	    defvalue = _;
	    return urllib;
	}

	return urllib;
    }
};












hedotools.barchartoncall = function() {
    var test = function(d,i) {
	// console.log(i);
	i = indices[i];
	if (stateSelType) {
	    shiftComp = i;
	    d3.select(".complabel").text(allData[i].name);
	    compencoder.varval(allData[i].name);
	}
	else {
	    shiftRef = i;
	    d3.select(".reflabel").text(allData[i].name);
	    refencoder.varval(allData[i].name);
	}

	if (shiftRef !== shiftComp) {
	    hedotools.shifter.shift(allData[shiftRef].freq,allData[shiftComp].freq,lens,words);
	    var happysad = hedotools.shifter._compH() > hedotools.shifter._refH() ? "happier" : "less happy";
	    hedotools.shifter.setfigure(d3.select('#shift01')).setText(["Why "+allData[shiftComp].name+" is "+happysad+" than "+allData[shiftRef].name+":"]).plot();
	}
    }
    var opublic = { test: test,
		  };
    return opublic;
}();

// make the plot
hedotools.barchart = function() {
    var figure;

    var setfigure = function(_) {
	// console.log("setting figure");
	figure = _;
	return hedotools.barchart;
    }

    var xlabeltext = "Happiness difference from US as a whole";
    var _xlabeltext = function(_) {
	if (!arguments.length) return xlabeltext;
	xlabeltext = _;
	return hedotools.barchart;
    }

    var data;
    var datanames;
    var geodata;

    var setdata = function(a,b) {
	data = a;
	geodata = b;
	datanames = Array(geodata.length);
	for (var i=0; i<geodata.length; i++) {
	    datanames[i] = geodata[i].properties.name;
	}
	return hedotools.barchart;
    }
    
    var _data = function(_) {
	if (!arguments.length) return data;
	data = _;
	return hedotools.barchart;
    }

    var _datanames = function(_) {
	if (!arguments.length) return datanames;
	datanames = _;
	return hedotools.barchart;
    }
    
    var figheight = 730;
    var _figheight = function(_) {
	if (!arguments.length) return figheight;
	figheight = _;
	return hedotools.barchart;
    }

    var manualTicks = [];
    var _manualTicks = function(_) {
	if (!arguments.length) return manualTicks;
	manualTicks = _;
	return hedotools.barchart;
    }

    var sortedStates;
    var getSorted = function(_) {
	if (!arguments.length) return sortedStates.map(function(d) { return d[2]; });
	if (_) {
	    return sortedStates.map(function(d,i) { return (i+1)+". "+d[2]; });
	}
	else {
	    return sortedStates.map(function(d) { return d[2]; });
	}
	return hedotools.barchart;
    }


    var plot = function() {
	/* plot the bar chart

	   -take a d3 selection, and draw the bar chart SVG on it
	   -requires the magnitude for each state, and the geojson
           with the names

	*/
	var margin = {top: 0, right: 0, bottom: 0, left: 0};
	var axeslabelmargin = {top: 0, right: 0, bottom: 50, left: 0};
	var figwidth = parseInt(figure.style('width')) - margin.left - margin.right;
	// aspectRatio = 1.9,
	// figheight = parseInt(d3.select('#barChart').style('width'))*aspectRatio - margin.top - margin.bottom,
	var width = figwidth-axeslabelmargin.left-axeslabelmargin.right;
	var height = figheight-axeslabelmargin.top-axeslabelmargin.bottom;
	var figcenter = width/2;
	var leftOffsetStatic = axeslabelmargin.left;

	// do the sorting
	var indices = Array(data.length);
	for (var i = 0; i < data.length; i++) { indices[i] = i; }
	// sort by abs magnitude
	// indices.sort(function(a,b) { return Math.abs(data[a]) < Math.abs(data[b]) ? 1 : Math.abs(data[a]) > Math.abs(data[b]) ? -1 : 0; });
	// sort by magnitude, parity preserving
	indices.sort(function(a,b) { return data[a] < data[b] ? 1 : data[a] > data[b] ? -1 : 0; });
	sortedStates = Array(data.length);
	for (var i = 0; i < data.length; i++) { sortedStates[i] = [i,indices[i],datanames[indices[i]],data[indices[i]]]; }
	// console.log(sortedStates);

	// remove an old figure if it exists
	figure.select(".canvas").remove();

	var canvas = figure.append("svg")
	    .attr("width",figwidth)
	    .attr("height",figheight)
	    .attr("class","canvas")
	    .attr("id","barchartsvg");

	// x scale, maps all the data to 
	var absDataMax = d3.max([d3.max(data),-d3.min(data)]);
	var x = d3.scale.linear()
	    .domain([-absDataMax,absDataMax])
	    .range([5,width-10]);

	// linear scale function
	var y =  d3.scale.linear()
	    .domain([data.length,1])
	    .range([height-20, 5]); 

	// // zoom object for the axes
	// var zoom = d3.behavior.zoom()
	// 	.y(y) // pass linear scale function
	//     // .translate([10,10])
	// 	.scaleExtent([1,1])
	// 	.on("zoom",zoomed);

	// create the axes themselves
	var axes = canvas.append("g")
	    .attr("transform", "translate(" + (axeslabelmargin.left) + "," +
		  (axeslabelmargin.top) + ")")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", "main");
	// .call(zoom);

	// create the axes background
	// var bgrect = axes.append("svg:rect")
	// 	.attr("width", width)
	// 	.attr("height", height)
	// 	.attr("class", "bg")
	// 	.style({'stroke-width':'2','stroke':'rgb(0,0,0)'})
	// 	.attr("fill", "#FCFCFC");

	// create the x axes
	var bgrect = axes.append("svg:line")
    	    .attr("x1", width)
    	    .attr("y1", height)
    	    .attr("x2", axeslabelmargin.left)
    	    .attr("y2", height)
    	//.attr("class", "bg")
    	    .style({'stroke-width':'1','stroke':'rgb(10,10,10)'});
    	//.attr("fill", "#FCFCFC");

	// axes creation functions
	var create_xAxis = function() {
	    return d3.svg.axis()
		.ticks(4)
		.scale(x)
		.orient("bottom"); }

	// // axis creation function
	// var create_yAxis = function() {
	// 	return d3.svg.axis()
	// 	    .scale(y) //linear scale function
	// 	    .orient("left"); }

	// // draw the axes
	// var yAxis = create_yAxis()
	// 	.innerTickSize(6)
	// 	.outerTickSize(0);

	// axes.append("g")
	// 	.attr("class", "y axis ")
	// 	.attr("font-size", "14.0px")
	// 	.attr("transform", "translate(0,0)")
	// 	.call(yAxis);

	var xAxis;
	if (manualTicks.length > 0) {
	    xAxis = create_xAxis()
		.innerTickSize(6)
		.outerTickSize(0)
		.tickValues(manualTicks);
	}
	else {
	    xAxis = create_xAxis()
		.innerTickSize(6)
		.outerTickSize(0);
	}

	axes.append("g")
	    .attr("class", "x axis ")
	    .attr("font-size", "14.0px")
	    .attr("transform", "translate(0," + (height) + ")")
	    .call(xAxis);

	d3.selectAll(".tick line").style({'stroke':'black'});

	// create the clip boundary
	// var clip = axes.append("svg:clipPath")
	// 	.attr("id","clip")
	// 	.append("svg:rect")
	// 	.attr("x",0)
	// 	.attr("y",0)
	// 	.attr("width",width)
	// 	.attr("height",height);

	// // now something else
	// var unclipped_axes = axes;

	// axes = axes.append("g")
	// 	.attr("clip-path","url(#clip)");

	// var ylabel = canvas.append("text")
	// 	.text("State Rank")
	// 	.attr("class","axes-text")
	// 	.attr("x",(figwidth-width)/4)
	// 	.attr("y",figheight/2+30)
	// 	.attr("font-size", "16.0px")
	// 	.attr("fill", "#000000")
	// 	.attr("transform", "rotate(-90.0," + (figwidth-width)/4 + "," + (figheight/2+30) + ")");

	var xlabel = canvas.append("text")
	    // .text("Happiness")
	    .text(xlabeltext)
	    .attr("class","axes-text")
	    .attr("x",width/2+(figwidth-width)/2)
	    .attr("y",3*(figheight-height)/4+height)
	    .attr("font-size", "16.0px")
	    .attr("fill", "#000000")
	    .attr("style", "text-anchor: middle;");

	axes.selectAll("rect.staterect")
	    .data(sortedStates)
	    .enter()
	    .append("rect")
	    .attr("class", function(d,i) { return d[2]+" staterect"+" q"+classColor(i+1)+"-8"; })
	    .attr("x", function(d,i) { if (d[3]>0) { return figcenter; } else { return x(d[3]); } })
	    .attr("y", function(d,i) { return y(i+1); })
	    .style({'opacity':'1.0','stroke-width':'1.0','stroke':'rgb(100,100,100)'})
	    .attr("height",function(d,i) { return 11; } )
	    .attr("width",function(d,i) { if (d[3]>0) {return d3.max([x(d[3])-figcenter,0]);} else {return d3.max([figcenter-x(d[3]),0]); } } )
	    .on('mouseover', function(d,i){
		var rectSelection = d3.select(this).style({'opacity':'1.0','stroke':'black','stroke-width':'1.0',});
		hedotools.barchartoncall.test(d,i);
	    })
	    .on('mouseout', function(d){
		var rectSelection = d3.select(this).style({'opacity':'1.0','stroke':'rgb(100,100,100)','stroke-width':'1.0',});
		// var rectSelection = d3.select(this).style({opacity:'0.7'});
	    });

	axes.selectAll("text.statetext")
	    .data(sortedStates)
	    .enter()
	    .append("text")
	    .attr("class", function(d,i) { return d[2]+" statetext"; })
	    .attr("x", function(d,i) { if (d[3]>0) { return figcenter-6; } else { return figcenter+6; } })
	    .style("text-anchor", function(d,i) { if (d[3]>0) { return "end";} else { return "start";}})
	    .attr("y",function(d,i) { return y(i+1)+11; } )
            .text(function(d,i) { return (i+1)+". "+d[2]; })
	    .on('mouseover', function(d,i){
		hedotools.barchartoncall.test(d,i);
	    });

	// d3.select(window).on("resize.shiftplot",resizeshift);
	
	// function resizeshift() {
	// 	figwidth = parseInt(d3.select("#shift01").style('width')) - margin.left - margin.right,
	// 	width = .775*figwidth
	// 	figcenter = width/2;

	// 	canvas.attr("width",figwidth);

	// 	x.range([(sortedWords[0].length+3)*9, width-(sortedWords[0].length+3)*9]);
	// 	topScale.range([width*.1,width*.9]);

	// 	bgrect.attr("width",width);
	// 	//axes.attr("transform", "translate(" + (0.125 * figwidth) + "," +
	// 	//      ((1 - 0.125 - 0.775) * figheight) + ")");
	
	// 	// mainline.attr("d",line);

	// 	// fix the x axis
	// 	canvas.select(".x.axis").call(xAxis);

	// 	clip.attr("width",width);

	// 	// get the x label
	// 	xlabel.attr("x",(leftOffsetStatic+width/2));

	// 	// the andy reagan credit
	// 	credit.attr("x",width-7);

	// 	// line separating summary
	// 	sepline.attr("x2",width);

	// 	// all of the lower shift text
	// 	axes.selectAll("text.shifttext").attr("x",function(d,i) { if (d>0) {return x(d)+2;} else {return x(d)-2; } } );
	// }
    };

    var opublic = { setfigure: setfigure,
		    setdata: setdata,
		    _data: _data,
		    _manualTicks: _manualTicks,
		    _datanames: _datanames,
		    _figheight: _figheight, 
		    _xlabeltext: _xlabeltext, 
		    getSorted: getSorted, 
		    plot: plot, };

    return opublic;
}();









// on call as a module
// in the test function, can set the function that gets called
// when the lens is moved
// full flexibility
hedotools.lensoncall = function() { 
    var test = function(extent1) {
	console.log("set on load (works for maps.html)");
	// reset
	for (var j=0; j<allData.length; j++) {
	    for (var i=0; i<allData[j].rawFreq.length; i++) {
		var include = true;
		// check if in removed word list
		for (var k=0; k<ignoreWords.length; k++) {
		    if (ignoreWords[k] == words[i]) {
			include = false;
			//console.log("ignored "+ignoreWords[k]);
		    }
		}
		// check if underneath lens cover
		if (lens[i] >= extent1[0] && lens[i] <= extent1[1]) {
		    include = false;
		}
		// include it, or set to 0
		if (include) {
		    allData[j].freq[i] = allData[j].rawFreq[i];
		}
		else { allData[j].freq[i] = 0; }
		
	    }
	}
	hedotools.computeHapps.go();
	hedotools.map.setfigure(d3.select('#map01')).setdata(geoJson).plot();
	if (shiftRef !== shiftComp) {
	    hedotools.shifter.shift(allData[shiftRef].freq,allData[shiftComp].freq,lens,words);
	    var happysad = hedotools.shifter._compH() > hedotools.shifter._refH() ? "happier" : "less happy";
	    hedotools.shifter.setfigure(d3.select('#shift01')).setText(["Why "+allData[shiftComp].name+" is "+happysad+" than "+allData[shiftRef].name+":"]).plot();
	}
    }
    var opublic = { test: test, };
    return opublic;
}();

hedotools.lens = function() {

    // for now, keep track of which page we're in
    // since they're all a bit different
    var page = "geo";

    var encoder = hedotools.urllib.encoder().varname("lens"); //.varval(lensExtent);
    var decoder = hedotools.urllib.decoder().varname("lens").varresult([4,6]); //.varval(lensExtent);

    var figure;
    var lens;
    var margin = {top: 0, right: 55, bottom: 0, left: 0};
    var figwidth;
    var figheight = 100 - margin.top - margin.bottom;
    var width;
    var height = .875*figheight-5;
    var leftOffsetStatic;

    var grabwidth = function() {
	figwidth = parseInt(figure.style('width')) - margin.left - margin.right;
	width = .875*figwidth-5;
	leftOffsetStatic = 0.125*figwidth;
    }

    var setfigure = function(_) {
	console.log("setting figure");
	figure = _;
	grabwidth();
	return hedotools.lens;
    }

    var setdata = function(_) {
	lens = _;
	return hedotools.lens;
    }
    
    lensExtent = decoder().cached;

    var plot = function () {

	if (figwidth > 10) {

	    // remove an old figure if it exists
	    figure.selectAll(".canvas").remove();

	    var canvas = figure.append("svg")
		.attr("width",figwidth)
		.attr("height",figheight)
		.attr("id","lenssvg")
		.attr("class","canvas");


	    // create the x and y axis
	    var x = d3.scale.linear()
	        .domain([1.00,9.00])
		// .domain(d3.extent(lens))
		.range([0,width]);
	    
	    // use d3.layout http://bl.ocks.org/mbostock/3048450
	    var data = d3.layout.histogram()
		.bins(x.ticks(65))
                (lens);

	    // linear scale function
	    var y =  d3.scale.linear()
		.domain([0,d3.max(data,function(d) { return d.y; } )])
		.range([height, 0]); 

	    // create the axes themselves
	    var axes = canvas.append("g")
		.attr("transform", "translate(" + (0.125 * figwidth) + "," +
		      ((1 - 0.125 - 0.875) * figheight) + ")")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "main");

	    // create the axes background
	    var bgrect = axes.append("svg:rect")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "bg")
		.style({'stroke-width':'2','stroke':'rgb(0,0,0)'})
		.attr("fill", "#FFFFF0");

	    // axes creation functions
	    var create_xAxis = function() {
		return d3.svg.axis()
		    .scale(x)
		    .ticks(9)
		    .orient("bottom"); }

	    // axis creation function
	    var create_yAxis = function() {
		return d3.svg.axis()
		    .ticks(3)
		    .scale(y) //linear scale function
		    .orient("left"); }

	    // draw the axes
	    var yAxis = create_yAxis()
		.innerTickSize(6)
		.outerTickSize(0);

	    axes.append("g")
		.attr("class", "top")
		.attr("transform", "translate(0,0)")
		.attr("font-size", "12.0px")
		.call(yAxis);

	    var xAxis = create_xAxis()
		.innerTickSize(6)
		.outerTickSize(0);

	    axes.append("g")
		.attr("class", "x axis ")
		.attr("font-size", "12.0px")
		.attr("transform", "translate(0," + (height) + ")")
		.call(xAxis);

	    d3.selectAll(".tick line").style({'stroke':'black'});

	    // create the clip boundary
	    var clip = axes.append("svg:clipPath")
		.attr("id","clip")
		.append("svg:rect")
		.attr("x",0)
		.attr("y",80)
		.attr("width",width)
		.attr("height",height-80);

	    var unclipped_axes = axes;
	    
	    //axes = axes.append("g")
	    //.attr("clip-path","url(#clip)");

	    canvas.append("text")
		.text("Num Words")
		.attr("class","axes-text")
		.attr("x",(figwidth-width)/4)
		.attr("y",figheight/2+30)
		.attr("font-size", "12.0px")
		.attr("fill", "#000000")
		.attr("transform", "rotate(-90.0," + (figwidth-width)/4 + "," + (figheight/2+30) + ")");

	    // var xlabel = canvas.append("text")
	    // 	.text("Word score")
	    // 	.attr("class","axes-text")
	    // 	.attr("x",width/2+(figwidth-width)/2)
	    // 	.attr("y",figheight)
	    // 	.attr("font-size", "12.0px")
	    // 	.attr("fill", "#000000")
	    // 	.attr("style", "text-anchor: middle;");

	    var lensMean = d3.mean(lens);

	    var bar = axes.selectAll(".distrect")
		.data(data)
		.enter()
		.append("g")
		.attr("class","distrect")
		.attr("fill",function(d,i) { if (d.x > lensMean) {return "#D3D3D3";} else { return "#D3D3D3";}})
		.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

	    var mainrect = bar.append("rect")
		.attr("x", 1)
		.attr("width", x(data[0].dx+1)-2 )
		.attr("height", function(d) { return height - y(d.y); });

	    var line = d3.svg.line()
		.x(function(d,i) { return x(d.x); })
		.y(function(d) { return y(d.y); })
		.interpolate("linear");

	    var mainline = axes.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("d", line)
		.attr("stroke","black")
		.attr("stroke-width",3)
		.attr("fill","none");

	    //console.log(x(d3.min(lens)));

	    var brushX = d3.scale.linear()
		.domain([1,9])
		// .domain(d3.extent(lens))
		.range([figwidth*.125,width+figwidth*.125]);
	    


	    function brushended() {
		if (!d3.event.sourceEvent) return;
		var extent0 = brush.extent(),
		extent1 = extent0; // should round it to bins

		onredrawfunction();
		
		// window.stopVals = extent1;
		// console.log(extent1);
		if ((extent1[0] !== lensExtent[0]) || (extent1[1] !== lensExtent[1]))
		{	    

		    lensExtent = [Math.round(extent1[0]*4)/4,Math.round(extent1[1]*4)/4];
		    hedotools.lensoncall.test(extent1);
		} 

		d3.select(this).transition()
		    .call(brush.extent(lensExtent))
		    .call(brush.event);

		encoder.varval(lensExtent);
	    }

	    var brush = d3.svg.brush()
		.x(brushX)
		.extent(lensExtent)
		.on("brushend",brushended);

	    var gBrush = canvas.append("g")
		.attr("class","lensbrush")
		.call(brush)
		.call(brush.event);

	    gBrush.selectAll("rect")
		.attr("height",height)
		.attr("y",0)
		.style({'stroke-width':'2','stroke':'rgb(100,100,100)','opacity': 0.95})
		.attr("fill", "#FCFCFC");

	    //console.log(lensExtent);

	    function resizelens() {
		figwidth = parseInt(d3.select("#lens01").style('width')) - margin.left - margin.right,
		width = .775*figwidth;

		canvas.attr("width",figwidth);

		x.range([0,width]);
		bgrect.attr("width",width);
		//axes.attr("transform", "translate(" + (0.125 * figwidth) + "," +
		//      ((1 - 0.125 - 0.775) * figheight) + ")");
		
		mainline.attr("d",line);

		//create_xAxis.scale(x);
		//xAxisHandle.call(xAxis);
		canvas.select(".x.axis").call(xAxis);

		canvas.selectAll(".distrect").attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
		
		// xlabel.attr("x",(leftOffsetStatic+width/2));

		d3.selectAll(".tick line").style({'stroke':'black'});

		// //brushX.range([figwidth*.125,width+figwidth*.125]);
		brushX.range([leftOffsetStatic,leftOffsetStatic+width]);
		brush.x(brushX);
		d3.select(".lensbrush") //.transition()
		    .call(brush.extent(lensExtent))
		    .call(brush.event);
		//brushing();
		//brush.event();
	    };

	    d3.select(window).on("resize.selectlens",resizelens);

	    // var buttongroup = figure.append("div").attr({"class":"btn-group-vertical",});
	    //buttongroup.html('<button type="button" class="btn btn-default">Button</button><button type="button" class="btn btn-default">Button</button><div class="btn-group"><button id="btnGroupVerticalDrop1" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Dropdown<span class="caret"></span>        </button>     <ul class="dropdown-menu" role="menu" aria-labelledby="btnGroupVerticalDrop1">          <li><a href="#">Dropdown link</a></li>          <li><a href="#">Dropdown link</a></li>        </ul></div>      <button type="button" class="btn btn-default">Button</button>'

	    figure.selectAll("div.btn-group-vertical").remove();
	    var buttongroup = figure.append("div").attr({"class":"btn-group-vertical pull-right",})
	    // var defaults = [[4,6],[3,7],[3,9],[1,7],[5,5]];
	    var defaults = [[4,6],[3,7],[5,5]];
	    // var defaultnames = ["Default","Wide","Sad","Happy","None"];
	    var defaultnames = ["Default","Wide","None"];
	    buttongroup.selectAll("button").data(defaults).enter()
		.append("button")
		.attr({"type":"button",
                       "class": function(d,i) { return "btn btn-default btn-xs "+defaultnames[i]; },})
		.html(function(d,i) { return defaultnames[i]; })
		.on("click",function(d,i) { 
		    figure.selectAll("button").attr("class","btn btn-default btn-xs"); 
		    d3.select(this).attr("class","btn btn-primary btn-xs"); 
		    d3.select(".lensbrush") //.transition()
			.call(brush.extent(d))
			.call(brush.event);
		});
	    // initially check if any are matched
	    console.log(lensExtent);
	    for (var i=0; i<defaults.length; i++) {
		if (defaults[i][0] === parseFloat(lensExtent[0]) && defaults[i][1] === parseFloat(lensExtent[1])) {
		    // make it active
		    buttongroup.select("button."+defaultnames[i]).attr("class","btn btn-primary btn-xs");
		}
	    }

	}; // if figwidth > 10
    }

    var onredrawfunction = function() {
	console.log("I got called");
    }

    var opublic = { setfigure: setfigure,
		    setdata: setdata,
		    plot: plot,
		    onredrawfunction: onredrawfunction,
		  };

    return opublic;
}();
hedotools.map = function() {

    var figure;

    var setfigure = function(_) {
	console.log("setting figure");
	figure = _;
	return hedotools.map;
    }

    var classColor = d3.scale.quantize()
        .range([0,1,2,3,4,5,6])
        .domain([50,1]);

    var geoJson;

    var setdata = function(_) {
	geoJson = _;
	return hedotools.map;
    }
    
    var plot = function() {
	/* 
	   plot the state map!

	   drawMap(figure,geoJson);
           -figure is a d3 selection
           -geoJson is the loaded us-states file
           -stateHapps is the loaded csv (state,val)
	*/

	//Width and height
	var w = parseInt(figure.style('width'));
	var h = w*650/900;

	// remove an old figure if it exists
	figure.select(".canvas").remove();

	//Create SVG element
	var canvas = figure
	    .append("svg")
	    .attr("class", "map canvas")
	    .attr("id", "mapsvg")
	    .attr("width", w)
	    .attr("height", h);

	var selarray = [false,true],
	selstrings = ["Reference","Comparison"],
	selstringslen = selstrings.map(function(d) { return d.width(); }),
	initialpadding = 5,
	boxpadding = 5,
	fullselboxwidth = selarray.length*boxpadding*2-boxpadding+initialpadding+d3.sum(selstringslen);

	var legendscale = d3.scale.linear()
            .domain([340,730])
            .range([0,1]);

	function makeSelector() {

	    canvas.append("text")
		.attr({
		    "x": (w-70-fullselboxwidth-56),
		    "y": 54,
		    "fill": "grey",
		})
		.text("Selecting ");

	    var selgroup = canvas.append("g")
		.attr({"class": "selgroup",
		       "transform": "translate("+(w-70-fullselboxwidth)+","+40+")",});

	    selgroup.append("rect")
		.attr({"class": "selbox",
		       "x": 0,
		       "y": 0,
		       "rx": 3,
		       "ry": 3,
		       "width": fullselboxwidth,
		       "height": 19,
		       "fill": "#F8F8F8",
		       'stroke-width': '0.5',
		       'stroke': 'rgb(0,0,0)'});
	    
	    selgroup.selectAll("rect.colorclick")
    		.data(selarray)
    		.enter()
    		.append("rect")
    		.attr({"class": function(d,i) { return "colorclick "+intStr[i]; },
    		       "x": function(d,i) { if (i === 0) { return 0; }
					    else { return d3.sum(selstringslen.slice(0,i))+i*boxpadding+(i-1)*boxpadding+initialpadding; } },
    		       "y": 0,
		       "rx": 3,
		       "ry": 3,
    		       "width": function(d,i) { if (i === 0) { return selstringslen[i]+initialpadding+boxpadding; } else { return selstringslen[i]+boxpadding*2; }},
    		       "height": 19,
    		       "fill": "#F8F8F8", //http://www.w3schools.com/html/html_colors.asp
		       'stroke-width': '0.5',
		       'stroke': 'rgb(0,0,0)'});

	    selgroup.selectAll("text")
    		.data(selstrings)
    		.enter()
    		.append("text")
    		.attr({ "x": function(d,i) { 
		    // start at 2
		    if (i==0) { return initialpadding; }
		    // then use 2+width+10+width+10+width...
		    // for default padding of 5 on L/R
		    else { return d3.sum(selstringslen.slice(0,i))+initialpadding+i*boxpadding*2; } },
    			"y": 14, 
    			"class": function(d,i) { return "seltext "+intStr[i]; },
		      })
    		.text(function(d,i) { return d; });

	    selgroup.selectAll("rect.selclick")
    		.data(selarray)
    		.enter()
    		.append("rect")
    		.attr({"class": "selrect",
    		       "x": function(d,i) { if (i === 0) { return 0; }
					    else { return d3.sum(selstringslen.slice(0,i))+i*boxpadding+(i-1)*boxpadding+initialpadding; } },
    		       "y": 0,
    		       "width": function(d,i) { if (i === 0) { return selstringslen[i]+initialpadding+boxpadding; } else { return selstringslen[i]+boxpadding*2; }},
    		       "height": 19,
    		       "fill": "white", //http://www.w3schools.com/html/html_colors.asp
    		       "opacity": "0.0",})
    		.on("mousedown", function(d,i) {
		    if (stateSelType !== d) {
			stateSelType = d;
			activeHover = true;
			d3.selectAll("text.seltext").attr("fill","black")
			d3.select("text.seltext."+intStr[i]).attr("fill","white")
			d3.selectAll("rect.colorclick").attr("fill","#F8F8F8").attr("stroke","rgb(0,0,0)")
			d3.select("rect.colorclick."+intStr[i]).attr("fill","#428bca").attr("stroke","#428bca"); 
			d3.select(".selbutton.one").attr("class","btn btn-default btn-xs pull-right selbutton one");
			d3.select(".selbutton.two").attr("class","btn btn-default btn-xs pull-right selbutton two");
			d3.select(".selbutton."+intStr[i]).attr("class","btn btn-primary btn-xs pull-right selbutton "+intStr[i]);
			d3.selectAll(".state").attr("stroke-width",0.7);
		    }
    		});

	    selgroup.selectAll("line")
    		.data(selstrings.slice(0,selstrings.length-1))
    		.enter()
    		.append("line")
    		.attr("stroke","grey")
    		.attr("stroke-width","2")
    		.attr("x1", function(d,i) { 
		    return d3.sum(selstringslen.slice(0,i+1))+i*boxpadding+(i+1)*boxpadding+initialpadding;
		})
    		.attr("x2", function(d,i) { 
		    return d3.sum(selstringslen.slice(0,i+1))+i*boxpadding+(i+1)*boxpadding+initialpadding;
		})
    		.attr("y1", 0)
    		.attr("y2", 19); 

	    if (stateSelType) {
		var i = 1; 
	    }
	    else { 
		var i = 0; 
	    }

	    d3.selectAll("text.seltext").attr("fill","black")
	    d3.select("text.seltext."+intStr[i]).attr("fill","white")
	    d3.selectAll("rect.colorclick").attr("fill","#F8F8F8").attr("stroke","rgb(0,0,0)")
	    d3.select("rect.colorclick."+intStr[i]).attr("fill","#428bca").attr("stroke","#428bca");

	}

	function makeLegend(legendwidth,legendheight,textsize) { 

	    var legendarray = [0,1,2,3,4,5,6],
	    legendstringslen = [legendwidth,legendwidth,legendwidth,legendwidth,legendwidth,legendwidth,legendwidth,],
	    initialpadding = 0,
	    boxpadding = 0.25,
	    fulllegendboxwidth = legendarray.length*boxpadding*2-boxpadding+initialpadding+d3.sum(legendstringslen);

	    var legendgroup = canvas.append("g")
		.attr({"class": "legendgroup",
		       "transform": "translate("+(w-50-fulllegendboxwidth)+","+(h-legendheight-legendheight-2)+")",});

	    legendgroup.selectAll("rect.legendrect")
    		.data(legendarray)
    		.enter()
    		.append("rect")
    		.attr({"class": function(d,i) { return "q"+i+"-8"; },
    		       "x": function(d,i) { if (i === 0) { return 0; }
					    else { return d3.sum(legendstringslen.slice(0,i))+i*boxpadding+(i-1)*boxpadding+initialpadding; } },
    		       "y": 0,
		       // "rx": 3,
		       // "ry": 3,
    		       "width": function(d,i) { return legendstringslen[i]; },
    		       "height": legendheight,
		       'stroke-width': '1',
		       'stroke': 'rgb(0,0,0)'});

	    legendgroup.selectAll("text.legendtext")
		.data(["less happy","happier"])
		.enter()
		.append("text")
		.attr({"x": function(d,i) {
		    if (i==0) { return 0; }
		    else { return fulllegendboxwidth-d.width(textsize+"px arial"); } },
    		       "y": legendheight+legendheight, 
    		       "class": function(d,i) { return "legendtext"; },
		       "font-size": textsize+"px",
		      })
    		.text(function(d,i) { return d; });
	}

	var scaleFactor = legendscale(w);

	makeLegend((20+10*scaleFactor),(8+5*scaleFactor),(9+3*scaleFactor));

	//Define map projection
	var projection = d3.geo.albersUsa()
	    .translate([w/2, h/2])
	    .scale(w*1.3);
	//.scale(1000);

	//Define path generator
	var path = d3.geo.path()
	    .projection(projection);

	var numColors = 20,
        hueRange = [240,60], // in degrees
        // see http://hslpicker.com/#ffd900
        saturation = 1, // full
        lightness = 0.5; // half
	var colors = Array(numColors);
	var colorStrings = Array(numColors);
	for (i = 0; i<numColors; i++) {
	    colors[i] = hslToRgb((hueRange[0]+(hueRange[1]-hueRange[0])/(numColors-1)*i)/360, saturation, lightness);
	    colorStrings[i] = "rgb(" + colors[i][0] + "," + colors[i][1] + "," + colors[i][2] + ")"
	}
	// console.log(colors);
	// console.log(colorStrings);
	
	//Define quantize scale to sort data values into buckets of color
	color = d3.scale.quantize()
	//.range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);
            .range(colorStrings)
	    .domain([
		d3.min(allData, function(d) { return d.avhapps; }), 
		d3.max(allData, function(d) { return d.avhapps; })
	    ]);

	//Colors taken from colorbrewer.js, included in the D3 download

	// do the sorting
	indices = Array(allData.length-1);
	for (var i = 0; i < allData.length-1; i++) { indices[i] = i; }
	indices.sort(function(a,b) { return Math.abs(allData[a].avhapps) < Math.abs(allData[b].avhapps) ? 1 : Math.abs(allData[a].avhapps) > Math.abs(allData[b].avhapps) ? -1 : 0; });
	sortedStates = Array(allData.length-1);
	for (var i = 0; i < allData.length-1; i++) { sortedStates[i] = [i,indices[i],allStateNames[indices[i]]]; }
	// console.log(sortedStates);
	sortedStateList = Array(allData.length);
	for (var i = 0; i < allData.length; i++) { sortedStateList[indices[i]] = i+1; }

	stateFeatures = topojson.feature(geoJson,geoJson.objects.states).features;

	//Bind data and create one path per GeoJSON feature
	var states = canvas.selectAll("path")
	    .data(stateFeatures);
	
	states.enter()
	    .append("path")
	    .attr("d", function(d,i) { return path(d.geometry); } )
	    .attr("id", function(d,i) { return d.properties.name; } )
	    .attr("class",function(d,i) { return "state map "+d.properties.name[0]+d.properties.name.split(" ")[d.properties.name.split(" ").length-1]+" "+"q"+classColor(sortedStateList[i])+"-8"; } )
            .on("mousedown",state_clicked)
            .on("mouseover",state_hover)
            .on("mouseout",state_unhover);

	states.exit().remove();

	states
	    .attr("stroke","black")
	    .attr("stroke-width",".7");

	function state_clicked(d,i) { 
	    // next line verifies that the data and json line up
	    // console.log(d.properties.name); console.log(allData[i].name);

	    if (activeHover) { 
		// stop hovering
		activeHover = false;
		// remove the color
		d3.selectAll(".state").style("fill",null);
		if (stateSelType) {
		    // select the comparison
		    d3.selectAll(".state."+allData[i].name[0]+allData[i].name.split(" ")[allData[i].name.split(" ").length-1])
			.attr("stroke-width",3);
		}
		else {
		    // toggle the reference
		    d3.selectAll(".state."+allData[i].name[0]+allData[i].name.split(" ")[allData[i].name.split(" ").length-1])
			.attr("stroke-width",3);
		}
	    }
	    else {
		activeHover = true;
		d3.selectAll(".state").attr("stroke-width",0.7);
	    }

	    //.text("Average Happiness h").append("tspan").attr("baseline-shift","sub").text("avg");

	    

	    // if (shiftRef !== i) {
	    //     //console.log("reference "+allData[i].name);
	    //     shiftRef = i;
	    //     d3.selectAll(".state.map").attr("stroke-width",".7");
	    //     d3.selectAll(".state.list").attr("stroke","none");
	    //     d3.selectAll(".state."+allData[i].name[0]+allData[i].name.split(" ")[allData[i].name.split(" ").length-1])
	    // 	.attr("stroke-width",3);
	    // }
	    // else { 
	    //     //console.log("reference everything");
	    //     shiftRef = 51;
	    //     d3.selectAll(".state.map").attr("stroke-width","0.7");
	    //     d3.selectAll(".state.list").attr("stroke","none");
	    //         //.attr("stroke-width",3);
	    // }
	    
	    // if (shiftRef !== shiftComp) {
	    //     shiftObj = shift(allData[shiftRef].freq,allData[shiftComp].freq,lens,words);
	    //     plotShift(d3.select('#shift01'),shiftObj.sortedMag.slice(0,200),
	    // 	      shiftObj.sortedType.slice(0,200),
	    // 	      shiftObj.sortedWords.slice(0,200),
	    // 	      shiftObj.sumTypes,
	    // 	      shiftObj.refH,
	    // 	      shiftObj.compH);
	    // }
	}

	function state_hover(d,i) { 
	    var bbox = this.getBBox(); 
	    var x = Math.floor(bbox.x + bbox.width/2.0);
	    var y = Math.floor(bbox.y + bbox.height/2.0);
	    // console.log(x);
	    // console.log(y);

	    var wordsstring = "Words Used: "+commaSeparateNumber(d3.sum(allData[i].freq)),// +"/"+commaSeparateNumber(d3.sum(allData[i].rawFreq)),
	    wordsstring2 = "Total Words: "+commaSeparateNumber(d3.sum(allData[i].rawFreq)),
	    USwordsstring = "US Words Used: "+commaSeparateNumber(d3.sum(allData[51].freq)),// +"/"+commaSeparateNumber(d3.sum(allData[i].rawFreq)),
	    USwordsstring2 = "US Total Words: "+commaSeparateNumber(d3.sum(allData[51].rawFreq)),
	    happsstring = "Average Happiness: "+allData[i].avhapps.toFixed(2)
	    //hoverboxheight = 115,
	    hoverboxheight = 125+51,
	    hoverboxwidth = d3.max([wordsstring.width('13px arial'),happsstring.width('15px arial'),wordsstring2.width('13px arial'),USwordsstring.width('13px arial'),USwordsstring2.width('13px arial')])+20,
	    hoverboxxoffset = 60;
	    var hoverboxyoffset = 30;
	    
	    // if it would wrap it over, move it to the left side
	    if ((x+hoverboxwidth+hoverboxxoffset)>w) {
		hoverboxxoffset = -hoverboxxoffset-hoverboxwidth;
	    }

	    // if it would wrap it over, move it to the left side
	    if ((y-hoverboxheight/2-hoverboxyoffset)<0) {
		hoverboxyoffset = -30;
	    }
	    
	    var hovergroup = canvas.append("g").attr({
		"class": "hoverinfogroup",
		"transform": "translate("+(x+hoverboxxoffset)+","+(y-hoverboxheight/2-hoverboxyoffset)+")",});

	    var hoverbox = hovergroup.append("rect").attr({
		"class": "hoverinfobox",
		"x": 0,
		"y": 0,
		"width": hoverboxwidth,
		"height": hoverboxheight,
		"fill": "white",
		"stroke": "black",
	    });

	    hovergroup.append("text").attr({
		"class": "hoverinfotext",
		"x": 10,
		"y": 15,
		"font-size": 15,
	    })
		.text(allData[i].name);

	    hovergroup.append("line").attr({
		"class": "hoverinfotext",
		"x": 10,
		"y": 15,
		"font-size": 15,
	    })
		.text(allData[i].name);

	    hovergroup.append("text").attr({
		"class": "hoverinfotext",
		"x": 10,
		//"y": 55,
		"y": 38,
		"font-size": 17,
	    })
		.text("Rank:"); // +"/51");

	    hovergroup.append("text").attr({
		"class": "hoverinfotext",
		"x": 59,
		"y": 55,
		"font-size": 40,
	    })
		.text(sortedStateList[i]); // +"/51");

	    hovergroup.append("text").attr({
		"class": "hoverinfotext",
		"x": 105,
		"y": 56,
		"font-size": 20,
	    })
		.text("out of 51");

	    hovergroup.append("text").attr({
		"class": "hoverinfotext",
		"x": 10,
		//"y": 73,
		"y": 79,
		"font-size": 15,
	    })
		.text(happsstring);

	    hovergroup.append("text").attr({
		"class": "hoverinfotext",
		"x": 10,
		//"y": 89,
		"y": 97,
		"font-size": 13,
	    })
		.text(wordsstring);

	    hovergroup.append("text").attr({
		"class": "hoverinfotext",
		"x": 10,
		//"y": 106,
		"y": 114,
		"font-size": 13,
	    })
		.text(wordsstring2);

	    hovergroup.append("text").attr({
		"class": "hoverinfotext",
		"x": 10,
		//"y": 106,
		"y": 131,
		"font-size": 13,
	    })
		.text("US Average Happiness: "+allData[51].avhapps.toFixed(2));

	    hovergroup.append("text").attr({
		"class": "hoverinfotext",
		"x": 10,
		//"y": 89,
		"y": 97+51,
		"font-size": 13,
	    })
		.text(USwordsstring);

	    hovergroup.append("text").attr({
		"class": "hoverinfotext",
		"x": 10,
		//"y": 106,
		"y": 114+51,
		"font-size": 13,
	    })
		.text(USwordsstring2);

	    if (activeHover) {
		if (stateSelType) {
		    shiftComp = i;
		    d3.select(".complabel").text(allData[i].name);
		    compencoder.varval(allData[i].name);
		}
		else {
		    shiftRef = i;
		    d3.select(".reflabel").text(allData[i].name);
		    refencoder.varval(allData[i].name);
		}

		// next line verifies that the data and json line up
		// console.log(d.properties.name); console.log(allData[i].name.split(" ")[allData[i].name.split(" ").length-1]); 
		d3.selectAll(".state."+allData[i].name[0]+allData[i].name.split(" ")[allData[i].name.split(" ").length-1]).style("fill","#428bca");

		if (shiftRef !== shiftComp) {
		    hedotools.shifter.shift(allData[shiftRef].freq,allData[shiftComp].freq,lens,words);
		    var happysad = hedotools.shifter._compH() > hedotools.shifter._refH() ? "happier" : "less happy";
		    hedotools.shifter.setfigure(d3.select('#shift01')).setText(["Why "+allData[shiftComp].name+" is "+happysad+" than "+allData[shiftRef].name+":"]).plot();
		}
	    }
	}

	function state_unhover(d,i) { 

	    d3.select(".hoverinfogroup").remove();

	    if (activeHover) {
		// next line verifies that the data and json line up
		// console.log(d.properties.name); console.log(allData[i].name.split(" ")[allData[i].name.split(" ").length-1]); 
		// shiftComp = i;
		//console.log(".state.list."+allData[i].name[0]+allData[i].name.split(" ")[allData[i].name.split(" ").length-1]);
		//d3.selectAll(".state.list."+allData[i].name[0]+allData[i].name.split(" ")[allData[i].name.split(" ").length-1])
		//.style("fill",null);
		d3.select(this)
		    .style("fill",null);
	    }
	}

	function resizemap() {
	    w = parseInt(figure.style('width'));
	    h = w*650/900;
	    projection.translate([w/2, h/2]).scale(w*1.3);
	    canvas.selectAll("path").attr("d",path);
	    canvas.attr("width",w).attr("height",h);
	};

	d3.select(window).on("resize.map",resizemap);

    };


    /*
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   Number  h       The hue
     * @param   Number  s       The saturation
     * @param   Number  l       The lightness
     * @return  Array           The RGB representation
     */
    function hslToRgb(h, s, l){
	var r, g, b;

	if(s == 0){
            r = g = b = l; // achromatic
	}else{
            function hue2rgb(p, q, t){
		if(t < 0) t += 1;
		if(t > 1) t -= 1;
		if(t < 1/6) return p + (q - p) * 6 * t;
		if(t < 1/2) return q;
		if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
		return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    var opublic = { setfigure: setfigure,
		    setdata: setdata,
		    plot: plot, };

    return opublic;

}();






hedotools.sankeyoncall = function() { 
    var test = function(i,data) {
	console.log("set in module");

	console.log(allDataOld);
	
	hedotools.shifter.shift(allDataOld[data[i].index].freq,allData[data[i].index].freq,lens,words);
	var happysad = hedotools.shifter._compH() > hedotools.shifter._refH() ? "happier" : "less happy";
	hedotools.shifter.setfigure(d3.select('#shift01')).setText(["Why "+data[i].name+" has become "+happysad+":"]).plot();


    }
    var opublic = { test: test, };
    return opublic;
}();

hedotools.sankey = function() { 

    var popuptimer;

    var figure;

    var setfigure = function(_) {
	console.log("setting figure");
	figure = _;
	// grabwidth();
	return hedotools.sankey;
    }

    var oldlist;
    var newlist;
    var stateNames;

    var oldindices;
    var newindices;
    var data;

    var setdata = function(a,b,c) {
	oldlist = a;
	newlist = b;
	stateNames = c;
	if ( stateNames[50] === "District of Columbia" ) {
	    stateNames[50] = "DC";
	}

	// do the sorting
	oldindices = Array(oldlist.length);
	for (var i = 0; i < oldlist.length; i++) { oldindices[i] = i; }

	// sort by abs magnitude
	// oldindices.sort(function(a,b) { return Math.abs(data[a]) < Math.abs(data[b]) ? 1 : Math.abs(data[a]) > Math.abs(data[b]) ? -1 : 0; });

	// sort by magnitude, parity preserving
	oldindices.sort(function(a,b) { return oldlist[a] < oldlist[b] ? 1 : oldlist[a] > oldlist[b] ? -1 : 0; });

	// do the sorting on new data
	newindices = Array(newlist.length);
	for (var i = 0; i < newlist.length; i++) { newindices[i] = i; }

	newindices.sort(function(a,b) { return newlist[a] < newlist[b] ? 1 : newlist[a] > newlist[b] ? -1 : 0; });

	data = Array(oldlist.length);
	for (var i=0; i<data.length; i++) {
	    data[i] = {
		"name": stateNames[i],
		"index": i,
		"oldindex": oldindices.indexOf(i),
		"newindex": newindices.indexOf(i),
		"change": newlist[i]-oldlist[i],
		"oldhapps": oldlist[i],
		"newhapps": newlist[i],
	    };
	}

	// console.log(data);
	// tmpglob = data;

	return hedotools.sankey;
    }

    // initialize everything so other function in this module have access
    var margin;
    var axeslabelmargin;
    var figwidth;
    var aspectRatio;
    var figheight;
    var width;
    var height;
    var figcenter;
    var leftOffsetStatic;

    var canvas;
    var x;
    var y;
    var axes;

    var oldstateselection;
    var newstateselction;
    var path;
    var sankeydata;
    var pathwidth;
    var pathselection;

    var listlabels;
    var extraSideWidth = [0,0];

    var useTip = false;
    var tip;

    var minwidth = 450;

    // make the plot
    var plot = function() {
	margin = {top: 0, right: 0, bottom: 0, left: 0};
	axeslabelmargin = {top: 0, right: 90+extraSideWidth[0], bottom: 0, left: 90+extraSideWidth[1]};
	figwidth = parseInt(figure.style('width')) - margin.left - margin.right;
	if (figwidth<minwidth) {
	    console.log("width is too small...");
	    d3.selectAll(".reftimelabel,.comptimelabel,.reftimelabelbottom,.comptimelabelbottom").remove();
	    figure.append("text").text("Unfortunately, this visualization will look terrible on your device. If you're on a phone, try rotating and refreshing, or looking from a desktop. Thanks :)");
	    return hedotools.sankey;
	}
	aspectRatio = 1.8+3.4*(oldlist.length-51)/(304-51);
	figheight = parseInt(figure.style('width'))*aspectRatio - margin.top - margin.bottom;
	// console.log("figheight is "+figheight);
	// figheight = 4576; // for the city sankey this seems good
	width = figwidth-axeslabelmargin.left-axeslabelmargin.right;
	height = figheight-axeslabelmargin.top-axeslabelmargin.bottom;
	figcenter = width/2;
	leftOffsetStatic = axeslabelmargin.left;

	var hovergroup = figure.append("div").attr({
	    "class": "hoverinfogroup",
	    // "transform": "translate("+(x+hoverboxxoffset+axeslabelmargin.left)+","+(d3.min([d3.max([0,y-hoverboxheight/2-hoverboxyoffset]),height-hoverboxheight]))+")", 
	})
	    .style({
		"position": "absolute",
		"top": "100px",
		"left": "100px",
		"visibility": "hidden",
	    });

	function hidehover() {
	    console.log("hiding hover");
	    d3.selectAll("path").transition().duration(500).style("opacity","1.0");
	    if (useTip) {
		hovergroup.style({
		    "visibility": "hidden",
		});
	    }
	}

	// remove an old figure if it exists
	figure.select(".canvas").remove();

	canvas = figure.append("svg")
	    .attr("width",figwidth)
	    .attr("height",figheight)
	    .attr("id","sankeysvg")
	    .attr("class","canvas")

	// x scale, maps all the data to 
	x = d3.scale.linear()
	    .domain([0,1])
	    .range([5,width-10]);

	// linear scale function
	y =  d3.scale.linear()
	    .domain([newlist.length,1])
	    .range([height-20, 5]); 

	// create the axes themselves
	axes = canvas.append("g")
	    .attr("transform", "translate(" + (axeslabelmargin.left) + "," +
		  (axeslabelmargin.top) + ")")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", "main");

	// if (useTip) {
	//     console.log("setting tip");
	//     tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d; });
	//     axes.call(tip);
	// }

	oldstateselection = axes.selectAll("text.statetext.old")
	    .data(data)
	    .enter()
	    .append("text")
	    .attr("class", function(d,i) { return d.name+" statetext"; })
	    .attr("x",20)
	    .style("text-anchor", "end")
	    .attr("y",function(d,i) { return y(d.oldindex+1)+11; } )
            .text(function(d,i) { return (d.oldindex+1)+". "+d.name; });

	newstateselection = axes.selectAll("text.statetext.new")
	    .data(data)
	    .enter()
	    .append("text")
	    .attr("class", function(d,i) { return d.name+" statetext"; })
	    .attr("x",width-20)
	    .style("text-anchor", "start")
	    .attr("y",function(d,i) { return y(d.newindex+1)+11; } )
            .text(function(d,i) { return (d.newindex+1)+". "+d.name; });

	// create an instance of the sankey to make paths
	var sankey = d3.sankey();
	path = sankey.link();

	// create the sankey data thingy
	sankeydata = Array(oldlist.length);
	for (var i=0; i<data.length; i++) {
	    sankeydata[i] = {
		"source": {
		    "x": 20,
		    "dx": 2,
		    "y": y(data[i].oldindex+1)-8, 
		},
		"target": {
		    "x": width-22,
		    "dx": 2,
		    "y": y(data[i].newindex+1)-8,
		},
		"name": data[i].name,
		"oldhapps": data[i].oldhapps,
		"newhapps": data[i].newhapps,
		"oldindex": data[i].oldindex,
		"newindex": data[i].newindex,
		"sy": 10,
		"ty": 10,
		"dy": 10,
	    };
	}

	pathwidth = d3.scale.linear()
	    .domain(d3.extent(data.map(function(d) { return Math.abs(d.change); })))
	    .range([2,13]);

	pathselection = axes.selectAll("path.sankey").data(sankeydata)
	    .enter()
	    .append("path")
            .attr({ "d": path,
		    "fill": "none",
		    "class": function(d,i) { return "r"+classColor(data[i].oldindex)+"-8"; },
		    "stroke-width": function(d,i) { return pathwidth(Math.abs(data[i].change)); } })
	    .on("mouseover", function(d,i) { 
		// console.log(i);
		// console.log(data[i]);
		// var rectSelection = d3.select(this)
		//     .style({'opacity':'0.7',
		// 	    // 'stroke-width':'1.0',
		// 	   });

		var thispath = this;

		hedotools.sankeyoncall.test(i,data);

		d3.selectAll("path").transition().duration(750).style("opacity","0.1");
		d3.select(this).transition().duration(5).style("opacity","1.0");

		if (useTip) {

		    // var bbox = this.getBBox(); 
		    // var x = Math.floor(bbox.x + bbox.width/2.0); 
		    // var y = Math.floor(bbox.y + bbox.height/2.0);

		    var hoverboxheight = 90;
		    var hoverboxwidth = 200;
		    var hoverboxyoffset = 0;
		    var hoverboxxoffset = 0;

		    var x = d3.mouse(thispath)[0];
		    var y = d3.mouse(thispath)[1];

                    var hoverboxheightguess = 190;
		    if (refcity.length > 0) {
			hoverboxheightguess = 270;
		    }
		    if ((y+hoverboxheightguess)>height) { y-=(y+hoverboxheightguess-height); }
		    
		    // tip.show;
		    // console.log(d);

		    hovergroup.style({
			"position": "absolute",
			"top": y+"px",
			"left": x+"px",
			"visibility": "visible",
		    });

		    hovergroup.selectAll("p,h3,button,br").remove();

		    hovergroup.append("h3")
			.attr("class","cityname")
			.text(d.name);

		    hovergroup.append("p")
			.attr("class","refhapps")
		    	.text(reftimeseldecoder().cached+" Happiness: "+parseFloat(d.oldhapps).toFixed(2));

		    hovergroup.append("p")
			.attr("class","refrank")
		    	.text(reftimeseldecoder().cached+" Rank: "+(d.oldindex+1));

		    hovergroup.append("p")
			.attr("class","comphapps")
		    	.text(comptimeseldecoder().cached+" Happiness: "+parseFloat(d.newhapps).toFixed(2));

		    hovergroup.append("p")
			.attr("class","comprank")
		    	.text(comptimeseldecoder().cached+" Rank: "+(d.newindex+1));

		    var popupshift = function(refyear,refname,compyear,compname) {
			refshifttimeencoder.varval(refyear);
			refshiftcityencoder.varval(refname);
			compshifttimeencoder.varval(compyear);
			compshiftcityencoder.varval(compname);
			// write a function to call on the load
			drawShift = function() {
			    hedotools.shifter._refF(refF);
			    hedotools.shifter._compF(compF);
			    hedotools.shifter.stop();
			    hedotools.shifter.shifter();
			    hedotools.shifter.setText(["Why "+compname+" in "+compyear+" is "+( ( hedotools.shifter._compH() > hedotools.shifter._refH() ) ? "happier" : "less happy" )+" than "+refname+" in "+refyear+":"]).plot();
			    $('#myModal').modal('show');
			}
			// load both of the files
			var csvLoadsRemaining = 2;
			// var reffile = "http://hedonometer.org/data/cities/word-vectors/"+reftimeseldecoder().cached+"/"+d.name+".csv";
			// if (parseInt(reftimeseldecoder().cached) < 2014) reffile+=".new"
			// var compfile = "http://hedonometer.org/data/cities/word-vectors/"+comptimeseldecoder().cached+"/"+d.name+".csv";
			// if (parseInt(comptimeseldecoder().cached) < 2014) compfile+=".new"
			var reffile = "http://hedonometer.org/data/cities/word-vectors/"+refyear+"/"+refname+".csv";
			if (parseInt(refyear) < 2014) reffile+=".new"
			var compfile = "http://hedonometer.org/data/cities/word-vectors/"+compyear+"/"+compname+".csv";
			if (parseInt(compyear) < 2014) compfile+=".new"
			console.log(reffile);
			console.log(compfile);
			var refF;
			var compF;
			d3.text(reffile,function(text) {
			    refF = text.split(",");
			    console.log(refF);
			    if (!--csvLoadsRemaining) drawShift();
			});
			d3.text(compfile,function(text) {
			    compF = text.split(",");
			    console.log(compF);
			    if (!--csvLoadsRemaining) drawShift();
			});
		    }

		    hovergroup.append("button")
			.attr("class","btn btn-sm btn-primary")
		    	.text("Shift city vs previous year")
			.on("click", function() {
			    console.log(d);
			    console.log(i);
			    popupshift(reftimeseldecoder().cached,d.name,comptimeseldecoder().cached,d.name);
			});

		    hovergroup.append("br");
		    hovergroup.append("br");

		    hovergroup.append("button")
			.attr("class","btn btn-sm btn-primary")
		    	.text("Shift city in "+reftimeseldecoder().cached+" vs sum "+reftimeseldecoder().cached)
			.on("click", function() {
			    console.log(d);
			    console.log(i);
			    popupshift(reftimeseldecoder().cached,"US",reftimeseldecoder().cached,d.name);
			});

		    hovergroup.append("br");
		    hovergroup.append("br");

		    hovergroup.append("button")
			.attr("class","btn btn-sm btn-primary")
		    	.text("Shift city in "+comptimeseldecoder().cached+" vs sum "+comptimeseldecoder().cached)
			.on("click", function() {
			    console.log(d);
			    console.log(i);
			    popupshift(comptimeseldecoder().cached,"US",comptimeseldecoder().cached,d.name);
			});

		    hovergroup.append("br");
		    hovergroup.append("br");


		    hovergroup.append("button")
			.attr("class","btn btn-xs btn-primary")
		    	.text("Select as reference for city-city comparison")
			.on("click", function() {
			    console.log(d);
			    console.log(i);
			    refcity = d.name;
			});

		    if (refcity.length > 0) {
			hovergroup.append("br");
			hovergroup.append("br");
			hovergroup.append("button")
			    .attr("class","btn btn-xs btn-primary")
		    	    .text("Compare against "+refcity+" in "+comptimeseldecoder().cached)
			    .on("click", function() {
				console.log(d);
				console.log(i);
				popupshift(comptimeseldecoder().cached,refcity,comptimeseldecoder().cached,d.name);
			    });
			hovergroup.append("br");
			hovergroup.append("br");
			hovergroup.append("button")
			    .attr("class","btn btn-xs btn-primary")
		    	    .text("Compare against "+refcity+" in "+reftimeseldecoder().cached)
			    .on("click", function() {
				console.log(d);
				console.log(i);
				popupshift(reftimeseldecoder().cached,refcity,reftimeseldecoder().cached,d.name);
			    });
		    }
		}
		
		clearTimeout(popuptimer);
		popuptimer = setTimeout(hidehover,3000);
	    })
	    .on("mouseout", function(d,i) { 
		var timeout = 500;
		if (useTip) {
		    // hovergroup.style({
		    // 	"visibility": "hidden",
		    // });

		    timeout = 3000;
		    clearTimeout(popuptimer);

		    popuptimer = setTimeout(hidehover,timeout);
		}
		clearTimeout(popuptimer);
		popuptimer = setTimeout(hidehover,timeout);
		var rectSelection = d3.select(this)
		    .style({ 'opacity':'1.0', }) 
	    });

	return hedotools.sankey;
    };

    var replot = function() {
	// assuming that the data has been updated
	// console.log(oldstateselection);
	// console.log(newstateselection);

	console.log(data);
	
	oldstateselection.data(data)
	    .transition()
	    .duration(3000)
            .text(function(d,i) { return (d.oldindex+1)+". "+d.name; })
	    .attr("y",function(d,i) { return y(d.oldindex+1)+11; } );

    	newstateselection.data(data)
	    .transition()
	    .duration(3000)
            .text(function(d,i) { return (d.newindex+1)+". "+d.name; })
    	    .attr("y",function(d,i) { return y(d.newindex+1)+11; } );

	// create the sankey data thingy
	for (var i=0; i<data.length; i++) {
	    sankeydata[i] = {
		"source": {
		    "x": 20,
		    "dx": 2,
		    "y": y(data[i].oldindex+1)-8, 
		},
		"target": {
		    "x": width-22,
		    "dx": 2,
		    "y": y(data[i].newindex+1)-8,
		},
		"name": data[i].name,
		"oldhapps": data[i].oldhapps,
		"newhapps": data[i].newhapps,
		"oldindex": data[i].oldindex,
		"newindex": data[i].newindex,
		"sy": 10,
		"ty": 10,
		"dy": 10,
	    };
	}

	// update the width function
	pathwidth.domain(d3.extent(data.map(function(d) { return Math.abs(d.change); })));

	pathselection.data(sankeydata)
	    .transition()
	    .duration(3000)
            .attr({ "d": path,
		    // don't update this
		    // because the transition is applied by the css at the end
		    // and it messes up the whole effect
		    // "class": function(d,i) { return "r"+classColor(data[i].oldindex)+"-8"; },
		    "stroke-width": function(d,i) { return pathwidth(Math.abs(data[i].change)); } });

	return hedotools.sankey;
    };

    // need functions to access updated properties
    var GETdata = function() {
	return data;
    };

    var GETnewindices = function() {
	return newindices;
    };

    var setTitles = function(titles) {
	listlabels = titles;
	return hedotools.sankey;
    };

    var setSideWidth = function(listTwoByOne) {
	extraSideWidth = listTwoByOne;
	return hedotools.sankey;
    };

    var setTipOn = function() {
	useTip = true;
	return hedotools.sankey;
    };

    var opublic = {
	plot: plot,
	setfigure: setfigure,
	setdata: setdata,
	data: GETdata,
	newindices: GETnewindices,
	replot: replot,
	setTitles: setTitles,
	setSideWidth: setSideWidth,
	setTipOn: setTipOn,
    };

    return opublic;

}();







// current usage example:
// (from the sankey page)
//
// hedotools.shifter.shift(allDataOld[hedotools.sankey.newindices()[0]].freq,allDatra[hedotools.sankey.newindices()[0]].freq,lens,words);
// hedotools.shifter.setfigure(d3.select("#shift01")).setHeight(400).setText("Why "+allDataOld[hedotools.sankey.newindices()[0]].name+" has become "+"happier"+":").plot();
//
// there are two options for having it compute the shift
// calling the .shift() with four arguments does the trick
// or calling .shifter() with no arguments also does 
// for the latter, need to have defined the variables beforehand
// using the _lens, _words, etc accessors
//
// if the text isn't set, will attempt to grab it using the
// allData structure (which works in the maps.html)
//
// the text setting here removes all p instances in the figure,
// and then inserts a new one before the svg, inside the figure (using d3.insert)
//
// can also use the setText method to set the text

// define the shifter module 
hedotools.shifter = function()
{
    // for the word type selection
    var shiftselencoder = hedotools.urllib.encoder().varname("wordtypes");
    var shiftseldecoder = hedotools.urllib.decoder().varname("wordtypes").varresult("none");
    // initialize that we have't selected a shift
    var shiftTypeSelect = false;
    var shiftType = -1;

    // put the status of the viz into the bar
    var viz_type = hedotools.urllib.encoder().varname("viz");
    var viz_type_decoder = hedotools.urllib.decoder().varname("viz").varresult("wordshift");
    var viz_type_use_URL = false;
    // if (viz_type_use_URL) {
    // }
    var _viz_type_use_URL = function(_) {
        var that = this;
	if (!arguments.length) return viz_type_use_URL;
	 viz_type_use_URL = _;
	return that;
    }            

    // set a special variable to make sure all necessary things
    // have been set before shifting
    // (this is a double check on the page loading)
    var loadsremaining = 4;

    // will need a figure.
    // this needs to be set by setfigure() before plotting
    var figure = d3.select("body");

    var widthsetexplicitly = false;
    var getfigure = function() {
        return figure;
    }
    var setfigure = function(_) {
        var that = this;
	console.log("setting figure for wordshift");
	figure = _;
        // wrap another relative parent div in there, for the overlay button to pad off of
        figure = figure.append("div").attr({"class":"outwrapper"}).style({"position":"relative"});
	if (!widthsetexplicitly) {
	    grabwidth();
	}
	return that;
    }

    var show_x_axis_bool = false;
    var show_x_axis = function(_) {
        var that = this;
	if (!arguments.length) return show_x_axis_bool;
	show_x_axis_bool = _;
        // give a litter extra space for it
	axeslabelmargin.bottom = axeslabelmargin.bottom + 10;
	return that;
    }

    var splitstring = function(_,w,f) {
	// take an array of strings _
	// a formatter f
	// and a max width w (in pixels)
	// 
	// return the strings split into an array
	var font = f || (topFontSizeArray[topFontSizeArray.length-1]+"px  "+fontString);
        // console.log(w);
        // console.log(f);
	var splitar = [];
	var newar;
	for (var i=0; i<_.length; i++) {
	    if (_[i].width(font) < w) {
		newar = [_[i]];
	    }
	    else {
		var tmp = _[i].split(" ");
		// chop words off until it's long enough
		// this is better if we know that they're
		// not going to be way too long
		// right now a max of two lines

		// a more general approach would be to march forward...
		// but this could be a lot of .width() calculations
		// really need to keep those at a min
		var leng = false;
		var numi = 0;
		while (!leng) {
		    numi+=1;
		    // console.log(numi);
		    var wt = tmp.slice(0,tmp.length-numi).join(" ");
		    // console.log(wt);
		    if (wt.width(font) < w) {
			newar = [wt,tmp.slice(tmp.length-numi,tmp.length).join(" ")];
			leng = true;
		    }
		}
	    }
	    // console.log("adding newar to splitar");
	    // console.log(newar);
	    // console.log(splitar);
	    splitar = splitar.concat(newar);
	    // console.log(splitar);
	}
	return splitar;
    }

    // set the ones we can
    // since the height is fixed, do all that
    // but just initialize the width-related variables

    // full width and height. we'll draw the outer svg this big
    var fullwidth = 400;
    var fullheight = 550 // 650; // make sure to change num words too

    var margin = {top: 0, right: 0, bottom: 0, left: 0};

    // the width and height that we're going to use
    var boxwidth = fullwidth-margin.left-margin.right;
    var boxheight = fullheight-margin.top-margin.bottom;

    // margin inside
    var axeslabelmargin = {top: 0, right: 3, bottom: 25, left: 23};
    
    // inner width and height
    // used for the axes
    var figwidth = boxwidth - axeslabelmargin.left - axeslabelmargin.right;
    var figheight = boxheight - axeslabelmargin.top - axeslabelmargin.bottom;
    var leftOffsetStatic = axeslabelmargin.left;

    // individual bar height, and number of words
    // need to be tuned to the height of the plot
    var iBarH = 11;
    var numWords = 28; // 37 with height 650 // 23 with height 500
    // I should be able to compute this?

    // max length of words to plot
    var maxChars = 20;    
    
    // all inside the axes
    var yHeight = (7+17*3+14+5-13); // 101
    // where to draw the line below the summary bars
    var barHeight = (7+17*3+15-13); // 95
    var figcenter = figwidth/2;

    // pull the width, set the height fixed
    var grabwidth = function() {
	// console.log("setting width from figure");
	// console.log(parseInt(figure.style("width")));
	// use d3.min to set a max width of fullwidth
	fullwidth = d3.min([parseInt(figure.style("width")),fullwidth]);
	boxwidth = fullwidth-margin.left-margin.right;
	figwidth = boxwidth-axeslabelmargin.left-axeslabelmargin.right;
	figcenter = figwidth/2;
    }

    var setWidth = function(_) {
	if (!arguments.length) return fullwidth;
	widthsetexplicitly = true;
	fullwidth = _;
	boxwidth = fullwidth-margin.left-margin.right;
	figwidth = boxwidth-axeslabelmargin.left-axeslabelmargin.right;
	figcenter = figwidth/2;
    }

    // pull the width, set the height fixed
    var setHeight = function(_) {
        var that = this;
	if (!arguments.length) return fullheight;
	fullheight = _;
	boxheight = fullheight-margin.top-margin.bottom;
	figheight = boxheight - axeslabelmargin.top - axeslabelmargin.bottom;
	return that;
    }

    // will be set by setdata() or shift() functions
    var sortedMag;
    var sortedType;
    var sortedWords;
    var sortedWordsRaw;
    var sortedWordsEn;
    var sortedWordsEnRaw;
    var sumTypes;
    var refH;
    var compH;

    var _sortedMag = function(_) {
        var that = this;
	if (!arguments.length) return sortedMag;
	sortedMag = _;
	return that;
    }
    var _sortedType = function(_) {
        var that = this;
	if (!arguments.length) return sortedType;
	sortedType = _;
	return that;
    }
    var _sortedWords = function(_) {
        var that = this;
	if (!arguments.length) return sortedWords;
	sortedWords = _;
	return that;
    }
    var _sortedWordsRaw = function(_) {
        var that = this;
	if (!arguments.length) return sortedWordsRaw;
	sortedWordsRaw = _;
	return that;
    }

    var xlabel_text = "Per word average happiness shift";
    var _xlabel_text = function(_) {
        var that = this;
	if (!arguments.length) return xlabel_text;
	xlabel_text = _;
	return that;
    }

    var ylabel_text = "Word Rank";
    var _ylabel_text = function(_) {
        var that = this;
	if (!arguments.length) return ylabel_text;
	ylabel_text = _;
	return that;
    }
    var _refH = function(_) {
        var that = this;
	if (!arguments.length) return refH;
	refH = _;
	return that;
    }
    var _compH = function(_) {
        var that = this;
	if (!arguments.length) return compH;
	compH = _;
	return that;
    }

    var reset = true;
    var _reset = function(_) {
        var that = this;
	if (!arguments.length) return reset;
	reset = _;
	return that;
    }

    var get_word_index = function(w) {
        var ind = -1;
        for (var i=0; i<words.length; i++) {
            if (w === words[i]) {
                ind = i;
                break;
            }
        }
        return ind;
    }

    // let's make this just toggle the state
    // you can force it to turn on by setting the _reset function
    // to set the reset bool to be false, then calling toggle
    var resetbuttontoggle = function() {
        var that = this;
        reset = !reset;
	resetButton(reset);
	if (reset) {
	    figure.select("g.help").style("visibility","visible");
	    figure.selectAll("text.credit").style("visibility","visible");	    
	}
	else {
	    figure.select("g.help").style("visibility","hidden");
	    figure.selectAll("text.credit").style("visibility","hidden");	    
	}
	return that;
    }

    var setdata = function(a,b,c,d,e,f) {
        var that = this;
	// console.log("setting data");
	sortedMag = a;
	sortedType = b;
	sortedWords = c;
        sortedWordsRaw = c;
	sumTypes = d;
	refH = e;
	compH = f;
	loadsremaining = 0;
	return that;
    }

    // ******************************************************************************** //
    // all of this stuff deals with setting the top text                                //
    // which has become the most haphazard part so far                                  //
    // -AR 2015-07-28                                                                   //
    //
    // right now, we can just set the text ourselves completely, or have it set
    // automatically

    // have control over:
    // -number of bold lines (top N lines, default 1)
    // -each line's size
    // -each line's color (which, doesn't seem to have an effect)
    // -whether custom text is split or not
    
    // this variable controls whether the top strings are checked for length
    // and split, if necessary
    // - only used if compatison text is set explicitly
    var split_top_strings = true;
    var _split_top_strings = function(_) {
        var that = this;
	if (!arguments.length) return split_top_strings;	
	split_top_strings = _;
	return that;
    }

    var numBoldLines = 1;
    var setTextBold = function(_) {
        var that = this;
	if (!arguments.length) return numBoldLines;
	numBoldLines = _;
	return that;
    }

    // only support up to 5 lines....
    var colorArray = ["#202020","#D8D8D8","#D8D8D8","#D8D8D8","#D8D8D8"];
    var topFontSizeArray = [16,12,12,12,12];
    // var topFontSizeArray = [20,16,16,16,16];
    
    var setTextColors = function(_) {
        var that = this;
	if (!arguments.length) return colorArray;
	colorArray = _;
	return that;
    }

    var bgcolor = "white";
    var setBgcolor = function(_) {
        var that = this;
	if (!arguments.length) return bgcolor;
	bgcolor = _;
	return that;
    }

    var setTopTextSizes = function(_) {
        var that = this;
	if (!arguments.length) return topFontSizeArray;
	topFontSizeArray = _;
	return that;
    }

    var comparisonText = [""];

    var setText = function(_) {
        var that = this;
	if (!arguments.length) return _;
	comparisonText = _;
	return that;
    }

    // end of the top text stuff                                                        //
    // ******************************************************************************** //
    
    var numwordstoplot = 200;

    var refF;
    var compF;
    var lens;
    var complens;    
    var stoprange = [4,6];
    var words;
    var words_en;
    var translate = false;

    var _stoprange = function(_) {
        var that = this;
	if (!arguments.length) return stoprange;
	stoprange = _;
	return that;
    }

    var _refF = function(_) {
        var that = this;
	if (!arguments.length) return refF;
	refF = _;
        // what better place to check for this
        // some datasets have less than 200 words
        numwordstoplot = d3.min([refF.length,numwordstoplot])
	loadsremaining--;
	return that;
    }

    var _compF = function(_) {
        var that = this;
	if (!arguments.length) return compF;
	compF = _;
	loadsremaining--;
	return that;
    }

    var _lens = function(_) {
        var that = this;
	if (!arguments.length) return lens;
	lens = _;
	loadsremaining--;
	return that;
    }

    var _complens = function(_) {
        var that = this;
	if (!arguments.length) return complens;
	complens = _;
	return that;
    }

    var _words = function(_) {
        var that = this;
	if (!arguments.length) return words;
	words = _;
	loadsremaining--;
	return that;
    }

    var _words_en = function(_) {
        var that = this;
	if (!arguments.length) return words_en;
	words_en = _;
	translate = true;
	return that;
    }

    var ignoreWords = ["nigga","niggas","niggaz","nigger"];

    var ignore = function(_) {
        var that = this;
	if (!arguments.length) return ignoreWords;
	// refresh the list each time
	ignoreWords = ["nigga","niggas","niggaz","nigger"];
	ignoreWords = ignoreWords.concat(_);
	// console.log(_);
	// console.log(ignoreWords);
	return that;
    }

    var stop = function() {
        var that = this;
	// first check if all the loads are done
	// WARNING
	// could not get this loop to stop!
	// even when the other variables are set
	// while (loadsremaining > 0) { console.log("waiting"); };
	for (var i=0; i<lens.length; i++) {
	    var include = true;
	    // check if in removed word list
	    for (var k=0; k<ignoreWords.length; k++) {
		if (ignoreWords[k] == words[i]) {
		    include = false;
		}
	    }
	    // check if underneath lens cover
	    if (lens[i] > stoprange[0] && lens[i] < stoprange[1]) {
		include = false;
	    }
	    // include it, or set to 0
	    if (!include) {
		refF[i] = 0;
		compF[i] = 0;
	    }
	}
	return that;
    }

    // stop an individual vector
    var istopper = function(fvec) {
	for (var i=0; i<lens.length; i++) {
	    var include = true;
	    // check if in removed word list
	    for (var k=0; k<ignoreWords.length; k++) {
		if (ignoreWords[k] == words[i]) {
		    include = false;
		}
	    }
	    // check if underneath lens cover
	    if (lens[i] > stoprange[0] && lens[i] < stoprange[1]) {
		include = false;
	    }
	    // include it, or set to 0
	    if (!include) {
		fvec[i] = 0;
	    }
	}
	return fvec;
    }

    var prefix = true;

    var concatter = function() {
	if (prefix) {
	    // new method, with numbers prefixed
	    // log everything
	    // console.log(sortedMag);
	    // console.log(sortedWords);
	    // console.log(sortedWordsEn);
	    // console.log(sortedType);
	    // console.log(refF);
	    // console.log(compF);
	    // console.log(lens);
	    // console.log(words);
	    sortedWords = sortedWords.map(function(d,i) { 
		if (sortedType[i] == 0) {
		    return ((i+1)+". ").concat(d.concat("-\u2193")); // down // increase in happs
		} 
		else if (sortedType[i] == 1) {
		    return ((i+1)+". ").concat(d.concat("+\u2193")); // decrease in happs
		}
		else if (sortedType[i] == 2) {
		    return ((i+1)+". ").concat(d.concat("-\u2191")); // up
		} else {
		    return ((i+1)+". ").concat(d.concat("+\u2191"));
		}
	    });
	    if (translate) {
		sortedWordsEn = sortedWordsEn.map(function(d,i) { 
		    if (sortedType[i] == 0) {
			return ((i+1)+". ").concat(d.concat("-\u2193"));
		    } 
		    else if (sortedType[i] == 1) {
			return ((i+1)+". ").concat(d.concat("+\u2193"));
		    }
		    else if (sortedType[i] == 2) {
			return ((i+1)+". ").concat(d.concat("-\u2191"));
		    } else {
			return ((i+1)+". ").concat(d.concat("+\u2191"));
		    }
		});
	    }
	}
	else {
	    // old method, without numbers prefixed
	    sortedWords = sortedWords.map(function(d,i) { 
		// d = ((i+1)+". ").concat(d);
		if (sortedType[i] == 0) {
		    return ((i+1)+". ").concat(d.concat("-\u2193"));
		} 
		else if (sortedType[i] == 1) {
		    return ((i+1)+". ").concat("\u2193+".concat(d));
		}
		else if (sortedType[i] == 2) {
		    return ((i+1)+". ").concat("\u2191-".concat(d));
		} else {
		    return ((i+1)+". ").concat(d.concat("+\u2191"));
		}
	    });
	}
    }

    var shift = function(a,b,c,d) {
        var that = this;
	refF = a;
	compF = b;
	lens = c;
	words = d;
	loadsremaining = 0;
	shifter();
	return that;
    }
    
    // var sortedMagFull;
    var sortedTypeFull;
    var distflag = false;
    var plotdist = function(_) {
        var that = this;
	if (!arguments.length) return distflag;
	distflag = _;
	return that;
    }

    var selfShifter = function() {
        var that = this;
	/* shift one frequency vectors, against itself

	   uses self.refF

	   -assume it has been zero-ed for stop words
	   -lens is of full length
	   -words is a list of utf8 strings

	   return an object with the sorted quantities for plotting the shift
	*/

	//normalize frequencies
	var Nref = 0.0;
	var lensLength = d3.min([refF.length,words.length,lens.length])
	for (var i=0; i<lensLength; i++) {
            Nref += parseFloat(refF[i]);
	}

	// refute refarison happiness
	refH = 0.0;
	for (var i=0; i<lensLength; i++) {
            refH += refF[i]*parseFloat(lens[i]);
	}
	refH = refH/Nref;
	compH = 0.0;

	// do the shifting
	shiftMag = Array(lensLength);
	shiftType = Array(lensLength);
	var freqDiff = 0.0;
	for (var i=0; i<lensLength; i++) {
	    freqDiff = refF[i]/Nref;
            shiftMag[i] = (parseFloat(lens[i])-refH)*freqDiff;
	    // this does just the weighted distribution
	    // (for LabMT, everything is positive)
            // shiftMag[i] = (parseFloat(lens[i]))*freqDiff;
	    if (freqDiff > 0) { shiftType[i] = 2; }
	    else { shiftType[i] = 0}
	    if (parseFloat(lens[i]) > refH) { shiftType[i] += 1;}
	}

	// +2 for frequency up
	// +1 for happier
	// => 
	// 0 sad, down
	// 1 happy, down
	// 2 sad, up
	// 3 happy, up

	// do the sorting
	var indices = Array(lensLength);
	for (var i = 0; i < lensLength; i++) { indices[i] = i; }
	indices.sort(function(a,b) { return Math.abs(shiftMag[a]) < Math.abs(shiftMag[b]) ? 1 : Math.abs(shiftMag[a]) > Math.abs(shiftMag[b]) ? -1 : 0; });

	sortedMag = Array(numwordstoplot);
	sortedType = Array(numwordstoplot);
	sortedWords = Array(numwordstoplot);

	for (var i = 0; i < numwordstoplot; i++) { 
	    sortedMag[i] = shiftMag[indices[i]]; 
	    sortedType[i] = shiftType[indices[i]]; 
	    sortedWords[i] = words[indices[i]]; 
	}

	if (distflag) {
	    // declare some new variables
	    sortedMagFull = Array(lensLength);
	    sortedTypeFull = Array(lensLength);
	    for (var i = 0; i < lensLength; i++) { 
		sortedMagFull[i] = shiftMag[indices[i]]; 
		sortedTypeFull[i] = shiftType[indices[i]]; 
	    }
	}

	// compute the sum of contributions of different types
	sumTypes = [0.0,0.0,0.0,0.0];
	for (var i = 0; i < lensLength; i++)
	{ 
            sumTypes[shiftType[i]] += shiftMag[i];
	}
	if (translate) {
	    sortedWordsEn = Array(numwordstoplot);
	    for (var i = 0; i < numwordstoplot; i++) { 
		sortedWordsEn[i] = words_en[indices[i]]; 
	    }   
	}

	return that;	
    }

    var shiftMag;
    var shiftType;

    var _shiftMag = function(_) {
        var that = this;
	if (!arguments.length) return shiftMag;
	shiftMag = _;
	return that;
    }

    var _shiftType = function(_) {
        var that = this;
	if (!arguments.length) return shiftType;
	shiftType = _;
	return that;
    }
    
    var shifter = function() {
        // console.log("running the shifter");
        var that = this;
	/* shift two frequency vectors
	   -assume they've been zero-ed for stop words
	   -lens is of full length
	   -words is a list of utf8 strings

	   return an object with the sorted quantities for plotting the shift
	*/

	//normalize frequencies
	var Nref = 0.0;
	var Ncomp = 0.0;
	var lensLength = d3.min([refF.length,compF.length,words.length,lens.length]);
	for (var i=0; i<lensLength; i++) {
            Nref += parseFloat(refF[i]);
            Ncomp += parseFloat(compF[i]);
	}

	// for (var i=0; i<refF.length; i++) {
	//     refF[i] = parseFloat(refF[i])/Nref;
	//     compF[i] = parseFloat(compF[i])/Ncomp;
	// }
	
	// compute reference happiness
	refH = 0.0;
	for (var i=0; i<lensLength; i++) {
            refH += refF[i]*parseFloat(lens[i]);
	}
	// normalize at the end to minimize floating point errors
	refH = refH/Nref;
	// console.log(refH);

	// compute reference variance
	// var refV = 0.0;
	// for (var i=0; i<refF.length; i++) {
	//     refV += refF[i]*Math.pow(parseFloat(lens[i])-refH,2);
	// }
	// refV = refV/Nref; 
	// // console.log(refV);

	// compute comparison happiness
	compH = 0.0;
	for (var i=0; i<lensLength; i++) {
            compH += compF[i]*parseFloat(lens[i]);
	}
	compH = compH/Ncomp;

	// do the shifting
	shiftMag = Array(lensLength);
	shiftType = Array(lensLength);
	var freqDiff = 0.0;
	for (var i=0; i<lensLength; i++) {
	    freqDiff = compF[i]/Ncomp-refF[i]/Nref;
            shiftMag[i] = (parseFloat(lens[i])-refH)*freqDiff;
	    if (freqDiff > 0) { shiftType[i] = 2; }
	    else { shiftType[i] = 0}
	    if (parseFloat(lens[i]) > refH) { shiftType[i] += 1;}
	}

	// +2 for frequency up
	// +1 for happier
	// => 
	// 0 sad, down
	// 1 happy, down
	// 2 sad, up
	// 3 happy, up

	// do the sorting
	var indices = Array(lensLength);
	for (var i = 0; i < lensLength; i++) { indices[i] = i; }
	indices.sort(function(a,b) { return Math.abs(shiftMag[a]) < Math.abs(shiftMag[b]) ? 1 : Math.abs(shiftMag[a]) > Math.abs(shiftMag[b]) ? -1 : 0; });

	sortedMag = Array(numwordstoplot);
	sortedType = Array(numwordstoplot);
	sortedWords = Array(numwordstoplot);

        // console.log(numwordstoplot);
        // console.log(indices);

	for (var i = 0; i < numwordstoplot; i++) { 
	    sortedMag[i] = shiftMag[indices[i]]; 
	    sortedType[i] = shiftType[indices[i]]
	    var tmpword = words[indices[i]];
	    // add 1 to maxChars, because I'll add the ellipsis
	    if (tmpword.length > maxChars+2) {
		var shorterword = tmpword.slice(0,maxChars);
		// check that the last char isn't a space (if it is, delete it)
		if (shorterword[shorterword.length-1] === " ") {
		    sortedWords[i] = shorterword.slice(0,shorterword.length-1)+"\u2026";
		}
		else {
		    sortedWords[i] = shorterword+"\u2026";		    
		}
	    }
	    else {
		sortedWords[i] = tmpword;	
	    }
	}

	if (distflag) {
	    // declare some new variables
	    sortedMagFull = Array(lensLength);
	    sortedTypeFull = Array(lensLength);
	    for (var i = 0; i < lensLength; i++) { 
		sortedMagFull[i] = shiftMag[indices[i]]; 
		sortedTypeFull[i] = shiftType[indices[i]]; 
	    }
	}

	// compute the sum of contributions of different types
	sumTypes = [0.0,0.0,0.0,0.0];
	for (var i = 0; i < lensLength; i++)
	{ 
            sumTypes[shiftType[i]] += shiftMag[i];
	}

	// slice them
	// sortedMag = sortedMag.slice(0,numwordstoplot);
	// sortedWords = sortedWords.slice(0,numwordstoplot);
	// sortedType = sortedType.slice(0,numwordstoplot);

	if (translate) {
	    sortedWordsEn = Array(numwordstoplot);
	    for (var i = 0; i < numwordstoplot; i++) { 
		sortedWordsEn[i] = words_en[indices[i]]; 
	    }   
	}

	// // return as an object
	// return {
	//     sortedMag: sortedMag,
	//     sortedType: sortedType,
	//     sortedWords: sortedWords,
	//     sumTypes: sumTypes,
	//     refH: refH,
	//     compH: compH,
	// };

        sortedWordsRaw = sortedWords;
        sortedWordsRawEn = sortedWordsEn;
	concatter();

	// allow chaining here too
	return that;
    }

    var dualShifter = function() {
        var that = this;
	/* shift two frequency vectors
	   -assume they've been zero-ed for stop words
	   -lens is of full length
	   -words is a list of utf8 strings

	   return an object with the sorted quantities for plotting the shift
	*/

	//normalize frequencies
	var Nref = 0.0;
	var Ncomp = 0.0;
	var lensLength = d3.min([refF.length,compF.length,words.length,lens.length]);
	for (var i=0; i<lensLength; i++) {
            Nref += parseFloat(refF[i]);
            Ncomp += parseFloat(compF[i]);
	}

	// for (var i=0; i<refF.length; i++) {
	//     refF[i] = parseFloat(refF[i])/Nref;
	//     compF[i] = parseFloat(compF[i])/Ncomp;
	// }
	
	// compute reference happiness
	refH = 0.0;
	for (var i=0; i<lensLength; i++) {
            refH += refF[i]*parseFloat(lens[i]);
	}
	// normalize at the end to minimize floating point errors
	refH = refH/Nref;
	// console.log(refH);

	// compute reference variance
	// var refV = 0.0;
	// for (var i=0; i<refF.length; i++) {
	//     refV += refF[i]*Math.pow(parseFloat(lens[i])-refH,2);
	// }
	// refV = refV/Nref; 
	// // console.log(refV);

	// compute comparison happiness
	compH = 0.0;
	for (var i=0; i<lensLength; i++) {
            compH += compF[i]*parseFloat(complens[i]);
	}
	compH = compH/Ncomp;

	// do the shifting
	shiftMag = Array(lensLength);
	shiftType = Array(lensLength);
	var freqDiff = 0.0;
	for (var i=0; i<lensLength; i++) {
            // shiftMag[i] = (parseFloat(complens[i])-compH)*compF[i]/Ncomp - (parseFloat(lens[i])-refH)*refF[i]/Nref;
            shiftMag[i] = parseFloat(complens[i])*compF[i]/Ncomp - parseFloat(lens[i])*refF[i]/Nref;	    
	    if (compF[i]/Ncomp > refF[i]/Nref) { shiftType[i] = 2; }
	    else { shiftType[i] = 0}
	    // if (parseFloat(complens[i])-compH > parseFloat(lens[i])-refH) { shiftType[i] += 1;}
	    // this means the word is in the reference, but not comparison
	    if (refF[i] > 0 && compF[i] == 0) {
		// compare the happiness to ref avg
		if (parseFloat(lens[i]) > refH) { shiftType[i] += 1;}
	    }
	    // this means the word is in the reference, but not comparison
	    else if (refF[i] == 0 && compF[i] > 0) {
		// compare the happiness to comp avg
		if (parseFloat(complens[i]) > compH) { shiftType[i] += 1;}
	    }
	    // if it's in both, color by the difference
	    else {
		if (parseFloat(complens[i]) > parseFloat(lens[i])) { shiftType[i] += 1;}
	    }
	}

	// +2 for frequency up
	// +1 for happier
	// => 
	// 0 sad, down
	// 1 happy, down
	// 2 sad, up
	// 3 happy, up

	// do the sorting
	var indices = Array(lensLength);
	for (var i = 0; i < lensLength; i++) { indices[i] = i; }
	indices.sort(function(a,b) { return Math.abs(shiftMag[a]) < Math.abs(shiftMag[b]) ? 1 : Math.abs(shiftMag[a]) > Math.abs(shiftMag[b]) ? -1 : 0; });

	sortedMag = Array(numwordstoplot);
	sortedType = Array(numwordstoplot);
	sortedWords = Array(numwordstoplot);

	for (var i = 0; i < numwordstoplot; i++) { 
	    sortedMag[i] = shiftMag[indices[i]]; 
	    sortedType[i] = shiftType[indices[i]]
	    var tmpword = words[indices[i]];
	    // add 1 to maxChars, because I'll add the ellipsis
	    if (tmpword.length > maxChars+2) {
		var shorterword = tmpword.slice(0,maxChars);
		// check that the last char isn't a space (if it is, delete it)
		if (shorterword[shorterword.length-1] === " ") {
		    sortedWords[i] = shorterword.slice(0,shorterword.length-1)+"\u2026";
		}
		else {
		    sortedWords[i] = shorterword+"\u2026";		    
		}
	    }
	    else {
		sortedWords[i] = tmpword;		
	    }
	}

	if (distflag) {
	    // declare some new variables
	    sortedMagFull = Array(lensLength);
	    sortedTypeFull = Array(lensLength);
	    for (var i = 0; i < lensLength; i++) { 
		sortedMagFull[i] = shiftMag[indices[i]]; 
		sortedTypeFull[i] = shiftType[indices[i]]; 
	    }
	}

	// compute the sum of contributions of different types
	sumTypes = [0.0,0.0,0.0,0.0];
	for (var i = 0; i < lensLength; i++)
	{ 
            sumTypes[shiftType[i]] += shiftMag[i];
	}

	// allow chaining here too
	return that;
    }    

    var nbins = 100;
    var dist;
    var cdist;
    var ntypes = 4;
    var nwords;
    var computedistributions = function() {
        var that = this;
	// bin the distribution of words into a distribution
	// and cumulative
	// there are four types of contributions here (the way
	// the sum has been broken down), so do the distribution
	// for the total, and each of the four bins

	// nwords = sortedMagFull.length;
	// nwords = 2000;
	var a = 1;
	nwords = -1;
	while (a > Math.pow(10,-6)) {
	    nwords++;
	    a = Math.abs(sortedMagFull[nwords]);
	}
	// console.log(nwords);

	dist = Array(nbins);
	cdist = Array(nbins);
	
	// compute the size of each bin
	// should be a fast way to do this
	// when it doesn't round evenly
	var binsize = Math.floor(nwords/nbins);
	// console.log(binsize);
	
	// loop over each bin, initialize it to zero
	// then add each of the types to it
	for (var i=0; i<nbins; i++) {
	    dist[i] = Array(ntypes+1);
	    cdist[i] = Array(ntypes+1);
	    for (var j=0; j<ntypes+1; j++) {
		dist[i][j] = 0;
		cdist[i][j] = 0;
	    }
	    // fast, with the sum
	    // console.log(i*binsize);
	    // console.log((i+1)*binsize);
	    dist[i][4] = d3.sum(sortedMagFull.slice(i*binsize,(i+1)*binsize));
	    // slower, by type
	    for (var j=i*binsize; j<(i+1)*binsize; j++ ) {
		dist[i][sortedTypeFull[j]] += sortedMagFull[j];
	    }
	}

	// now get the cumulative
	for (var j=0; j<ntypes+1; j++) {	    
	    cdist[0][j] = dist[0][j];
	}
	for (var i=1; i<nbins; i++) {
	    for (var j=0; j<ntypes+1; j++) {
		cdist[i][j] = cdist[i-1][j] + dist[i][j];
	    }
	}

	// console.log(dist);
	// console.log(cdist);
	// console.log(cdist[cdist.length-1]);
	return that;
    }
    
    // declare a boat load of private variables
    // to be accessed by the other methods
    var canvas;
    var maxWidth;
    var x;
    var y;
    var topScale;
    var bgrect;
    var xlabel;
    var topbgrect;
    var ylabel;
    var sepline;
    var zoom;
    var axes;
    var fontString = "Latex default, serif";
    var _fontString = function(_) {
        var that = this;
        if (!arguments.length) return fontString;
        fontString = _;
        return that;
    }
    // the inspector computed width of ∑+↓ rendering in latex default (cmr10)
    var sumTextWidth = 34.1562;
    // these are set explicitly on the elements
    var bigshifttextsize = 12;
    var xaxisfontsize = 12;
    var xylabelfontsize = 16;
    var wordfontsize = 12;
    var distlabeltext = 8;
    var creditfontsize = 8;
    var resetfontsize  = 12;
    // [16,10,20,10,8,8,13];
    var setFontSizes = function(_) {
        var that = this;
        if (!arguments.length) return [bigshifttextsize,xaxisfontsize,xylabelfontsize,wordfontsize,distlabeltext,creditfontsize,resetfontsize];
        bigshifttextsize = _[0];
        xaxisfontsize = _[1];
        xylabelfontsize = _[2];
        wordfontsize = _[3];
        distlabeltext = _[4];
        creditfontsize = _[5];
        resetfontsize = _[6];
	return that;
    }
    var typeClass = ["negdown","posdown","negup","posup"];
    var colorClass;
    var shiftrects;
    var shifttext;
    var flipVector;
    var maxShiftSum;
    var summaryArray;
    var toptext;
    var toptextheight;
    var credit;
    var help;
    var logo = false;
    var logowidth = 0;

    var drawlogo = function() {
        var that = this;
	logo = true;
	var logosize = d3.min([toptextheight-10,80]);
	logowidth = logosize+40; // add some extra space
	// not working yet
	canvas.append("image")
	    .attr({ "x": (boxwidth-logosize-10), 
		    "y": "0",
		    "width": logosize,
		    "height": logosize,
		    "xlink:href": "data:image/png;base64,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",
		  })
	    .on("click", function() {
		window.open("http://hedonometer.org","_blank");
	    });
    }

    var xAxis;
    var distgroup;
    var my_shift_id = "shiftsvg";
    var _my_shift_id = function(_) {
        var that = this;
	if (!arguments.length) return my_shift_id;
	my_shift_id = _;
	return that;
    }

    var word_paragraph = function(i) {
        var this_type = sortedType[i];
        return "The word \""+
            (sortedWordsRaw[i])+
            "\", shown as \""+
            (sortedWords[i])+
            "\", is a "+
            (((this_type == 1) || (this_type == 3)) ? "more happy word (+)" : "less happy word (-)")+
            " than the reference average, and was used "+
            ((this_type > 1) ? "more frequently (\u2191)" : "less frequently (\u2193)")+
            " in the comparion, bringing the comparison happiness "+
            (((this_type == 0) || (this_type == 2)) ? "up" : "down")+
            " by "+
            (Math.abs(sortedMag[i]/(Math.abs(refH-compH))).toFixed(2))+
            "%.";
    }

    var word_list = function(i) {
        var this_type = sortedType[i];
        var sign = ((this_type == 1) || (this_type == 3)) ? "+" : "-";
        var morelesshappy = ((this_type == 1) || (this_type == 3)) ? "more" : "less";;
        var frequency = (this_type > 1) ? "\u2191" : "\u2193";
        var morelessfreq = (this_type > 1) ? "more" : "less";
        var updown = (sortedMag[i] > 0) ? "up" : "down";
        var risefall = (sortedMag[i] > 0) ? "rise" : "fall";
        var leftright = (sortedMag[i] > 0) ? "right" : "left";
        var index = my_shifter.get_word_index(sortedWordsRaw[i]);
        return "The word \""+
            (sortedWordsRaw[i])+
            "\" is shown as \""+
            (sortedWords[i])+
            "\". Let's break that down: <br>"+
            "<ul>"+
            // "<li>The "+sign+" means "+sortedWordsRaw[i]+" is a "+morelesshappy+" happy word ($h_{\\textrm{avg}} {("+sortedWordsRaw[i]+")}=$"+lens[index].toFixed(2)+")"+
            "<li>The "+sign+" means "+sortedWordsRaw[i]+" is a "+morelesshappy+" happy word"+
            " than the reference average ($h_{\\textrm{avg}} {(\\textrm{"+sortedWordsRaw[i]+"})}="+lens[index].toFixed(2)+"$ and $h^{\\textrm{(ref)}}_{\\textrm{avg}}="+refH.toFixed(2)+"$).</li><li>The "+
            ((this_type > 1) ? "\u2191 means used more" : "\u2193 means used less")+
            "  frequently in the comparison text than reference text ("+commaSeparateNumber(compF[index])+" times to "+commaSeparateNumber(refF[index])+" times, such that "+
            "$p_\\textrm{"+sortedWordsRaw[i]+"}^{\\textrm{(comp)}} = "+(compF[index]/d3.sum(compF)).toFixed(3)+"$ and "+ "$p_\\textrm{"+sortedWordsRaw[i]+"}^{\\textrm{(ref)}}="+(refF[index]/d3.sum(refF)).toFixed(3)+"$"+
            ").</li><li>Together"+
            // ((this_type > 1) ? " (more" : " (less")+
            // ", "+
            // (((this_type == 1) || (this_type == 3)) ? "positive) " : "negative) ")+
            " this brings the comparison happiness <strong>"+
            ((sortedMag[i] > 0) ? "up" : "down")+
            "</strong> by "+
            (Math.abs(sortedMag[i])).toFixed(3)+
            ", or "+
            (Math.abs(sortedMag[i]/(refH-compH)).toFixed(2))+
            "%. We can see this as the individual term in the shift equations' sum: "+
            '  $$\\underbrace{'+
            '  \\left['+
            '  h_{\\textrm{avg}} {(\\textrm{'+sortedWordsRaw[i]+'})} – h^{\\textrm{(ref)}}_{\\textrm{avg}}'+
            '  \\right]'+
            '  }_{'+sign+'}'+
            '  \\underbrace{'+
            '  \\left['+
            '  p_\\textrm{'+sortedWordsRaw[i]+'}^{\\textrm{(comp)}} – p_\\textrm{'+sortedWordsRaw[i]+'}^{\\textrm{(ref)}}'+
            '  \\right]'+
            '    }_{\\'+updown+'arrow}.$$'+
            "</li></ul>"+
            (((this_type == 1) || (this_type == 3)) ? "Positive, " : "Negative, ")+
            ((this_type > 1) ? " more frequent (" : " less frequent (")+
            sign+frequency+
            ") words "+
            " will always be on the "+
            leftright+
            " contributing to a "+
            risefall+
            " in happiness.";
    }

    var wordshift_tour = function() {
        // function wordshift_tour() {
        // Instance the tour
        console.log("launching the tour");
        var tour = new Tour({
            steps: [
                {
                    element: "#shiftsvg",
                    title: "A quick wordshift whats-what",
                    placement: "auto left",
                    onShown: function() {
                        console.log("first element shown");
                        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
                    },
                    // content: MathJax.HTML.Element("div",null,['We generate the wordshift from this equation: $$h^{\\textrm{(comp)}}_{\\textrm{avg}} – h^{\\textrm{(ref)}}_{\\textrm{avg}} = $$'])
                    // content: "We generate the wordshift from this equation: $$h^{\\textrm{(comp)}}_{\\textrm{avg}} – h^{\\textrm{(ref)}}_{\\textrm{avg}} = $$"

                    content: "Let’s say we have two texts which we call ‘reference’, ${T}^\\textrm{(ref)}$, and ‘comparison’, ${T}^\\textrm{(comp)}$. We want to know why the happiness of the comparison text, $h^{\\textrm{(comp)}}_{\\textrm{avg}}$, is higher or lower than that of the reference text $h^{\\textrm{(ref)}}_{\\textrm{avg}}$."+
                        "<br>To do this, we analyze how each word $w$ which contributes to the difference in average happiness between the two texts:"+
                        '  $$h^{\\textrm{(comp)}}_{\\textrm{avg}} – h^{\\textrm{(ref)}}_{\\textrm{avg}} = '+
                        '  \\sum_{w \\in L}'+
                        '  \\underbrace{'+
                        '  \\left['+
                        '  h_{\\textrm{avg}} {(w)} – h^{\\textrm{(ref)}}_{\\textrm{avg}}'+
                        '  \\right]'+
                        '  }_{+/-}'+
                        '  \\underbrace{'+
                        '  \\left['+
                        '  p_w^{\\textrm{(comp)}} – p_w^{\\textrm{(ref)}}'+
                        '  \\right]'+
                        '    }_{\\uparrow/\\downarrow}.$$'+
                        'Next let\'s take a look at how the top three words contribute.'
                },
                {
                    element: "#shiftrect0",
                    // title: "Word with the greatest individual contribution",
                    content: word_list(0),
                    placement: "auto left",
                    onShown: function() {
                        console.log("first element shown");
                        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
                    },
                },
                {
                    element: "#shiftrect1",
                    // title: "Second word",
                    content: word_list(1),
                    placement: "auto left",
                    onShown: function() {
                        console.log("first element shown");
                        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
                    },
                },
                {
                    element: "#shiftrect2",
                    // title: "Third word",
                    content: word_list(2),
                    placement: "auto left",
                    onShown: function() {
                        console.log("first element shown");
                        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
                    },
                },
                {
                    element: "#sumTextR0",
                    // title: "Third word",
                    content: "At the top, we see the relative contributions from each of the four words types, and the total (the grey bar). This particular bar, $\\sum +\\uparrow$, shows the relative contribution to the shift in happiness from positive words that increased in frequency. <br><br>Try clicking this bar to see only those word types. To reset the view, click the grey $\\sum$ bar.<br><br>And that's all for now, we hope this quick what's-what was helpful!",
                    placement: "auto left",
                    onShown: function() {
                        MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
                    },
                }
            ]});

        // Initialize the tour
        tour.init();

        // Start the tour
        // force it, since it's an option
        tour.restart();
        tour.start(true);
    }

    var add_help_button = function() {
        // this requires bootstrap for stying
        // it requires fontawesome for the icon
        // requires bootstrap, bootstrap-tour for the tour
        // and it requires mathjax for the equations
        figure.append("a")
            .attr({"class": "btn btn-large btn-default"})
            .style({
                "position": "absolute",
                // this position starts from the padding on the left
                // so inside a bootstrap col, this is 15px too far left
                "left": function() { return (fullwidth-34)+"px"; },
            })
            .on("click",function() {
                wordshift_tour();
            })
            .append("i")
            .attr({"class": "fa fa-question"});
        
        // <a class="btn btn-large btn-default" style= onclick="wordshift_tour();"><i class="fa fa-question" aria-hidden="true"></i></a>
    }

    
    var plot = function() {
        var that = this;
	/* plot the shift

	   -take a d3 selection, and draw the shift SVG on it
	   -requires sorted vectors of the shift magnitude, type and word
	   for each word

	*/
	// console.log("plotting shift");

	// first things first, plot the text on top
	// if there wasn't any text passed, make it
	if (comparisonText[0].length < 1) {
	    if (compH >= refH) {
		var happysad = "happier";
	    }
	    else { 
		var happysad = "less happy";
	    }

	    // console.log("generating text for wordshift");
	    comparisonText = splitstring(["Reference happiness: "+refH.toFixed(2),"Comparison happiness: "+compH.toFixed(2),"Why comparison is "+happysad+" than reference:"],boxwidth-10-logowidth);

	    // console.log(comparisonText);
	}
	else {
	    if ( split_top_strings ) {
		comparisonText = splitstring(comparisonText,boxwidth-10-logowidth);
	    }
	    // console.log(comparisonText);
	}
	
	// this would put the text above the svg, in the figure div
	// figure.selectAll("p")
	//     .remove();
	// figure.selectAll("p")
	//     .data(comparisonText)
	//     .enter()
	//     .insert("p","svg")
	//     .attr("class","shifttitle")
	//     .html(function(d) { return d; });

	// made a new svg
	figure.selectAll("svg").remove();
	canvas = figure.append("svg")
	    .attr("id",my_shift_id)
	    .attr("width",function () { return boxwidth; })
	    .attr("height",function () { return boxheight; });
	
	// this one will be white, and behind EVERYTHING
	bgbgrect = canvas.append("rect")
	    .attr("x",0)
	    .attr("y",0)
	    .attr("width", boxwidth)
	    .attr("height", boxheight)
	    .attr("class", "bgbg")
	    .attr("fill", bgcolor);

	toptextheight = comparisonText.length*17+13;
	// console.log(toptextheight);
	
	// reset this
	figheight = boxheight - axeslabelmargin.top - axeslabelmargin.bottom - toptextheight;
	// console.log(figheight);
	// console.log(yHeight);

	// take the longest of the top five words
	// console.log("appending to sorted words");
	// console.log(sortedWords);

	maxWidth = d3.max(sortedWords.slice(0,7).map(function(d) { return d.width(wordfontsize + "px  "+fontString); }));

	// a little extra padding for the words
	var xpadding = 10;
	// linear scale function
	x = d3.scale.linear()
	    .domain([-Math.abs(sortedMag[0]),Math.abs(sortedMag[0])])
	    .range([maxWidth+xpadding,figwidth-maxWidth-xpadding]);	

	// linear scale function
	y = d3.scale.linear()
	    .domain([numWords+1,1])
	    .range([figheight+2, yHeight]); 

	// zoom object for the axes
	zoom = d3.behavior.zoom()
	    .y(y) // pass linear scale function
	    // .translate([10,10])
	    .scaleExtent([1,1])
	    .on("zoom",zoomed);

	// drag = d3.behavior.drag()
	//     // .y(y) // pass linear scale function
	//     // .translate([10,10])
	//     // .scaleExtent([1,1])
	//     .on("drag",zoomed);

	// create the axes themselves
	axes = canvas
	    // not using the "svg inside svg" approach again
	    // .append("svg")
	    // .attr("width", figwidth)
	    // .attr("height", figheight)
	    // .attr("class", "shiftcanvas")
	    .append("g")
	    .attr("transform","translate("+(axeslabelmargin.left)+","+(axeslabelmargin.top+toptextheight)+")")
	    .attr("width", figwidth)
	    .attr("height", figheight)
	    .attr("class", "main");

	axes.call(zoom);
	// axes.call(drag);

	// don't need these
	axes.on("wheel.zoom", null);
	axes.on("mousewheel.zoom", null);
	// can re-register them...
	// axes.on("wheel",function(d) { console.log(d3.event); });
	// axes.on("mousewheel",function(d) { console.log(d3.event); });
	// now use them to translate (instead of zoom)
	axes.on("wheel",function(d) { d3.event.preventDefault(); zoom.translate([0,zoom.translate()[1]+d3.event.wheelDeltaY/2]); zoom.event(axes); });
	axes.on("mousewheel",function(d) { d3.event.preventDefault(); zoom.translate([0,zoom.translate()[1]+d3.event.wheelDeltaY/2]); zoom.event(axes); });
	
	// create the axes background
	bgrect = axes.append("rect")
	    .attr({"x": 0,
	           "y": 1,
	           "width":  figwidth-2,
	           "height":  figheight-2,
	           "class":  "bg",})
	    .style({"stroke-width":"0.5",
                       "stroke":"rgb(0,0,0)",
                       "fill": bgcolor,
                       "opacity": ".96"});

	if (show_x_axis_bool) {
	    // axes creation functions
	    var create_xAxis = function() {
		return d3.svg.axis()
		    .ticks(4)
		    .scale(x)
		    .orient("bottom"); }

	    xAxis = create_xAxis()
		.innerTickSize(3)
		.outerTickSize(0);

	    canvas.append("g")
		.attr("class", "x axis ")
		.attr("font-size", xaxisfontsize)
		.attr("transform", "translate("+(axeslabelmargin.left)+"," + (yHeight+figheight) + ")")
	    // .attr("transform", "translate(0," + (figheight) + ")")
		.call(xAxis);

	    canvas.selectAll(".tick line").style({"stroke":"black"});
	}


	// figure.selectAll("p.sumtext.ref")
	// 	.data([refH,])
	// 	.html(function(d,i) { 
	// 	    if (i===0) {
	// 		return "Reference: happiness " + (d.toFixed(3));
	// 	    }
	// 	});

	// figure.selectAll("p.sumtext.comp")
	// 	.data([compH,])
	// 	.html(function(d,i) { 
	// 	    if (i===0) {
	// 		return "Comparison: happiness " + (d.toFixed(3));
	// 	    }
	// 	});

	// addthis_share.passthrough.twitter.text = "Why "+allData[shiftComp].name+" was "+happysad+" than "+allData[shiftRef].name+" in "+timeseldecoder().cached;

	// addthis_share.title = "Why "+allData[shiftComp].name+" was "+happysad+" than "+allData[shiftRef].name+" in "+timeseldecoder().cached;

	// addthis_share.url = document.URL;

	// d3.select("[id=fbtitle]").attr("content","Hedonometer Maps: Andy has been here");

	typeClass = ["negdown","posdown","negup","posup"];

	var colorClass = ["#b3b3ff","#ffffb3","#4c4cff","#ffff4c","#272727"];
	
	shiftrects = axes.selectAll("rect.shiftrect")
	    .data(sortedMag)
	    .enter()
	    .append("rect")
	    .attr({ 
		"class": function(d,i) { return "shiftrect "+intStr0[sortedType[i]]+" "+typeClass[sortedType[i]]; },
		// "x": function(d,i) { 
		//     if (d>0) { return figcenter; } 
		//     else { return x(d)}
		// },
		// "y": function(d,i) { return y(i+1); },
                "id": function(d,i) { return "shiftrect"+i; },
                "x": 0,
                "y": 0,
                "transform": function(d,i) {
                    if (d>0) { return "translate("+figcenter+","+y(i+1)+")"; }
		    else { return "translate("+x(d)+","+y(i+1)+")"; }
                },
		"height": function(d,i) { return iBarH; },
		"width": function(d,i) {
		    if ((d)>0) { return x(d)-x(0); }
		    else { return x(0)-x(d); }
		},
		"opacity": "0.7",
		"stroke-width": "1",
		"stroke": "rgb(0,0,0)",
		"fill": function(d,i) { return colorClass[sortedType[i]]; },
	    });
	// .on("mouseover", function(d){
	//     var rectSelection = d3.select(this).style({opacity:"1.0"});
	// })
	// .on("mouseout", function(d){
	//     var rectSelection = d3.select(this).style({opacity:"0.7"});
	// });


	shifttext = axes.selectAll("text.shifttext")
	    .data(sortedMag)
	    .enter()
	    .append("text")
	    .attr({"class": function(d,i) { return "shifttext "+intStr0[sortedType[i]]; },
                   "x": 0,
                   "y": 0,
                   "transform": function(d,i) {
                       if (d>0) { return "translate("+(x(d)+2)+","+(y(i+1)+iBarH)+")"; } 
		       else { return "translate("+(x(d)-2)+","+(y(i+1)+iBarH)+")"; }
                   },})
	    // .attr("x",function(d,i) { if (d>0) {return x(d)+2;} else {return x(d)-2; } } )
	    // .attr("y",function(d,i) { return y(i+1)+iBarH; } )
	    .style({"text-anchor": function(d,i) { return ((d < 0) ? "end" : "start"); },
                    "font-size": wordfontsize})
	    .text(function(d,i) { return sortedWords[i]; });

	if (translate) {
	    // it is one longer than the words, the last entry being what
	    // everything will be set to on "translate all"
	    flipVector = Array(sortedWords.length+1);
	    for (var i=0; i<flipVector.length; i++) { flipVector[i] = 0; }
	    flipVector[flipVector.length-1] = 1;
	    shifttext.on("click",function(d,i) {
		// goal is to toggle translation
		// need translation vector
		//console.log(flipVector[i]);
		if (flipVector[i]) { 
		    d3.select(this).text(sortedWords[i]);
		    flipVector[i] = 0; 
		}
		else {
		    d3.select(this).text(sortedWordsEn[i]);
		    flipVector[i] = 1;
		}
	    });
	}

	// check if there is a word selection to apply
	if (shiftseldecoder().current === "posup") {
	    shiftTypeSelect = true;
	    shiftType = 3;
	    resetButton(true);
            // ((d>0) ? 500 : -500)
            // ((d>0) ? figcenter : x(d))
	    axes.selectAll("rect.shiftrect.zero").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
            axes.selectAll("text.shifttext.zero").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
	    axes.selectAll("rect.shiftrect.one").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
	    axes.selectAll("text.shifttext.one").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
	    axes.selectAll("rect.shiftrect.two").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
	    axes.selectAll("text.shifttext.two").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
            // .attr("transform","translate(0,"+y(i+1)+")");
            // .attr("transform",function(d,i) { return "translate("+((d>0) ? figcenter : x(d))+","+y(i+1)+")"; });
	    axes.selectAll("rect.shiftrect.three").attr("transform",function(d,i) { return "translate("+((d>0) ? figcenter : x(d))+","+y(i+1)+")"; });
	    axes.selectAll("text.shifttext.three").attr("transform",function(d,i) { return "translate("+((d>0) ? x(d)+2 : x(d)-2)+","+(y(i+1)+iBarH)+")"; });
	}
	else if (shiftseldecoder().current === "negdown") {
	    shiftTypeSelect = true;
	    shiftType = 0;
	    resetButton(true);
	    axes.selectAll("rect.shiftrect.zero").attr("transform",function(d,i) { return "translate("+((d>0) ? figcenter : x(d))+","+y(i+1)+")"; });
	    axes.selectAll("text.shifttext.zero").attr("transform",function(d,i) { return "translate("+((d>0) ? x(d)+2 : x(d)-2)+","+(y(i+1)+iBarH)+")"; });
	    axes.selectAll("rect.shiftrect.one").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
	    axes.selectAll("text.shifttext.one").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
	    axes.selectAll("rect.shiftrect.two").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
	    axes.selectAll("text.shifttext.two").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
	    axes.selectAll("rect.shiftrect.three").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
	    axes.selectAll("text.shifttext.three").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });		
	}
	else if (shiftseldecoder().current === "posdown") {
	    shiftTypeSelect = true;
	    shiftType = 1;
	    resetButton(true);
	    axes.selectAll("rect.shiftrect.zero").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
	    axes.selectAll("text.shifttext.zero").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
	    axes.selectAll("rect.shiftrect.three").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
	    axes.selectAll("text.shifttext.three").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
	    axes.selectAll("rect.shiftrect.two").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
	    axes.selectAll("text.shifttext.two").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
	    axes.selectAll("rect.shiftrect.one").attr("transform",function(d,i) { return "translate("+((d>0) ? figcenter : x(d))+","+y(i+1)+")"; });
	    axes.selectAll("text.shifttext.one").attr("transform",function(d,i) { return "translate("+((d>0) ? x(d)+2 : x(d)-2)+","+(y(i+1)+iBarH)+")"; });
	}
	else if (shiftseldecoder().current === "negup") {
	    shiftTypeSelect = true;
	    shiftType = 2;
	    resetButton(true);
	    axes.selectAll("rect.shiftrect.zero").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
	    axes.selectAll("text.shifttext.zero").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
	    axes.selectAll("rect.shiftrect.one").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
	    axes.selectAll("text.shifttext.one").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
	    axes.selectAll("rect.shiftrect.two").attr("transform",function(d,i) { return "translate("+((d>0) ? figcenter : x(d))+","+y(i+1)+")"; });
	    axes.selectAll("text.shifttext.two").attr("transform",function(d,i) { return "translate("+((d>0) ? x(d)+2 : x(d)-2)+","+(y(i+1)+iBarH)+")"; });
	    axes.selectAll("rect.shiftrect.three").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
	    axes.selectAll("text.shifttext.three").attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
	}
	
	// draw a white rectangle to hide the shift bars behind the summary shifts
	// move x,y to 3 and width to -6 to give the bg a little space
	topbgrect = axes.append("rect").attr("x",3).attr("y",3).attr("class","topbgrect").attr("width",figwidth-axeslabelmargin.left-5).attr("height",73-13).attr("fill",bgcolor).style({"opacity": "1.0"});

	topbgrect2 = canvas.append("rect").attr("x",0).attr("y",0).attr("class","topbgrect").attr("width",boxwidth).attr("height",toptextheight).attr("fill",bgcolor).style({"opacity": "1.0"});

	// draw the text on top of this rect
	toptext = canvas.selectAll("text.titletext")
	    .data(comparisonText)
	    .enter()
	    .append("text")
	    .attr("y",function(d,i) { return (i+1)*17; })
	    .attr("x",3)
	    .attr("class",function(d,i) { return "titletext "+intStr[i]; })
	    .style({ // "font-family": "Helvetica Neue",
		     "font-size": function(d,i) { return topFontSizeArray[i]; },
		     "line-height": "1.42857143",
		     "color": function(d,i) { return colorArray[i]; },
		     // if there are 4 items...make the first two bold
		     "font-weight": function(d,i) { 
			 // using this variable numBoldLines
			 if (i < numBoldLines) {
			     return "bold";
			 }
			 else {
			     return "normal";
			 }
			 // if (comparisonText.length > 3) {
			 //     if (i < (comparisonText.length - 2) ) {
			 // 	 return "bold";
			 //     }
			 //     else {
			 // 	 return "normal";
			 //     }
			 // }
			 // else {
			 //     return "normal";
			 // }
		     },
		   })
	    .text(function(d,i) { return d; });

	bottombgrect = axes.append("rect")
            .attr("x",3)
            .attr("y",fullheight-axeslabelmargin.bottom-toptextheight)
            .attr("width",figwidth-2)
            .attr("height",axeslabelmargin.bottom)
            .attr("fill",bgcolor)
            .style({"opacity": "1.0"});

	// draw the summary things
	sepline = axes.append("line")
	    .attr({"x1": 0,
		   "x2": figwidth-2,
		   "y1": barHeight,
		   "y2": barHeight, })
	    .style({"stroke-width" : "1",
		    "stroke": "black", });

	maxShiftSum = Math.max(Math.abs(sumTypes[1]),Math.abs(sumTypes[2]),sumTypes[0],sumTypes[3],d3.sum(sumTypes));

	topScale = d3.scale.linear()
	    .domain([-maxShiftSum,maxShiftSum])
	    // .range([figwidth*.12,figwidth*.88]);
            .range([sumTextWidth,figwidth-sumTextWidth]);

	// define the RHS summary bars so I can add if needed
	// summaryArray = [sumTypes[3],sumTypes[0],sumTypes[3]+sumTypes[1],d3.sum(sumTypes)];
	summaryArray = [sumTypes[3],sumTypes[0],d3.sum(sumTypes)];

	typeClass = ["posup","negdown","sumgrey"];
	colorClass = ["#ffff4c","#b3b3ff","#272727"];

	axes.selectAll(".sumrectR")
	    .data(summaryArray)
	    .enter()
	    .append("rect")
	    .attr({
		"class": function(d,i) { 
		    return "sumrectR "+intStr0[i]+" "+typeClass[i]; 
		},
		"x": function(d,i) {
		    if (d>0) {
			return figcenter;
		    }
		    else { 
			return topScale(d);
		    }
		},
		"y": function(d,i) { 
		    if (i<3) { 
			return i*17+7;
		    }
		    else { 
			return i*17+7-2;
		    } 
		},
		"height": function(d,i) { return 14; },
		"width": function(d,i) { 
		    if (d>0) { 
			return topScale(d)-figcenter;
		    }
		    else {
			return figcenter-topScale(d); 
		    } 
		},
		"fill": function(d,i) {
		    return colorClass[i];
		},
	    })
	    .style({
		"opacity": function(d,i) {
		    var specificType = [3,0,-1];
		    if ((shiftTypeSelect) && (shiftType !== specificType[i])) {
			return "0.14";
		    }
		    else {
			return "0.7";
		    }
		},
		"stroke-width": "1",
		"stroke":"rgb(0,0,0)",
	    })
	    .on("mouseover", function(d,i){
		var specificType = [3,0,-1];
		// if we're in a shift selection
		if (shiftTypeSelect) {
		    if (shiftType === specificType[i]) {
			// console.log("in a shift type, and that specific type");
			var rectSelection = d3.select(this).style({opacity:"0.7"});
		    }
		    else {
			// console.log("in a shift type, but not that specific type");
			var rectSelection = d3.select(this).style({opacity:"0.3"});
		    }
		}
		// not in a shift selection
		else {
		    // console.log("not in a shift type");
		    var rectSelection = d3.select(this).style({opacity:"1.0"});
		}
	    })
	    .on("mouseout", function(d,i){
		var specificType = [3,0,-1];
		if (shiftTypeSelect) {
		    if (shiftType === specificType[i]) {
			// console.log("in a shift type, and that specific type");
			var rectSelection = d3.select(this).style({opacity:"0.7"});
		    }
		    else {
			// console.log("in a shift type, but not that specific type");
			// console.log(shiftType);
			// console.log(specificType);
			// console.log(i);
			// console.log(specificType[i]);
			var rectSelection = d3.select(this).style({opacity:"0.14"});
		    }
		}
		else {
		    // console.log("not in a shift type");
		    var rectSelection = d3.select(this).style({opacity:"0.7"});
		}
	    })
	    .on("click", function(d,i) { 
		var specificType = [3,0,-1];
		figure.selectAll(".sumrectR,.sumrectL").style({opacity:"0.1"});
		var rectSelection = d3.select(this).style({opacity:"0.7"});
		if (i==0) {
		    shiftTypeSelect = true;
		    shiftType = specificType[i];
		    resetButton(true);
		    shiftselencoder.varval("posup");
		    // shoot them all away
		    //d3.selectAll("rect.shiftrect, text.shifttext").transition().duration(1000).attr("transform",function(d,i) { if (d<0) { return "translate(-500,0)"; } else {return "translate(500,0)"; }});
		    // keep the ones with class "three"
		    //d3.selectAll("rect.shiftrect.three, text.shifttext.three").transition().duration(1000)
		    axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		    axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		    axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		    axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		    axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		    axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		    axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? figcenter : x(d))+","+y(i+1)+")"; });
		    axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? x(d)+2 : x(d)-2)+","+(y(i+1)+iBarH)+")"; });
		}
		else if (i==1) {
		    shiftTypeSelect = true;
		    shiftType = specificType[i];
		    resetButton(true);
		    shiftselencoder.varval("negdown");
		    axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? figcenter : x(d))+","+y(i+1)+")"; });
		    axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? x(d)+2 : x(d)-2)+","+(y(i+1)+iBarH)+")"; });
		    axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		    axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		    axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		    axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		    axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		    axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		}
		else if (i==2) {
		    // shiftTypeSelect = true;
		    // d3.selectAll(".sumrectR,.sumrectL").style({opacity:"0.7"});
		    resetfun();
		    // shiftselencoder.varval("negdown");
		}
	    });

	axes.selectAll(".sumtextR")
	    .data([sumTypes[3],sumTypes[0],d3.sum(sumTypes)])
	    .enter()
	    .append("text")
	    .style({"text-anchor": function(d,i) { return ((d>0) ? "start" : "end");},
                    "font-size": bigshifttextsize,})
	//.attr("y",function(d,i) { if (i<2) {return i*17+17;} else if ((sumTypes[3]+sumTypes[1])*(sumTypes[0]+sumTypes[2])<0) {return i*17+33; } else {return i*17+33; } })
	// for only three days
            .attr({"class": "sumtextR",
                   "id": function(d,i) { return "sumTextR"+i; },
	           "y": function(d,i) { return i*17+17; },
                   "x": function(d,i) { return topScale(d)+5*d/Math.abs(d); },})
	    .text(function(d,i) { if (i == 0) {return "\u2211+\u2191";} if (i==1) { return"\u2211-\u2193";} else { return "\u2211";} } );

	// summaryArray = [sumTypes[1],sumTypes[2],sumTypes[0]+sumTypes[2]];
	summaryArray = [sumTypes[1],sumTypes[2]];

	typeClass = ["posdown","negup"];
	colorClass = ["#ffffb3","#4c4cff"];

	axes.selectAll(".sumrectL")
	    .data(summaryArray)
	    .enter()
	    .append("rect")
	    .attr({
		"class": function(d,i) { return "sumrectL "+intStr0[i]+" "+typeClass[i]; },
                "id": function(d,i) { return "sumTextL"+i; },
		"x": function(d,i) { 
		    if (i<2) { 
			return topScale(d);
		    } 
		    else { 
			// place the sum of negatives bar
			// if they are not opposing
			if ((sumTypes[3]+sumTypes[1])*(sumTypes[0]+sumTypes[2])>0) {
			    // if positive, place at end of other bar
			    if (d>0) {
				return topScale((sumTypes[3]+sumTypes[1]));
			    }
			    // if negative, place at left of other bar, minus length (+topScale(d))
			    else {
				return topScale(d)-(figcenter-topScale((sumTypes[3]+sumTypes[1])));
			    }
			} 
			else { 
			    if (d>0) {return figcenter} 
			    else { return topScale(d)} }
		    }
		}, 
		"y": function(d,i) { return i*17+7; },
		"height": function(d,i) { return 14; },
		"width": function(d,i) { if (d>0) {return topScale(d)-figcenter;} else {return figcenter-topScale(d); } },
		"fill": function(d,i) {
		    return colorClass[i];
		}, 
	    })
	    .style({
		"opacity": function(d,i) {
		    var specificType = [1,2];
		    if ((shiftTypeSelect) && (shiftType !== specificType[i])) {
			return "0.14";
		    }
		    else {
			return "0.7";
		    }
		},
		"stroke-width": "1",
		"stroke": "rgb(0,0,0)"
	    })
	    .on("mouseover", function(d,i){
		var specificType = [1,2];
		// if we're in a shift selection
		if (shiftTypeSelect) {
		    if (shiftType === specificType[i]) {
			// console.log("in a shift type, and that specific type");
			var rectSelection = d3.select(this).style({opacity:"0.7"});
		    }
		    else {
			// console.log("in a shift type, but not that specific type");
			var rectSelection = d3.select(this).style({opacity:"0.3"});
		    }
		}
		// not in a shift selection
		else {
		    // console.log("not in a shift type");
		    var rectSelection = d3.select(this).style({opacity:"1.0"});
		}
	    })
	    .on("mouseout", function(d,i){
		var specificType = [1,2];
		if (shiftTypeSelect) {
		    if (shiftType === specificType[i]) {
			// console.log("in a shift type, and that specific type");
			var rectSelection = d3.select(this).style({opacity:"0.7"});
		    }
		    else {
			// console.log("in a shift type, but not that specific type");
			// console.log(shiftType);
			// console.log(specificType);
			// console.log(i);
			// console.log(specificType[i]);
			var rectSelection = d3.select(this).style({opacity:"0.14"});
		    }
		}
		else {
		    // console.log("not in a shift type");
		    var rectSelection = d3.select(this).style({opacity:"0.7"});
		}
	    })
	    .on("click", function(d,i) {
		var specificType = [1,2];
		shiftTypeSelect = true;
		shiftType = specificType[i];
		figure.selectAll(".sumrectR,.sumrectL").style({opacity:"0.1"});
		var rectSelection = d3.select(this).style({opacity:"0.7"});
		resetButton(true);
		if (i==0) {
		    shiftselencoder.varval("posdown");
		    // together
		    // axes.selectAll("rect.shiftrect.zero, text.shifttext.zero, rect.shiftrect.three, text.shifttext.three, rect.shiftrect.two, text.shifttext.two").transition().duration(1000).attr("transform",function(d,i) { if (d<0) { return "translate(-500,0)"; } else {return "translate(500,0)"; }});
		    // separate
		    axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		    axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		    axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		    axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		    axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		    axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		    axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? figcenter : x(d))+","+y(i+1)+")"; });
		    axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? x(d)+2 : x(d)-2)+","+(y(i+1)+iBarH)+")"; });
		}
		else if (i==1) {
		    shiftselencoder.varval("negup");
		    axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		    axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		    axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		    axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		    axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? figcenter : x(d))+","+y(i+1)+")"; });
		    axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? x(d)+2 : x(d)-2)+","+(y(i+1)+iBarH)+")"; });
		    axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		    axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		}
	    } );

	axes.selectAll(".sumtextL")
	    .data(summaryArray)
	    .enter()
	    .append("text")
            .style({"text-anchor": "end",
                    "font-size": bigshifttextsize,})
	    .attr("class", "sumtextL")
	    .attr("y",function(d,i) { return i*17+17; } )
	    .text(function(d,i) { if (i == 0) {return "\u2211+\u2193";} else { return"\u2211-\u2191";} })
	    .attr("x",function(d,i) { return topScale(d)-5; });
	
	// x label of shift, outside of the SVG
	xlabel = canvas.append("text")
	    .text(xlabel_text)
	    .attr("class","axes-text")
	    .attr("x",axeslabelmargin.left+figcenter) // 350-20-10 for svg width,  
	    .attr("y",boxheight-7)
	    .style({"font-size": xylabelfontsize,
                    "fill": "#000000",
                    "text-anchor": "middle"});

	ylabel = canvas.append("text")
	    .text(ylabel_text)
	    .attr("class","axes-text")
	    .attr("x",18)
	    .attr("y",figheight/2+60+toptextheight)
	    .attr("font-size", xylabelfontsize)
	    .attr("fill", "#000000")
	    .attr("transform", "rotate(-90.0," + (18) + "," + (figheight/2+60+toptextheight) + ")");

	function zoomed() {
	    // console.log(d3.event);

            // this prevents scrolling in the wrong direction
	    if (d3.event.translate[1] > 0) {
		zoom.translate([0,0]).scale(1);
	    }
	    
	    // if we have zoomed in, we set the y values for each subselection
	    if (shiftTypeSelect) {
		for (var j=0; j<4; j++) {
		    axes.selectAll("rect.shiftrect."+intStr0[j])
                        .attr("transform",function(d,i) {
                            return "translate("+(shiftType===j ? ((d>0) ? figcenter : x(d)) : ((d>0) ? 500 : -500))+","+(y(i+1))+")";
                        });
		    axes.selectAll("text.shifttext."+intStr0[j])
                        .attr("transform",function(d,i) {
                            return "translate("+(shiftType===j ? ((d>0) ? (x(d)+2) : (x(d)-2) ) : ((d>0) ? 500 : -500))+","+(y(i+1)+iBarH)+")";
		        });
                }
            }
	    else {
		axes.selectAll("rect.shiftrect")
                    .attr("transform",function(d,i) {
                            if (d>0) { return "translate("+(figcenter)+","+(y(i+1))+")"; } 
		            else { return "translate("+(x(d))+","+(y(i+1))+")"; }
                        });
		axes.selectAll("text.shifttext").attr("transform",function(d,i) {
                    if (d>0) { return "translate("+(x(d)+2)+","+(y(i+1)+iBarH)+")"; } 
		    else { return "translate("+(x(d)-2)+","+(y(i+1)+iBarH)+")"; } });

	    }
	    if (distflag) {
		// console.log(d3.event.translate);
		// move scaled to the height of the window (23 words)
		var scaledMove = d3.event.translate[1]/(figheight-yHeight);
		// console.log(scaledMove);
		// move relative to the height of the box and those 23 words
		var relMove = scaledMove*distgrouph*numWords/lens.length;
		// console.log(relMove);
		figure.select(".distwin").attr({
		    "y": d3.max([2,-relMove+2]),
		});
	    }
	}; // zoomed

	// // console.log(figheight);
	// // attach this guy. cleaner with the group
	// help = axes.append("g")
        //     .attr({"class": "help",
	// 	   "fill": "#B8B8B8",
	// 	   "transform": "translate("+(5)+","+(figheight-16)+")",
	// 	  })
	//     .on("click", function() {
	// 	window.open("http://hedonometer.org/instructions.html#wordshifts","_blank");
	//     })
	//     .selectAll("text.help")
	//     .data(["click here","for instructions"])
	//     .enter()
	//     .append("text")
        //     .attr({"class": "help",
	// 	   "fill": "#B8B8B8",
	// 	   "x": 0,
	// 	   "y": function(d,i) { return i*10; },
	// 	   "font-size": "8.0px", })
        //     .style({"text-anchor": "start", })
	//     .text(function(d) { return d; });
	
	if (distflag) {
	    computedistributions();

	    // console.log(figheight);
	    // console.log(yHeight);
	    var distgrouph = 250;
	    var distgroupw = 70;
	    var dxspace = 1;
	    var dyspace = 2;

	    distgroup = axes.append("g")
		.attr({"class": "dist",
		       "fill": "#B8B8B8",
		       "transform": "translate("+(5)+","+(figheight-28-distgrouph)+")",
		      });
	    
	    distgroup.append("rect")
		.attr({
		    "x": 0,
		    "y": 0,
		    "height": distgrouph,
		    "width": distgroupw,
		    "class": "distbg",
		    "stroke-width": "2",
		    "stroke":"rgb(150,150,150)",
		    "fill": "#FCFCFC",
		    "opacity": "0.96",
		});

	    var distx = d3.scale.linear()
		.domain(d3.extent(dist.map(function(d) { return d[4]; })))
		.range([dxspace,distgroupw-2*dxspace]);

	    var disty = d3.scale.linear()
		.domain([0,nbins-1])
		.range([dyspace,distgrouph-dyspace]);
		// .range([dyspace,distgrouph-2*dyspace]);
	    
	    var line = d3.svg.line()
		.x(function(d,i) { return distx(d); })
		.y(function(d,i) { return disty(i); })
		.interpolate("cardinal");

	    // console.log(dist.map(function(d) { return d[4]; }));
	    
	    var distline = distgroup.append("path")
		.datum(dist.map(function(d) { return d[4]; }))
		.attr("class", "line")
		.attr("d", line)
		.attr("stroke","red")
		.attr("stroke-width",1.25)
		.attr("fill","none");

	    var cdistx = d3.scale.linear()
		.domain(d3.extent(cdist.map(function(d) { return d[4]; })))
		.range([dxspace,distgroupw-2*dxspace]);

	    var cline = d3.svg.line()
		.x(function(d,i) { return cdistx(d); })
		.y(function(d,i) { return disty(i); })
		.interpolate("cardinal");

	    var cdistline = distgroup.append("path")
		.datum(cdist.map(function(d) { return d[4]; }))
		.attr("class", "line")
		.attr("d", cline)
		.attr("stroke","blue")
		.attr("stroke-width",1.25)
		.attr("fill","none");

	    // console.log(distgrouph*numWords/lens.length);
	    // console.log(distgrouph*numWords/2000);

	    var distwindowrect = distgroup.append("rect")
		.attr({
		    "x": 0,
		    "y": 2,
		    "height": distgrouph*numWords/nwords,
		    "width": distgroupw,
		    "class": "distwin",
		    "stroke-width": "0.75",
		    "stroke":"rgb(20,20,20)",
		    "fill": "#FCFCFC",
		    "opacity": "0.6",
		});

	    var nwordstext = distgroup.append("text")
		.attr({
		    "x": distgroupw+2,
		    "y": distgrouph+2,
		    "class": "nwordslabel",})
                .style({
		    "fill": "#B8B8B8",
		    "font-size": distlabeltext,
		    "text-anchor": "start",
		})
		.text(nwords);

	    distgroup.append("text")
		.attr({
		    "x": distgroupw+2,
		    "y": 2,
		    "class": "zerolabel",})
                .style({
		    "fill": "#B8B8B8",
		    "font-size": distlabeltext,
		    "text-anchor": "start",
		})
		.text("0");
	}

	credit = axes.selectAll("text.credit")
	// .data(["visualization by","@andyreagan","word shifts by","@hedonometer"])
	    .data(["visualization by","@andyreagan",])
	    .enter()
	    .append("text")
            .attr({"class": "credit",
		   "x": (figwidth-5),
		   "y": function(d,i) { return figheight-15+i*10; },
		   })
            .style({"text-anchor": "end",
                    "fill": "#B8B8B8",
                    "font-size": creditfontsize,
                   })
	    .text(function(d) { return d; });

	// get this inside of the plot...so that resizeshift won't get called
	// too early (before a shift has been plotted)
	if (!widthsetexplicitly) {
	    d3.select(window).on("resize.shiftplot",resizeshift);
	}

	if (reset) {
	    // call it
	    resetButton(true);
	}

	if (translate) {
            console.log(translate);
	    translateButton();
	}

	return that;

    }; // hedotools.shifter.plot

    function resetfun() {
	// console.log("reset function");
	figure.selectAll(".sumrectR,.sumrectL").style({opacity:"0.7"});
	shiftTypeSelect = false;	
	shiftType = -1;
	figure.selectAll("rect.shiftrect").transition().duration(1000)
	    .attr("transform",function(d,i) { return "translate("+((d>0) ? figcenter : x(d))+","+y(i+1)+")"; });
	figure.selectAll("text.shifttext").transition().duration(1000)
	    .attr("transform",function(d,i) { return "translate("+((d>0) ? x(d)+2 : x(d)-2)+","+(y(i+1)+iBarH)+")"; });
	// d3.selectAll(".resetbutton").remove();
	shiftselencoder.varval("none");
	shiftselencoder.destroy();
    } // resetfun

    function resetButton(showb) {
	// console.log("resetbutton function");

	// console.log(showb);
	// showb = showb || true;
	// console.log("showing reset button?");
	// console.log(showb);
	figure.selectAll(".resetbutton").remove();

	if (showb) {
	
	    var resetGroup = canvas.append("g")
		.attr("transform","translate("+(4)+","+(56+toptextheight)+") rotate(-90)")
		.attr("class","resetbutton");

	    resetGroup.append("rect")
		.attr("x",0)
		.attr("y",0)
		.attr("rx",3)
		.attr("ry",3)
		.attr("width",48)
		.attr("height",17)
		.attr("fill","#F0F0F0") //http://www.w3schools.com/html/html_colors.asp
		.style({"stroke-width":"0.5","stroke":"rgb(0,0,0)"});

	    resetGroup.append("text")
		.text("Reset")
		.attr("x",6)
		.attr("y",13)
		.attr("font-size", resetfontsize);
            
	    resetGroup.append("rect")
		.attr("x",0)
		.attr("y",0)
		.attr("rx",3)
		.attr("ry",3)
		.attr("width",48)
		.attr("height",18)
		.attr("fill","white") //http://www.w3schools.com/html/html_colors.asp
		.style({"opacity": "0.0"})
		.on("click",function() { 
		    resetfun();
		});

	}
	
    }; // resetButton

    function translateButton() {
        console.log("adding the translate button");
	var translateGroup = canvas.append("g")
	    .attr("class","translatebutton")
	    .attr("transform","translate("+(4)+","+(136+toptextheight)+") rotate(-90)");

	translateGroup.append("rect")
	    .attr("x",0)
	    .attr("y",0)
	    .attr("rx",3)
	    .attr("ry",3)
	    .attr("width",75)
	    .attr("height",17)
	    .attr("fill","#F0F0F0") //http://www.w3schools.com/html/html_colors.asp
	    .style({"stroke-width":"0.5","stroke":"rgb(0,0,0)"});

	translateGroup.append("text")
	    .text("Translate All")
	    .attr("x",6)
	    .attr("y",13)
	    .attr("font-size", "11.0px")

	translateGroup.append("rect")
	    .attr("x",0)
	    .attr("y",0)
	    .attr("rx",3)
	    .attr("ry",3)
	    .attr("width",75)
	    .attr("height",18)
	    .attr("fill","white") //http://www.w3schools.com/html/html_colors.asp
	    .style({"opacity": "0.0"})
	    .on("click",function() { 
		for (var i=0; i<flipVector.length-1; i++) { flipVector[i] = flipVector[flipVector.length-1]; }
		flipVector[flipVector.length-1] = (flipVector[flipVector.length-1] + 1) % 2;
		// console.log("clicked translate");

		axes.selectAll("text.shifttext").transition().duration(1000)
		    .text(function(d,i) { 
			// goal is to toggle translation
			// need translation vector
			//console.log(flipVector[i]);
			if (flipVector[i]) { 
			    return sortedWordsEn[i];
			}
			else {
			    return sortedWords[i];
			}
		    }); // .text()
	    }); // on("click")
    }; // translateButton

    var cloud = function() {
        var that = this;
        
        if (viz_type_decoder().cached === "table") {
            // console.log("removing table stuff");
            newrank.remove();
            newfreq.remove();
            newtype.remove();
            newmag.remove();
            header.remove();
        }
        
        // push the state the browser URL
        viz_type.varval("cloud");
        // console.log("making a cloud");

        // move all the stuff out of the way (table or wordshift)
        axes.selectAll("rect.shiftrect").transition().duration(1000).attr("x",1000);
        axes.selectAll(".sumrectR").transition().duration(2000).attr("x",1000);
	axes.selectAll(".sumtextR").transition().duration(2000).attr("x",1000);
	axes.selectAll(".sumrectL").transition().duration(2000).attr("x",-1000);
	axes.selectAll(".sumtextL").transition().duration(2000).attr("x",-1000);
        // bgrect.style("stroke-width",0.5);
        bottombgrect.attr("y",1000);
        // // need to get rid of the clipping boundary too?
        // bgrect.remove();
        xlabel.transition().duration(2000).attr("y",1000);
        ylabel.transition().duration(2000).attr("x",-1000);
	topbgrect.transition().duration(2000).attr("y",-200);
        sepline.transition().duration(1000).attr({"y1":-10,"y2":-10,});

        var sizeScale = d3.scale.linear()
            .domain([Math.abs(sortedMag[49]),Math.abs(sortedMag[0])])
            .range([6,70]);

        // go create a canvas and get the context there
        // var cloud_canvas = document.createElement("canvas");
        // cloud_canvas.width = figwidth;
        // cloud_canvas.height = figheight;
        // // cloud_canvas.width = 2048;
        // // cloud_canvas.height = 2048;
        figure.selectAll("canvas").remove();
        figure.append("canvas")
            .attr({"width": figwidth, "height": figheight, "id": "cloudcanvas"})
            .style({"display": "none"});
        // var cloud_canvas_context = cloud_canvas.getContext("2d");
        var cloud_canvas_context = document.getElementById("cloudcanvas").getContext("2d");

        figure.append("canvas")
            .attr({"width": figwidth, "height": figheight, "id": "cloudcanvas2"})
            .style({"display": "none"});
        
        // var cloud_canvas_context = cloud_canvas.getContext("2d");
        var cloud_canvas_context_demo = document.getElementById("cloudcanvas2").getContext("2d");

        cloud_canvas_context.textAlign = "center";
        // cloud_canvas_context.textBaseline = "bottom";
        cloud_canvas_context.fillStyle = "red";
        cloud_canvas_context.strokeStyle = "red";
        cloud_canvas_context.textAlign = "center";
        cloud_canvas_context.save();

        var nbins = 1;
        
        // keep track of everything in this data structure
        var data = sortedWordsRaw.map(function(d, i) {
            a = {};
            // text
            a.text = d;
            // random rotation
            a.rotate = Math.round((Math.random() * nbins) - nbins/2) * 90;
            // a.rotate = 0;
            // scale the size (see scale above)
            a.size = sizeScale(Math.abs(sortedMag[i]));
            // set the font style using a single string
            // https://developer.mozilla.org/en-US/docs/Web/CSS/font
            a.fontString = a.size+"px  "+fontString;
            // don't let them touch
            a.padding = 1;
            // initially space them along the horizontal line
            // width half of the width
            a.x = figcenter+(Math.random()-.5)*figwidth/2;
            a.y = figheight/2;
            return a;
        });

        var num_to_cloud = 199;

        var size = [figwidth,figheight];
        var bounds = null;
        var board = [];
        var i = -1;
        while (i++ < num_to_cloud ) {
            var d = data[i];
            // go and generate the image data
            // it saves on d
            
            cloudSpriteSimple(cloud_canvas_context_demo, d, size);

            var cloud_canvas_monochrome = monochrome(cloud_canvas_context.getImageData(0,0,size[0],size[1]).data);
            // this will place it (updating x and y)
            var success = place(board,d,cloud_canvas_monochrome);
            // reset the bounds
            // if (bounds) cloudBounds(bounds, d);
            // else bounds = [{x: d.x + d.x0, y: d.y + d.y0}, {x: d.x + d.x1, y: d.y + d.y1}];
            // translate such that the rotation actually is centered
            // put it back to having all of the words
            cloud_canvas_context.setTransform(1, 0, 0, 1, 0, 0);
            cloud_canvas_context.save();
            cloud_canvas_context.font = d.fontString;
            cloud_canvas_context.lineWidth = 2 * d.padding;
            cloud_canvas_context.translate(d.x, d.y);
            cloud_canvas_context.rotate(d.rotate * cloudRadians);
            // put it in the center (with the translation)
            cloud_canvas_context.fillText(d.text, 0, 0);
            cloud_canvas_context.strokeText(d.text, 0, 0);
            cloud_canvas_context.restore();
            // console.log(d);
        }

        // check that the board works
        // console.log(board);
        // axes.append("rect")
        //     .attr({"x": board[0].x0,
        //            "y": board[0].y0,
        //            "width": board[0].w,
        //            "height": board[0].h,})
        //     .style({"stroke-width": 2,
        //             "stroke": "black",
        //             "fill": "white",
        //             "fill-opacity": "0.0",
        //         });

        // num_to_cloud += 30;
	var newwords = axes.selectAll("text.shifttext").data(data)
            .filter(function(d, i) { if (i < num_to_cloud+1) { return 1; } });

        newwords.text(function(d,i) { return d.text; })
            .transition().duration(1000)
            .delay(function(d,i) { return i*10; })
            // .style("font-size", function(d,i) { return sizeScale(Math.abs(sortedMag[i])); })
            // .attr("x",function(d,i) { return Math.random()*100+figcenter; })
            // .attr("y",function(d,i) { return Math.random()*100+figheight/2; });
            .attr("placed",function(d,i) { return d.placed; } )
            // .attr("x", function(d,i) { return d.x; })
        // .attr("y", function(d,i) { return d.y; })
            .attr("x", function(d,i) { return 0; })
            .attr("y", function(d,i) { return 0; })
            .style("text-anchor", "middle")
            // .style("font-size", function(d) { return d.size + "px"; })
            // .style("font-family", "\"Impact\", serif")
        // .style("font", function(d,i) { return d.size + "px " + d.font + ", " + d.style; })
            .style("font", function(d,i) { return d.fontString; })
            .attr("transform", function(d,i) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                // return "rotate(" + d.rotate + ")";
            });
        
        function place(board, tag, my_monochrome) {
            // size of the whole figure
            var perimeter = [{x: 0, y: 0}, {x: size[0], y: size[1]}];
            // initial position
            var startX = tag.x;
            var startY = tag.y;
            // diagonal length of the board
            var maxDelta = Math.sqrt(size[0] * size[0] + size[1] * size[1]);
            // spiral outward!
            var e = size[0] / size[1];
            var archimedeanSpiral = function(t) {
                return [e * t * Math.cos(t), t * Math.sin(t)];
            };
            // randomly choose a direction to spin
            var dt = Math.random() < .5 ? 1 : -1;
            // start on the other side of 0, with a small timestep
            var delta = 2;
            dt = dt*delta;
            var t = -dt;
            var dxdy;
            var dx;
            var dy;
            
            // march ahead, setting dxdy as the position of our spiral
            while ( dxdy = archimedeanSpiral(t += dt) ) {
                dx = dxdy[0];
                dy = dxdy[1];

                // make sure we are not outside the radius
                // if so, kill it
                if (Math.min(Math.abs(dx), Math.abs(dy)) >= maxDelta) break;

                // update the position
                tag.x = startX + dx;
                tag.y = startY + dy;

                // console.log(dxdy);
                // axes.selectAll("circle").remove();
                // axes.append("circle")
                //     .attr({"cx": tag.x, "cy": tag.y, "r": 1})
                //     .style({"fill": "red",});


                // if the word extends past the edge, keep rotating
                // (it should come back in!)
                if (tag.x + tag.x0 < 0 || tag.y + tag.y0 < 0 ||
                    tag.x + tag.x1 > size[0] || tag.y + tag.y1 > size[1]) continue;

                // now let's take the image data from the canvas, and compare the placement
                // of the data from the tag's sprite
                // not using the board, (which could store the bounding boxes for a smarter search)
                
                // for the whole canvas
                // var cloud_canvas_monochrome = monochrome(cloud_canvas_context.getImageData(0, 0, size[0], size[1]).data);
                // for the just the bounding box of the sprite
                // could fetch this from the above....
                // console.log(cloud_canvas_context.getImageData(tag.x+tag.x0, tag.y-tag.y1, 2*tag.x1, tag.y1));
                var place_rect = {"x0": Math.floor(tag.x)+tag.x0,
                                  "y0": Math.floor(tag.y)-tag.y1,
                                  "w": 2*tag.x1,
                                  "h": tag.y1,};
                place_rect.x1 = place_rect.x0+place_rect.w;
                place_rect.y1 = place_rect.y0+place_rect.h;
                // var cloud_canvas_monochrome = monochrome(cloud_canvas_context.getImageData(
                //     place_rect.x0,place_rect.y0,place_rect.w,place_rect.h
                // ).data);

                var cloud_canvas_monochrome = indexer2d(my_monochrome,
                                                        size[0],
                                                        place_rect.y0,
                                                        place_rect.y1,
                                                        place_rect.x0,
                                                        place_rect.x1);
                
                // // console.log(cloud_canvas_monochrome);
                // console.log(cloud_canvas_monochrome.reduce(function(pv, cv) { return pv + cv; }, 0))
                // // console.log(tag.sprite);
                // console.log(tag.sprite.reduce(function(pv, cv) { return pv + cv; }, 0));
                for (var i=0; i<tag.sprite.length; i++) {
                    // check that they both have data there
                    if (tag.sprite[i] && cloud_canvas_monochrome[i] ) {
                        break
                    }
                }
                // index on the canvas data is tag.x
                if (i === tag.sprite.length) {
                    board.push(place_rect)
                    // console.log(t);
                    return true;
                }
            }// while()
            // console.log(t);
            return false;
        } // place()
        
        return that;
    } // hedotools.shifter.cloud

    var newrank;
    var newfreq;
    var newtype;
    var newmag;
    var header;

    var table = function() {
        var that = this;

        viz_type.varval("table");

        // console.log("making a table");
        
        var rankwidth = 20;
        var wordwidth = 70;
        var typewidth = 25;
        var freqwidth = 25;
        var magwidth = 35;
        var totalwidth = rankwidth+wordwidth+typewidth+freqwidth+magwidth;
        // console.log("width of all the text stuff "+totalwidth);
        var barswidth = figwidth-totalwidth;
        var aligns = ["start","start","middle","middle","end","middle"];
        // console.log("width left "+barswidth);
        xpadding = 10;
        var barcenter = totalwidth+barswidth/2;
        var width_offsets = [0,rankwidth,rankwidth+wordwidth,rankwidth+wordwidth+typewidth,rankwidth+wordwidth+typewidth+freqwidth+magwidth,barcenter];
        
	// linear scale function
	x.domain([-Math.abs(sortedMag[0]),Math.abs(sortedMag[0])])
	    .range([xpadding,barswidth-xpadding]);

        yHeight = 15;

	// linear scale function
	y.range([figheight+2, yHeight]); 

	// both of these need their y height reset
	resetButton(false);

	// if (translate) {
	//     translateButton();
	// }

	var newbars = axes.selectAll("rect.shiftrect").data(sortedMag);
	var newwords = axes.selectAll("text.shifttext").data(sortedMag);

	newbars.transition().duration(1000)
		.attr({"fill": "grey",
		       "class": function(d,i) { return "shiftrect "+intStr0[sortedType[i]]; },
                       "transform": function(d,i) {
                           if (d>0) { return "translate("+barcenter+","+(y(i+1)+2.5)+")"; } 
		           else { return "translate("+(x(d)+totalwidth)+","+(y(i+1)+2.5)+")"; }
                       },
		       "height": function(d,i) { return iBarH; },
		       "width": function(d,i) { if ((d)>0) {return x(d)-x(0);} else { return x(0)-x(d); } } });

	newwords.transition().duration(1000)
	        .attr({"class": function(d,i) { return "shifttext "+intStr0[sortedType[i]]; },
                       "transform": function(d,i) {
                           return "translate("+rankwidth+","+(y(i+1)+iBarH)+")";
                       },})
	    .style({"text-anchor": "start", "font-size": wordfontsize})        
            .text(function(d,i) { return sortedWordsRaw[i]; });

        // fix these both for the translate button
        sortedWords = sortedWordsRaw;
        if (translate) { sortedWordsEn = sortedWordsEnRaw; }

        newrank = axes.selectAll("text.shiftrank").data(sortedMag)
            .enter()
            .append("text")
            .attr("y",function(d,i) { return y(i+1)+iBarH; } )
	    .attr("x",function(d,i) { return 0; } )
            .style({"text-anchor": "start", "font-size": wordfontsize})
            .text(function(d,i) { return (i+1)+"."; });

        newtype = axes.selectAll("text.shifttype").data(sortedMag)
            .enter()
            .append("text")
            .attr("y",function(d,i) { return y(i+1)+iBarH; } )
	    .attr("x",function(d,i) { return rankwidth+wordwidth; } )
            .style({"text-anchor": "middle", "font-size": wordfontsize})
            .text(function(d,i) { 
	        if (sortedType[i] == 0) { return "\u002D"; } 
		else if (sortedType[i] == 2) { return "\u002D"; } // -
	        else { return "\u002B"; } // +
            });
                    
        newfreq = axes.selectAll("text.shiftfreq").data(sortedMag)
            .enter()
            .append("text")
            .attr("y",function(d,i) { return y(i+1)+iBarH; } )
	    .attr("x",function(d,i) { return rankwidth+wordwidth+typewidth; } )
            .style({"text-anchor": "middle", "font-size": wordfontsize})
            .text(function(d,i) { 
	        if (sortedType[i] == 0) { return "\u2193"; } 
		else if (sortedType[i] == 1) { return "\u2193"; }
		else { return "\u2191"; }
            });

        newmag = axes.selectAll("text.shiftmag").data(sortedMag)
            .enter()
            .append("text")
            .attr("y",function(d,i) { return y(i+1)+iBarH; } )
	    .attr("x",function(d,i) { return rankwidth+wordwidth+typewidth+freqwidth+magwidth; } )
            .style({"text-anchor": "end", "font-size": wordfontsize})
            .text(function(d,i) { return (d/(Math.abs(compH-refH))*100).toFixed(2)+"%"; });

        header = axes.selectAll("text.header")
            .data(["#","Word","\u002B/\u002D","\u2191/\u2193","% Cont.","% Cont."])
            .enter()
            .append("text")
            .attr({"x": function(d,i) { return width_offsets[i]; },
                   "y": function(d,i) { return y(0)+iBarH; }, })
            .style({"text-anchor": function(d,i) { return aligns[i]; },
                    "font-size": function(d,i) { return wordfontsize; }, })
            .text(function(d,i) { return d; })
        
	axes.selectAll(".sumrectR").transition().duration(2000).attr("x",1000);
	axes.selectAll(".sumtextR").transition().duration(2000).attr("x",1000);
	axes.selectAll(".sumrectL").transition().duration(2000).attr("x",-1000);
	axes.selectAll(".sumtextL").transition().duration(2000).attr("x",-1000);
        bgrect.style("stroke-width",0);
        bottombgrect.attr("y",1000);
        // // need to get rid of the clipping boundary too?
        // bgrect.remove();
        xlabel.transition().duration(2000).attr("y",1000);
        ylabel.transition().duration(2000).attr("x",-1000);
	topbgrect.transition().duration(2000).attr("y",-200);
        sepline.transition().duration(1000).attr({"y1":"15","y2":15,});

        function zoomed() {
	    // console.log(d3.event);
	    if (d3.event.translate[1] > 0) {
		zoom.translate([0,0]).scale(1);
	    }
	    newbars.attr("transform",function(d,i) { return "translate("+((d > 0) ? barcenter : x(d)+totalwidth)+","+(y(i+1)+2.5)+")"; });
            newwords.attr("transform",function(d,i) { return "translate("+((d > 0) ? rankwidth : rankwidth)+","+(y(i+1)+iBarH)+")"; });
            
	    // newbars.attr("y", function(d,i) { return y(i+1) });
	    // newwords.attr("y", function(d,i) { return y(i+1)+iBarH; } );
            newrank.attr("y", function(d,i) { return y(i+1)+iBarH; } );
            newtype.attr("y", function(d,i) { return y(i+1)+iBarH; } );
            newfreq.attr("y", function(d,i) { return y(i+1)+iBarH; } );
            newmag.attr("y", function(d,i) { return y(i+1)+iBarH; } );

	}; // zoomed

        zoom = d3.behavior.zoom()
	    .y(y) // pass linear scale function
	    // .translate([10,10])
	    .scaleExtent([1,1])
	    .on("zoom",zoomed);
        
	return that;
    } // hedotools.shifter.table()

    var replot = function() {
        var that = this;

	// apply new data to the bars, transition everything
	// tricky to get the transition right
        var yHeight = (7+17*3+14+5-13); // 101

        // linear scale function
	y.range([figheight+2, yHeight]);
        sepline.transition().duration(1000).attr({"y1":barHeight,"y2":barHeight,});

        if (viz_type_decoder().cached === "table") {
            // console.log("removing table stuff");
            newrank.remove();
            newfreq.remove();
            newtype.remove();
            newmag.remove();
            header.remove();
        }

        viz_type.varval("wordshift");
        // console.log("making a wordshift");

	// make sure to update this
	if (comparisonText[0].length < 1) {
	    if (compH >= refH) {
		var happysad = "happier";
	    }
	    else { 
		var happysad = "less happy";
	    }

	    // console.log("generating text for wordshift");
	    comparisonText = splitstring(["Reference happiness: "+refH.toFixed(2),"Comparison happiness: "+compH.toFixed(2),"Why comparison is "+happysad+" than reference:"],boxwidth-10-logowidth,"14px  "+fontString);
	    // console.log(comparisonText);
	}
	else {
	    if ( split_top_strings ) {
		comparisonText = splitstring(comparisonText,boxwidth-10-logowidth,"14px  "+fontString);
	    }
	    // console.log(comparisonText);
	}

	// could set a cap to make sure no 0"s
	maxWidth = d3.max(sortedWords.slice(0,5).map(function(d) { return d.width(wordfontsize + "px  "+fontString); }));

	var xpadding = 10;
	// linear scale function
	x.domain([-Math.abs(sortedMag[0]),Math.abs(sortedMag[0])])
	    .range([maxWidth+xpadding,figwidth-maxWidth-xpadding]);

	if (show_x_axis_bool) {
	    canvas.select(".x.axis")
		.call(xAxis);
	}

	// get the height again
	toptextheight = comparisonText.length*17+13;
	// console.log(toptextheight);

	resetButton(true);
	
	// reset this
	figheight = boxheight - axeslabelmargin.top - axeslabelmargin.bottom - toptextheight;

	// linear scale function
	y.range([figheight+2, yHeight]); 

	axes.attr("transform","translate("+(axeslabelmargin.left)+","+(axeslabelmargin.top+toptextheight)+")")
	    .attr("height", figheight);
	
	bgrect.attr("height", figheight-2).style({"stroke-width":0.5,"stroke": "rgb(20,20,20)"});
        
	topbgrect2.attr("height",toptextheight);

	// // console.log(figheight);
	// canvas.selectAll("g.help").remove();
	// help.remove();
	// help = axes.append("g")
        //     .attr({"class": "help",
	// 	   "fill": "#B8B8B8",
	// 	   "transform": "translate("+(5)+","+(figheight-16)+")",
	// 	  })
	//     .on("click", function() {
	// 	window.open("http://hedonometer.org/instructions.html#wordshifts","_blank");
	//     })
	//     .selectAll("text.help")
	//     .data(["click here","for instructions"])
	//     .enter()
	//     .append("text")
        //     .attr({"class": "help",
	// 	   "fill": "#B8B8B8",
	// 	   "x": 0,
	// 	   "y": function(d,i) { return i*10; },
	// 	   "font-size": "8.0px", })
        //     .style({"text-anchor": "start", })
	//     .text(function(d) { return d; });


	// since I really want this on there (in safari)
	// go through the extra trouble of removing it first
	canvas.selectAll("text.credit").remove();
	credit.remove();
	credit = axes.selectAll("text.credit")
	    .data(["visualization by","@andyreagan"])
	    .enter()
	    .append("text")
            .attr({"class": "credit",
		   "fill": "#B8B8B8",
		   "x": (figwidth-5),
		   "y": function(d,i) { return figheight-15+i*10; },
		   "font-size": "8.0px", })
            .style({"text-anchor": "end", })
	    .text(function(d) { return d; });

	// console.log("the comparison text in replot is:");
	// console.log(comparisonText);
	// console.log(toptext);
	canvas.selectAll("text.titletext").remove();
	toptext.remove();
	toptext = canvas.selectAll("text.titletext")
	    .data(comparisonText)
	    .enter()
	    .append("text")
	    .attr({ "y": function(d,i) { return (i+1)*17; },
		    "x": 3,
		    "class": function(d,i) { return "titletext "+intStr[i]; }, })
	    .style({ // "font-family": "Helvetica Neue",
		     "font-size": function(d,i) { return topFontSizeArray[i]; },
		     "line-height": "1.42857143",
		     "color": function(d,i) { return colorArray[i]; },
		     // if there are 4 items...make the first two bold
		     "font-weight": function(d,i) { 
			 // using this variable numBoldLines
			 if (i < numBoldLines) {
			     return "bold";
			 }
			 else {
			     return "normal";
			 }
		     },
		   })	
	    .text(function(d,i) { return d; });

	bottombgrect.attr("y",fullheight-axeslabelmargin.bottom-toptextheight);

	// both of these need their y height reset
	// resetButton(true);
	
	// if (translate) {
	//     translateButton();
	// }

	var newbars = axes.selectAll("rect.shiftrect").data(sortedMag);
	var newwords = axes.selectAll("text.shifttext").data(sortedMag);
        // console.log(sortedWords);
        // console.log(sortedMag);
        // console.log(compF);
	
	// if we haven't dont a subselection, apply with a transition
	if (shiftseldecoder().current === "none" || shiftseldecoder().current.length === 0) {
	    newbars.transition().duration(1500)
		.attr({"fill": function(d,i) { if (sortedType[i] == 2) {return "#4C4CFF";} else if (sortedType[i] == 3) {return "#FFFF4C";} else if (sortedType[i] == 0) {return "#B3B3FF";} else { return "#FFFFB3"; }},
		       "class": function(d,i) { return "shiftrect "+intStr0[sortedType[i]]; },
		       // "x":function(d,i) { 
		       //     if (d>0) { return figcenter; } 
		       //     else { return x(d)} },
            	       // "y": function(d,i) { return y(i+1); },
                       "x": 0,
                       "y": 0,
                       "transform": function(d,i) {
                           if (d>0) { return "translate("+figcenter+","+y(i+1)+")"; } 
		           else { return "translate("+x(d)+","+y(i+1)+")"; }
                       },
		       "height": function(d,i) { return iBarH; },
		       "width": function(d,i) { if ((d)>0) {return x(d)-x(0);} else {return x(0)-x(d); } } });

	    newwords.transition().duration(1500)
	        .attr({"class": function(d,i) { return "shifttext "+intStr0[sortedType[i]]; },
                       "x": 0,
                       "y": 0,
                       "transform": function(d,i) {
                           if (d>0) { return "translate("+(x(d)+2)+","+(y(i+1)+iBarH)+")"; } 
		           else { return "translate("+(x(d)-2)+","+(y(i+1)+iBarH)+")"; }
                       },})
	    // .attr("class", function(d,i) { return "shifttext "+intStr0[sortedType[i]]; })
            // .attr("transform", null)
            // .attr("y",function(d,i) { return y(i+1)+iBarH; })
	    // .attr("x",function(d,i) { if (d>0) {return x(d)+2;} else {return x(d)-2; } } )
            	.style({"text-anchor": function(d,i) { if (sortedMag[i] < 0) { return "end";} else { return "start";}},
                        "font-size": wordfontsize,})
            	.text(function(d,i) { return sortedWords[i]; });
	}
	// else apply without a transition
	else {
	    newbars.attr({"fill": function(d,i) { if (sortedType[i] == 2) {return "#4C4CFF";} else if (sortedType[i] == 3) {return "#FFFF4C";} else if (sortedType[i] == 0) {return "#B3B3FF";} else { return "#FFFFB3"; }},
		       "class": function(d,i) { return "shiftrect "+intStr0[sortedType[i]]; },
		       // "x":function(d,i) { 
		       //     if (d>0) { return figcenter; } 
		       //     else { return x(d)} },
            	       // "y": function(d,i) { return y(i+1); },
                       "x": 0,
                       "y": 0,
                       "transform": function(d,i) {
                           if (d>0) { return "translate("+figcenter+","+y(i+1)+")"; } 
		           else { return "translate("+x(d)+","+y(i+1)+")"; }
                       },
		       "height": function(d,i) { return iBarH; },
		       "width": function(d,i) { if ((d)>0) {return x(d)-x(0);} else {return x(0)-x(d); } } });

	    newwords.attr({"class": function(d,i) { return "shifttext "+intStr0[sortedType[i]]; },
                       "x": 0,
                       "y": 0,
                       "transform": function(d,i) {
                           if (d>0) { return "translate("+(x(d)+2)+","+(y(i+1)+iBarH)+")"; } 
		           else { return "translate("+(x(d)-2)+","+(y(i+1)+iBarH)+")"; }
                       },})
		.style({"text-anchor": function(d,i) { if (sortedMag[i] < 0) { return "end";} else { return "start";}}, "font-size": wordfontsize})
		.text(function(d,i) { return sortedWords[i]; });

	    if (shiftseldecoder().current === "posup") {
		axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? figcenter : x(d))+","+y(i+1)+")"; });
		axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? x(d)+2 : x(d)-2)+","+(y(i+1)+iBarH)+")"; });
	    }
	    else if (shiftseldecoder().current === "negdown") {
		axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? figcenter : x(d))+","+y(i+1)+")"; });
		axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? x(d)+2 : x(d)-2)+","+(y(i+1)+iBarH)+")"; });
		axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });		
	    }
	    else if (shiftseldecoder().current === "posdown") {
		axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? figcenter : x(d))+","+y(i+1)+")"; });
		axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? x(d)+2 : x(d)-2)+","+(y(i+1)+iBarH)+")"; });
	    }
	    else if (shiftseldecoder().current === "negup") {
		axes.selectAll("rect.shiftrect.zero").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		axes.selectAll("text.shifttext.zero").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		axes.selectAll("rect.shiftrect.one").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		axes.selectAll("text.shifttext.one").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
		axes.selectAll("rect.shiftrect.two").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? figcenter : x(d))+","+y(i+1)+")"; });
		axes.selectAll("text.shifttext.two").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? x(d)+2 : x(d)-2)+","+(y(i+1)+iBarH)+")"; });
		axes.selectAll("rect.shiftrect.three").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+y(i+1)+")"; });
		axes.selectAll("text.shifttext.three").transition().duration(1000).attr("transform",function(d,i) { return "translate("+((d>0) ? 500 : -500)+","+(y(i+1)+iBarH)+")"; });
	    }
	}

	maxShiftSum = Math.max(Math.abs(sumTypes[1]),Math.abs(sumTypes[2]),sumTypes[0],sumTypes[3]);

	topScale.domain([-maxShiftSum,maxShiftSum]);

	// define the RHS summary bars so I can add if needed
	// var summaryArray = [sumTypes[3],sumTypes[0],sumTypes[3]+sumTypes[1],d3.sum(sumTypes)];
	summaryArray = [sumTypes[3],sumTypes[0],d3.sum(sumTypes)];

	var newRtopbars = axes.selectAll(".sumrectR")
	    .data(summaryArray);
	
	newRtopbars.transition().duration(1500)
	    .attr("x",function(d,i) { 
		if (d>0) { 
		    return figcenter;
		} 
		else { return topScale(d)} })
	    .attr("width",function(d,i) { if (d>0) {return topScale(d)-figcenter;} else {return figcenter-topScale(d); } } );

	var newRtoptext = axes.selectAll(".sumtextR")
	    .data([sumTypes[3],sumTypes[0],d3.sum(sumTypes)]);

	newRtoptext.transition().duration(1500).attr("class", "sumtextR")
	    .style("text-anchor",function(d,i) { if (d>0) {return "start";} else {return "end";} })
	    .attr("x",function(d,i) { return topScale(d)+5*d/Math.abs(d); });
	
	summaryArray = [sumTypes[1],sumTypes[2],sumTypes[0]+sumTypes[2]];

	var newLtopbars = axes.selectAll(".sumrectL")
	    .data(summaryArray);

	newLtopbars.transition().duration(1500).attr("fill", function(d,i) { 
	    if (i==0) {
		return "#FFFFB3";
	    } 
	    else if (i==1) {
		return "#4C4CFF";
	    } 
	    else {
		// choose color based on whether increasing/decreasing wins
		if (d>0) {
		    return "#B3B3FF";
		}
		else {
		    return "#4C4CFF";
		}
	    }
	})
	    .attr("x",function(d,i) { 
		if (i<2) { 
		    return topScale(d);
		} 
		else { 
		    // place the sum of negatives bar
		    // if they are not opposing
		    if ((sumTypes[3]+sumTypes[1])*(sumTypes[0]+sumTypes[2])>0) {
			// if positive, place at end of other bar
			if (d>0) {
			    return topScale((sumTypes[3]+sumTypes[1]));
			}
			// if negative, place at left of other bar, minus length (+topScale(d))
			else {
			    return topScale(d)-(figcenter-topScale((sumTypes[3]+sumTypes[1])));
			}
		    } 
		    else { 
			if (d>0) {return figcenter} 
			else { return topScale(d)} }
		}
	    })
	    .attr("width",function(d,i) { if (d>0) {return topScale(d)-figcenter;} else {return figcenter-topScale(d); } } );

	var newLtoptext = axes.selectAll(".sumtextL")
	    .data([sumTypes[1],sumTypes[2]]);

	newLtoptext.transition().duration(1500).attr("x",function(d,i) { return topScale(d)-5; });

	return that;
    }; // hedotools.shifter.replot

    function resizeshift() {
        var that = this;

	// don't use this function...
	// not sure why, but the updates don't always seem to work
	// (need selections, can't pass variables that are local
	// in scope)
	return 1;
	
	fullwidth = parseInt(figure.style("width"));
	boxwidth = fullwidth-margin.left-margin.right;
	figwidth = boxwidth-axeslabelmargin.left-axeslabelmargin.right;
	figcenter = figwidth/2;
	// console.log(figcenter);

	canvas.attr("width", boxwidth);
	axes.attr("width", figwidth);

	x.range([maxWidth+10,figwidth-maxWidth-10]);
	
	topScale.range([figwidth*.12,figwidth*.88]);

	bgrect.attr("width",figwidth);
	topbgrect.attr("width",figwidth-5);
	bottombgrect.attr("width",figwidth-5);

	// fix the x axis
	// canvas.select(".x.axis").call(xAxis);

	// get the x label
	xlabel.transition().duration(2000).attr("x",(leftOffsetStatic+figwidth/2))
	    .attr("y",boxheight-7);
        ylabel.transition().duration(2000).attr("y",figheight/2+60+toptextheight)
            .attr("x",18)
	    .attr("transform", "rotate(-90.0," + (18) + "," + (figheight/2+60+toptextheight) + ")");

	// the andy reagan credit
	// credit.attr("x",width-7);

	// line separating summary
	sepline.attr("x2",figwidth);

	axes.selectAll(".sumrectR")
	    .attr("x",function(d,i) { 
		if (d>0) { return figcenter; } 
		else { return topScale(d)} } )
	    .attr("width",function(d,i) { if (d>0) {return topScale(d)-figcenter;} else {return figcenter-topScale(d); } } );

	axes.selectAll(".sumtextR")
	    .attr("x",function(d,i) { return topScale(d)+5*d/Math.abs(d); });

	axes.selectAll(".sumrectL")
	    .attr("x",function(d,i) { 
		if (i<2) { 
		    return topScale(d);
		} 
		else { 
		    // place the sum of negatives bar
		    // if they are not opposing
		    if ((sumTypes[3]+sumTypes[1])*(sumTypes[0]+sumTypes[2])>0) {
			// if positive, place at end of other bar
			if (d>0) {
			    return topScale((sumTypes[3]+sumTypes[1]));
			}
			// if negative, place at left of other bar, minus length (+topScale(d))
			else {
			    return topScale(d)-(figcenter-topScale((sumTypes[3]+sumTypes[1])));
			}
		    } 
		    else { 
			if (d>0) {return figcenter} 
			else { return topScale(d)} }
		}
	    })
	    .attr("width",function(d,i) { if (d>0) {return topScale(d)-figcenter;} else {return figcenter-topScale(d); } } );

	axes.selectAll(".sumtextL")
	    .attr("x",function(d,i) { return topScale(d)-5; });

	shiftrects
	    .attr("x",function(d,i) { 
		if (d>0) { return figcenter; } 
		else { return x(d); } })
	    .attr("width",function(d,i) { 
		if ((d)>0) { return x(d)-x(0); } 
		else { return x(0)-x(d); } });

	// all of the lower shift text
	shifttext.attr("x",function(d,i) { if (d>0) {return x(d)+2;} else {return x(d)-2; } } );

    }

    var opublic = { shift: shift,
		    ignore: ignore,
		    setTextBold: setTextBold,
		    stop: stop,
		    istopper: istopper,
		    shifter: shifter,
		    selfShifter: selfShifter,
		    setfigure: setfigure,
                    getfigure: getfigure,
		    setdata: setdata,
		    plot: plot,
                    add_help_button: add_help_button,
		    show_x_axis: show_x_axis,
		    replot: replot,
                    table: table,
                    cloud: cloud,
		    setText: setText,
		    setWidth: setWidth,
		    setHeight: setHeight,
                    setBgcolor: setBgcolor,
		    splitstring: splitstring,
		    drawlogo: drawlogo,
		    resetbuttontoggle: resetbuttontoggle,
		    plotdist: plotdist,
		    _reset: _reset,
		    _stoprange: _stoprange,
		    _refF: _refF,
		    _compF: _compF,
		    _lens: _lens,
		    _complens: _complens,
		    _words: _words,
		    _words_en: _words_en,
		    // boatload more accessor functions
		    _refH: _refH,
		    _compH: _compH,
		    _xlabel_text: _xlabel_text,
		    _ylabel_text: _ylabel_text,
		    setTextColors: setTextColors,
		    setTopTextSizes: setTopTextSizes,
		    _split_top_strings: _split_top_strings,
		    _shiftMag: _shiftMag,
		    _shiftType: _shiftType,
		    dualShifter: dualShifter,
                    setFontSizes: setFontSizes,
                    _fontString: _fontString,
                    _viz_type_use_URL: _viz_type_use_URL,
                    _my_shift_id: _my_shift_id,
                    _sortedMag: _sortedMag,
                    _sortedType: _sortedType,
                    _sortedWords: _sortedWords,
                    _sortedWordsRaw: _sortedWordsRaw,
                    get_word_index: get_word_index,
		  }
    return opublic;
};

function cloudSpriteSimple(my_canvas_context, d, size) {
    if (d.sprite) return;
    
    my_canvas_context.setTransform(1, 0, 0, 1, 0, 0);
    my_canvas_context.clearRect(0, 0, size[0],size[1]);
    my_canvas_context.save()

    // set the initial values
    var x = 0;
    var y = 0;
    var maxh = 0;
    
    my_canvas_context.font = d.fontString;
    my_canvas_context.textAlign = "center";
    my_canvas_context.textBaseline = "bottom";
    my_canvas_context.fillStyle = "red";
    my_canvas_context.strokeStyle = "red";
    my_canvas_context.textAlign = "center";
    my_canvas_context.lineWidth = 2 * d.padding;

    var w = my_canvas_context.measureText(d.text + "m").width,
        h = d.size;

    d.x0 = Math.floor(-w/2);
    d.x1 = Math.ceil(w/2);
    d.y0 = 0;
    d.y1 = Math.ceil(h);

    // translate such that the rotation actually works
    my_canvas_context.translate(size[0]/2, size[1]/2);
    
    my_canvas_context.rotate(d.rotate * cloudRadians);
    // put it in the center (with the translation)
    my_canvas_context.fillText(d.text, 0, 0);

    // test that we contain the text here
    // my_canvas_context.strokeRect(d.x0, d.y0-d.y1, w, h);
    
    my_canvas_context.strokeText(d.text, 0, 0);
    // var pixels = my_canvas_context.getImageData(0, 0, size[0], size[1]).data;
    // my_canvas_context.setTransform(1, 0, 0, 1, 0, 0);
    var pixels = my_canvas_context.getImageData(size[0]/2+d.x0, size[1]/2+d.y0-d.y1, 2*d.x1, d.y1).data;
    // now let's convert this raw RGBA 0-255 data into a monochrome
    d.sprite = monochrome(pixels);
    my_canvas_context.restore();
}

function monochrome(pixels) {
    var a = Array(pixels.length/4);
    for (var i=0; i<a.length; i++) {
        // standard luminance scale
        // var L = (0.2126 * pixels[i*4] + 0.7152 * pixels[i*4+1] + 0.0722 * pixels[i*4+2]);
        // I set the canvas to only show red
        var L = pixels[i*4]
        // don't multiply by the alpha, just make sure the luminance
        // is more than .1 percent
        if (L > (.1*256)) { a[i] = 1; }
        else { a[i] = 0; }
        // a[i] = (L/256 > 0.1) ? 1 : 0;
    }
    return a;
}

function collideRects(a, b) {
    // a and b are both objects with x0,y0 and x1,y1 upper left and lower right points
    // not right && not left && not above && not below
    return b.x0 < a.x1 && b.x1 > a.x0 && b.y1 > a.y0 && b.y0 > a.y1;
    // note that this may need to more complicated if the object is rotated:
    // depends on the rotation
}

var cloudRadians = Math.PI / 180;

function indexer2d(a,w,i,ip,j,jp) {
    // get a[i:ip,j:jp], where a has width w
    // get the points ip and jp
    // i goes down, j goes across

    // initialize result
    var result = Array((ip-i+1)*(jp-j+1));
    
    // go down
    for (var ii=i; ii<=ip; ii++) {
        for (var jj=j; jj<=jp; jj++) {
            // var flat_index = w*ii+jj;
            // console.log(flat_index);
            // console.log(ii*(ip-i+1)+(jj-j))
            result[(ii-i)*(jp-j+1)+(jj-j)] = a[w*ii+jj]
        }
    }
    return result;
}

// my_array = Array(10000);
// for (var i=0; i<my_array.length; i++) { my_array[i] = i; }


