// namespace it
var hedotools = hedotools || {};

// hedonometer.org/maps.html needs this in hedotools.map.js
var classColor = d3.scaleQuantize()
    .range([0,1,2,3,4,5,6])
    .domain([50,1]);

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
	var x = d3.scaleLinear()
	    .domain([-absDataMax,absDataMax])
	    .range([5,width-10]);

	// linear scale function
	var y =  d3.scaleLinear()
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
    	    .style('stroke-width','1').style('stroke','rgb(10,10,10)');
    	//.attr("fill", "#FCFCFC");

	// axes creation functions
	var create_xAxis = function() {
	    return d3.axisBottom(x)
		.ticks(4); }

	// // axis creation function
	// var create_yAxis = function() {
	// 	return d3.svg.axis()
	// 	    .scale(y) //linear scale function
	// 	    .orient("left"); }

	// // draw the axes
	// var yAxis = create_yAxis()
	// 	.tickSizeInner(6)
	// 	.tickSizeOuter(0);

	// axes.append("g")
	// 	.attr("class", "y axis ")
	// 	.attr("font-size", "14.0px")
	// 	.attr("transform", "translate(0,0)")
	// 	.call(yAxis);

	var xAxis;
	if (manualTicks.length > 0) {
	    xAxis = create_xAxis()
		.tickSizeInner(6)
		.tickSizeOuter(0)
		.tickValues(manualTicks);
	}
	else {
	    xAxis = create_xAxis()
		.tickSizeInner(6)
		.tickSizeOuter(0);
	}

	axes.append("g")
	    .attr("class", "x axis ")
	    .attr("font-size", "14.0px")
	    .attr("transform", "translate(0," + (height) + ")")
	    .call(xAxis);

	d3.selectAll(".tick line").style('stroke','black');

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
	    .style('opacity','1.0').style('stroke-width','1.0').style('stroke','rgb(100,100,100)')
	    .attr("height",function(d,i) { return 11; } )
	    .attr("width",function(d,i) { if (d[3]>0) {return d3.max([x(d[3])-figcenter,0]);} else {return d3.max([figcenter-x(d[3]),0]); } } )
	    .on('mouseover', function(event,d){
		var rectSelection = d3.select(this).style('opacity','1.0').style('stroke','black').style('stroke-width','1.0');
		hedotools.barchartoncall.test(d,d[0]);
	    })
	    .on('mouseout', function(event,d){
		var rectSelection = d3.select(this).style('opacity','1.0').style('stroke','rgb(100,100,100)').style('stroke-width','1.0');
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
	    .on('mouseover', function(event,d){
		hedotools.barchartoncall.test(d,d[0]);
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
};









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
	    var x = d3.scaleLinear()
	        .domain([1.00,9.00])
		// .domain(d3.extent(lens))
		.range([0,width]);
	    
	    // use d3.layout http://bl.ocks.org/mbostock/3048450
	    var data = d3.bin()
		.domain(x.domain())
		.thresholds(x.ticks(65))
                (lens);

	    // linear scale function
	    var y =  d3.scaleLinear()
		.domain([0,d3.max(data,function(d) { return d.length; } )])
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
		.style('stroke-width','2').style('stroke','rgb(0,0,0)')
		.attr("fill", "#FFFFF0");

	    // axes creation functions
	    var create_xAxis = function() {
		return d3.axisBottom(x)
		    .ticks(9); }

	    // axis creation function
	    var create_yAxis = function() {
		return d3.axisLeft(y)
		    .ticks(3); }

	    // draw the axes
	    var yAxis = create_yAxis()
		.tickSizeInner(6)
		.tickSizeOuter(0);

	    axes.append("g")
		.attr("class", "top")
		.attr("transform", "translate(0,0)")
		.attr("font-size", "12.0px")
		.call(yAxis);

	    var xAxis = create_xAxis()
		.tickSizeInner(6)
		.tickSizeOuter(0);

	    axes.append("g")
		.attr("class", "x axis ")
		.attr("font-size", "12.0px")
		.attr("transform", "translate(0," + (height) + ")")
		.call(xAxis);

	    d3.selectAll(".tick line").style('stroke','black');

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
		.attr("fill",function(d,i) { if (d.x0 > lensMean) {return "#D3D3D3";} else { return "#D3D3D3";}})
		.attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

	    var mainrect = bar.append("rect")
		.attr("x", 1)
		.attr("width", x(data[0].x1 - data[0].x0 + 1)-2 )
		.attr("height", function(d) { return height - y(d.length); });

	    var line = d3.line()
		.x(function(d,i) { return x(d.x0); })
		.y(function(d) { return y(d.length); })
		.curve(d3.curveLinear);

	    var mainline = axes.append("path")
		.datum(data)
		.attr("class", "line")
		.attr("d", line)
		.attr("stroke","black")
		.attr("stroke-width",3)
		.attr("fill","none");

	    //console.log(x(d3.min(lens)));

	    var brushX = d3.scaleLinear()
		.domain([1,9])
		// .domain(d3.extent(lens))
		.range([figwidth*.125,width+figwidth*.125]);
	    


	    function brushended(event) {
		if (!event.sourceEvent) return;
		if (!event.selection) return;
		// selection is in pixels; invert through brushX to data space
		var extent0 = event.selection.map(brushX.invert),
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
		    .call(brush.move, lensExtent.map(brushX));

		encoder.varval(lensExtent);
	    }

	    var brush = d3.brushX()
		.extent([[brushX.range()[0], 0], [brushX.range()[1], height]])
		.on("end",brushended);

	    var gBrush = canvas.append("g")
		.attr("class","lensbrush")
		.call(brush);
	    gBrush.call(brush.move, lensExtent.map(brushX));

	    gBrush.selectAll("rect")
		.attr("height",height)
		.attr("y",0)
		.style('stroke-width','2').style('stroke','rgb(100,100,100)').style('opacity',0.95)
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

		canvas.selectAll(".distrect").attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });
		
		// xlabel.attr("x",(leftOffsetStatic+width/2));

		d3.selectAll(".tick line").style('stroke','black');

		// //brushX.range([figwidth*.125,width+figwidth*.125]);
		brushX.range([leftOffsetStatic,leftOffsetStatic+width]);
		brush.extent([[brushX.range()[0], 0], [brushX.range()[1], height]]);
		d3.select(".lensbrush") //.transition()
		    .call(brush.move, lensExtent.map(brushX));
		//brushing();
		//brush.event();
	    };

	    d3.select(window).on("resize.selectlens",resizelens);

	    // var buttongroup = figure.append("div").attr({"class":"btn-group-vertical",});
	    //buttongroup.html('<button type="button" class="btn btn-default">Button</button><button type="button" class="btn btn-default">Button</button><div class="btn-group"><button id="btnGroupVerticalDrop1" type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Dropdown<span class="caret"></span>        </button>     <ul class="dropdown-menu" role="menu" aria-labelledby="btnGroupVerticalDrop1">          <li><a href="#">Dropdown link</a></li>          <li><a href="#">Dropdown link</a></li>        </ul></div>      <button type="button" class="btn btn-default">Button</button>'

	    figure.selectAll("div.btn-group-vertical").remove();
	    var buttongroup = figure.append("div").attr("class","btn-group-vertical pull-right")
	    // var defaults = [[4,6],[3,7],[3,9],[1,7],[5,5]];
	    var defaults = [[4,6],[3,7],[5,5]];
	    // var defaultnames = ["Default","Wide","Sad","Happy","None"];
	    var defaultnames = ["Default","Wide","None"];
	    buttongroup.selectAll("button").data(defaults).enter()
		.append("button")
		.attr("type","button")
		.attr("class", function(d,i) { return "btn btn-default btn-xs "+defaultnames[i]; })
		.html(function(d,i) { return defaultnames[i]; })
		.on("click",function(event,d) {
		    figure.selectAll("button").attr("class","btn btn-default btn-xs"); 
		    d3.select(this).attr("class","btn btn-primary btn-xs"); 
		    d3.select(".lensbrush") //.transition()
			.call(brush.move, d.map(brushX));
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
};
hedotools.map = function() {

    var figure;

    var setfigure = function(_) {
	console.log("setting figure");
	figure = _;
	return hedotools.map;
    }

    var classColor = d3.scaleQuantize()
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

	var legendscale = d3.scaleLinear()
            .domain([340,730])
            .range([0,1]);

	function makeSelector() {

	    canvas.append("text")
		.attr("x", (w-70-fullselboxwidth-56))
		.attr("y", 54)
		.attr("fill", "grey")
		.text("Selecting ");

	    var selgroup = canvas.append("g")
		.attr("class", "selgroup")
		.attr("transform", "translate("+(w-70-fullselboxwidth)+","+40+")");

	    selgroup.append("rect")
		.attr("class", "selbox")
		.attr("x", 0)
		.attr("y", 0)
		.attr("rx", 3)
		.attr("ry", 3)
		.attr("width", fullselboxwidth)
		.attr("height", 19)
		.attr("fill", "#F8F8F8")
		.attr('stroke-width', '0.5')
		.attr('stroke', 'rgb(0,0,0)');
	    
	    selgroup.selectAll("rect.colorclick")
    		.data(selarray)
    		.enter()
    		.append("rect")
    		.attr("class", function(d,i) { return "colorclick "+intStr[i]; })
    		.attr("x", function(d,i) { if (i === 0) { return 0; }
					    else { return d3.sum(selstringslen.slice(0,i))+i*boxpadding+(i-1)*boxpadding+initialpadding; } })
    		.attr("y", 0)
		.attr("rx", 3)
		.attr("ry", 3)
    		.attr("width", function(d,i) { if (i === 0) { return selstringslen[i]+initialpadding+boxpadding; } else { return selstringslen[i]+boxpadding*2; }})
    		.attr("height", 19)
    		.attr("fill", "#F8F8F8") //http://www.w3schools.com/html/html_colors.asp
		.attr('stroke-width', '0.5')
		.attr('stroke', 'rgb(0,0,0)');

	    selgroup.selectAll("text")
    		.data(selstrings)
    		.enter()
    		.append("text")
    		.attr("x", function(d,i) {
		    // start at 2
		    if (i==0) { return initialpadding; }
		    // then use 2+width+10+width+10+width...
		    // for default padding of 5 on L/R
		    else { return d3.sum(selstringslen.slice(0,i))+initialpadding+i*boxpadding*2; } })
    			.attr("y", 14)
    			.attr("class", function(d,i) { return "seltext "+intStr[i]; })
    		.text(function(d,i) { return d; });

	    selgroup.selectAll("rect.selclick")
    		.data(selarray)
    		.enter()
    		.append("rect")
    		.attr("class", "selrect")
    		.attr("x", function(d,i) { if (i === 0) { return 0; }
					    else { return d3.sum(selstringslen.slice(0,i))+i*boxpadding+(i-1)*boxpadding+initialpadding; } })
    		.attr("y", 0)
    		.attr("width", function(d,i) { if (i === 0) { return selstringslen[i]+initialpadding+boxpadding; } else { return selstringslen[i]+boxpadding*2; }})
    		.attr("height", 19)
    		.attr("fill", "white") //http://www.w3schools.com/html/html_colors.asp
    		.attr("opacity", "0.0")
    		.on("mousedown", function(event,d) {
		    var i = selarray.indexOf(d);
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
		.attr("class", "legendgroup")
		.attr("transform", "translate("+(w-50-fulllegendboxwidth)+","+(h-legendheight-legendheight-2)+")");

	    legendgroup.selectAll("rect.legendrect")
    		.data(legendarray)
    		.enter()
    		.append("rect")
    		.attr("class", function(d,i) { return "q"+i+"-8"; })
    		.attr("x", function(d,i) { if (i === 0) { return 0; }
					    else { return d3.sum(legendstringslen.slice(0,i))+i*boxpadding+(i-1)*boxpadding+initialpadding; } })
    		.attr("y", 0)
		       // "rx": 3,
		       // "ry": 3,
    		.attr("width", function(d,i) { return legendstringslen[i]; })
    		.attr("height", legendheight)
		.attr('stroke-width', '1')
		.attr('stroke', 'rgb(0,0,0)');

	    legendgroup.selectAll("text.legendtext")
		.data(["less happy","happier"])
		.enter()
		.append("text")
		.attr("x", function(d,i) {
		    if (i==0) { return 0; }
		    else { return fulllegendboxwidth-d.width(textsize+"px arial"); } })
    		.attr("y", legendheight+legendheight)
    		.attr("class", function(d,i) { return "legendtext"; })
		.attr("font-size", textsize+"px")
    		.text(function(d,i) { return d; });
	}

	var scaleFactor = legendscale(w);

	makeLegend((20+10*scaleFactor),(8+5*scaleFactor),(9+3*scaleFactor));

	//Define map projection
	var projection = d3.geoAlbersUsa()
	    .translate([w/2, h/2])
	    .scale(w*1.3);
	//.scale(1000);

	//Define path generator
	var path = d3.geoPath()
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
	color = d3.scaleQuantize()
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

	function state_clicked(event,d) { var i = stateFeatures.indexOf(d);
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

	function state_hover(event,d) { var i = stateFeatures.indexOf(d);
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
	    
	    var hovergroup = canvas.append("g")
		.attr("class", "hoverinfogroup")
		.attr("transform", "translate("+(x+hoverboxxoffset)+","+(y-hoverboxheight/2-hoverboxyoffset)+")");

	    var hoverbox = hovergroup.append("rect")
		.attr("class", "hoverinfobox")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", hoverboxwidth)
		.attr("height", hoverboxheight)
		.attr("fill", "white")
		.attr("stroke", "black");

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		.attr("y", 15)
		.attr("font-size", 15)
		.text(allData[i].name);

	    hovergroup.append("line")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		.attr("y", 15)
		.attr("font-size", 15)
		.text(allData[i].name);

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		//"y": 55,
		.attr("y", 38)
		.attr("font-size", 17)
		.text("Rank:"); // +"/51");

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 59)
		.attr("y", 55)
		.attr("font-size", 40)
		.text(sortedStateList[i]); // +"/51");

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 105)
		.attr("y", 56)
		.attr("font-size", 20)
		.text("out of 51");

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		//"y": 73,
		.attr("y", 79)
		.attr("font-size", 15)
		.text(happsstring);

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		//"y": 89,
		.attr("y", 97)
		.attr("font-size", 13)
		.text(wordsstring);

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		//"y": 106,
		.attr("y", 114)
		.attr("font-size", 13)
		.text(wordsstring2);

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		//"y": 106,
		.attr("y", 131)
		.attr("font-size", 13)
		.text("US Average Happiness: "+allData[51].avhapps.toFixed(2));

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		//"y": 89,
		.attr("y", 97+51)
		.attr("font-size", 13)
		.text(USwordsstring);

	    hovergroup.append("text")
		.attr("class", "hoverinfotext")
		.attr("x", 10)
		//"y": 106,
		.attr("y", 114+51)
		.attr("font-size", 13)
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

	function state_unhover(event,d) {

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

};






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

	var hovergroup = figure.append("div").attr("class", "hoverinfogroup")
	    .style("position", "absolute")
	    .style("top", "100px")
	    .style("left", "100px")
	    .style("visibility", "hidden");

	function hidehover() {
	    console.log("hiding hover");
	    d3.selectAll("path").transition().duration(500).style("opacity","1.0");
	    if (useTip) {
		hovergroup.style("visibility", "hidden");
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
	x = d3.scaleLinear()
	    .domain([0,1])
	    .range([5,width-10]);

	// linear scale function
	y =  d3.scaleLinear()
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
	// horizontal sankey-style link path: this is the v3 d3.sankey().link()
	// generator inlined. Nodes are positioned manually above, so we only need
	// the path shape (a horizontal cubic Bezier), not the sankey layout.
	path = function(d) {
	    var x0 = d.source.x + d.source.dx,
		x1 = d.target.x,
		xi = d3.interpolateNumber(x0, x1),
		x2 = xi(0.5),
		x3 = xi(0.5),
		y0 = d.source.y + d.sy + d.dy / 2,
		y1 = d.target.y + d.ty + d.dy / 2;
	    return "M" + x0 + "," + y0
		+ "C" + x2 + "," + y0
		+ " " + x3 + "," + y1
		+ " " + x1 + "," + y1;
	};

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

	pathwidth = d3.scaleLinear()
	    .domain(d3.extent(data.map(function(d) { return Math.abs(d.change); })))
	    .range([2,13]);

	pathselection = axes.selectAll("path.sankey").data(sankeydata)
	    .enter()
	    .append("path")
            .attr("d", path)
		    .attr("fill", "none")
		    .attr("class", function(d,i) { return "r"+classColor(data[i].oldindex)+"-8"; })
		    .attr("stroke-width", function(d,i) { return pathwidth(Math.abs(data[i].change)); })
	    .on("mouseover", function(event,d) { var i = sankeydata.indexOf(d);
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

		    var x = d3.pointer(event, thispath)[0];
		    var y = d3.pointer(event, thispath)[1];

                    var hoverboxheightguess = 190;
		    if (refcity.length > 0) {
			hoverboxheightguess = 270;
		    }
		    if ((y+hoverboxheightguess)>height) { y-=(y+hoverboxheightguess-height); }
		    
		    // tip.show;
		    // console.log(d);

		    hovergroup.style("position", "absolute")
			.style("top", y+"px")
			.style("left", x+"px")
			.style("visibility", "visible");

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
			d3.text(reffile).then(function(text) {
			    refF = text.split(",");
			    console.log(refF);
			    if (!--csvLoadsRemaining) drawShift();
			});
			d3.text(compfile).then(function(text) {
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
	    .on("mouseout", function(event,d) {
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
		    .style('opacity', '1.0')
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
            .attr("d", path)
		    // don't update this
		    // because the transition is applied by the css at the end
		    // and it messes up the whole effect
		    .attr("stroke-width", function(d,i) { return pathwidth(Math.abs(data[i].change)); });

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
};







// hedotools.shifter — the wordshift graph.
//
// As of v4.5 this is no longer implemented here; it lives in its own package,
// @andyreagan/d3-shifterator (extracted from this repo's old shifter.v4.js).
// We instantiate that package's factory once and expose it as the shared
// `hedotools.shifter` singleton that the dashboard modules (barchart, lens,
// map, sankey) drive via .shift(refF, compF, lens, words) and
// .setfigure(...).setText(...).plot().
//
// Load order on the page (and in bundle.sh): D3 v4, then the d3-shifterator
// UMD bundle (which defines the global `shifterator`), then this file.
//
// One compatibility shim: the dashboard modules call
//     setfigure(d3.select('#shift01'))
// passing a d3 SELECTION (the old hedotools.shifter API). d3-shifterator's
// setfigure expects a selector string or node (it runs d3.select() on its
// argument). Normalize a selection down to its node so both styles work.
hedotools.shifter = (function () {
    var instance = shifterator.shifterator();
    var setfigure = instance.setfigure;
    instance.setfigure = function (_) {
        var arg = (_ && typeof _.node === "function") ? _.node() : _;
        setfigure.call(instance, arg);
        return instance;
    };
    return instance;
})();
