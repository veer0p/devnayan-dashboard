import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, CaretRight } from '@phosphor-icons/react';

export default function AddPatientModal({ isOpen, onClose, onAdd }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'Male',
    address: '',
    medicalAlerts: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    // Submit complete
    const newPatient = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      age: parseInt(formData.age),
      medicalAlerts: formData.medicalAlerts ? formData.medicalAlerts.split(',').map(s => s.trim()) : [],
      registrationDate: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      totalVisits: 0,
      balance: 0,
      status: 'Active',
      teethConditions: {},
      history: []
    };

    onAdd(newPatient);
    onClose();
    // Reset
    setTimeout(() => {
      setStep(1);
      setFormData({ name: '', phone: '', age: '', gender: 'Male', address: '', medicalAlerts: '' });
    }, 300);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity" />
        <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-bg-card p-6 shadow-2xl z-50 focus:outline-none overflow-y-auto custom-scrollbar border border-border-color">
          
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-bold text-text-main">
              {step === 1 ? 'Add New Patient' : 'Initial Dental Assessment'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-text-muted hover:text-text-main transition-colors p-1 rounded-md hover:bg-bg-body">
                <X size={20} weight="bold" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Age</label>
                      <input 
                        type="number" 
                        required
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Gender</label>
                      <select 
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full h-11 px-2 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm cursor-pointer"
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Address (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full h-11 px-3 bg-bg-body border border-border-color rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase">Medical Alerts (Comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Asthma, Penicillin Allergy"
                    value={formData.medicalAlerts}
                    onChange={(e) => setFormData({...formData, medicalAlerts: e.target.value})}
                    className="w-full h-11 px-3 bg-red-50 border border-red-200 text-red-900 placeholder:text-red-300 rounded-xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all text-sm"
                  />
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-text-muted">
                <p className="mb-4 text-sm">You can document initial tooth conditions later from the Patient Drawer.</p>
                <div className="w-16 h-16 mx-auto bg-primary-light text-primary rounded-full flex items-center justify-center mb-4">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-text-main">Ready to Register</h3>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-border-color flex justify-end gap-3">
              <Dialog.Close asChild>
                <button 
                  type="button"
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm text-text-muted hover:text-text-main hover:bg-bg-body transition-colors"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button 
                type="submit"
                className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-primary text-white hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-2"
              >
                {step === 1 ? (
                  <>Continue <CaretRight weight="bold" /></>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>
          </form>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
