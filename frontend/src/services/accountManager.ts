import { UserInfo, api } from './api';

export interface StoredAccount {
  token: string;
  user: UserInfo;
  workspaceName?: string;
  lastActiveAt?: number;
}

const STORAGE_KEY = 'crm_accounts';

export const accountManager = {
  getAccounts(): StoredAccount[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  saveCurrentSession(token: string, user: UserInfo, workspaceName: string = 'Efferd LLC') {
    if (!token || !user || !user.email) return;

    const accounts = this.getAccounts();
    const existingIndex = accounts.findIndex(
      (a) => a.user.email.toLowerCase() === user.email.toLowerCase()
    );

    const updatedAccount: StoredAccount = {
      token,
      user,
      workspaceName,
      lastActiveAt: Date.now()
    };

    if (existingIndex >= 0) {
      accounts[existingIndex] = updatedAccount;
    } else {
      accounts.push(updatedAccount);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  switchAccount(email: string): StoredAccount | null {
    const accounts = this.getAccounts();
    const target = accounts.find(
      (a) => a.user.email.toLowerCase() === email.toLowerCase()
    );

    if (!target) return null;

    target.lastActiveAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    localStorage.setItem('token', target.token);
    localStorage.setItem('user', JSON.stringify(target.user));

    return target;
  },

  removeAccount(email: string): StoredAccount[] {
    const accounts = this.getAccounts().filter(
      (a) => a.user.email.toLowerCase() !== email.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    return accounts;
  },

  async loginNewAccount(email: string, password: string, workspaceName: string = 'Efferd LLC'): Promise<StoredAccount> {
    const res = await api.auth.login({ email, password });
    this.saveCurrentSession(res.accessToken, res.user, workspaceName);
    return {
      token: res.accessToken,
      user: res.user,
      workspaceName,
      lastActiveAt: Date.now()
    };
  }
};
