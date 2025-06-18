import React from 'react';
import OnboardingForm from '../../components/OnboardingForm';

export default function OnboardingFormPage() {
  const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));

  if (!currentEmployee) {
    return <div className="text-center py-4 text-red-500">No employee data found.</div>;
  }

  return <OnboardingForm />;
} 