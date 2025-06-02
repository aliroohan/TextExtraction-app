import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private baseUrl = 'https://forensicapi.duckdns.org/api';

  constructor(private http: HttpClient) { }

  analyzeImage(image: File) {
    const formData = new FormData();
    formData.append('file', image);
    return this.http.post(`${this.baseUrl}/analyze_image`, formData, {
      reportProgress: true, 
      observe: 'response'
    });
  }
}
