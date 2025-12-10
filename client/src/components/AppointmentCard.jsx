import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import RescheduleModal from './RescheduleModal';
import PaymentModal from './PaymentModal';
import { Calendar, Clock, MapPin, RefreshCw, User, Mail, Phone, CalendarCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';

const AppointmentCard = ({ appointment, onUpdate }) => {
  const { user } = useAppContext();
  const [showReschedule, setShowReschedule] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const canReschedule = () => {
    return user && 
           (user.role === 'patient' || user.role === 'doctor') &&
           appointment.status !== 'completed' &&
           appointment.status !== 'cancelled';
  };

  const isDoctorView = user?.role === 'doctor' && appointment.patientId;
  const bookingDate = appointment.createdAt 
    ? new Date(appointment.createdAt).toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : null;

  return (
    <>
      <Card className="border-2 premium-shadow card-hover">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <motion.div 
                  className="h-14 w-14 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg flex-shrink-0"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {isDoctorView ? (
                    <User className="h-7 w-7 text-primary-foreground" />
                  ) : (
                    <Calendar className="h-7 w-7 text-primary-foreground" />
                  )}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-foreground">
                        {isDoctorView 
                          ? appointment.patientId?.name || 'Patient'
                          : appointment.doctorId?.name || 'Doctor'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isDoctorView 
                          ? `Patient Appointment`
                          : appointment.doctorId?.specialization || 'Specialization'}
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(appointment.status)} className="capitalize shrink-0">
                      {appointment.status}
                    </Badge>
                  </div>

                  {/* Patient Details for Doctor View */}
                  {isDoctorView && appointment.patientId && (
                    <div className="mb-3 p-3 bg-muted/50 rounded-lg border border-border/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">Patient:</span>
                          <span className="font-medium">{appointment.patientId.name}</span>
                        </div>
                        {appointment.patientId.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-medium truncate">{appointment.patientId.email}</span>
                          </div>
                        )}
                        {appointment.patientId.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">Phone:</span>
                            <span className="font-medium">{appointment.patientId.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Appointment Details */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 text-muted-foreground cursor-help">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>{new Date(appointment.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Appointment Date</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 text-muted-foreground cursor-help">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="font-medium">{appointment.slot}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Time Slot</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {bookingDate && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 text-muted-foreground cursor-help">
                              <CalendarCheck className="h-4 w-4 text-primary" />
                              <span className="text-xs">Booked: {bookingDate}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Booking was made at this time</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {appointment.doctorId?.city && !isDoctorView && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{appointment.doctorId.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {/* Pay Now Button for Pending Appointments (Patient Only) */}
              {!isDoctorView && appointment.status === 'pending' && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setShowPayment(true)}
                  >
                    Pay Now
                  </Button>
                </motion.div>
              )}

              {canReschedule() && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReschedule(true)}
                    className="border-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reschedule
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showReschedule && (
        <RescheduleModal
          open={showReschedule}
          onOpenChange={setShowReschedule}
          appointment={appointment}
          onSuccess={() => {
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {showPayment && (
        <PaymentModal
          open={showPayment}
          onOpenChange={setShowPayment}
          appointment={appointment}
          doctor={appointment.doctorId}
          onSuccess={() => {
            setShowPayment(false);
            if (onUpdate) onUpdate();
          }}
        />
      )}
    </>
  );
};

export default AppointmentCard;
