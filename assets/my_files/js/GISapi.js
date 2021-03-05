// Map
require(['esri/Map'],function(Map){
    my_map = new Map({
        basemap:'streets-navigation-vector'
    });
});

  

// Side bar
require(['esri/views/MapView','esri/widgets/LayerList','esri/widgets/BasemapGallery','esri/widgets/Print'],function(MapView,LayerList,BasemapGallery,Print){
    view = new MapView({
        container:'mapview',
        map:my_map,
        center:[-118.80500, 34.02700],//long,lat
        zoom:10,
        ui:{
            components: [ "attribution" ]
        },
    });
    legend = new LayerList({
        view:view,
        listItemCreatedFunction: function (event) {
            const item = event.item;
            if (item.layer.type != "group") {
              // don't show legend twice
              item.panel = {
                content: "legend",
                open: true
              };
            };
            
        },
        container:'listlayer'
    });
    gallery = new BasemapGallery({
        view:view,
        container:'BasemapGallery'
    });
    var print = new Print({
        view:view,
        container:'Export_div'
    })
});
// 

// Layer side
layers_groub = {}
require(['esri/layers/FeatureLayer'],function(FeatureLayer){
    trailhead_lyr = new FeatureLayer({
        url:'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0',
    });
    layers_groub[trailhead_lyr['title']] = trailhead_lyr['id']
    my_map.add(trailhead_lyr);
    document.getElementById('layer_in').innerHTML += '<option>' + trailhead_lyr['title'] +'</option>'
    trail_lyr = new FeatureLayer({
        url:'https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0'
    });
    layers_groub[trail_lyr['title']] = trail_lyr['id']
    my_map.add(trail_lyr);
    document.getElementById('layer_in').innerHTML += '<option>' + trail_lyr['title'] +'</option>'
});

function addlayer(){
    var furl = document.getElementById('url').value;
    require(['esri/layers/FeatureLayer'],function(FeatureLayer){
        lyr = new FeatureLayer({
            url:furl,
        });
    });
    layers_groub[lyr['title']] = lyr['id']
    my_map.add(lyr);
    document.getElementById('layer_in').innerHTML += '<option>' + lyr['title'] +'</option>'
    lyr.load().then(function() { view.goTo(lyr['fullExtent']['extent'])
    })
}

function removerlayer(){
    var inx = document.getElementById("layer_in").selectedIndex;
    var ops = document.getElementById("layer_in").options;
    my_map.remove(my_map.findLayerById(layers_groub[ops[inx].text]));
    delete layers_groub[ops[inx].text]
    document.getElementById('layer_in').innerHTML='<option value="" disabled selected>Select Layer</option>'
    for(x in layers_groub){
        document.getElementById('layer_in').innerHTML+='<option>' + x +'</option>'
    }
}
// 
