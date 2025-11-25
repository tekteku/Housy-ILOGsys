
// Imports nécessaires (à ajouter en haut du fichier si manquants)
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Fonction de mutation pour confirmer un paiement
const confirmPaymentMutation = useMutation({
  mutationFn: async (paymentId: string) => {
    const response = await fetch(`/api/payments/${paymentId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Erreur lors de la confirmation');
    return response.json();
  },
  onSuccess: () => {
    toast.success('Paiement confirmé avec succès');
    queryClient.invalidateQueries({ queryKey: ['payments'] });
  },
  onError: () => {
    toast.error('Erreur lors de la confirmation du paiement');
  }
});

const handleConfirmPayment = (paymentId: string) => {
  confirmPaymentMutation.mutate(paymentId);
};

// Bouton à ajouter dans la liste des paiements (condition: payment.status === 'pending')
{payment.status === 'pending' && (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button size="sm" className="bg-green-600 hover:bg-green-700">
        <CheckCircle className="w-4 h-4 mr-2" />
        Confirmer le paiement
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Confirmer le paiement</AlertDialogTitle>
        <AlertDialogDescription>
          Confirmez-vous avoir effectué le paiement de {payment.amount.toLocaleString()} TND
          pour la facture {payment.invoiceNumber} ?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Annuler</AlertDialogCancel>
        <AlertDialogAction 
          onClick={() => handleConfirmPayment(payment.id)}
          disabled={confirmPaymentMutation.isPending}
        >
          {confirmPaymentMutation.isPending ? 'Confirmation...' : 'Confirmer'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}