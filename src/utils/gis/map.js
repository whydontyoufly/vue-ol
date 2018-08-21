import Map from "ol/Map";
import View from "ol/View";
import {TileLayer,VectorTileLayer} from "ol/layer";
import { defaults as defaultControls } from "ol/control";
import { getWidth, getTopLeft } from "ol/extent";
import {OSM,WMTS,VectorTileSource,TileWMS} from "ol/source";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { transform, get as getProjection } from "ol/proj";
import {createXYZ} from "ol/tileGrid.js";
import {Fill, Stroke, Style} from 'ol/style.js';
import {MVT} from 'ol/format';

export default class Maps{
    constructor(domId,mapConfig){
        this.init(domId,mapConfig);
    }
    init(){
        this.map = new Map({
            target:domId ? domId : 'map'
        })
    }
}