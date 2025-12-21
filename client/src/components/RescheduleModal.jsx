import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from './ui/use-toast';
import api from '../utils/api';
import { Calendar } from 'lucide-react';

const RescheduleModal = ({ open, onOpenChange, appointment, onSuccess }) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && appointment) {
      setSelectedDate(new Date(appointment.date).toISOString().split('T')[0]);
      if (selectedDate) {
        fetchAvailableSlots();
      }
    }
  }, [open, appointment]);

  useEffect(() => {
    if (selectedDate && appointment) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      const response = await api.get('/appointments/available-slots', {
        params: { doctorId: appointment.doctorId._id || appointment.doctorId, date: selectedDate },
      });
      if (response.data.success) {
        // Include current slot in available slots
        const slots = response.data.data;
        if (!slots.includes(appointment.slot)) {
          slots.push(appointment.slot);
        }
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedSlot) {
      toast({
        variant: "destructive",
        title: "Required",
        description: "Please select date and slot",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.patch(`/appointments/${appointment._id}/reschedule`, {
        date: selectedDate,
        slot: selectedSlot,
      });

      if (response.data.success) {
        toast({
          variant: "success",
          title: "Success!",
          description: "Appointment rescheduled successfully",
        });
        if (onSuccess) onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error rescheduling appointment';
      const bookingDetails = error.response?.data?.bookingDetails;
      
      toast({
        variant: "destructive",
        title: "Reschedule Failed",
        description: bookingDetails 
          ? `${errorMessage}. This slot was booked by ${bookingDetails.patientName} at ${bookingDetails.bookedAt}.`
          : errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reschedule Appointment
          </DialogTitle>
          <DialogDescription>
            Select a new date and time for your appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select New Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Select New Time Slot</label>
            <Select
              value={selectedSlot}
              onValueChange={setSelectedSlot}
              disabled={!selectedDate}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a slot" />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-slots" disabled>
                    {selectedDate ? 'No slots available' : 'Select date first'}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleReschedule}
              disabled={loading || !selectedDate || !selectedSlot}
              className="flex-1"
            >
              {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleModal;

