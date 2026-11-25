import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  User, 
  Mail, 
  Plus, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import Modal from '../components/Modal';
import { api } from '../services/api';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await api.getAppointments();
      if (res.success) setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = () => {
    setErrorMsg('');
    setIsModalOpen(true);
    fetchSlots(bookingDate);
  };

  const fetchSlots = async (date) => {
    try {
      const res = await api.getAvailableSlots(date);
      if (res.success) {
        setAvailableSlots(res.data);
        const firstAvail = res.data.find(s => s.available);
        if (firstAvail) setSelectedSlot(firstAvail.time);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!customerName || !selectedSlot) return;

    setBookingLoading(true);
    setErrorMsg('');

    try {
      const res = await api.bookAppointment({
        customer_name: customerName,
        customer_email: customerEmail,
        scheduled_time: selectedSlot,
        notes: notes || 'Booked via TechNova Sales Dashboard'
      });

      if (res.success) {
        setIsModalOpen(false);
        setCustomerName('');
        setCustomerEmail('');
        setNotes('');
        loadAppointments();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Booking conflict or calendar error');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Appointments & Google Calendar Integration</h2>
          <p className="text-xs text-slate-400 mt-0.5">Automated technical discovery consultations booked by the AI voice agent</p>
        </div>

        <button
          onClick={handleOpenBooking}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-blue to-brand-purple text-white font-semibold text-xs hover:opacity-95 shadow-md shadow-brand-blue/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Appointment</span>
        </button>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {appointments.length === 0 ? (
          <div className="col-span-full glass-panel p-12 text-center rounded-2xl border text-slate-500 text-sm">
            No appointments booked yet. The voice agent automatically offers discovery calls during qualification.
          </div>
        ) : (
          appointments.map((apt) => {
            const dateObj = new Date(apt.scheduled_time);
            return (
              <div key={apt.id} className="glass-panel p-5 rounded-2xl border glass-panel-hover flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-base">{apt.customer_name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{apt.customer_email || 'No email specified'}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      CONFIRMED
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center space-x-2 text-slate-200">
                      <CalendarIcon className="w-3.5 h-3.5 text-brand-blue" />
                      <span>{dateObj.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({apt.duration_minutes || 30} mins)</span>
                    </div>
                  </div>

                  {apt.notes && (
                    <p className="text-[11px] text-slate-400 p-2.5 rounded-xl bg-navy-900 border border-slate-800 line-clamp-2">
                      {apt.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Synced with G-Cal
                  </span>

                  {apt.google_meet_link && (
                    <a
                      href={apt.google_meet_link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-blue/15 hover:bg-brand-blue/25 text-brand-blue text-xs font-semibold transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meet</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Book Discovery Consultation"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitBooking} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">Customer Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Vikramaditya Sen"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Customer Email Address</label>
            <input
              type="email"
              placeholder="client@company.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Select Date</label>
            <input
              type="date"
              value={bookingDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                setBookingDate(e.target.value);
                fetchSlots(e.target.value);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">Available Time Slots</label>
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.time)}
                  className={`p-2 rounded-xl border text-[11px] font-medium transition-all ${
                    selectedSlot === slot.time
                      ? 'bg-brand-blue text-white border-brand-blue font-bold shadow'
                      : slot.available
                      ? 'bg-navy-900 text-slate-200 border-slate-700 hover:border-slate-500'
                      : 'bg-slate-900/40 text-slate-600 border-slate-800 line-through cursor-not-allowed'
                  }`}
                >
                  {slot.formattedTime}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Session Scope / Notes</label>
            <textarea
              rows="2"
              placeholder="Requirements or focus areas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-slate-700 text-white focus:outline-none focus:border-brand-blue"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookingLoading || !selectedSlot}
              className="px-5 py-2.5 rounded-xl bg-brand-blue text-white font-semibold hover:bg-blue-600 disabled:opacity-50"
            >
              {bookingLoading ? 'Booking Event...' : 'Confirm Consultation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
