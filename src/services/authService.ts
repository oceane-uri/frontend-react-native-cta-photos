// Service d'authentification simple pour les tests
class AuthService {
  private static instance: AuthService;
  private authToken: string | null = null;

  private constructor() {
    // Générer un token simple pour les tests
    this.authToken = 'test-token-' + Date.now();
    // Mettre le token globalement pour que photoService puisse l'utiliser
    (global as any).authToken = this.authToken;
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public getToken(): string | null {
    return this.authToken;
  }

  public isAuthenticated(): boolean {
    return !!this.authToken;
  }

  public initializeAuth(): void {
    // Initialiser l'authentification au démarrage
    if (!this.authToken) {
      this.authToken = 'test-token-' + Date.now();
      (global as any).authToken = this.authToken;
    }
  }
}

export const authService = AuthService.getInstance(); 