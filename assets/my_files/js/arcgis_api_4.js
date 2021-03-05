require(['esri/Map'],function(Map){
    my_map = new Map({
        basemap:'streets-navigation-vector'
    });
})

layers_groub = {}

require(['esri/layers/FeatureLayer'],function(FeatureLayer){
    trailhead_lyr = new FeatureLayer({
        url:'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0',
    });
    my_map.add(trailhead_lyr)
    layers_groub[trailhead_lyr['title']] = trailhead_lyr['id']
    document.getElementById('remove_option').innerHTML +='<option>' + trailhead_lyr['title'] +'</option>'
    document.getElementById('choose_table').innerHTML +='<option>' + trailhead_lyr['title'] +'</option>'
    document.getElementById('select_to').innerHTML +='<option>' + trailhead_lyr['title'] +'</option>'
    trail_lyr = new FeatureLayer({
        url:'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0'
    });
    my_map.add(trail_lyr);
    layers_groub[trail_lyr['title']] = trail_lyr['id']
    document.getElementById('remove_option').innerHTML += '<option>' + trail_lyr['title'] +'</option>'
    document.getElementById('choose_table').innerHTML += '<option>' + trail_lyr['title'] +'</option>'
    document.getElementById('select_to').innerHTML += '<option>' + trail_lyr['title'] +'</option>'
})


require(['esri/views/MapView','esri/widgets/LayerList','esri/widgets/BasemapGallery','esri/widgets/Print','esri/widgets/Locate','esri/widgets/Measurement','esri/widgets/Bookmarks','esri/widgets/Search'],function(MapView,LayerList,BasemapGallery,Print,Locate,Measurement,Bookmarks,Search){
    view = new MapView({
        container:'mapview',
        map:my_map,
        center:[-118.80500, 34.02700],//long,lat
        zoom:10,
        ui:{
            components: [ "attribution" ]
        },
        popup: {
            dockOptions: {
              buttonEnabled: false
            }
          }
    });
    locate = new Locate({
        view:view,
    });
    view.ui.add(locate,'bottom-left')
    gallery = new BasemapGallery({
        view:view,
        container:'BasemapGallery'
    });
    var print = new Print({
        view:view,
        container:'Export_div'
    });
    // Measurement
    let activeView = view;
    measurement = new Measurement();

    const distanceButton = document.getElementById('distance');
    const areaButton = document.getElementById('area');
    const clearButton = document.getElementById('clear');

    distanceButton.addEventListener("click", function(){
        distanceMeasurement();
    });
    areaButton.addEventListener("click", function(){
        areaMeasurement();
    });
    clearButton.addEventListener("click", function(){
        clearMeasurements();
    });

    function distanceMeasurement() {
            const type = activeView.type;
            measurement.activeTool = type.toUpperCase() === "2D" ? "distance" : "direct-line";
            distanceButton.classList.add("active");
            areaButton.classList.remove("active");
    }

    function areaMeasurement() {
        measurement.activeTool = "area";
        distanceButton.classList.remove("active");
        areaButton.classList.add("active");
    }

    function clearMeasurements() {
        distanceButton.classList.remove("active");
        areaButton.classList.remove("active");
        measurement.clear();
    }

    loadView();

    function loadView() {
        activeView.set({
        container: "mapview"
        });
        activeView.ui.add(measurement, "bottom-right");
        measurement.view = activeView;
    }

    // end Measurement
    layers = new LayerList({
        view:view,
        container:'listlayer',
        listItemCreatedFunction: function(event) {
            const item = event.item;
            if (item.layer.type != "group") {
              // don't show legend twice
              item.panel = {
                content: "legend",
                open: true
              };
            }
          }
    });
    bookmarks = new Bookmarks({
        view: view,
        // allows bookmarks to be added, edited, or deleted
        editingEnabled: true,
        container:'bookmark'
    });
    searchWidget = new Search({
        view: view,
        container:'search',
        // sources:[
        //     {trail_lyr,name:trail_lyr.title,placeholder: "Find address or place in "+trail_lyr.title},
        //     {trailhead_lyr,name:trailhead_lyr.title,placeholder: "Find address or place in "+trailhead_lyr.title}
        // ]
        });
    // view.ui.add(searchWidget,'bottom-right') 
})

