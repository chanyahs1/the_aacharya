import React, { useEffect, useState } from 'react';
import { ArrowBigDownDash } from 'lucide-react';

// Recursive Tree Renderer
const TreeNode = ({ node }) => {
  return (
    <div className="ml-4 relative pl-6">
      <div className="absolute left-0 top-4 h-full border-l border-neutral-300"></div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-1 border border-neutral-200">
        <div className="font-semibold text-neutral-800">
          {node.name} {node.surname}
        </div>
        <div className="text-sm text-neutral-500">{node.role}</div>
      </div>

      {node.subordinates.length > 0 && (
        <div className="ml-4">
          {node.subordinates.map((child, index) => (
            <div key={child.id} className="flex flex-col items-start">
              <ArrowBigDownDash className="text-neutral-400 ml-2 my-1" size={20} />
              <TreeNode node={child} />
            </div>
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

        const res = await fetch('http://localhost:5000/api/employees');
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-neutral-800 mb-6">
        Employee Hierarchy
      </h1>

      {loading ? (
        <p className="text-neutral-600">Loading...</p>
      ) : error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : hierarchy.length === 0 ? (
        <p className="text-neutral-600">No employee hierarchy data found.</p>
      ) : (
        <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
          {hierarchy.map(root => (
            <TreeNode key={root.id} node={root} />
          ))}
        </div>
      )}
    </div>
  );
}