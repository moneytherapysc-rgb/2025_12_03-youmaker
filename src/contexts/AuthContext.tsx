
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isPro: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserSubscription: (updatedUser: User) => void;
  changePassword: (currentPw: string, newPw: string) => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
  getAllUsers: () => User[];
  deleteUser: (email: string) => void;
  checkEmailExists: (email: string) => Promise<boolean>;
  resetPassword: (email: string, newPw: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'yt_macgyver_users';
const CURRENT_USER_KEY = 'yt_macgyver_current_user';

// Demo Admin Email
const ADMIN_EMAIL = 'admin@test.com';

// Helper for safe JSON parsing
function safeJsonParse<T>(jsonString: string | null, fallback: T): T {
    if (!jsonString) return fallback;
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Auth Storage Parse Error", e);
        return fallback;
    }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    try {
        // 1. Load User
        const storedUser = localStorage.getItem(CURRENT_USER_KEY);
        if (storedUser) {
          const parsedUser = safeJsonParse<User | null>(storedUser, null);
          if (parsedUser) {
              setUser(parsedUser);
              setIsAdmin(parsedUser.email === ADMIN_EMAIL);
          }
        }

        // 2. Seed Admin Account
        const users = safeJsonParse<User[]>(localStorage.getItem(USERS_STORAGE_KEY), []);

        if (!users.some(u => u.email === ADMIN_EMAIL)) {
            const adminUser: User = {
                id: 'admin-root',
                name: '최고관리자',
                email: ADMIN_EMAIL,
                password: 'admin',
                joinedAt: new Date().toISOString(),
                subscription: {
                    plan: '12months',
                    status: 'active',
                    startDate: new Date().toISOString(),
                    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString()
                }
            };
            users.push(adminUser);
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
    } catch (e) {
        console.error("Auth initialization error:", e);
        localStorage.removeItem(CURRENT_USER_KEY);
        setUser(null);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const isPro = !!user && (
      isAdmin || 
      (!!user.subscription && user.subscription.status === 'active' && new Date(user.subscription.endDate) > new Date())
  );

  const getAllUsers = (): User[] => {
      return safeJsonParse<User[]>(localStorage.getItem(USERS_STORAGE_KEY), []);
  };

  const deleteUser = (email: string) => {
      const users = getAllUsers();
      const updatedUsers = users.filter(u => u.email !== email);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
      
      // If the deleted user is currently logged in
      if (user?.email === email) {
          logout();
      }
  };

  const login = async (email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
            const users = safeJsonParse<User[]>(localStorage.getItem(USERS_STORAGE_KEY), []);
            
            const foundUser = users.find(u => u.email === email && u.password === password);
            
            if (foundUser) {
              const { password, ...userWithoutPass } = foundUser;
              const isUserAdmin = email === ADMIN_EMAIL;
              
              const sessionUser = { ...userWithoutPass, isAdmin: isUserAdmin } as User;
              
              setUser(sessionUser);
              setIsAdmin(isUserAdmin);
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
              resolve();
            } else {
              reject(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'));
            }
        } catch (e) {
            reject(new Error('로그인 처리 중 오류가 발생했습니다.'));
        }
      }, 800);
    });
  };

  const signup = async (name: string, email: string, password: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
            const users = safeJsonParse<User[]>(localStorage.getItem(USERS_STORAGE_KEY), []);
            
            if (users.some(u => u.email === email)) {
              reject(new Error('이미 가입된 이메일입니다.'));
              return;
            }

            const newUser: User = {
              id: Date.now().toString(),
              name,
              email,
              password,
              joinedAt: new Date().toISOString(),
            };

            users.push(newUser);
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
            
            const { password: _, ...userWithoutPass } = newUser;
            const isUserAdmin = email === ADMIN_EMAIL;
            const sessionUser = { ...userWithoutPass, isAdmin: isUserAdmin } as User;

            setUser(sessionUser);
            setIsAdmin(isUserAdmin);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
            
            resolve();
        } catch (e) {
            reject(new Error('회원가입 처리 중 오류가 발생했습니다.'));
        }
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const updateUserSubscription = (updatedUser: User) => {
      setUser(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      
      try {
          const users = safeJsonParse<User[]>(localStorage.getItem(USERS_STORAGE_KEY), []);
          const index = users.findIndex(u => u.email === updatedUser.email);
          if (index !== -1) {
              const password = users[index].password;
              users[index] = { ...updatedUser, password };
              localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
          }
      } catch (e) {
          console.error("Failed to update subscription in storage", e);
      }
  };

  const changePassword = async (currentPw: string, newPw: string): Promise<void> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              if (!user) {
                  reject(new Error('로그인이 필요합니다.'));
                  return;
              }

              try {
                  const users = safeJsonParse<User[]>(localStorage.getItem(USERS_STORAGE_KEY), []);
                  const userIndex = users.findIndex(u => u.email === user.email);

                  if (userIndex === -1) {
                      reject(new Error('사용자 정보를 찾을 수 없습니다.'));
                      return;
                  }

                  if (users[userIndex].password !== currentPw) {
                      reject(new Error('현재 비밀번호가 일치하지 않습니다.'));
                      return;
                  }

                  users[userIndex].password = newPw;
                  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
                  resolve();
              } catch (e) {
                  reject(new Error('비밀번호 변경 중 오류가 발생했습니다.'));
              }
          }, 500);
      });
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              const users = safeJsonParse<User[]>(localStorage.getItem(USERS_STORAGE_KEY), []);
              resolve(users.some(u => u.email === email));
          }, 500);
      });
  };

  const resetPassword = async (email: string, newPw: string): Promise<void> => {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              try {
                  const users = safeJsonParse<User[]>(localStorage.getItem(USERS_STORAGE_KEY), []);
                  const userIndex = users.findIndex(u => u.email === email);

                  if (userIndex === -1) {
                      reject(new Error('사용자 정보를 찾을 수 없습니다.'));
                      return;
                  }

                  users[userIndex].password = newPw;
                  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
                  resolve();
              } catch (e) {
                  reject(new Error('비밀번호 재설정 중 오류가 발생했습니다.'));
              }
          }, 800);
      });
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        isPro, 
        login, 
        signup, 
        logout, 
        updateUserSubscription, 
        changePassword, 
        isLoading, 
        isAdmin, 
        getAllUsers, 
        deleteUser, 
        checkEmailExists, 
        resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
