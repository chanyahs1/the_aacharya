import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight, User, Users } from 'lucide-react';

const levelColors = [
  { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-600' },
  { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-600' },
  { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-600' },
  { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-600' },
  { border: 'border-teal-500', bg: 'bg-teal-50', text: 'text-teal-600' },
];

// Recursive Tree Renderer
const TreeNode = ({ node, isRoot = false, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubordinates = node.subordinates && node.subordinates.length > 0;
  const color = levelColors[depth % levelColors.length];

  return (
    <div className={`${isRoot ? '' : 'pl-8 relative mt-3'}`}>
      {!isRoot && (
        <>
          {/* Vertical line from parent */}
          <div className="absolute -left-3 top-0 w-0.5 h-full bg-neutral-300" />
          {/* Horizontal line to node */}
          <div className="absolute -left-3 top-5 w-8 h-0.5 bg-neutral-300" />
        </>
      )}

      <div className="flex items-center relative">
        {hasSubordinates && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -left-5 top-3.5 z-10 p-0.5 bg-white rounded-full border border-neutral-400 hover:bg-neutral-100 transition"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
        
        <div className={`bg-white shadow rounded-lg p-2.5 w-full flex items-center gap-x-3 border-l-4 ${color.border} hover:shadow-md transition`}>
          <div className={`${color.bg} ${color.text} p-2 rounded-full`}>
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-neutral-800">
              {node.name} {node.surname}
            </p>
            <p className="font-semibold text-neutral-600">
              {node.email} - {node.empID}
            </p>
            <p className="text-sm text-neutral-500">{node.role}</p>
          </div>
        </div>
      </div>

      {isExpanded && hasSubordinates && (
        <div className="mt-1">
          {node.subordinates.map((child) => (
            <TreeNode key={child.id} node={child} isRoot={false} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function EmployeeHierarchy() {
  const [employees, setEmployees] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const current = JSON.parse(localStorage.getItem('currentEmployee')) ||
                        JSON.parse(sessionStorage.getItem('currentEmployee'));

        const res = await fetch('https://the-aacharya.onrender.com/api/employees');
        if (!res.ok) throw new Error('Failed to fetch employees');
        const data = await res.json();

        const filtered = current
          ? data.filter(emp => emp.department === current.department)
          : data;

        setEmployees(filtered);
        const tree = buildHierarchy(filtered);
        setHierarchy(tree);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const buildHierarchy = (data) => {
    const map = {};
    const roots = [];

    data.forEach(emp => {
      map[emp.id] = { ...emp, subordinates: [] };
    });

    data.forEach(emp => {
      if (emp.assigned_supervisor && map[emp.assigned_supervisor]) {
        map[emp.assigned_supervisor].subordinates.push(map[emp.id]);
      } else {
        roots.push(map[emp.id]);
      }
    });

    return roots;
  };

  const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee') || sessionStorage.getItem('currentEmployee'));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center gap-4 mb-6">
          <div className="bg-blue-100 p-3 rounded-full">
            <Users className="w-9 h-9 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Company Hierarchy</h1>
            <p className="text-gray-500 flex items-center gap-2 mt-1">
              {currentEmployee?.full_name || currentEmployee?.name} | {currentEmployee?.empID} | {currentEmployee?.department}
            </p>
          </div>
        </div>
        {/* Hierarchy Tree Card */}
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <p className="text-neutral-600 text-center">Loading hierarchy...</p>
          ) : error ? (
            <p className="text-red-600 text-center">Error: {error}</p>
          ) : hierarchy.length === 0 ? (
            <p className="text-neutral-600 text-center">No employee hierarchy data found.</p>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
              {hierarchy.map(root => (
                <TreeNode key={root.id} node={root} isRoot={true} depth={0} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}