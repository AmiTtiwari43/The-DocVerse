import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';
import api from '../utils/api';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Copy, Smartphone } from 'lucide-react';

const PaymentModal = ({ open, onOpenChange, appointment, doctor, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paid, setPaid] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (open && appointment && !paid) {
      getUPIPaymentDetails();
    }
  }, [open, appointment]);

  const getUPIPaymentDetails = async () => {
    setLoading(true);
    try {
      const response = await api.post('/payments/upi/get-details', {
        appointmentId: appointment._id,
      });

      if (response.data.success) {
        setPaymentDetails(response.data.data);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || 'Failed to initialize payment',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyUPIId = () => {
    if (paymentDetails?.upiId) {
      navigator.clipboard.writeText(paymentDetails.upiId);
      toast({
        title: "Copied!",
        description: "UPI ID copied to clipboard",
      });
    }
  };

  const confirmPayment = async () => {
    if (!transactionId.trim()) {
      toast({
        variant: "destructive",
        title: "Transaction ID Required",
        description: "Please enter your UPI transaction ID after making the payment",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/payments/upi/confirm', {
        paymentId: paymentDetails.paymentId,
        transactionId: transactionId.trim(),
      });

      if (response.data.success) {
        setPaid(true);
        toast({
          title: "Payment Confirmed!",
          description: "Your appointment is now confirmed",
        });
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onOpenChange(false);
          setPaid(false);
          setTransactionId('');
          setPaymentDetails(null);
        }, 3000);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || 'Payment confirmation failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay via UPI</DialogTitle>
          <DialogDescription>
            Scan the QR code or use UPI ID to pay ₹{doctor?.fees} for your appointment with Dr. {doctor?.name}
          </DialogDescription>
        </DialogHeader>

        {paid ? (
          <div className="text-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold">Payment Confirmed!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your appointment is now confirmed
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Amount Display */}
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Appointment Fee</p>
              <p className="text-3xl font-bold">₹{doctor?.fees}</p>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading payment details...</p>
              </div>
            ) : paymentDetails ? (
              <>
                {/* QR Code */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-primary">
                    <QRCodeSVG
                      value={paymentDetails.qrCodeData}
                      size={256}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan with any UPI app (Google Pay, PhonePe, Paytm, etc.)
                  </p>
                </div>

                {/* UPI ID */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">UPI ID</label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={paymentDetails.upiId}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyUPIId}
                      title="Copy UPI ID"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Or manually enter this UPI ID in your payment app
                  </p>
                </div>

                {/* Transaction ID Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter UPI transaction ID after payment"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    After making the payment, enter the transaction ID from your UPI app
                  </p>
                </div>

                {/* Confirm Button */}
                <Button
                  onClick={confirmPayment}
                  disabled={loading || !transactionId.trim()}
                  className="w-full"
                  size="lg"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  {loading ? 'Confirming...' : 'Confirm Payment'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  🔒 Your payment is secure and encrypted
                </p>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Failed to load payment details</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;

