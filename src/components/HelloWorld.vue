<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>

<template>
  <div class="hello">
    <div id="map"></div>
  </div>
</template>

<script>
import Map from "ol/Map";
import View from "ol/View";
import {VectorTile as VectorTileLayer,Vector as VectorLayer,
Tile as TileLayer,Image as ImageLayer} from "ol/layer";

import { defaults as defaultControls } from "ol/control";
import { getWidth, getTopLeft } from "ol/extent";
import {OSM,WMTS,VectorTileSource,TileWMS,Vector as VectorSource,ImageWMS,TileImage} from "ol/source";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { transform, get as getProjection,fromLonLat } from "ol/proj";
import {createXYZ} from "ol/tileGrid.js";
import TileGrid from 'ol/tilegrid/TileGrid.js';
import {Atlas,AtlasManager,Circle as CircleStyle,Fill,Icon,IconImage,Image,RegularShape,Stroke,Style,Text} from 'ol/style.js';
import {MVT} from 'ol/format';
import {Point} from 'ol/geom.js'
import Feature from 'ol/Feature.js'
export default {
  name: "HelloWorld",
  data() {
    return {
      map: null
    };
  },
  methods: {
    initMap() {
      const resolutions = [0.703125,0.3515625,0.17578125,0.087890625,0.0439453125,0.02197265625,0.010986328125,0.0054931640625,
                          0.00274658203125,0.001373291015625,0.0006866455078125,0.0003433227539062,0.0001716613769531,0.0000858306884766,0.0000429153442383,
                          0.0000214576721191,0.0000107288360596,0.0000053644180298,0.0000026822090149,0.0000013411045074,0.0000006705522537,0.0000003352761269];
      this.map = new Map({
        target: "map",
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View({
          center: [106.53633162509037,29.584144691579215],
          zoom: 9,
          // resolutions:resolutions,
          projection: "EPSG:4326"
        })
      });
    },
    addBound() {
      const wmsSrc = new TileWMS({
        url: "http://127.0.0.1:9090/geoserver/cq/wms",
        params: { LAYERS: "cq:cq_bound", TILED: true }
      });
      const tileLayer = new TileLayer({
        source: wmsSrc
      });
      this.map.addLayer(tileLayer);
    },
    addDistrict() {
      const wmsSrc = new TileWMS({
        url: "http://127.0.0.1:9090/geoserver/cq/wms",
        params: { LAYERS: "cq:cq_district", TILED: true }
      });
      const tileLayer = new TileLayer({
        source: wmsSrc
      });
      this.map.addLayer(tileLayer);
    },
    addLayerGroup() {
      const wmsSrc = new TileWMS({
        url: "http://127.0.0.1:9090/geoserver/cq/wms",
        params: { LAYERS: "cq:cq_data", TILED: true }
      });
      const tileLayer = new TileLayer({
        source: wmsSrc
      });
      this.map.addLayer(tileLayer);
      const bounds = [
        105.262214660645,
        28.1438865661621,
        110.215599060059,
        32.2322883605957
      ];
      this.map.getView().fit(bounds, this.map.getSize());
    },
    addWMTS() {
      const projection = getProjection("EPSG:4326");
      const extent = projection.getExtent();
      const size = getWidth(extent) / 256;
      const resolutions = [0.703125,0.3515625,0.17578125,0.087890625,0.0439453125,0.02197265625,0.010986328125,0.0054931640625,
                          0.00274658203125,0.001373291015625,0.0006866455078125,0.0003433227539062,0.0001716613769531,0.0000858306884766,0.0000429153442383,
                          0.0000214576721191,0.0000107288360596,0.0000053644180298,0.0000026822090149,0.0000013411045074,0.0000006705522537,0.0000003352761269];
      const matrixIds = new Array(21);
      // const resolutions = new Array(21);
      for (let z = 0; z < 22; z++) {
        // resolutions[z] = size/Math.pow(2,z);
        matrixIds[z] = "EPSG:4326:"+z;
      }

      const tileGrid = new WMTSTileGrid({
        origin:[-180,90],
        resolutions:resolutions,
        matrixIds:matrixIds
      });

      const wmtsSrc = new WMTS({
        url:'http://localhost:9090/geoserver/gwc/service/wmts',
        layer:'cq:cq_data',
        matrixSet:'EPSG:4326',
        format:'image/png',
        projection:projection,
        tileGrid:tileGrid,
        wrapX:true
      });

      const tileLayer = new TileLayer({
        source: wmtsSrc
      });
      this.map.addLayer(tileLayer);

      const controls = defaultControls({
          attributionOptions: {
            collapsible: false
          }
        });
      // this.map.addControl(controls);
    },
    addVectorTile(){
      const vtLayer = new VectorTileLayer({
        declutter:true,
        source:new VectorTileSource({
          format:new MVT(),
          tileGrid:createXYZ({
            extent:[105.262214660645,28.1438865661621,110.215599060059,32.2322883605957],
            minZoom:3,
            maxZoom:21
          }),
          url:'https//localhost:9090/geoserver/gwc/service/tms/1.0.0/' +
            'cq:cq_data@EPSG%3A4326@pbf/{z}/{x}/{-y}.pbf'
        }),
        style:new Style({
          stroke:new Stroke({
            color:"rgb(123,212,132)",
            width:3
          }),
          fill:new Fill({
            color:"rgb(211,145,189)"
          })
        })
      });

      this.map.addLayer(vtLayer);
    },
    addVector(){
      let feature = new Feature(new Point(fromLonLat([106.53633162509037,29.584144691579215])));
      feature.setStyle({

      });
      let vectorLayer = new Vector({
        source:new VectorSource({
          features:[feature]
        })
      });
      this.map.addLayer(vectorLayer);
    },
    addBDMap(){
      let resolutions = [];
      for(let i=0;i<19;i++){
        resolutions[i] = Math.pow(2,18-i);
      }
      let tileGrid = new TileGrid({
        origin:[0,0],
        resolutions:resolutions
      });
      let bd_source = new TileImage({
        projection:'EPSG:3857',
        tileGrid:tileGrid,
        tileUrlFunction:function(tileCoord, pixelRatio, proj){
          if(!tileCoord){
                return "";
            }
            var z = tileCoord[0];
            var x = tileCoord[1];
            var y = tileCoord[2];

            if(x<0){
                x = "M"+(-x);
            }
            if(y<0){
                y = "M"+(-y);
            }

            return "http://online3.map.bdimg.com/onlinelabel/?qt=tile&x="+x+"&y="+y+"&z="+z+"&styles=pl&udt=20151021&scaler=1&p=1";
        }
      });
      let bd_layer = new TileLayer({
        source:bd_source
      });
      this.map = new Map({
        target:"map",
        layers:[bd_layer],
        view:new View({
          center: [12959773,4853101],
          zoom: 9,
          // projection: "EPSG:4326"
        })
      });

      let vSource = new VectorSource();

      let feature = new Feature({
        geometry:new Point(fromLonLat([116.4323186600956,39.91904444259851])),
        name:"point1"
      })

      let style = new Style({
        image: new CircleStyle({
                  radius:10,
                  fill: null,
                  stroke: new Stroke({color: 'red', width: 2})
              })
      })
      
      feature.setStyle(style)

      vSource.addFeature(feature);
      let vLayer = new VectorLayer({
        source:vSource
        // style:new CircleStyle({
        //   radius:30,
        //   fill: null,
        //   stroke: new Stroke({color: 'red', width: 2})
        // })
      });
      this.map.addLayer(vLayer);
    }
  },
  mounted() {
    this.addBDMap();
    // this.initMap();
    // this.addDistrict();
    // this.addBound();
    // this.addLayerGroup();
    // this.addWMTS();
    // this.addVectorTile();
    // console.log("resulution",this.map.getView().getResolution());
  }
};
</script>
