import React from 'react';
import { LogOut, Settings, Users, Receipt, Package, Gift, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();

  const adminMenuItems = [
    { id: 'pos', label: 'POS', icon: Receipt },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'vouchers', label: 'Vouchers', icon: Gift },
    { id: 'reports', label: 'Reports', icon: Receipt },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const employeeMenuItems = [
    { id: 'pos', label: 'POS', icon: Receipt },
    { id: 'timecard', label: 'Time Card', icon: Clock },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : employeeMenuItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-8 w-auto" />
            ) : (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: settings.primary_color }}
              >
                {settings.brand_name.charAt(0).toUpperCase()}
              </div>
            )}
            <h1 className="text-xl font-bold text-gray-900">{settings.brand_name}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-600">Welcome, </span>
              <span className="font-medium text-gray-900">{user?.name}</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {user?.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onViewChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                        currentView === item.id
                          ? 'text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      style={{
                        backgroundColor: currentView === item.id ? settings.primary_color : 'transparent'
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};