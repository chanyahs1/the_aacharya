import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const RatingSlider = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <div className="flex justify-between">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      <span className="text-sm font-medium text-primary-600">{value}/10</span>
    </div>
    <input
      type="range"
      min="0"
      max="10"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
    />
  </div>
);

export default function TaskRatingModal({ isOpen, onClose, task, onSubmit }) {
  const [ratings, setRatings] = useState({
    productivity: 7,
    quality: 7,
    teamwork: 7
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/employees/tasks/${task.id}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task.id,
          employeeId: task.assignee_id,
          ratings: {
            ...ratings,
            taskTitle: task.title,
            completedDate: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit ratings');
      }

      onSubmit(ratings);
      onClose();
    } catch (error) {
      console.error('Error submitting ratings:', error);
      alert('Failed to submit ratings. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-neutral-800">Rate Employee Performance</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-neutral-900">{task.title}</h3>
          <p className="text-sm text-neutral-500">Completed by: {task.assignee_name} {task.assignee_surname}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <RatingSlider
            label="Productivity"
            value={ratings.productivity}
            onChange={(value) => setRatings(prev => ({ ...prev, productivity: value }))}
          />

          <RatingSlider
            label="Quality of Work"
            value={ratings.quality}
            onChange={(value) => setRatings(prev => ({ ...prev, quality: value }))}
          />

          <RatingSlider
            label="Teamwork & Communication"
            value={ratings.teamwork}
            onChange={(value) => setRatings(prev => ({ ...prev, teamwork: value }))}
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Submit Ratings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 