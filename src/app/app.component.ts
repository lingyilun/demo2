import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as topojson from 'topojson-client';
import { geoIdentity, geoPath } from 'd3-geo';

import taiwanTopoJson from './taiwan-country.topo.json';
import { HttpClientService } from './@services/http-client.service';

export interface CountyFeature {
  name: string;
  pathD: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  httpClient = inject(HttpClientService);
  locationArray: any[] = [];
  chooseLocationName: string = '';
  chooseLocationData: any = null;
  chooseWeatherName: string = '';
  chooseWeatherData: any = null;

  countyMapList: CountyFeature[] = [];

  // 請填入你的中央氣象署 API KEY
  private readonly CWA_API_KEY = 'CWA-0DF49296-2C40-408C-AE52-17D1EE4F572s8';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.convertTopoJsonToSvg();
    this.fetchCwaWeatherData();
  }

  // 地圖轉換邏輯
  private convertTopoJsonToSvg(): void {
    const geojsonData = topojson.feature(
      taiwanTopoJson as any,
      taiwanTopoJson.objects.map as any
    ) as any;

    const projection = geoIdentity()
      .reflectY(true)
      .fitExtent([[30, 30], [770, 970]], geojsonData);

    const pathGenerator = geoPath().projection(projection);

    this.countyMapList = geojsonData.features.map((feature: any) => ({
      name: feature.properties.name,
      pathD: pathGenerator(feature) || ''
    }));
  }

  // 抓取氣象局 API 資料
  fetchCwaWeatherData(): void {
    const url = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${this.CWA_API_KEY}`;

    this.httpClient.getApi(url).subscribe({
      next: (res) => {
        console.log(res);

        const rawLocations = res?.records?.location || [];
        this.locationArray = rawLocations.map((loc: any) => this.formatLocationData(loc));

        // 預設選擇第一個地區
        if (this.locationArray.length > 0) {
          this.chooseLocation(this.locationArray[0].LocationName);
        }
      },
      error: (err) => {
        console.error('API 讀取失敗，使用模擬資料:', err);
      }
    });
  }

  private formatLocationData(rawLoc: any) {
    const nameMap: { [key: string]: { name: string; unit: string } } = {
      'Wx': { name: '天氣現象', unit: '' },
      'PoP': { name: '降雨機率', unit: '%' },
      'MinT': { name: '最低溫度', unit: '°C' },
      'CI': { name: '舒適度分析', unit: '' },
      'MaxT': { name: '最高溫度', unit: '°C' }
    };

    return {
      LocationName: rawLoc.locationName,
      WeatherElement: rawLoc.weatherElement.map((elem: any) => {
        const config = nameMap[elem.elementName] || { name: elem.elementName, unit: '' };
        return {
          ElementName: config.name,
          Time: elem.time.map((t: any) => ({
            StartTime: t.startTime?.substring(5, 16),
            EndTime: t.endTime?.substring(5, 16),
            Value: t.parameter?.parameterName,
            Unit: config.unit,
            Parameter: t.parameter?.parameterValue ? `CODE: ${t.parameter.parameterValue}` : null
          }))
        };
      })
    };
  }

  chooseLocation(locationName: string): void {
    this.chooseLocationName = locationName;
    const found = this.locationArray.find(item => item.LocationName === locationName);

    if (found) {
      this.chooseLocationData = found;
      if (found.WeatherElement && found.WeatherElement.length > 0) {
        this.chooseWeather(found.WeatherElement[0]);
      }
    }
  }

  chooseWeather(weather: any): void {
    this.chooseWeatherName = weather.ElementName;
    this.chooseWeatherData = weather;
  }
}
