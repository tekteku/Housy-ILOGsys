/**
 * Dialogue d'avertissement de session
 * 
 * Features:
 * - Compte à rebours visuel
 * - Options d'extension de session
 * - Design moderne et accessible
 * - Animations fluides
 * 
 * @author Housy Development Team
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Shield, LogOut } from 'lucide-react';

interface SessionWarningDialogProps {
  isOpen: boolean;
  timeLeft: number;
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionWarningDialog({
  isOpen,
  timeLeft,
  onExtend,
  onLogout
}: SessionWarningDialogProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    if (timeLeft > 180) return 'bg-green-500';
    if (timeLeft > 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const progressPercentage = Math.max(0, (timeLeft / 300) * 100); // Assuming 5 min warning

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <DialogTitle className="text-center text-xl font-semibold">
            Session bientôt expirée
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Votre session expirera dans quelques minutes en raison d'inactivité.
            Souhaitez-vous prolonger votre session ?
          </DialogDescription>
        </DialogHeader>

        {/* Compte à rebours visuel */}
        <div className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-2xl font-mono font-bold text-gray-900">
                {formatTime(timeLeft)}
              </span>
            </div>
            
            {/* Barre de progression */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={onExtend}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <Shield className="w-4 h-4 mr-2" />
              Prolonger la session (30 min)
            </Button>
            
            <Button 
              onClick={onLogout}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              size="lg"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter maintenant
            </Button>
          </div>

          {/* Informations de sécurité */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Sécurité de votre compte</p>
                <p className="text-blue-700">
                  Cette mesure protège vos données personnelles en cas d'inactivité prolongée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
