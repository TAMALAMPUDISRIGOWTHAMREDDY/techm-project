import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { CreateUser, LoginUser, AuthResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private tokenKey = 'token';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private currentUserSubject: BehaviorSubject<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
  }

  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginUser): Observable<AuthResponse> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map(response => {
          if (response && response.token) {
            this.setToken(response.token);
            this.isLoggedInSubject.next(true);
            return response;
          }
          throw new Error('Invalid response from server');
        }),
        switchMap(response => this.getCurrentUser().pipe(
          map(user => {
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            return {
              token: response.token,
              expiresIn: 86400 // 24 hours in seconds
            };
          })
        )),
        catchError(this.handleError)
      );
  }

  register(user: CreateUser): Observable<void> {
    // Log the request data (excluding password)
    const requestData = {
      ...user,
      password: '********' // Don't log actual password
    };
    console.log('Registration request data:', requestData);
    console.log('Sending registration request to:', `${this.apiUrl}/register`);

    return this.http.post<User>(`${this.apiUrl}/register`, user)
      .pipe(
        map(response => {
          console.log('Registration response:', response);
          // Registration successful, no need to set token or user data
          // User will need to login after registration
        }),
        catchError(error => {
          // Log detailed error information
          console.error('Registration request failed:', {
            url: `${this.apiUrl}/register`,
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            message: error.message,
            requestData: requestData
          });

          // If we have validation errors from the server, log them
          if (error.error?.errors) {
            console.error('Validation errors:', error.error.errors);
          }

          return this.handleError(error);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('currentUser');
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      catchError(this.handleError)
    );
  }

  updateAvatar(formData: FormData): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/update-avatar`, formData).pipe(
      map(user => {
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError(this.handleError)
    );
  }

  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    console.warn('API not available, using mock authentication:', error);
    
    // For development purposes, return a mock successful response
    if (error.status === 0) { // Connection refused
      return of({
        token: 'mock-token-for-development',
        user: {
          id: 1,
          username: 'demo_user',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }
    
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error || error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
} 