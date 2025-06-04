import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private baseUrl = 'http://51.21.199.143:3000';

  constructor(private http: HttpClient) { }

  analyzeImage(image: File) {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post(`${this.baseUrl}/extract`, formData, {
      reportProgress: true, 
      observe: 'response'
    });
  }
}
