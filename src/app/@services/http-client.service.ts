import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {
  // 將HttpClient這個套件注入到httpClient這個全域變數裡面
  httpClient = inject(HttpClient);

  // constructor(private httpClient: HttpClient) { }

  // 呼叫後端分四種方法 GET(讀取) POST(新增) PUT(更新) DELETE(刪除)
  // GET DELETE都不能帶東西給API (例外情況是寫在URL裡面傳遞)
  // POST PUT必須要傳遞資料給後端做處理
  // 後端API開哪種類型 你就只能用那種類型去呼叫API
  // Observable代表的是一個可以被訂閱的方法
  // 後面的<>中寫的是API回傳回來的資料類型
  getApi(url: string): Observable<any> {
    return this.httpClient.get(url);
  }

  postApi(url: string, data: any): Observable<any> {
    return this.httpClient.post(url, data);
  }

  putApi(url: string, data: any): Observable<any> {
    return this.httpClient.put(url, data);
  }

  delApi(url: string): Observable<any> {
    return this.httpClient.delete(url);
  }
}