function get(lyr){
    var fileds = []
    for(i=0;i<lyr.fields.length;i++){
        fileds.push(lyr.fields[i].name)
    }
    return fileds
}
function addlayer(){
    var furl = document.getElementById('url').value;
    require(['esri/layers/FeatureLayer'],function(FeatureLayer){
        lyr = new FeatureLayer({
            url:furl,
        });
    });
    layers_groub[lyr['title']] = lyr['id']
    my_map.add(lyr);
    // searchWidget.sources.push({lyr,name:lyr.title,placeholder: "Find address or place in "+lyr.title})
    document.getElementById('remove_option').innerHTML += '<option>' + lyr['title'] +'</option>'
    document.getElementById('choose_table').innerHTML += '<option>' + lyr['title'] +'</option>'
    document.getElementById('lyrs_to_select').innerHTML+='<option>' + lyr['title'] +'</option>'
    document.getElementById('select_to').innerHTML+='<option>' + lyr['title'] +'</option>'
    lyr.load().then(function() { view.goTo(lyr['fullExtent']['extent'])
    })
}

function removerlayer(){
    var inx = document.getElementById("remove_option").selectedIndex;
    var ops = document.getElementById("remove_option").options;
    my_map.remove(my_map.findLayerById(layers_groub[ops[inx].text]));
    delete layers_groub[ops[inx].text]
    document.getElementById('remove_option').innerHTML='<option value="" disabled selected>Select Layer</option>'
    document.getElementById('lyrs_to_select').innerHTML='<option value="" disabled selected>Select Fields</option>'
    document.getElementById('select_to').innerHTML='<option value="" disabled selected>Select Fields</option>'
    // searchWidget.sources=[]
    for(x in layers_groub){
        document.getElementById('remove_option').innerHTML+='<option>' + x +'</option>'
        document.getElementById('lyrs_to_select').innerHTML+='<option>' + x +'</option>'
        document.getElementById('select_to').innerHTML+='<option>' + x +'</option>'
        // lyr = my_map.findLayerById(layers_groub[x])
        // searchWidget.sources.push({lyr,name:lyr.title,placeholder: "Find address or place in "+lyr.title})
    }
}

function get_fields(){
    var inx = document.getElementById("lyrs_to_select").selectedIndex;
    var ops = document.getElementById("lyrs_to_select").options;
    lyr = my_map.findLayerById(layers_groub[ops[inx].text])
    document.getElementById('fields').innerHTML='<option value="" disabled selected>Select Fields</option>'
    for(x=0;x<lyr.fields.length;x++){
        document.getElementById('fields').innerHTML+='<option>' + lyr.fields[x].name +'</option>'
    }
}

function get_unique_values(){
    var inx = document.getElementById("fields").selectedIndex;
    var ops = document.getElementById("fields").options;
    require(["esri/smartMapping/statistics/uniqueValues"], function(uniqueValues){
        uniqueValues({
            layer:lyr,
            field:ops[inx].text
        }).then(function(response){
            document.getElementById('unique_values').innerHTML = '<option value=""disabled selected>unique values</option>'
            var infos = response.uniqueValueInfos;
            infos.forEach(function(info){
                document.getElementById('unique_values').innerHTML+='<option>' + info.value +'</option>'
            })
        })
    })    
}

function get_where_statment(){
    var inx_filed = document.getElementById("fields").selectedIndex;
    var ops_filed = document.getElementById("fields").options;
    var inx_operation = document.getElementById("operation").selectedIndex;
    var ops_operation = document.getElementById("operation").options;
    var inx_value = document.getElementById("unique_values").selectedIndex;
    var ops_value = document.getElementById("unique_values").options;
    where_statment = String(ops_filed[inx_filed].text)+String(ops_operation[inx_operation].text)+"'"+String(ops_value[inx_value].text)+"'"
    lyr.definitionExpression=where_statment
}
function removerselection(){
    for(x in layers_groub){
        my_map.findLayerById(layers_groub[x]).definitionExpression=null
    }
}

// Directions
// function colse_directions(){
//     x = document.getElementById("toast_direction")
//     if (x.style.display === "block"){
//         x.style.display = "none";
//     }
// }

// Feature Table
function choose_table(){
    var inx_table = document.getElementById("choose_table").selectedIndex;
    var ops_table = document.getElementById("choose_table").options;
    document.getElementById('table').innerHTML=null
    require(['esri/widgets/FeatureTable'],function(FeatureTable){
        var f_tabel = new FeatureTable({
            view: view,
            layer: my_map.findLayerById(layers_groub[ops_table[inx_table].text]),
            container:'table',
            editingEnabled: true,
        })
    })
}
// 

function zoom_to_layer(){
    var inx = document.getElementById("select_to").selectedIndex;
    var ops = document.getElementById("select_to").options;
    lyr = my_map.findLayerById(layers_groub[ops[inx].text])
    view.goTo(lyr['fullExtent'])
}
