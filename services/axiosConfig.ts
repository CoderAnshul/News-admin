import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

// Popup notification system
class PopupNotification {
  private overlay: HTMLElement | null = null;

  constructor() {
    // No need to create container on initialization
  }

  private createOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'popup-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(31, 29, 29, 0.18);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    return overlay;
  }

  private createPopup(message: string, type: 'error' | 'success' | 'warning' = 'error'): HTMLElement {
    const popup = document.createElement('div');
    popup.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transform: scale(0.8);
      transition: transform 0.3s ease;
      position: relative;
    `;

    const icon = type === 'error' ? '⚠️' : type === 'warning' ? '⚠️' : '✅';
    const iconColor = type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981';
    const titleColor = type === 'error' ? '#991b1b' : type === 'warning' ? '#92400e' : '#065f46';
    const textColor = type === 'error' ? '#6b7280' : type === 'warning' ? '#6b7280' : '#6b7280';

    popup.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 48px; margin-bottom: 16px;">${icon}</div>
        <h2 style="
          font-size: 24px;
          font-weight: 600;
          color: ${titleColor};
          margin: 0 0 8px 0;
        ">
          ${type === 'error' ? 'Access Denied' : type === 'warning' ? 'Warning' : 'Success'}
        </h2>
        <p style="
          font-size: 16px;
          color: ${textColor};
          margin: 0;
          line-height: 1.6;
        ">
          ${message}
        </p>
      </div>
      <div style="display: flex; justify-content: center; gap: 12px;">
        <button 
          id="popup-ok-btn"
          style="
            background: ${iconColor};
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            min-width: 100px;
          "
          onmouseover="this.style.opacity='0.9'; this.style.transform='translateY(-1px)'"
          onmouseout="this.style.opacity='1'; this.style.transform='translateY(0)'"
        >
          OK
        </button>
      </div>
    `;

    return popup;
  }

  show(message: string, type: 'error' | 'success' | 'warning' = 'error'): Promise<void> {
    return new Promise((resolve) => {
      // Remove existing popup if any
      this.hide();

      // Create overlay
      this.overlay = this.createOverlay();
      const popup = this.createPopup(message, type);
      
      this.overlay.appendChild(popup);
      document.body.appendChild(this.overlay);

      // Animate in
      setTimeout(() => {
        if (this.overlay) {
          this.overlay.style.opacity = '1';
          popup.style.transform = 'scale(1)';
        }
      }, 10);

      // Handle OK button click
      const okBtn = popup.querySelector('#popup-ok-btn');
      if (okBtn) {
        okBtn.addEventListener('click', () => {
          this.hide();
          resolve();
        });
      }

      // Handle overlay click (close popup)
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.hide();
          resolve();
        }
      });

      // Handle ESC key
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          this.hide();
          document.removeEventListener('keydown', handleEsc);
          resolve();
        }
      };
      document.addEventListener('keydown', handleEsc);
    });
  }

  hide(): void {
    if (this.overlay) {
      this.overlay.style.opacity = '0';
      const popup = this.overlay.querySelector('div');
      if (popup) {
        popup.style.transform = 'scale(0.8)';
      }
      
      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
        }
        this.overlay = null;
      }, 300);
    }
  }

  error(message: string): Promise<void> {
    return this.show(message, 'error');
  }

  warning(message: string): Promise<void> {
    return this.show(message, 'warning');
  }

  success(message: string): Promise<void> {
    return this.show(message, 'success');
  }
}

// Create global popup instance
const popup = new PopupNotification();

// Prevent multiple permission denied popups
let permissionDeniedPopupActive = false;

// API base URL
const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000/";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 86400000, // 1 day in milliseconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (
    config: import("axios").InternalAxiosRequestConfig
  ): import("axios").InternalAxiosRequestConfig => {
    const token = localStorage.getItem("accessToken");

    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
      config.headers["x-access-token"] = token;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        config.headers["x-refresh-token"] = refreshToken;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check for "Permission denied" in response data (string or object)
    if (
      response?.data &&
      (
        (typeof response.data === "string" && response.data.includes("Permission denied")) ||
        (typeof response.data === "object" && JSON.stringify(response.data).includes("Permission denied"))
      )
    ) {
      if (!permissionDeniedPopupActive) {
        permissionDeniedPopupActive = true;
        popup.error("You don't have permission to access this resource. Please contact your administrator if you believe this is an error.")
          .finally(() => {
            permissionDeniedPopupActive = false;
          });
      }
    }
    return response;
  },
  (error: AxiosError) => {
    // Check for "Permission denied" in error response data
    if (
      error.response?.data &&
      (
        (typeof error.response.data === "string" && error.response.data.includes("Permission denied")) ||
        (typeof error.response.data === "object" && JSON.stringify(error.response.data).includes("Permission denied"))
      )
    ) {
      if (!permissionDeniedPopupActive) {
        permissionDeniedPopupActive = true;
        popup.error("You don't have permission to access this resource. Please contact your administrator if you believe this is an error.")
          .finally(() => {
            permissionDeniedPopupActive = false;
          });
      }
    }
    
    if (error.response && error.response.status === 401) {
      // Handle 401 Unauthorized errors
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      if (!permissionDeniedPopupActive) {
        permissionDeniedPopupActive = true;
        popup.error("Your session has expired. You will be redirected to the login page.").then(() => {
          permissionDeniedPopupActive = false;
          window.location.href = "/"; // Redirect to login page after user closes popup
        });
      }
    }
    
    return Promise.reject(error);
  }
);

// Export both the axios instance and popup for use in other parts of your app
export { popup };
export default axiosInstance;