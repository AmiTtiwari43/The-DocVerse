import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import RescheduleModal from './RescheduleModal';
import { Calendar, Clock, MapPin, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const AppointmentCard = ({ appointment, onUpdate }) => {
  const { user } = useAppContext();
  const [showReschedule, setShowReschedule] = useState(false);

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

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">
                    {appointment.doctorId?.name || appointment.patientId?.name || 'Appointment'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {appointment.doctorId?.specialization || 'Patient'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(appointment.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {appointment.slot}
                    </div>
                    {appointment.doctorId?.city && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {appointment.doctorId.city}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={getStatusVariant(appointment.status)}>
                {appointment.status}
              </Badge>
              {canReschedule() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReschedule(true)}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reschedule
                </Button>
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
    </>
  );
};

export default AppointmentCard;
