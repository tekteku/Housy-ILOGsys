/**
 * En-tête de navigation avec authentification et profil utilisateur
 * 
 * Features:
 * - Menu de navigation principal
 * - Profil utilisateur avec dropdown
 * - Notifications et badges de rôle
 * - Menu mobile responsive
 * - Animations fluides
 * 
 * @author Housy Development Team
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface AuthHeaderProps {
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function AuthHeader({ onMobileMenuToggle, isMobileMenuOpen }: AuthHeaderProps) {
  const [, setLocation] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fermer les notifications en cliquant à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gestionnaire de déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Obtenir les initiales du nom d'utilisateur
  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Obtenir la couleur du badge de rôle
  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'client':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Traduire le rôle en français
  const translateRole = (role: string): string => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Administrateur';
      case 'client':
        return 'Client';
      default:
        return role;
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            {/* Bouton menu mobile */}
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-3">              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">H</span>
              </div><div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Housy
                </h1>
                <p className="text-xs text-gray-500">Gestion de construction</p>
              </div>
            </div>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 relative"
              >
                <BellIcon className="h-6 w-6" />
                {/* Badge de notification */}
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Dropdown des notifications */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {/* Exemple de notifications */}
                    <div className="p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Nouveau projet assigné</p>
                          <p className="text-xs text-gray-500 mt-1">Villa moderne à La Marsa</p>
                          <p className="text-xs text-gray-400 mt-1">Il y a 2 heures</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Devis approuvé</p>
                          <p className="text-xs text-gray-500 mt-1">Rénovation appartement Tunis</p>
                          <p className="text-xs text-gray-400 mt-1">Il y a 1 jour</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Livraison de matériaux</p>
                          <p className="text-xs text-gray-500 mt-1">Ciment et briques prévus demain</p>
                          <p className="text-xs text-gray-400 mt-1">Il y a 2 jours</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-100">
                    <button className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors">
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profil utilisateur */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=f97316&color=fff`} />
                    <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-500 text-white text-sm font-medium">
                      {getUserInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium leading-none">{user.fullName}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                        {user.role === 'super_admin' && <ShieldCheckIcon className="w-3 h-3 mr-1" />}
                        {user.role === 'admin' && <CogIcon className="w-3 h-3 mr-1" />}
                        {user.role === 'client' && <UserIcon className="w-3 h-3 mr-1" />}
                        {translateRole(user.role)}
                      </span>
                    </div>
                    <p className="text-xs leading-none text-gray-600">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => setLocation('/profile')}
                  className="cursor-pointer"
                >
                  <UserCircleIcon className="mr-2 h-4 w-4" />
                  <span>Mon profil</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setLocation('/settings')}
                  className="cursor-pointer"
                >
                  <CogIcon className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
